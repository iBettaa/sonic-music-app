'use strict';
// Sonic server: dependency-free Node HTTP, authenticated WebSockets and JSON storage.
// The defaults are intended for a personal/self-hosted prototype, not a public SaaS.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { URL } = require('node:url');

const ROOT = __dirname;
const PUB = path.join(ROOT, 'public');
const DATA = path.resolve(process.env.DATA_DIR || path.join(ROOT, 'data'));
const UPLOADS = path.resolve(process.env.UPLOAD_DIR || path.join(ROOT, 'uploads'));
for (const dir of [DATA, UPLOADS]) fs.mkdirSync(dir, { recursive: true });
const envFile = path.join(ROOT, '.env');
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const found = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (found && !process.env[found[1]]) process.env[found[1]] = found[2].replace(/^['"]|['"]$/g, '');
  }
}
const PORT = Number(process.env.PORT || 3000);
const secretFile = path.join(DATA, 'session.secret');
if (!fs.existsSync(secretFile)) fs.writeFileSync(secretFile, crypto.randomBytes(32).toString('hex'), { mode: 0o600 });
const SECRET = Buffer.from(fs.readFileSync(secretFile, 'utf8').trim(), 'hex');
const dbFile = path.join(DATA, 'sonic.json');
let db;
try { db = JSON.parse(fs.readFileSync(dbFile, 'utf8')); } catch { db = { users: [], rooms: [] }; }
db.users ||= []; db.rooms ||= [];
let dirtyTimer = null;
function save() {
  if (dirtyTimer) clearTimeout(dirtyTimer);
  dirtyTimer = setTimeout(() => {
    const temp = dbFile + '.' + process.pid + '.tmp';
    fs.writeFileSync(temp, JSON.stringify(db, null, 2), { mode: 0o600 });
    fs.renameSync(temp, dbFile);
    dirtyTimer = null;
  }, 60);
}
function flush() { if (dirtyTimer) { clearTimeout(dirtyTimer); dirtyTimer = null; } const t = dbFile + '.tmp'; fs.writeFileSync(t, JSON.stringify(db, null, 2), { mode: 0o600 }); fs.renameSync(t, dbFile); }
process.on('SIGINT', () => { flush(); process.exit(0); });
process.on('SIGTERM', () => { flush(); process.exit(0); });
const uid = () => crypto.randomUUID();
const short = s => String(s == null ? '' : s).trim();
const clean = (s, max = 160) => short(s).slice(0, max).replace(/[\u0000-\u001f\u007f]/g, '');
function send(res, status, obj) { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }); res.end(JSON.stringify(obj)); }
const fail = (res, code, message) => send(res, code, { error: message });
function readBody(req, max = 256 * 1024) { return new Promise((resolve, reject) => { let size = 0; const chunks = []; req.on('data', c => { size += c.length; if (size > max) { reject(Object.assign(new Error('File/request too large'), { status: 413 })); req.destroy(); } else chunks.push(c); }); req.on('end', () => resolve(Buffer.concat(chunks))); req.on('error', reject); }); }
async function jsonBody(req) { let body; try { body = JSON.parse((await readBody(req)).toString('utf8')); } catch (e) { throw Object.assign(new Error('Invalid JSON request'), { status: 400 }); } if (!body || typeof body !== 'object' || Array.isArray(body)) throw Object.assign(new Error('Invalid body'), { status: 400 }); return body; }
function encode(obj) { return Buffer.from(JSON.stringify(obj)).toString('base64url'); }
function tokenFor(user) { const data = encode({ id: user.id, exp: Date.now() + 30 * 24 * 3600 * 1000 }); return data + '.' + crypto.createHmac('sha256', SECRET).update(data).digest('base64url'); }
function checkToken(str) { if (typeof str !== 'string' || str.length > 1024) return null; const [data, sig] = str.split('.'); if (!data || !sig) return null; const actual = crypto.createHmac('sha256', SECRET).update(data).digest('base64url'); if (Buffer.byteLength(sig) !== Buffer.byteLength(actual) || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(actual))) return null; try { const p = JSON.parse(Buffer.from(data, 'base64url').toString()); if (p.exp < Date.now()) return null; return db.users.find(u => u.id === p.id) || null; } catch { return null; } }
function auth(req) { return checkToken((req.headers.authorization || '').replace(/^Bearer\s+/i, '')); }
function requireAuth(req, res) { const user = auth(req); if (!user) fail(res, 401, 'Please log in to continue.'); return user; }
function profile(u) { return { id: u.id, username: u.username, email: u.email, liked: u.liked || [], tracks: u.tracks || [], playlists: u.playlists || [] }; }
function passHash(pass, salt) { return crypto.scryptSync(pass, salt, 64).toString('hex'); }
const rate = new Map();
function limited(key, max, duration) { const now = Date.now(); let e = rate.get(key); if (!e || now > e.until) { e = { num: 0, until: now + duration }; rate.set(key, e); } return ++e.num > max; }
setInterval(() => { for (const [key, r] of rate) if (r.until < Date.now()) rate.delete(key); }, 120000).unref();
const roomCode = () => crypto.randomBytes(5).toString('hex');
function publicRoom(r) { const state = r.state || {}; return { code: r.code, name: r.name, owner: r.owner, queue: r.queue || [], state: { trackId: state.trackId || null, playing: !!state.playing, position: currentPosition(state), updatedAt: Date.now() }, messages: (r.messages || []).slice(-80) }; }
function currentPosition(st) { return Math.max(0, Number(st.position || 0) + (st.playing ? Math.max(0, (Date.now() - Number(st.updatedAt || Date.now())) / 1000) : 0)); }
function validTrack(raw) {
  if (!raw || typeof raw !== 'object') throw Object.assign(new Error('Invalid track'), { status: 400 });
  const title = clean(raw.title, 100) || 'Untitled track';
  const artist = clean(raw.artist, 70) || 'Unknown artist';
  let url = clean(raw.url, 2048);
  let u;
  try { u = new URL(url); } catch { throw Object.assign(new Error('Paste a valid music link.'), { status: 400 }); }
  if (!['http:', 'https:'].includes(u.protocol)) throw Object.assign(new Error('Only web links are supported.'), { status: 400 });
  let kind = 'audio', videoId = null;
  const host = u.hostname.toLowerCase().replace(/^www\./, '');
  if (host === 'youtu.be' || host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
    videoId = host === 'youtu.be' ? u.pathname.split('/')[1] : u.searchParams.get('v') || u.pathname.match(/^\/(?:shorts|embed|live)\/([^/?]+)/)?.[1];
    if (!/^[\w-]{11}$/.test(videoId || '')) throw Object.assign(new Error('Please paste a YouTube video link.'), { status: 400 });
    kind = 'youtube'; url = 'https://www.youtube.com/watch?v=' + videoId;
  } else if (host === 'instagram.com' || host === 'instagr.am') {
    if (!/^\/(p|reel|tv)\/[\w-]+/.test(u.pathname)) throw Object.assign(new Error('Paste an Instagram post or Reel link.'), { status: 400 });
    kind = 'instagram'; url = `https://www.instagram.com${u.pathname}`;
  } else if (host === 'drive.google.com' || host === 'docs.google.com') {
    const id = u.pathname.match(/\/file\/d\/([\w-]+)/)?.[1] || u.searchParams.get('id');
    if (!id || !/^[\w-]{8,}$/.test(id)) throw Object.assign(new Error('Paste a Google Drive file share link.'), { status: 400 });
    kind = 'drive'; url = `https://drive.google.com/file/d/${id}/view`;
  }
  return { id: uid(), title, artist, url, kind, videoId, addedAt: Date.now() };
}
const demos = [
  { id:'demo-midnight', title:'Midnight Drive', artist:'Sonic Originals', url:'/demo/midnight-drive.wav', kind:'audio', demo:true, duration:26, art:0 },
  { id:'demo-glass', title:'Glass Horizon', artist:'Sonic Originals', url:'/demo/glass-horizon.wav', kind:'audio', demo:true, duration:26, art:1 },
  { id:'demo-velvet', title:'Velvet Circuit', artist:'Sonic Originals', url:'/demo/velvet-circuit.wav', kind:'audio', demo:true, duration:26, art:2 },
  { id:'demo-neon', title:'Neon Skyline', artist:'Sonic Originals', url:'/demo/neon-skyline.wav', kind:'audio', demo:true, duration:26, art:3 },
  { id:'demo-afterglow', title:'Afterglow', artist:'Sonic Originals', url:'/demo/afterglow.wav', kind:'audio', demo:true, duration:26, art:4 },
  { id:'demo-orbit', title:'Soft Orbit', artist:'Sonic Originals', url:'/demo/soft-orbit.wav', kind:'audio', demo:true, duration:26, art:5 }
];
function allowedQueueItem(t) { return { id: clean(t.id, 90), title: clean(t.title, 100), artist: clean(t.artist, 70), url: clean(t.url, 2048), kind: t.kind, videoId: t.videoId || null, duration: Number(t.duration) || 0, art: Number(t.art) || 0, demo: !!t.demo }; }
function getTrackForUser(u, id) { return [...demos, ...(u.tracks || [])].find(t => t.id === id); }
const fonts = ['DM Sans','Outfit','Space Grotesk','Poppins','Inter','Playfair Display','Cormorant Garamond','JetBrains Mono'];
const hex = /^#[0-9a-fA-F]{6}$/;
const palettes = {
  lavender: { bg:'#0c0a16',surface:'#171329',surface2:'#231b3b',primary:'#bd95ff',accent:'#f2a7e5',text:'#f8f4ff',muted:'#9b90b8',font:'Outfit' },
  sunset: { bg:'#180c16',surface:'#301625',surface2:'#482033',primary:'#ff9b78',accent:'#ffcb80',text:'#fff6ee',muted:'#bca3aa',font:'Outfit' },
  ocean: { bg:'#07171e',surface:'#102c36',surface2:'#1a3e46',primary:'#5cdfd4',accent:'#88b8ff',text:'#edffff',muted:'#91b4bb',font:'DM Sans' },
  forest: { bg:'#0b1712',surface:'#182c21',surface2:'#244533',primary:'#a4da91',accent:'#ebdd98',text:'#f3ffed',muted:'#a7bda8',font:'DM Sans' },
  cherry: { bg:'#1b0a17',surface:'#351326',surface2:'#481c33',primary:'#ff86b1',accent:'#ffb6cc',text:'#fff0f6',muted:'#c19eae',font:'Poppins' },
  midnight: { bg:'#090d18',surface:'#141d32',surface2:'#202c44',primary:'#95acff',accent:'#c2beff',text:'#f0f4ff',muted:'#9ba9c4',font:'Space Grotesk' }
};
function smartTheme(prompt) { const p = prompt.toLowerCase(); const key = /ocean|sea|blue|rain|water|ice|aqua/.test(p) ? 'ocean' : /forest|green|nature|moss|sage|garden/.test(p) ? 'forest' : /sunset|orange|warm|peach|gold|retro|summer/.test(p) ? 'sunset' : /cherry|pink|strawberry|rose|coquette|barbie/.test(p) ? 'cherry' : /night|black|space|cyber|galaxy|dark blue/.test(p) ? 'midnight' : 'lavender'; const result = { ...palettes[key] }; if (/elegant|vintage|royal|classic|romantic/.test(p)) result.font = 'Playfair Display'; else if (/futur|tech|cyber|robot/.test(p)) result.font = 'Space Grotesk'; else if (/minimal|clean|simple/.test(p)) result.font = 'Inter'; else if (/cute|soft|kawaii/.test(p)) result.font = 'Poppins'; return result; }
function validateTheme(theme, fallback) { const out = {}; for (const k of ['bg','surface','surface2','primary','accent','text','muted']) out[k] = hex.test(theme[k]) ? theme[k] : fallback[k]; out.font = fonts.includes(theme.font) ? theme.font : fallback.font; return out; }

