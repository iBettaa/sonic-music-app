/* Sonic — Spotify-inspired personal music app. No front-end dependencies. */
'use strict';
const $ = (s, root=document) => root.querySelector(s);
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const attr = escapeHtml;
const svgPaths = {
 star:'<path d="m12 2 3.2 6.8 7.5 1.1-5.4 5.2 1.3 7.4-6.6-3.6-6.6 3.6 1.3-7.4L1.3 9.9l7.5-1.1L12 2Z"/>',
 home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10Z"/>',search:'<circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 5 5"/>',
 sparkle:'<path d="m12 2 2.4 7.5L22 12l-7.6 2.5L12 22l-2.4-7.5L2 12l7.6-2.5L12 2Z"/><path d="m19 1 .8 2.2L22 4l-2.2.8L19 7l-.8-2.2L16 4l2.2-.8L19 1Z"/>',
 library:'<path d="M3 4v16m5-16v16m5-13v13m5-16v16"/>',heart:'<path d="M20.8 8.2c0 4.6-8.8 11.7-8.8 11.7S3.2 12.8 3.2 8.2a4.9 4.9 0 0 1 8.8-2.6 4.9 4.9 0 0 1 8.8 2.6Z"/>',
 radio:'<circle cx="12" cy="12" r="2"/><path d="M7.7 7.7a6 6 0 0 0 0 8.6m8.6-8.6a6 6 0 0 1 0 8.6M4.7 4.7a10 10 0 0 0 0 14.6m14.6-14.6a10 10 0 0 1 0 14.6"/>',
 palette:'<path d="M12 3a9 9 0 1 0 0 18h2a2 2 0 0 0 2-2c0-1-.5-2 1-2h1a5 5 0 0 0 4-5c0-5-4.5-9-10-9Z"/><circle cx="6.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="16" cy="7" r="1"/><circle cx="18" cy="12" r="1"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',play:'<path d="m8 5 11 7-11 7V5Z"/>',pause:'<path d="M8 5v14M16 5v14"/>',previous:'<path d="M5 5v14m13-14-10 7 10 7V5Z"/>',next:'<path d="M19 5v14M6 5l10 7-10 7V5Z"/>',music:'<path d="M9 18V5l12-3v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="15" r="3"/>',
 volume:'<path d="M11 5 6 9H3v6h3l5 4V5Zm4 4a4 4 0 0 1 0 6m3-9a8 8 0 0 1 0 12"/>',muted:'<path d="M11 5 6 9H3v6h3l5 4V5Zm5 4 5 6m0-6-5 6"/>',
 logout:'<path d="M9 4H4v16h5m4-4 4-4-4-4m4 4H8"/>',user:'<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
 ellipsis:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',x:'<path d="M5 5 19 19M19 5 5 19"/>',check:'<path d="m5 12 5 5L20 7"/>',
 download:'<path d="M12 3v14m-5-5 5 5 5-5M4 18v3h16v-3"/>',upload:'<path d="M12 17V3m-5 5 5-5 5 5M4 17v4h16v-4"/>',link:'<path d="m9 15 6-6M10 7l2-2a5 5 0 0 1 7 7l-2 2m-3 3-2 2a5 5 0 0 1-7-7l2-2"/>',
 send:'<path d="m3 3 18 9-18 9 4-9-4-9Zm4 9h14"/>',copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
 chevron:'<path d="m8 5 7 7-7 7"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',wand:'<path d="m4 20 13-13 3 3L7 23l-3-3ZM15 4l2-2m4 4 2-2M8 3l1-2"/>',
 trash:'<path d="M4 7h16m-14 0 1 14h10l1-14M9 7V4h6v3m-6 4v7m6-7v7"/>',users:'<circle cx="9" cy="8" r="4"/><path d="M2 21v-2a7 7 0 0 1 14 0v2M17 4a4 4 0 0 1 0 8m1 4a5 5 0 0 1 4 5"/>',external:'<path d="M14 4h6v6m0-6-9 9M18 14v6H4V6h6"/>',
 headphones:'<path d="M4 14v-3a8 8 0 0 1 16 0v3M4 14h4v7H6a2 2 0 0 1-2-2v-5Zm16 0h-4v7h2a2 2 0 0 0 2-2v-5Z"/>',
 menu:'<path d="M4 6h16M4 12h16M4 18h16"/>', info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v1"/>'};
function ico(name,cl=''){return `<svg class="${cl}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">${svgPaths[name] || svgPaths.music}</svg>`;}
const backgrounds=['linear-gradient(135deg,#e13047,#542051)','linear-gradient(135deg,#d38623,#495528)','linear-gradient(135deg,#ca0e8b,#53145b)','linear-gradient(135deg,#7426cb,#2c1276)','linear-gradient(135deg,#317eb5,#18317a)','linear-gradient(135deg,#28abb2,#2e4470)','linear-gradient(135deg,#b13f82,#5f1964)','linear-gradient(135deg,#344cb8,#301d74)'];
const palettes={
 default:{bg:'#090b11',surface:'#121621',surface2:'#1c2232',primary:'#22d768',accent:'#8ca2ff',text:'#f6f7fb',muted:'#8d9bb1',font:'DM Sans'},
 emerald:{bg:'#09110e',surface:'#101b18',surface2:'#1d3227',primary:'#24dc78',accent:'#8bf3b7',text:'#f5fff9',muted:'#8cbba3',font:'DM Sans'},
 midnight:{bg:'#090d18',surface:'#141d32',surface2:'#202c44',primary:'#95acff',accent:'#c2beff',text:'#f0f4ff',muted:'#9ba9c4',font:'Space Grotesk'},
 lavender:{bg:'#0c0a16',surface:'#171329',surface2:'#231b3b',primary:'#bd95ff',accent:'#f2a7e5',text:'#f8f4ff',muted:'#9b90b8',font:'Outfit'},
 retro:{bg:'#180c16',surface:'#301625',surface2:'#482033',primary:'#ff9b78',accent:'#ffcb80',text:'#fff6ee',muted:'#bca3aa',font:'Outfit'},
 forest:{bg:'#0b1712',surface:'#182c21',surface2:'#244533',primary:'#a4da91',accent:'#ebdd98',text:'#f3ffed',muted:'#a7bda8',font:'DM Sans'},
 cherry:{bg:'#1b0a17',surface:'#351326',surface2:'#481c33',primary:'#ff86b1',accent:'#ffb6cc',text:'#fff0f6',muted:'#c19eae',font:'Poppins'},
 ocean:{bg:'#07171e',surface:'#102c36',surface2:'#1a3e46',primary:'#5cdfd4',accent:'#88b8ff',text:'#edffff',muted:'#91b4bb',font:'DM Sans'}
};
const themeOptions=[['emerald','Emerald Echo'],['midnight','Midnight Wave'],['lavender','Lavender Dream'],['retro','Retro Synth'],['ocean','Ocean Drift'],['cherry','Cherry Pop'],['forest','Forest Lo-Fi']];
const fonts=['DM Sans','Outfit','Space Grotesk','Poppins','Inter','Playfair Display','Cormorant Garamond','JetBrains Mono'];
const navItems=[['home','Home','home'],['search','Search','search'],['jams','Your Jams','sparkle'],['library','Your Library','library'],['liked','Liked Songs','heart'],['rooms','Listening Rooms','radio'],['theme','Theme Studio','palette']];
const seed={id:'local',username:'Guest',email:''};
const state={user:null,token:localStorage.getItem('sonic_token')||'',demo:[],page:'home',query:'',libraryQuery:'',filter:'All',playlist:null,modal:null,modalTab:'Link',menu:null,liked:[],tracks:[],playlists:[],themeName:localStorage.getItem('sonic_theme_name')||'default',theme:null,current:null,playing:false,time:0,duration:0,volume:.78,room:null,pendingRoom:new URL(location.href).searchParams.get('room'),roomUsers:[],roomJoin:'',ws:null,shouldJoinAfterAuth:false,pendingRoomTrack:null};
try{state.theme=JSON.parse(localStorage.getItem('sonic_theme'))||palettes.default;}catch{state.theme=palettes.default;}
const audio = new Audio(); audio.preload='metadata'; audio.volume=state.volume;
// Local equalizer settings; each listener controls their own sound.
const eq = {bass:Number(localStorage.getItem('sonic_bass')||0),treble:Number(localStorage.getItem('sonic_treble')||0)};
let audioContext=null,bassFilter=null,trebleFilter=null;
function ensureEqualizer(){
 try{
  if(!audioContext){
   const Context=window.AudioContext||window.webkitAudioContext;
   if(!Context)return;
   audioContext=new Context();
   const source=audioContext.createMediaElementSource(audio);
   bassFilter=audioContext.createBiquadFilter();bassFilter.type='lowshelf';bassFilter.frequency.value=180;
   trebleFilter=audioContext.createBiquadFilter();trebleFilter.type='highshelf';trebleFilter.frequency.value=3200;
   source.connect(bassFilter);bassFilter.connect(trebleFilter);trebleFilter.connect(audioContext.destination);
  }
  bassFilter.gain.value=eq.bass;trebleFilter.gain.value=eq.treble;
  if(audioContext.state==='suspended')audioContext.resume().catch(()=>{});
 }catch(error){console.warn('Equalizer unavailable for this audio source:',error);}
}

let ytPlayer=null, ytApiRequested=false, playerKind='audio', lastPaint=0, reconnectTimer=null;const pendingMessages=[];
const getAll=()=>[...state.tracks,...state.demo];
const getTrack=id=>getAll().find(t=>t.id===id) || (state.discoveryResults||[]).find(t=>t.id===id) || state.room?.queue?.find(t=>t.id===id);
const asDate=ms=>ms?new Date(ms).toLocaleDateString('en-US',{month:'short',day:'2-digit',year:'numeric'}):'Today';
const fmt=s=>!Number.isFinite(+s)?'--:--':`${Math.floor(Math.max(0,s)/60)}:${String(Math.floor(Math.max(0,s)%60)).padStart(2,'0')}`;
function toast(message,bad=false){const el=document.createElement('div');el.className='toast'+(bad?' bad':'');el.textContent=message;$('#toasts').append(el);setTimeout(()=>el.remove(),3700);}
function setTheme(t,name='custom'){
 const p={...palettes.default,...t}; state.theme=p;state.themeName=name;
 for(const key of ['bg','surface','surface2','text','muted','primary','accent']) document.documentElement.style.setProperty('--'+key,p[key]);
 document.documentElement.style.setProperty('--font',`'${p.font}', sans-serif`);
 localStorage.setItem('sonic_theme',JSON.stringify(p));localStorage.setItem('sonic_theme_name',name);
 renderContent();
}
function cover(track,size='regular'){
 const ix=Number(track?.art??Math.abs([...String(track?.id||'')].reduce((v,c)=>v+c.charCodeAt(0),0))%backgrounds.length);
 return `<span class="song-thumb ${size}" style="background:${backgrounds[ix%backgrounds.length]}">${ico('music')}</span>`;
}
function liked(id){return state.liked.includes(id);}
function authRequired(){if(state.user)return true; openModal('auth');toast('Create an account or log in to save your music.');return false;}
function saveUser(user){state.user=user;state.tracks=user.tracks||[];state.liked=user.liked||[];state.playlists=user.playlists||[];renderShell();renderContent();}
async function api(path,method='GET',data,headers={}){
 const opts={method,headers:{...(state.token?{Authorization:'Bearer '+state.token}:{}),...headers}};
 if(data!==undefined){opts.headers['Content-Type']='application/json';opts.body=JSON.stringify(data);}
 const res=await fetch(path,opts);let output;try{output=await res.json();}catch{output={error:'Unexpected server response'};}
 if(!res.ok)throw new Error(output.error||`Request failed (${res.status})`);
 return output;
}
async function init(){setTheme(state.theme,state.themeName);
 try{const demos=await api('/api/demo');state.demo=demos.tracks||[];}catch{toast('Could not load demo songs.',true);}
 if(state.token){try{const r=await api('/api/me');saveUser(r.user);connectWS();}catch{state.token='';localStorage.removeItem('sonic_token');}}
 renderShell();renderContent();renderPlayer();
 if(state.pendingRoom){state.page='rooms';renderShell();renderContent();if(state.user)joinRoom(state.pendingRoom);else openModal('auth');}
}
function renderShell(){
 $('#sidebar').innerHTML=`<div class="brand">${ico('star','brand-star')}<span>Sonic</span></div><div class="navlist">${navItems.map(([id,name,icon])=>`<button class="nav ${state.page===id?'active':''}" data-page="${id}">${ico(icon)}<span>${name}</span></button>`).join('')}</div>
 <div class="side-section"><div class="side-heading"><span>PLAYLISTS</span><button class="side-add" data-action="create-playlist" title="Create playlist">${ico('plus')}</button></div>
 <div class="side-playlists">${state.playlists.length?state.playlists.map(p=>`<button class="playlist-nav" data-playlist="${attr(p.id)}">${escapeHtml(p.name)}</button>`).join(''):'<div class="side-note">Make your first playlist with +</div>'}</div>
 <div class="side-heading" style="margin-top:14px">YOUR ROOMS</div><div class="side-note">${state.room?'Listening in '+escapeHtml(state.room.name):'Share a song to start a room.'}</div></div>
 <div class="side-spacer"></div><button class="user-tile" data-action="user"><span class="user-bubble ${state.user?'':'guest'}">${escapeHtml((state.user?.username||'G')[0].toUpperCase())}</span><span style="min-width:0"><span class="user-name">${escapeHtml(state.user?.username||'Guest listener')}</span><span class="user-email">${escapeHtml(state.user?.email||'Sign in to save songs')}</span></span>${ico(state.user?'logout':'user')}</button>`;
 $('#topbar').innerHTML=`<div class="global-search">${ico('search')}<input id="globalSearch" type="search" value="${attr(state.query)}" placeholder="What do you want to listen to?" aria-label="Search your library"></div><div class="top-actions">${state.room?`<button class="pill soft sm" data-page="rooms">${ico('radio')} In a room</button>`:''}${state.user?'':`<button class="pill sm" data-action="auth">Log in / Sign up</button>`}<button class="avatar-mini" data-action="user" aria-label="Account">${escapeHtml((state.user?.username||'G')[0].toUpperCase())}</button></div>`;
}
function renderContent(){const view=$('#view');if(!view)return;
 const fns={home:homeHTML,search:searchHTML,jams:jamsHTML,library:libraryHTML,liked:likedHTML,rooms:roomsHTML,theme:themeHTML,playlist:playlistHTML};
 view.innerHTML=(fns[state.page]||homeHTML)();
 if(state.page==='rooms'){const log=$('.chat-log');if(log)log.scrollTop=log.scrollHeight;}
}
function goto(page){state.page=page;state.menu=null;if(page!=='playlist')state.playlist=null;renderShell();renderContent();$('#main').scrollTop=0;}
function quickTile(track){return `<button class="quick-tile" data-play="${attr(track.id)}"><span class="quick-cover" style="background:${backgrounds[Number(track.art||0)%backgrounds.length]}">${ico('music')}</span><span>${escapeHtml(track.title)}</span><span class="quick-play">${ico('play')}</span></button>`;}
function homeHTML(){const tracks=getAll().slice(0,5);const all=getAll();const who=state.user?.username?.replace(/[_-]+/g,' ') || 'music lover';return `<div class="hero"><p class="eyebrow">Good ${new Date().getHours()<12?'morning':new Date().getHours()<18?'afternoon':'evening'}</p><h1>${escapeHtml(who)}, what's the vibe?</h1><div class="actions"><button class="pill" data-action="add">${ico('plus')} Add music</button><button class="pill soft" data-action="create-room">${ico('radio')} Listen with friends</button></div>
 <div class="quick-grid"><button class="quick-tile" data-page="liked"><span class="quick-cover" style="background:linear-gradient(140deg,#4d79d3,#28ba88)">${ico('heart')}</span><span>Liked Songs</span><small class="muted">${state.liked.length}</small></button>${tracks.map(quickTile).join('')}</div></div>
 <div class="section-heading"><div><h2>Jams made for you</h2><p>Built from what you listen to — updated every day.</p></div><button class="text-button" data-page="jams">Show all</button></div>${jamCards(all)}`;}
function jamCards(list){const count=list.length;return `<div class="covers">${[['Web Mix','YOUR FAVORITE SOURCE','You listen to the web the most — here\'s all of it',list],['Rediscover','UNPLAYED GEMS','Songs in your library you haven\'t played yet',list.slice().reverse()]].map(([title,label,descr,tracks],i)=>`<article class="mix-card"><div class="mix-cover">${Array.from({length:4},()=>`<div class="mix-quarter">♪</div>`).join('')}<span class="mix-label">${label}</span><span class="mix-name">${title}</span><button class="mix-play" data-play="${attr(tracks[0]?.id||'')}" aria-label="Play ${title}">${ico('play')}</button></div><p>${descr}</p><div class="count">${count} songs</div><button class="jam-action" data-action="jam-room">${ico('radio')} Jam with friends</button></article>`).join('')}</div>`;}
function searchHTML(){
 const val=state.query.toLowerCase().trim();
 const mine=getAll().filter(t=>`${t.title} ${t.artist} ${t.kind}`.toLowerCase().includes(val));
 const discovery=state.discoveryResults||[];
 return `<div class="page-top"><div><h1>Discover music</h1><p>Search a worldwide song catalog. Listen to a 30-second preview without uploading anything.</p></div><button class="pill sm" data-action="add">${ico('plus')} Add your music</button></div>
 ${val?`<div class="section-heading"><div><h2>All songs</h2><p>${state.discoveryLoading?'Searching the music catalog…':state.discoveryError?escapeHtml(state.discoveryError):`${discovery.length} matches from the iTunes catalog · 30-second previews`}</p></div></div>
 ${discovery.length?`<div class="discover-list">${discovery.map(t=>`<div class="discover-row"><img src="${attr(t.artwork)}" alt="" loading="lazy"><div class="discover-info"><strong>${escapeHtml(t.title)}</strong><small>${escapeHtml(t.artist)} · ${escapeHtml(t.album||'Single')}</small></div><button class="pill sm" data-play="${attr(t.id)}">${ico('play')} Preview</button><a class="discover-store" href="${attr(t.storeUrl)}" target="_blank" rel="noopener noreferrer" title="Open licensed music store">${ico('external')}</a></div>`).join('')}</div>`:state.discoveryLoading?'<p class="muted">Searching…</p>':'<p class="muted">No matching previews yet. Try another title or artist.</p>'}`:''}
 ${mine.length?`<div class="section-heading"><div><h2>Your music</h2><p>${mine.length} tracks in your library</p></div></div>${tableHTML(mine)}`:!val?'<p class="muted">Type an artist or song title in the search box above to discover music.</p>':''}
 <p class="discover-notice">Search results are provided by Apple's iTunes catalog. Previews are not full tracks, and copyrighted previews cannot be downloaded through Sonic. You can download audio you own or have permission to save.</p>`;
}
let discoveryTimer=0,discoverySeq=0;
function searchCatalog(term){
 clearTimeout(discoveryTimer);const seq=++discoverySeq;
 state.discoveryLoading=!!term.trim();state.discoveryError='';state.discoveryResults=[];
 if(state.page==='search')renderContent();
 if(!term.trim())return;
 discoveryTimer=setTimeout(()=>{
  const cb='sonicItunes'+seq;
  const script=document.createElement('script');
  let completed=false;
  const cleanup=()=>{script.remove();delete window[cb];clearTimeout(timeout);};
  window[cb]=data=>{
   if(completed)return;completed=true;cleanup();if(seq!==discoverySeq)return;
   state.discoveryResults=(Array.isArray(data?.results)?data.results:[]).filter(r=>r.trackId&&r.previewUrl&&/^https:\/\//.test(r.previewUrl)).map(r=>({id:'catalog-'+r.trackId,title:r.trackName||'Untitled',artist:r.artistName||'Unknown',album:r.collectionName||'',artwork:(r.artworkUrl100||'').replace(/^http:/,'https:'),url:r.previewUrl,kind:'audio',source:'itunes-preview',duration:30,storeUrl:r.trackViewUrl||'https://music.apple.com/',art:Math.abs(r.trackId)%backgrounds.length}));
   state.discoveryLoading=false;if(state.page==='search')renderContent();
  };
  script.onerror=()=>{if(completed)return;completed=true;cleanup();if(seq!==discoverySeq)return;state.discoveryLoading=false;state.discoveryError='Music search is unavailable right now. Please try again.';if(state.page==='search')renderContent();};
  const timeout=setTimeout(()=>script.onerror(),10000);
  script.src='https://itunes.apple.com/search?'+new URLSearchParams({term,media:'music',entity:'song',limit:'30',country:'US',callback:cb});
  document.head.append(script);
 },420);
}
function canDownload(track){return !!track&&(!!track.demo||(track.kind==='audio'&&typeof track.url==='string'&&track.url.startsWith('/uploads/')));}
function downloadSong(id){const track=getTrack(id);if(!track)return;
 if(!canDownload(track)){toast('This recording is not licensed for downloading from Sonic.',true);return;}
 const a=document.createElement('a');a.href=track.url;a.download=(track.title||'sonic-track').replace(/[\\/:*?"<>|]/g,'').slice(0,90)+(track.url.match(/\.(mp3|wav|ogg|m4a|flac)(?:$|\?)/i)?.[0]||'.audio');document.body.append(a);a.click();a.remove();
}

function jamsHTML(){return `<div class="page-top"><div><p style="color:var(--primary);font-weight:800;font-size:10px;letter-spacing:1px">MADE FOR YOU</p><h1>Your Jams</h1><p>Playlists that update as you listen — your most played, recent discoveries, and old favorites.</p></div></div><div class="room-features"><article class="feature-card"><span class="tag">✦ AI JAM MAKER</span><h3>A fresh jam built from what you actually listen to</h3><p>Curated around your favorite tracks and new discoveries.</p><div class="actions"><button class="pill sm" data-play="${attr(getAll()[0]?.id||'')}">${ico('play')} Play a jam</button><button class="pill soft sm" data-action="create-room">${ico('radio')} Create my jam</button></div></article><article class="feature-card"><span class="tag">♫ SHARED JAMS</span><h3>Mix your taste with a friend's</h3><p>Create a room, add tracks, and listen together with synced playback.</p><button class="pill soft sm" data-action="create-room">Create listening room</button></article></div><div class="section-heading"><div><h2>Jams for you</h2><p>Your mixes, ready when you are.</p></div></div>${jamCards(getAll())}`;}
function pageHeading(title,subtitle='',controls=''){return `<div class="page-top"><div><h1>${title}</h1><p>${subtitle}</p></div><div class="actions">${controls}</div></div>`;}
function libraryHTML(){let tracks=getAll();const filter=state.filter;if(filter!=='All')tracks=tracks.filter(t=>({Link:['audio'],YouTube:['youtube'],Instagram:['instagram'],Drive:['drive'],Upload:['upload'],Google:['google']}[filter]||[]).some(k=>k==='audio'?(t.kind==='audio'&&!t.url.startsWith('/uploads/')&&!t.demo):k==='upload'?(t.kind==='audio'&&t.url.startsWith('/uploads/')):k===t.kind));
 if(state.libraryQuery)tracks=tracks.filter(t=>`${t.title} ${t.artist}`.toLowerCase().includes(state.libraryQuery.toLowerCase()));
 const controls=`<button class="pill icon-pill" data-play="${attr(tracks[0]?.id||'')}" title="Play all">${ico('play')}</button><button class="pill sm" data-action="add">${ico('plus')} Add music</button>`;
 return `${pageHeading('Your Library',`${getAll().length} songs added`,controls)}<div class="library-toolbar"><div class="filters">${['All','Upload','YouTube','Instagram','Drive','Google','Link'].map(f=>`<button class="filter ${state.filter===f?'active':''}" data-filter="${f}">${f}</button>`).join('')}</div><div class="small-search">${ico('search')}<input id="librarySearch" value="${attr(state.libraryQuery)}" placeholder="Search your songs" aria-label="Search library"></div></div>${tableHTML(tracks)}`;}
function likedHTML(){const tracks=getAll().filter(t=>liked(t.id));return `${pageHeading('Liked Songs',`${tracks.length} songs you've saved`,`<button class="pill icon-pill" data-play="${attr(tracks[0]?.id||'')}" title="Play liked songs">${ico('play')}</button>`)}${tableHTML(tracks)}`;}
function playlistHTML(){const p=state.playlists.find(p=>p.id===state.playlist);if(!p)return `<div class="empty">Playlist not found.</div>`;let tracks=p.tracks.map(id=>getTrack(id)).filter(Boolean);return `${pageHeading(escapeHtml(p.name),`${tracks.length} songs in your playlist`,`<button class="pill sm" data-action="add">${ico('plus')} Add music</button>`)}${tableHTML(tracks)}`;}
function sourceType(track){return track?.demo?'Demo':track.kind==='audio'?(track.url.startsWith('/uploads/')?'Upload':'Link'):track.kind==='youtube'?'YouTube':track.kind==='instagram'?'Instagram':track.kind==='drive'?'Drive':track.kind||'Link';}
function tableHTML(tracks){if(!tracks.length)return `<div class="empty">${ico('music')}<h3>No songs here yet</h3><p>Add music from your computer, YouTube, Google Drive, or a direct link. Your library will show up here.</p><button class="pill" data-action="add">${ico('plus')} Add a song</button></div>`;
 return `<table class="song-table"><thead><tr><th class="num">#</th><th>TITLE</th><th class="sourcecol">SOURCE</th><th class="datecol">ADDED</th><th class="actcol"></th></tr></thead><tbody>${tracks.map((t,i)=>`<tr><td class="num">${i+1}</td><td><div class="table-song">${cover(t)}<div style="min-width:0"><span class="song-title" role="button" tabindex="0" data-play="${attr(t.id)}">${escapeHtml(t.title)}</span><div class="song-artist">${escapeHtml(t.artist)}</div></div></div></td><td><span class="source-badge ${sourceType(t).toLowerCase()}">● ${escapeHtml(sourceType(t))}</span></td><td>${asDate(t.addedAt)}</td><td><div class="row-actions"><button class="icon-button ${liked(t.id)?'liked':''}" title="${liked(t.id)?'Unlike':'Like'} song" data-like="${attr(t.id)}">${ico('heart')}</button><span class="table-actions"><button class="icon-button" title="More song options" data-more="${attr(t.id)}">${ico('ellipsis')}</button>${state.menu===t.id?`<span class="drop-menu"><button data-play="${attr(t.id)}">Play song</button><button data-action="song-room" data-id="${attr(t.id)}">Add to listening room</button>${state.playlists.map(p=>`<button data-toggle-playlist="${attr(p.id)}" data-id="${attr(t.id)}">${p.tracks.includes(t.id)?'✓ ':''}${escapeHtml(p.name)}</button>`).join('')}${canDownload(t)?`<button data-download="${attr(t.id)}">Download audio</button>`:''}${!t.demo&&state.tracks.some(s=>s.id===t.id)?`<button data-delete="${attr(t.id)}">Delete from library</button>`:''}</span>`:''}</span></div></td></tr>`).join('')}</tbody></table>`;}
function roomsHTML(){if(!state.room)return `<div class="page-top"><div><p style="color:var(--primary);font-size:10px;letter-spacing:1px;font-weight:800">✦ LIVE TOGETHER</p><h1>Listening Rooms</h1><p>Share a song and a room opens with group chat. Everyone hears the same moment, and anyone can switch the track.</p></div></div><div class="actions"><button class="pill" data-action="create-room">${ico('plus')} New room</button><button class="pill soft" data-action="join-room">${ico('link')} Join with a code</button></div><div class="empty">${ico('users')}<h3>No room open yet</h3><p>Create one and share its link — or join your friends with a room code.</p><button class="pill" data-action="create-room">Create your first room</button></div>`;
 const r=state.room, members=state.roomUsers, liveTrack=r.queue.find(t=>t.id===r.state?.trackId), options=getAll().filter(t=>!r.queue.some(s=>s.id===t.id));
 return `<div class="page-top"><div><p style="color:var(--primary);font-weight:800;font-size:10px;letter-spacing:1px">● LIVE LISTENING ROOM</p><h1>${escapeHtml(r.name)}</h1><p>${members.length||1} listening · Room code: ${escapeHtml(r.code)}</p></div><div class="actions"><button class="pill soft sm" data-action="share-room">${ico('copy')} Invite friends</button><button class="pill ghost sm" data-action="leave-room">Leave</button></div></div>
 <div class="help-notice">${ico('radio')} Anyone in the room can add songs, change what plays, and chat. Audio files and supported YouTube embeds can sync; browser autoplay rules and external providers may limit exact synchronization.</div>
 <div class="room-layout"><div><section class="room-box"><div class="room-box-head"><strong>Now playing together</strong><span style="color:var(--primary);font-size:11px">● LIVE</span></div><div class="room-box-body">${liveTrack?`<div class="room-song room-now">${cover(liveTrack)}<div class="room-meta"><strong>${escapeHtml(liveTrack.title)}</strong><span>${escapeHtml(liveTrack.artist)}</span></div><button class="pill icon-pill" data-action="toggle" title="Play or pause">${ico(state.playing?'pause':'play')}</button></div>`:'<p class="muted">Add a song below to start your room.</p>'}<div class="member-pills" style="margin-top:17px">${(members.length?members:[{username:state.user?.username||'You'}]).map(u=>`<span class="member-pill">● ${escapeHtml(u.username)}</span>`).join('')}</div></div></section>
 <section class="room-box" style="margin-top:16px"><div class="room-box-head"><strong>Shared queue</strong><small class="muted">${r.queue.length} tracks</small></div><div class="room-box-body"><label class="field" style="margin:0">Add from your library <select class="room-add-select" id="roomAddTrack"><option value="">Choose a song to add...</option>${options.map(t=>`<option value="${attr(t.id)}">${escapeHtml(t.title)} — ${escapeHtml(t.artist)}</option>`).join('')}</select></label><button class="pill sm" data-action="room-add-selected" style="margin-top:10px">${ico('plus')} Add to queue</button><div style="margin-top:16px">${r.queue.length?r.queue.map(t=>`<div class="room-song ${liveTrack?.id===t.id?'room-now':''}">${cover(t)}<div class="room-meta"><strong>${escapeHtml(t.title)}</strong><span>${escapeHtml(t.artist)}</span></div><button class="icon-button" title="Play this song" data-switch="${attr(t.id)}">${ico('play')}</button><button class="icon-button" title="Remove song" data-room-remove="${attr(t.id)}">${ico('x')}</button></div>`).join(''):'<p class="muted">The queue is empty. Choose a song above.</p>'}</div></div></section></div>
 <section class="room-box" style="display:flex;flex-direction:column"><div class="room-box-head"><strong>${ico('users')} Group chat</strong><span class="muted" style="font-size:11px">${members.length||1} members</span></div><div class="chat-log">${r.messages.length?r.messages.map(m=>`<div class="chat-entry"><strong>${escapeHtml(m.username)}</strong><time>${new Date(m.at).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})}</time><p>${escapeHtml(m.text)}</p></div>`).join(''):'<div class="muted" style="font-size:12px">Say hi to everyone in the room! ✨</div>'}</div><form class="chat-form" id="chatForm"><input name="message" aria-label="Chat message" maxlength="400" placeholder="Send a message..." autocomplete="off" required><button class="pill icon-pill" type="submit" aria-label="Send message">${ico('send')}</button></form></section></div>`;
}
function themeHTML(){const t=state.theme;return `<div class="page-top"><div><p style="color:var(--primary);font-size:10px;letter-spacing:1px;font-weight:800">MAKE IT YOURS</p><h1>Theme Studio</h1><p>Pick a vibe, adjust the colors and fonts, or describe your dream theme.</p></div><button class="pill soft sm" data-action="reset-theme">Reset theme</button></div><div class="theme-section"><h2>Pick your vibe</h2><p>Every choice changes your Sonic universe instantly.</p><div class="theme-grid">${themeOptions.map(([name,label])=>`<button class="theme-choice ${state.themeName===name?'selected':''}" data-theme="${name}" style="background:linear-gradient(115deg,${palettes[name].surface},${palettes[name].bg});color:${palettes[name].primary}"><span class="theme-disc" style="background:${palettes[name].primary}"></span><strong style="color:${palettes[name].text}">${label}</strong>${state.themeName===name?`<span class="tick">${ico('check')}</span>`:''}</button>`).join('')}</div></div>
 <div class="theme-section theme-controls"><div><h2>Fonts</h2><p>Pick the font that feels like you. Changes apply everywhere.</p><div class="font-grid">${fonts.map(font=>`<button class="font-choice ${t.font===font?'selected':''}" data-font="${font}"><span class="font-sample" style="font-family:'${font}',sans-serif">Sonic Aa</span><small>${font}</small></button>`).join('')}</div></div><div><h2>Accent colors</h2><p>Little details, big personality.</p><div class="color-editor">${[['primary','Primary / buttons'],['accent','Secondary accent'],['bg','Background'],['surface','Main surface']].map(([k,label])=>`<label><input type="color" data-color="${k}" value="${attr(t[k])}"><span>${label}</span><small style="margin-left:auto;color:#899cb4">${escapeHtml(t[k])}</small></label>`).join('')}</div></div></div>
 <div class="theme-section"><div class="theme-prompt"><span class="tag">✦ CREATE WITH AI</span><h2 style="margin:8px 0 4px">Describe the look you're imagining</h2><p>Try "pink dreamy cyberpop", "midnight ocean" or "soft green forest with a classic font".</p><form id="themeForm"><textarea name="prompt" maxlength="250" required minlength="3" placeholder="My perfect Sonic theme feels like..."></textarea><button class="pill" type="submit">${ico('wand')} Generate my theme</button></form><p style="font-size:11px;margin:10px 0 0">Without a Gemini API key this creates a matching preset, not an AI-generated design.</p></div></div>`;}
function openModal(name,tab='Link'){state.modal=name;state.modalTab=tab;renderModal();}
function closeModal(){state.modal=null;$('#modalRoot').innerHTML='';}
function renderModal(){const m=state.modal;if(!m){$('#modalRoot').innerHTML='';return;}
 let body='';if(m==='auth'||m==='register'){const isReg=m==='register';body=`<h2>${isReg?'Create your Sonic account':'Welcome to Sonic ✦'}</h2><p>${isReg?'Save songs, favorites, themes and invite your friends to listening rooms.':'Sign in to your music, favorites, playlists, and listening rooms.'}</p><form id="authForm">${isReg?`<label class="field">Username<input name="username" minlength="3" maxlength="24" pattern="[A-Za-z0-9_.-]+" placeholder="Your username" autocomplete="username" required></label>`:''}<label class="field">Email ${isReg?'address':'or username'}<input name="email" ${isReg?'type="email"':'type="text"'} placeholder="you@example.com" autocomplete="email" required></label><label class="field">Password<input type="password" name="password" minlength="8" autocomplete="${isReg?'new-password':'current-password'}" placeholder="At least 8 characters" required></label><div class="modal-footer"><button type="button" class="modal-link" data-action="${isReg?'auth':'register'}">${isReg?'Already have an account?':'New here? Create account'}</button><button type="submit" class="pill">${isReg?'Sign up':'Log in'} ${ico('chevron')}</button></div></form><p class="form-hint">Prototype accounts are saved on the Sonic server. Use a unique password; no password-reset email is configured.</p>`;}
 if(m==='add'){const t=state.modalTab;body=`<h2>Add music</h2><p>Build your own library with music from the web or audio files you have permission to use.</p><div class="modal-tabs">${['Link','YouTube','Instagram','Drive','Upload'].map(n=>`<button class="modal-tab ${t===n?'active':''}" data-modal-tab="${n}">${n}</button>`).join('')}</div>${t==='Upload'?`<form id="uploadForm"><label class="dropzone">${ico('upload')}<strong id="fileLabel">Choose an audio file (up to 20 MB)</strong><span class="muted">MP3, WAV, OGG, M4A, WEBM or FLAC</span><input name="file" id="audioFile" type="file" accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/mp4,audio/webm,audio/flac,.mp3,.m4a,.wav,.ogg,.webm,.flac" required></label><label class="field">Song title<input name="title" placeholder="My favorite song" maxlength="100"></label><label class="field">Artist<input name="artist" placeholder="Artist name" maxlength="70"></label><div class="modal-footer"><button class="pill" type="submit">${ico('plus')} Upload song</button></div></form>`:`<form id="addForm"><label class="field">${t==='YouTube'?'YouTube video link':t==='Instagram'?'Instagram Reel/post link':t==='Drive'?'Public Google Drive file link':'Direct music URL or supported link'}<input type="url" name="url" placeholder="${t==='YouTube'?'https://www.youtube.com/watch?v=...':t==='Instagram'?'https://www.instagram.com/reel/...':t==='Drive'?'https://drive.google.com/file/d/...':'https://example.com/song.mp3'}" required></label><label class="field">Song title<input name="title" placeholder="Give this song a name" maxlength="100" required></label><label class="field">Artist<input name="artist" placeholder="Artist / creator" maxlength="70"></label><p class="form-hint">${t==='YouTube'?'YouTube uses its official embedded player. Some videos cannot be embedded or autoplayed.':t==='Instagram'?'Instagram content may only open on Instagram; it cannot always play inside Sonic.':t==='Drive'?'Set the audio file to “Anyone with the link”. Drive previews might not support exact synchronization.':'Direct links must point to playable audio. Search results and ordinary web pages are not audio files.'}</p><div class="modal-footer"><button class="pill" type="submit">${ico('plus')} Add to library</button></div></form>`}`;}
 if(m==='playlist'){body=`<h2>Create a playlist</h2><p>Give it a name — then use the ••• menu on any song to add it.</p><form id="playlistForm"><label class="field">Playlist name<input name="name" maxlength="50" placeholder="My favorites" required></label><div class="modal-footer"><button type="submit" class="pill">${ico('plus')} Create playlist</button></div></form>`;}
 if(m==='create-room'){body=`<h2>Start listening together</h2><p>Create a room and share the invite link with friends. Anyone in the room can add and switch songs.</p><form id="roomCreateForm"><label class="field">Room name<input name="name" placeholder="Our late night playlist" maxlength="48" required></label><div class="modal-footer"><button type="submit" class="pill">${ico('radio')} Create room</button></div></form>`;}
 if(m==='join-room'){body=`<h2>Join a listening room</h2><p>Enter the 10-character code your friend sent you.</p><form id="roomJoinForm"><label class="field">Room code<input name="code" placeholder="a12bc34de5" maxlength="10" minlength="10" autocomplete="off" required></label><div class="modal-footer"><button type="submit" class="pill">Join room ${ico('chevron')}</button></div></form>`;}
 if(m==='share-room'){body=`<h2>Invite your friends</h2><p>Anyone with a Sonic account can join this room with the link or code.</p><div class="field">Room code <div class="room-share">${escapeHtml(state.room?.code||'')}</div></div><div class="field">Invite link<div class="room-share">${escapeHtml(roomLink())}</div></div><div class="modal-footer"><button class="pill soft" data-action="copy-code">${ico('copy')} Copy code</button><button class="pill" data-action="copy-room">${ico('copy')} Copy link</button></div>`;}
 $('#modalRoot').innerHTML=`<div class="modal-backdrop" data-action="dismiss-modal"><section class="modal" role="dialog" aria-modal="true" aria-label="${attr(m.replace(/-/g,' '))}"><button class="icon-button modal-close" aria-label="Close modal" data-action="close-modal">${ico('x')}</button>${body}</section></div>`;
 const focus=$('.modal input:not([type=file]),.modal textarea');focus?.focus();
}
function roomLink(){return location.origin+'/?room='+encodeURIComponent(state.room?.code||'');}
function sendWS(payload){if(state.ws?.readyState===WebSocket.OPEN){state.ws.send(JSON.stringify(payload));return true;}if(state.token&&state.ws?.readyState===WebSocket.CONNECTING){pendingMessages.push(payload);return true;}toast('The room is reconnecting. Please try again.',true);return false;}
function connectWS(){if(!state.token)return;
 if(reconnectTimer){clearTimeout(reconnectTimer);reconnectTimer=null;}
 try{state.ws?.close();}catch{}
 const ws=new WebSocket((location.protocol==='https:'?'wss://':'ws://')+location.host+'/ws');state.ws=ws;
 ws.onopen=()=>{ws.send(JSON.stringify({type:'auth',token:state.token}));if(state.room?.code)ws.send(JSON.stringify({type:'join',code:state.room.code}));while(pendingMessages.length)ws.send(JSON.stringify(pendingMessages.shift()));};
 ws.onmessage=event=>{let m;try{m=JSON.parse(event.data);}catch{return;}
 if(m.type==='room'){state.room=m.room;state.roomUsers=[];if(state.page==='rooms')renderContent();applyRoomState(m.room.state);}
 if(m.type==='presence'){state.roomUsers=m.users||[];if(state.page==='rooms')renderContent();}
 if(m.type==='chat'&&state.room){state.room.messages.push(m.message);state.room.messages=state.room.messages.slice(-100);if(state.page==='rooms')renderContent();}
 if(m.type==='queue'&&state.room){state.room.queue=m.queue;if(state.page==='rooms')renderContent();}
 if(m.type==='playback'&&state.room){state.room.state=m.state;applyRoomState(m.state);if(state.page==='rooms')renderContent();}
 if(m.type==='error')toast(m.error,true);
 };
 ws.onclose=()=>{if(state.ws!==ws||!state.token)return;if(state.room)toast('Room connection interrupted; reconnecting...',true);reconnectTimer=setTimeout(()=>connectWS(),2200);};
}
async function createRoom(name){if(!authRequired())return;try{const r=await api('/api/rooms','POST',{name});state.room=r.room;state.roomUsers=[{username:state.user.username}];state.pendingRoom=null;window.history.replaceState(null,'',location.pathname);closeModal();goto('rooms');sendWS({type:'join',code:r.room.code});if(state.pendingRoomTrack){const trackId=state.pendingRoomTrack;state.pendingRoomTrack=null;roomAdd(trackId,true);}toast('Room created! Share its invite link.');openModal('share-room');}catch(e){toast(e.message,true);}}
async function joinRoom(code){if(!authRequired()){state.pendingRoom=code;return;}try{const r=await api('/api/rooms/'+encodeURIComponent(String(code).trim().toLowerCase()));state.room=r.room;state.roomUsers=[];state.pendingRoom=null;window.history.replaceState(null,'',location.pathname);closeModal();goto('rooms');sendWS({type:'join',code:r.room.code});toast('Joined '+r.room.name);applyRoomState(r.room.state);}catch(e){toast(e.message,true);}}
function leaveRoom(){pendingMessages.length=0;state.room=null;state.roomUsers=[];state.pendingRoom=null;closeModal();state.ws?.close();if(state.token)connectWS();goto('rooms');toast('You left the listening room.');}
function roomAdd(trackId,playAfter=false){if(!state.room)return;const id=String(trackId||'');const track=getTrack(id);if(!track){toast('Song not found.',true);return;}
 if(!state.room.queue.some(t=>t.id===id)){sendWS({type:'add_track',trackId:id});}
 if(playAfter){sendWS({type:'switch',trackId:id});}
 else toast('Added to shared queue!');}
function applyRoomState(st){if(!state.room||!st)return;
 const item=state.room.queue.find(t=>t.id===st.trackId);if(!item)return;
 const drift=Math.abs((state.current?.id===item.id?getTime():0)-Number(st.position||0));
 if(state.current?.id!==item.id||drift>2.3){playTrack(item.id,true,Math.max(0,+st.position||0),!!st.playing);}
 else if(st.playing!==state.playing){setPlayback(!!st.playing,true);}
}
async function generateTheme(prompt){try{const res=await api('/api/theme','POST',{prompt});setTheme(res.theme,'custom');toast(res.source==='ai'?'Your AI-generated theme is ready!':res.message||'Your theme is ready!');}catch(e){toast(e.message,true);}}
function makeDock(track){const dock=$('#mediaDock');
 if(track.kind==='youtube'){
  dock.className='media-dock'; dock.innerHTML=`<div class="media-header"><strong>${escapeHtml(track.title)} · YouTube</strong><button class="icon-button" data-action="hide-dock" title="Hide video">${ico('x')}</button></div><div id="ytHost" style="aspect-ratio:16/9;background:#050608;display:grid;place-items:center;color:#9da6b3">Loading YouTube player...</div>`;
  playerKind='youtube';initYouTube(track);
 }else if(track.kind==='drive'){
  dock.className='media-dock';const id=track.url.match(/\/file\/d\/([\w-]+)/)?.[1];dock.innerHTML=`<div class="media-header"><strong>${escapeHtml(track.title)} · Drive preview</strong><button class="icon-button" data-action="hide-dock">${ico('x')}</button></div>${id?`<iframe title="Google Drive file preview" allow="autoplay" referrerpolicy="strict-origin-when-cross-origin" src="https://drive.google.com/file/d/${encodeURIComponent(id)}/preview"></iframe>`:'<p>Drive file could not be previewed.</p>'}<p>Press play in the Drive preview. Google Drive controls are not fully synchronized with Sonic.</p>`;playerKind='drive';
 }else if(track.kind==='instagram'){
  dock.className='media-dock';dock.innerHTML=`<div class="media-header"><strong>${escapeHtml(track.title)} · Instagram</strong><button class="icon-button" data-action="hide-dock">${ico('x')}</button></div><p>Instagram doesn't consistently allow embedded audio playback. <a href="${attr(track.url)}" target="_blank" rel="noopener noreferrer">Open this post in Instagram ${ico('external')}</a>.</p>`;playerKind='instagram';
 }else{dock.className='media-dock hidden';dock.innerHTML='';playerKind='audio';}
}
function initYouTube(track){
 if(!ytApiRequested){ytApiRequested=true;const s=document.createElement('script');s.src='https://www.youtube.com/iframe_api';s.async=true;document.head.appendChild(s);}
 if(window.YT?.Player){
  try{ytPlayer?.destroy();}catch{}
  ytPlayer=new YT.Player('ytHost',{height:'211',width:'375',videoId:track.videoId||new URL(track.url).searchParams.get('v'),playerVars:{autoplay:state.playing?1:0,playsinline:1,origin:location.origin,enablejsapi:1,rel:0},events:{onReady:e=>{if(playerKind!=='youtube')return;if(state.time>0)e.target.seekTo(state.time,true);try{e.target.setVolume(Math.round(state.volume*100));}catch{}if(state.playing)e.target.playVideo();},onStateChange:e=>{if(playerKind!=='youtube'||state.current?.id!==track.id)return;const S=window.YT?.PlayerState;if(!S)return;if(e.data===S.PLAYING){state.playing=true;renderPlayer();}else if(e.data===S.PAUSED){state.playing=false;renderPlayer();}}}});
 }else{
  $('#ytHost').innerHTML='<div class="muted">Loading YouTube player...</div>';
  setTimeout(()=>{const host=$('#ytHost');if(playerKind==='youtube' && state.current?.id===track.id && host && !window.YT?.Player){host.outerHTML=`<iframe title="YouTube embedded player" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen src="https://www.youtube.com/embed/${encodeURIComponent(track.videoId)}?autoplay=${state.playing?1:0}"></iframe>`;}},2600);
 }
}
window.onYouTubeIframeAPIReady=()=>{if(state.current?.kind==='youtube')initYouTube(state.current);};
function getTime(){if(playerKind==='youtube'&&ytPlayer?.getCurrentTime){try{return Number(ytPlayer.getCurrentTime())||0;}catch{}}return playerKind==='audio'?audio.currentTime||0:state.time||0;}
function getDuration(){if(playerKind==='youtube'&&ytPlayer?.getDuration){try{return Number(ytPlayer.getDuration())||0;}catch{}}return playerKind==='audio'?audio.duration||state.current?.duration||0:0;}
function playTrack(id,remote=false,position=0,play=true){const track=getTrack(id);if(!track)return;
 if(state.room&&!remote){roomAdd(id,true);return;}
 const previousId=state.current?.id;const changed=previousId!==track.id;
 if(changed){audio.pause();if(ytPlayer){try{ytPlayer.destroy();}catch{}ytPlayer=null;}}
 state.current=track;state.time=position;state.duration=track.duration||0;state.playing=play;
 if(track.kind==='audio'){
  if(changed||audio.src!==new URL(track.url,location.origin).href)audio.src=track.url;
  playerKind='audio';$('#mediaDock').className='media-dock hidden';
  const seek=()=>{try{if(Number.isFinite(audio.duration)&&audio.duration>0)audio.currentTime=Math.min(position,audio.duration-.05);else if(position>0)audio.currentTime=position;}catch{}};
  if(position>0){if(audio.readyState>0)seek();else audio.addEventListener('loadedmetadata',seek,{once:true});}
  if(play){ensureEqualizer();audio.play().then(()=>{state.playing=true;renderPlayer();}).catch(()=>{state.playing=false;renderPlayer();toast('Tap play to start audio, or check that this is a direct audio link.',true);});}
  else{audio.pause();renderPlayer();}
 }else if(track.kind==='youtube'){
  audio.pause();if(changed||playerKind!=='youtube')makeDock(track);
  else{try{if(position>0)ytPlayer?.seekTo(position,true);if(play)ytPlayer?.playVideo();else ytPlayer?.pauseVideo();}catch{}}
 }else{audio.pause();if(changed)makeDock(track);state.playing=false;if(!remote)toast('Use the embedded preview or source link to play this item.');}
 renderPlayer();
 if(state.page==='rooms')renderContent();
}
function setPlayback(play,remote=false){if(!state.current){const first=getAll()[0];if(first)playTrack(first.id,remote,0,play);return;}
 state.playing=play;
 if(playerKind==='audio'){if(play){ensureEqualizer();audio.play().catch(()=>{state.playing=false;toast('Playback was blocked. Try pressing play again.',true);renderPlayer();});}else audio.pause();}
 if(playerKind==='youtube'){try{if(play)ytPlayer?.playVideo();else ytPlayer?.pauseVideo();}catch{}}
 renderPlayer();if(state.room&&!remote)sendWS({type:'playback',playing:play,position:getTime()});
}
function seekPlayer(pos,remote=false){if(!state.current)return;const sec=Math.max(0,+pos||0);state.time=sec;
 if(playerKind==='audio'){try{audio.currentTime=sec;}catch{}}
 if(playerKind==='youtube'){try{ytPlayer?.seekTo(sec,true);}catch{}}
 renderPlayer();if(state.room&&!remote)sendWS({type:'playback',playing:state.playing,position:sec});
}
function nextTrack(dir=1){if(state.room){const q=state.room.queue;const at=q.findIndex(t=>t.id===state.current?.id);if(q.length)sendWS({type:'switch',trackId:q[(Math.max(0,at)+dir+q.length)%q.length].id});return;}
 const queue=getAll();if(!queue.length)return;const at=queue.findIndex(t=>t.id===state.current?.id);playTrack(queue[(Math.max(0,at)+dir+queue.length)%queue.length].id);
}
function renderPlayer(){const t=state.current,played=getTime(),dur=getDuration();$('#player').innerHTML=`<div class="player-left"><span class="song-orbit ${state.playing?'is-playing':''}"><span class="player-art" ${t?`style="background:${backgrounds[Number(t.art||0)%backgrounds.length]}"`:''}>${ico('music')}</span><i class="orbit-star star-a">✦</i><i class="orbit-star star-b">✧</i><i class="orbit-star star-c">✦</i><i class="orbit-star star-d">✧</i><i class="orbit-star star-e">✦</i></span><span class="player-info"><strong>${escapeHtml(t?.title||'Nothing playing')}</strong><small>${escapeHtml(t?.artist||'Pick a song to start')}</small></span>${canDownload(t)?`<button class="icon-button" data-download="${attr(t.id)}" title="Download song">${ico('download')}</button>`:''}${t?`<button class="icon-button ${liked(t.id)?'liked':''}" data-like="${attr(t.id)}" title="Like song">${ico('heart')}</button>`:''}</div><div class="player-center"><div class="transport"><button data-action="prev" aria-label="Previous song">${ico('previous')}</button><button class="big-play" data-action="toggle" aria-label="${state.playing?'Pause':'Play'}">${ico(state.playing?'pause':'play')}</button><button data-action="next" aria-label="Next song">${ico('next')}</button></div><div class="seekrow"><span id="elapsed">${fmt(played)}</span><input class="range" id="seek" type="range" min="0" max="${Math.max(1,dur)}" step="0.1" value="${Math.min(played,Math.max(1,dur))}" aria-label="Seek within song"><span id="total">${fmt(dur)}</span></div></div><div class="player-right"><button class="eq-toggle icon-button" data-action="eq" aria-label="Audio equalizer" title="Bass & treble">${ico('palette')}</button><button class="icon-button" data-action="open-dock" title="Show external player">${ico('headphones')}</button><button class="icon-button" data-action="mute" aria-label="Mute">${ico(state.volume>0?'volume':'muted')}</button><input class="range volume" style="--fill:${state.volume*100}%" id="volume" aria-label="Volume" type="range" min="0" max="1" step="0.01" value="${state.volume}"></div>${state.eqOpen?`<section class="eq-panel" aria-label="Sound settings"><header><strong>Sound settings</strong><span>For uploaded & direct audio</span></header><label>Bass <output id="bassValue">${eq.bass>0?'+':''}${eq.bass} dB</output><input id="bassSlider" type="range" min="-12" max="12" step="1" value="${eq.bass}"></label><label>Treble <output id="trebleValue">${eq.treble>0?'+':''}${eq.treble} dB</output><input id="trebleSlider" type="range" min="-12" max="12" step="1" value="${eq.treble}"></label><button type="button" class="eq-reset" data-action="reset-eq">Reset sound</button><p>YouTube embeds and Instagram players have their own audio controls.</p></section>`:''}`;}
function updateProgress(){const now=Date.now();if(now-lastPaint<300)return;lastPaint=now;
 $('#elapsed')?.replaceChildren(document.createTextNode(fmt(getTime())));$('#total')?.replaceChildren(document.createTextNode(fmt(getDuration())));
 const seek=$('#seek');if(seek&&document.activeElement!==seek){seek.max=Math.max(1,getDuration());seek.value=Math.min(getTime(),Math.max(1,getDuration()));}}
audio.addEventListener('timeupdate',updateProgress);
audio.addEventListener('loadedmetadata',()=>{state.duration=audio.duration;renderPlayer();});
audio.addEventListener('ended',()=>nextTrack());
audio.addEventListener('error',()=>{if(state.current?.kind==='audio'){state.playing=false;renderPlayer();toast('This audio cannot be played. Check the link or try uploading the file.',true);}});
function sparkle(e){const actionable=e.target.closest('button');if(!actionable)return;
 const b=actionable.getBoundingClientRect();const x=Number.isFinite(e.clientX)&&e.clientX>0?e.clientX:b.x+b.width/2;const y=Number.isFinite(e.clientY)&&e.clientY>0?e.clientY:b.y+b.height/2;
 for(let k=0;k<7;k++){const s=document.createElement('span');const angle=Math.PI*2*k/7;const dist=20+Math.random()*27;s.className='spark';s.textContent=k%3?'✦':'✧';s.style.left=x+'px';s.style.top=y+'px';s.style.setProperty('--dx',Math.cos(angle)*dist+'px');s.style.setProperty('--dy',Math.sin(angle)*dist+'px');document.body.appendChild(s);setTimeout(()=>s.remove(),650);}
}
async function likeTrack(id){if(!authRequired())return;try{const r=await api('/api/like','POST',{trackId:id});state.liked=r.liked;renderContent();renderPlayer();}catch(e){toast(e.message,true);}}
function copy(str){if(!str)return;navigator.clipboard?.writeText(str).then(()=>toast('Copied to clipboard!')).catch(()=>{toast('Copy is unavailable here. Select the invite link to copy it.',true);});}
async function deleteTrack(id){if(!authRequired())return;if(!confirm('Remove this song from your Sonic library?'))return;try{const r=await api('/api/tracks/'+encodeURIComponent(id),'DELETE');saveUser(r.user);toast('Song removed.');}catch(e){toast(e.message,true);}}
async function togglePlaylist(p,id){if(!authRequired())return;try{const res=await api('/api/playlists/'+encodeURIComponent(p)+'/toggle','POST',{trackId:id});state.playlists=res.playlists;state.menu=null;renderShell();renderContent();toast('Playlist updated!');}catch(e){toast(e.message,true);}}
function accountLogout(){pendingMessages.length=0;if(reconnectTimer){clearTimeout(reconnectTimer);reconnectTimer=null;}state.token='';localStorage.removeItem('sonic_token');state.user=null;state.tracks=[];state.liked=[];state.playlists=[];state.room=null;state.ws?.close();goto('home');toast('Signed out.');}
async function action(name,id){switch(name){case 'add':if(authRequired())openModal('add');break;case 'auth':openModal('auth');break;case 'register':openModal('register');break;
 case 'user':if(state.user){if(confirm('Sign out of Sonic?'))accountLogout();}else openModal('auth');break;
 case 'create-playlist':if(authRequired())openModal('playlist');break;
 case 'create-room':case 'jam-room':if(authRequired())openModal('create-room');break;
 case 'join-room':if(authRequired())openModal('join-room');break;
 case 'share-room':openModal('share-room');break;case 'copy-room':copy(roomLink());break;case 'copy-code':copy(state.room?.code);break;
 case 'leave-room':leaveRoom();break;case 'room-add-selected':{const sel=$('#roomAddTrack');if(sel?.value)roomAdd(sel.value);else toast('Choose a song first.');break;}
 case 'song-room':if(!state.room){state.pendingRoomTrack=id;if(authRequired())openModal('create-room');}else roomAdd(id);state.menu=null;renderContent();break;
 case 'close-modal':closeModal();break;case 'dismiss-modal':closeModal();break;
 case 'prev':nextTrack(-1);break;case 'next':nextTrack(1);break;
 case 'toggle':setPlayback(!state.playing);break;case 'mute':state.volume=state.volume>0?0:.78;audio.volume=state.volume;try{ytPlayer?.setVolume(Math.round(state.volume*100));}catch{}renderPlayer();break;
 case 'hide-dock':$('#mediaDock').classList.add('hidden');break;case 'open-dock':if(state.current?.kind&&state.current.kind!=='audio')$('#mediaDock').classList.remove('hidden');else toast('Direct audio is playing in the Sonic player.');break;
 case 'eq':state.eqOpen=!state.eqOpen;renderPlayer();break;case 'reset-eq':eq.bass=0;eq.treble=0;localStorage.setItem('sonic_bass','0');localStorage.setItem('sonic_treble','0');ensureEqualizer();renderPlayer();break;
 case 'reset-theme':setTheme(palettes.default,'default');toast('Default theme restored.');break;}}
document.addEventListener('click',async e=>{
 sparkle(e);
 const el=e.target.closest('[data-page],[data-action],[data-play],[data-like],[data-more],[data-theme],[data-font],[data-filter],[data-modal-tab],[data-playlist],[data-toggle-playlist],[data-switch],[data-room-remove],[data-delete],[data-download]');if(!el)return;
 if(el.dataset.action==='dismiss-modal'&&e.target!==el)return;
 if(el.dataset.page){goto(el.dataset.page);return;}
 if(el.dataset.action){await action(el.dataset.action,el.dataset.id);return;}
 if(el.dataset.play!==undefined){if(el.dataset.play)playTrack(el.dataset.play);return;}
 if(el.dataset.like){likeTrack(el.dataset.like);return;}
 if(el.dataset.more){state.menu=state.menu===el.dataset.more?null:el.dataset.more;renderContent();return;}
 if(el.dataset.theme){setTheme(palettes[el.dataset.theme],el.dataset.theme);toast('Theme applied!');return;}
 if(el.dataset.font){setTheme({...state.theme,font:el.dataset.font},'custom');toast(el.dataset.font+' font selected.');return;}
 if(el.dataset.filter){state.filter=el.dataset.filter;renderContent();return;}
 if(el.dataset.modalTab){state.modalTab=el.dataset.modalTab;renderModal();return;}
 if(el.dataset.playlist){state.page='playlist';state.playlist=el.dataset.playlist;renderShell();renderContent();return;}
 if(el.dataset.togglePlaylist){togglePlaylist(el.dataset.togglePlaylist,el.dataset.id);return;}
 if(el.dataset.switch){sendWS({type:'switch',trackId:el.dataset.switch});return;}
 if(el.dataset.roomRemove){sendWS({type:'remove_track',trackId:el.dataset.roomRemove});return;}
 if(el.dataset.delete){deleteTrack(el.dataset.delete);return;}
 if(el.dataset.download){downloadSong(el.dataset.download);return;}
});
document.addEventListener('input',e=>{
 if(e.target.id==='globalSearch'){state.query=e.target.value;if(state.page!=='search'){state.page='search';renderShell();$('#globalSearch').focus();$('#globalSearch').setSelectionRange(state.query.length,state.query.length);}renderContent();searchCatalog(state.query);}
 if(e.target.id==='librarySearch'){const val=e.target.value,pos=e.target.selectionStart;state.libraryQuery=val;renderContent();const input=$('#librarySearch');input?.focus();input?.setSelectionRange(pos,pos);}
 if(e.target.id==='seek'){const a=$('#elapsed');if(a)a.textContent=fmt(+e.target.value);}
 if(e.target.id==='volume'){state.volume=+e.target.value;audio.volume=state.volume;e.target.style.setProperty('--fill',state.volume*100+'%');try{ytPlayer?.setVolume(Math.round(state.volume*100));}catch{}}
 if(e.target.id==='bassSlider'||e.target.id==='trebleSlider'){const isBass=e.target.id==='bassSlider';const key=isBass?'bass':'treble';eq[key]=+e.target.value;localStorage.setItem('sonic_'+key,String(eq[key]));ensureEqualizer();const out=$(isBass?'#bassValue':'#trebleValue');if(out)out.textContent=(eq[key]>0?'+':'')+eq[key]+' dB';}
 if(e.target.id==='audioFile'){const f=e.target.files?.[0];const label=$('#fileLabel');if(f&&label)label.textContent=f.name;}
});
document.addEventListener('change',e=>{
 if(e.target.id==='seek')seekPlayer(e.target.value);
 if(e.target.dataset.color){const key=e.target.dataset.color;const theme={...state.theme,[key]:e.target.value};setTheme(theme,'custom');}
});
document.addEventListener('submit',async e=>{if(!e.target.matches('form'))return;e.preventDefault();const f=e.target;const btn=f.querySelector('button[type=submit]');if(btn){btn.disabled=true;}
 try{
 if(f.id==='authForm'){const data=Object.fromEntries(new FormData(f).entries());const isReg=state.modal==='register';const r=await api('/api/'+(isReg?'register':'login'),'POST',data);state.token=r.token;localStorage.setItem('sonic_token',r.token);saveUser(r.user);connectWS();closeModal();toast(isReg?'Welcome to Sonic!':'Welcome back!');if(state.pendingRoom)joinRoom(state.pendingRoom);else if(state.pendingRoomTrack&&!state.room)openModal('create-room');}
 if(f.id==='addForm'){if(!authRequired())return;const data=Object.fromEntries(new FormData(f).entries());const r=await api('/api/tracks','POST',data);saveUser(r.user);closeModal();goto('library');toast('Song added to your library!');}
 if(f.id==='uploadForm'){if(!authRequired())return;const file=$('#audioFile')?.files?.[0];if(!file)throw Error('Choose an audio file first.');if(file.size>20*1024*1024)throw Error('Files must be 20 MB or smaller.');let mime=file.type.toLowerCase();if(!mime){const ext=file.name.split('.').pop().toLowerCase();mime={mp3:'audio/mpeg',wav:'audio/wav',m4a:'audio/mp4',ogg:'audio/ogg',webm:'audio/webm',flac:'audio/flac'}[ext]||'';}
 const title=f.elements.namedItem('title').value.trim()||file.name.replace(/\.[^.]+$/,'');const artist=f.elements.namedItem('artist').value.trim()||'My uploads';const res=await fetch('/api/upload',{method:'POST',headers:{Authorization:'Bearer '+state.token,'Content-Type':mime,'X-Track-Title':title,'X-Track-Artist':artist},body:file});const r=await res.json();if(!res.ok)throw Error(r.error||'Upload failed');saveUser(r.user);closeModal();goto('library');toast('Upload complete!');}
 if(f.id==='playlistForm'){if(!authRequired())return;const r=await api('/api/playlists','POST',{name:f.elements.namedItem('name').value});state.playlists=r.playlists;closeModal();renderShell();goto('library');toast('Playlist created.');}
 if(f.id==='roomCreateForm'){await createRoom(f.elements.namedItem('name').value);}
 if(f.id==='roomJoinForm'){await joinRoom(f.elements.namedItem('code').value);}
 if(f.id==='themeForm'){const prompt=f.elements.namedItem('prompt').value;await generateTheme(prompt);}
 if(f.id==='chatForm'){const message=f.elements.namedItem('message').value.trim();if(message)sendWS({type:'chat',text:message});f.reset();}
 }catch(err){toast(err.message||'Something went wrong.',true);}finally{if(btn?.isConnected)btn.disabled=false;}
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(state.modal)closeModal();else if(state.menu){state.menu=null;renderContent();}}
 if((e.code==='Space')&&['BODY','MAIN'].includes(document.activeElement?.tagName)&&!state.modal){e.preventDefault();setPlayback(!state.playing);}
 if(e.key==='Enter'&&e.target.matches('.song-title')&&e.target.dataset.play)playTrack(e.target.dataset.play);
});
window.addEventListener('popstate',()=>{const code=new URL(location.href).searchParams.get('room');if(code)joinRoom(code);});
init();