const sockets = new Set();
function wsSend(c, data) { if (c.socket.destroyed) return; const p = Buffer.from(JSON.stringify(data)); let h; if (p.length < 126) h = Buffer.from([0x81, p.length]); else if (p.length < 65536) { h = Buffer.alloc(4); h[0] = 0x81; h[1] = 126; h.writeUInt16BE(p.length, 2); } else { h = Buffer.alloc(10); h[0] = 0x81; h[1] = 127; h.writeBigUInt64BE(BigInt(p.length), 2); } c.socket.write(Buffer.concat([h, p])); }
function roomUsers(code) { return [...new Map([...sockets].filter(c => c.roomCode === code && c.user).map(c => [c.user.id, { id: c.user.id, username: c.user.username }])).values()]; }
function broadcast(code, data) { for (const c of sockets) if (c.roomCode === code) wsSend(c, data); }
function present(code) { broadcast(code, { type:'presence', users:roomUsers(code) }); }
function leave(c) { const prev = c.roomCode; c.roomCode = null; if (prev) present(prev); }
function onMessage(c, msg) {
  if (!msg || typeof msg !== 'object') return;
  if (msg.type === 'auth') { if (c.user) return; c.user = checkToken(msg.token); wsSend(c, { type:'auth', ok:!!c.user, username:c.user?.username }); return; }
  if (!c.user) { wsSend(c, { type:'error', error:'Sign in to use rooms.' }); return; }
  if (msg.type === 'join') {
    const code = clean(msg.code, 32); const room = db.rooms.find(r => r.code === code);
    if (!room) { wsSend(c, { type:'error', error:'This room no longer exists.' }); return; }
    leave(c); c.roomCode = code;
    wsSend(c, { type:'room', room:publicRoom(room) }); present(code); return;
  }
  const r = db.rooms.find(r => r.code === c.roomCode);
  if (!r) { wsSend(c, { type:'error', error:'Join a room first.' }); return; }
  if (msg.type === 'chat') {
    if (limited('chat:'+c.user.id, 25, 10000)) return;
    const content = clean(msg.text, 400);
    if (!content) return;
    const entry = { id:uid(), text:content, username:c.user.username, userId:c.user.id, at:Date.now() };
    r.messages ||= []; r.messages.push(entry); r.messages = r.messages.slice(-100);
    save(); broadcast(r.code, { type:'chat', message:entry }); return;
  }
  if (msg.type === 'add_track') {
    const t = getTrackForUser(c.user, msg.trackId);
    if (!t) return;
    r.queue ||= [];
    if (r.queue.length >= 100) { wsSend(c, { type:'error', error:'This queue is full.' }); return; }
    const existing = r.queue.find(s => s.id === t.id);
    if (!existing) r.queue.push(allowedQueueItem(t));
    save(); broadcast(r.code, { type:'queue', queue:r.queue });
    return;
  }
  if (msg.type === 'remove_track') {
    r.queue = (r.queue || []).filter(t => t.id !== msg.trackId);
    if (r.state?.trackId === msg.trackId) r.state = { trackId:null, playing:false, position:0, updatedAt:Date.now() };
    save(); broadcast(r.code, { type:'queue', queue:r.queue }); broadcast(r.code, { type:'playback', state:publicRoom(r).state }); return;
  }
  if (msg.type === 'switch') {
    const t = (r.queue || []).find(q => q.id === msg.trackId);
    if (!t) return;
    r.state = { trackId:t.id, playing:true, position:0, updatedAt:Date.now() };
    save(); broadcast(r.code, { type:'playback', state:publicRoom(r).state, by:c.user.username }); return;
  }
  if (msg.type === 'playback') {
    if (!r.state?.trackId) return;
    if (limited('playback:'+c.user.id, 60, 10000)) return;
    r.state = { trackId:r.state.trackId, playing:!!msg.playing, position:Math.max(0, Math.min(86400, Number(msg.position) || 0)), updatedAt:Date.now() };
    save(); broadcast(r.code, { type:'playback', state:publicRoom(r).state, by:c.user.username }); return;
  }
  if (msg.type === 'sync') wsSend(c, { type:'playback', state:publicRoom(r).state });
}
function handleFrames(c, chunk) {
  c.buf = Buffer.concat([c.buf, chunk]);
  if (c.buf.length > 128 * 1024) { c.socket.destroy(); return; }
  while (c.buf.length >= 2) {
    const first = c.buf[0], second = c.buf[1]; let off = 2; let len = second & 127;
    if (!(second & 128)) { c.socket.destroy(); return; } // browser client frames must be masked
    if (len === 126) { if (c.buf.length < 4) return; len = c.buf.readUInt16BE(2); off = 4; }
    else if (len === 127) { if (c.buf.length < 10) return; const l = c.buf.readBigUInt64BE(2); if (l > 65536n) { c.socket.destroy(); return; } len = Number(l); off = 10; }
    if (len > 65536) { c.socket.destroy(); return; }
    if (c.buf.length < off + 4 + len) return;
    const mask = c.buf.subarray(off, off+4); const payload = Buffer.from(c.buf.subarray(off+4, off+4+len)); c.buf = c.buf.subarray(off+4+len);
    for (let i=0; i<payload.length; i++) payload[i] ^= mask[i%4];
    const op = first & 0x0f;
    if (!(first & 0x80)) { c.socket.destroy(); return; } // fragmented messages unsupported
    if (op === 8) { c.socket.end(); return; }
    if (op === 9) { c.socket.write(Buffer.from([0x8a, payload.length, ...payload])); continue; }
    if (op !== 1) continue;
    try { onMessage(c, JSON.parse(payload.toString('utf8'))); } catch (e) { wsSend(c, { type:'error', error:'Invalid room message.' }); }
  }
}
const MIME = { '.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon','.woff2':'font/woff2','.wav':'audio/wav','.mp3':'audio/mpeg','.m4a':'audio/mp4','.ogg':'audio/ogg','.flac':'audio/flac','.webm':'audio/webm' };
function sendFile(req,res, file) {
  let stat; try { stat = fs.statSync(file); } catch { return fail(res, 404, 'Not found'); }
  if (!stat.isFile()) return fail(res,404,'Not found');
  const type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
  const range = req.headers.range;
  const headers = { 'Content-Type':type, 'Accept-Ranges':'bytes', 'X-Content-Type-Options':'nosniff', 'Cache-Control':file.includes('/demo/') ? 'public, max-age=86400' : 'no-cache' };
  if (range && /^(audio|video)\//.test(type)) {
    const match = range.match(/^bytes=(\d*)-(\d*)$/);
    if (!match) { res.writeHead(416, { ...headers, 'Content-Range': `bytes */${stat.size}` }); res.end(); return; }
    let start = match[1] ? Number(match[1]) : 0; let end = match[2] ? Number(match[2]) : stat.size - 1;
    if (!match[1] && match[2]) { start = Math.max(0, stat.size - Number(match[2])); end = stat.size - 1; }
    if (start >= stat.size || end < start) { res.writeHead(416, { ...headers, 'Content-Range': `bytes */${stat.size}` }); res.end(); return; }
    end = Math.min(end, stat.size - 1);
    res.writeHead(206, { ...headers, 'Content-Range':`bytes ${start}-${end}/${stat.size}`, 'Content-Length':end-start+1 }); fs.createReadStream(file,{start,end}).pipe(res); return;
  }
  res.writeHead(200, {...headers, 'Content-Length':stat.size}); fs.createReadStream(file).pipe(res);
}
async function handle(req,res) {
  const address = new URL(req.url, 'http://localhost'); const route = address.pathname;
  if (route.startsWith('/api/')) {
    const ip = req.socket.remoteAddress || '?';
    if (limited('http:'+ip, 180, 60000)) return fail(res, 429, 'Too many requests; please try again shortly.');
    if (req.method === 'POST' && route === '/api/register') {
      if (limited('register:'+ip, 10, 3600000)) return fail(res,429,'Too many registration attempts.');
      const b=await jsonBody(req); const username=clean(b.username,30); const email=clean(b.email,120).toLowerCase(); const pass=String(b.password||'');
      if (!/^[a-zA-Z0-9_.-]{3,24}$/.test(username) || !/^\S+@\S+\.\S+$/.test(email) || pass.length<8 || pass.length>128) return fail(res,400,'Use a 3–24 character username, valid email, and password with at least 8 characters.');
      if (db.users.some(u=>u.email===email || u.username.toLowerCase()===username.toLowerCase())) return fail(res,409,'That email or username is already used.');
      const salt=crypto.randomBytes(16).toString('hex'); const u={id:uid(),username,email,salt,hash:passHash(pass,salt),liked:[],tracks:[],playlists:[],createdAt:Date.now()};
      db.users.push(u); save(); return send(res,201,{token:tokenFor(u),user:profile(u)});
    }
    if (req.method === 'POST' && route === '/api/login') {
      if (limited('login:'+ip, 30, 15*60000)) return fail(res,429,'Too many sign-in attempts.');
      const b=await jsonBody(req); const key=clean(b.email,120).toLowerCase(); const pass=String(b.password||'');
      const u=db.users.find(u=>u.email===key || u.username.toLowerCase()===key);
      if (!u || pass.length>128 || passHash(pass,u.salt)!==u.hash) return fail(res,401,'Incorrect login details.');
      return send(res,200,{token:tokenFor(u),user:profile(u)});
    }
    if (req.method === 'GET' && route === '/api/me') { const u=requireAuth(req,res); if (u) send(res,200,{user:profile(u)}); return; }
    if (req.method === 'GET' && route === '/api/demo') return send(res,200,{ tracks:demos });
    if (req.method === 'POST' && route === '/api/tracks') {
      const u=requireAuth(req,res); if (!u) return;
      const b=await jsonBody(req); if (u.tracks.length>500) return fail(res,400,'Your library is full.');
      const t=validTrack(b); u.tracks.unshift(t); save(); return send(res,201,{track:t,user:profile(u)});
    }
    if (req.method === 'DELETE' && route.startsWith('/api/tracks/')) {
      const u=requireAuth(req,res); if (!u) return; const id=route.slice('/api/tracks/'.length);
      const t=u.tracks.find(t=>t.id===id); u.tracks=u.tracks.filter(t=>t.id!==id); u.liked=u.liked.filter(i=>i!==id);
      for (const p of u.playlists) p.tracks=p.tracks.filter(i=>i!==id);
      if (t && t.kind==='audio' && t.url?.startsWith('/uploads/')) { try { fs.unlinkSync(path.join(UPLOADS,path.basename(t.url))); } catch {} }
      save(); return send(res,200,{user:profile(u)});
    }
    if (req.method === 'POST' && route === '/api/like') {
      const u=requireAuth(req,res); if (!u) return; const b=await jsonBody(req);
      if (!getTrackForUser(u,b.trackId)) return fail(res,404,'Track not found.');
      const already=u.liked.includes(b.trackId); u.liked=already?u.liked.filter(i=>i!==b.trackId):[b.trackId,...u.liked]; save(); return send(res,200,{liked:u.liked});
    }
    if (req.method === 'POST' && route === '/api/playlists') {
      const u=requireAuth(req,res); if (!u) return; const b=await jsonBody(req); const title=clean(b.name,50);
      if (!title) return fail(res,400,'Give your playlist a name.'); if (u.playlists.length>=30) return fail(res,400,'Playlist limit reached.');
      const p={id:uid(),name:title,tracks:[]}; u.playlists.push(p); save(); return send(res,201,{playlists:u.playlists});
    }
    if (req.method === 'POST' && route.match(/^\/api\/playlists\/[^/]+\/toggle$/)) {
      const u=requireAuth(req,res); if (!u) return; const id=route.split('/')[3]; const p=u.playlists.find(p=>p.id===id); if (!p) return fail(res,404,'Playlist not found.');
      const b=await jsonBody(req); if (!getTrackForUser(u,b.trackId)) return fail(res,404,'Track not found.');
      p.tracks=p.tracks.includes(b.trackId)?p.tracks.filter(s=>s!==b.trackId):[...p.tracks,b.trackId]; save(); return send(res,200,{playlists:u.playlists});
    }
    if (req.method === 'POST' && route === '/api/upload') {
      const u=requireAuth(req,res); if (!u) return; if (u.tracks.length>500) return fail(res,400,'Your library is full.');
      const mime=String(req.headers['content-type']||'').split(';')[0].trim().toLowerCase();
      const ext=({ 'audio/mpeg':'.mp3','audio/mp3':'.mp3','audio/wav':'.wav','audio/x-wav':'.wav','audio/ogg':'.ogg','audio/mp4':'.m4a','audio/x-m4a':'.m4a','audio/webm':'.webm','audio/flac':'.flac' })[mime];
      if (!ext) return fail(res,415,'Upload an MP3, WAV, OGG, M4A, WEBM, or FLAC audio file.');
      const body=await readBody(req,20*1024*1024); if (!body.length) return fail(res,400,'Empty file.');
      const file=uid()+ext; fs.writeFileSync(path.join(UPLOADS,file),body);
      const t={id:uid(),title:clean(req.headers['x-track-title'],100)||'Uploaded song',artist:clean(req.headers['x-track-artist'],70)||'My uploads',url:'/uploads/'+file,kind:'audio',addedAt:Date.now()};
      u.tracks.unshift(t); save(); return send(res,201,{track:t,user:profile(u)});
    }
    if (req.method === 'POST' && route === '/api/rooms') {
      const u=requireAuth(req,res); if (!u) return; const b=await jsonBody(req); const name=clean(b.name,48)||`${u.username}'s room`;
      const room={code:roomCode(),name,owner:u.id,queue:[],state:{trackId:null,playing:false,position:0,updatedAt:Date.now()},messages:[],createdAt:Date.now()};
      db.rooms.push(room); save(); return send(res,201,{room:publicRoom(room)});
    }
    if (req.method === 'GET' && route.match(/^\/api\/rooms\/[a-f0-9]{10}$/)) {
      const u=requireAuth(req,res); if (!u) return; const room=db.rooms.find(r=>r.code===route.split('/')[3]); if (!room) return fail(res,404,'Room not found.');
      return send(res,200,{room:publicRoom(room)});
    }
    if (req.method === 'POST' && route === '/api/theme') {
      const b=await jsonBody(req); const prompt=clean(b.prompt,250);
      if (prompt.length<3) return fail(res,400,'Describe your ideal theme first.');
      if (limited('theme:'+ip, 12, 3600000)) return fail(res,429,'Theme limit reached; try again later.');
      const base=smartTheme(prompt);
      if (!process.env.GEMINI_API_KEY) return send(res,200,{theme:base,source:'palette',message:'Generated with built-in palettes. Add GEMINI_API_KEY on the server for AI themes.'});
      try {
        const model=process.env.GEMINI_MODEL || 'gemini-2.5-flash';
        const system=`You are a music-app theme designer. Return only a JSON object, no markdown, with exactly these keys: bg, surface, surface2, primary, accent, text, muted, font. All seven colors must be 6-digit hexadecimal with #. Keep text readable against bg, surfaces dark unless user explicitly wants light. Font must be one of: ${fonts.join(', ')}. Theme requested: ${prompt}.`;
        const controller=new AbortController(); const timer=setTimeout(()=>controller.abort(),12000);
        let response; try { response=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':process.env.GEMINI_API_KEY},body:JSON.stringify({contents:[{parts:[{text:system}]}],generationConfig:{responseMimeType:'application/json',temperature:0.8}}),signal:controller.signal}); } finally {clearTimeout(timer);}
        if (!response.ok) throw new Error('Theme API unavailable');
        const result=await response.json(); const txt=result.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
        return send(res,200,{theme:validateTheme(JSON.parse(txt),base),source:'ai'});
      } catch { return send(res,200,{theme:base,source:'palette',message:'AI service was unavailable, so a built-in palette was created instead.'}); }
    }
    return fail(res,404,'Endpoint not found.');
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') return fail(res,405,'Method not allowed.');
  if (route === '/health') return send(res,200,{ok:true});
  let file;
  if (route.startsWith('/uploads/')) {
    const name=route.slice('/uploads/'.length); if (!/^[a-f0-9-]+\.(mp3|wav|ogg|m4a|webm|flac)$/.test(name)) return fail(res,403,'Not allowed'); file=path.join(UPLOADS,name);
  } else {
    const rel=route==='/'?'index.html':decodeURIComponent(route).replace(/^\/+/, '');
    file=path.resolve(PUB,rel);
    if (!file.startsWith(PUB + path.sep) && file !== PUB) return fail(res,403,'Not allowed');
  }
  return sendFile(req,res,file);
}
const server=http.createServer((req,res)=>{ Promise.resolve(handle(req,res)).catch(e=>{ if (!res.headersSent && !res.destroyed) fail(res,e.status||500,e.status?e.message:'An unexpected server error occurred.'); console.error(e.message); }); });
server.on('upgrade',(req,socket,head)=>{
  if (req.url !== '/ws' || (req.headers.upgrade||'').toLowerCase() !== 'websocket' || !req.headers['sec-websocket-key']) return socket.destroy();
  const origin=req.headers.origin;
  // Browsers must connect from the same site's origin (native non-browser clients may omit it).
  if (origin) { try { if (new URL(origin).host !== req.headers.host) return socket.destroy(); } catch { return socket.destroy(); } }
  const key=crypto.createHash('sha1').update(req.headers['sec-websocket-key']+'258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
  socket.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: '+key+'\r\n\r\n');
  const c={socket,buf:Buffer.alloc(0),user:null,roomCode:null}; sockets.add(c);
  socket.on('data',chunk=>handleFrames(c,chunk)); if(head.length) handleFrames(c,head);
  socket.on('error',()=>{}); socket.on('close',()=>{sockets.delete(c);leave(c);});
});
server.listen(PORT,'0.0.0.0',()=>console.log(`✦ Sonic running at http://localhost:${PORT}`));
