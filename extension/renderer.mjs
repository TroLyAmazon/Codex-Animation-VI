// Runtime-only appearance layer. No writes to the installed application.
export function installRenderer(payload, mount) {
  if(window.top!==window)return {installed:false,reason:'child-frame'};
  if(window.__aemeathExtension)return {installed:true,alreadyActive:true};
  let frame=null,watchdog=0,observer=null,priorFocus=null,disposed=false;
  let ready=false,completed=false,phase='loading',wallpaperURL=null,lastImage=null;
  let wallpaperVideo=null;
  function clearVideo(){if(wallpaperVideo){wallpaperVideo.pause();wallpaperVideo.removeAttribute('src');wallpaperVideo.load();wallpaperVideo.remove();wallpaperVideo=null;}root.removeAttribute('data-aemeath-video');}
  function pauseBackground(){wallpaperVideo?.pause();}
  function resumeBackground(){if(wallpaperVideo&&!document.hidden&&!frame)wallpaperVideo.play().catch(()=>{});}
  function visibility(){document.hidden?pauseBackground():resumeBackground();}
  const root=document.documentElement;
  const before=new Map(['--aemeath-wallpaper','--aemeath-wash'].map(key=>[key,[root.style.getPropertyValue(key),root.style.getPropertyPriority(key)]]));
  const originalAttribute=root.getAttribute('data-aemeath-skin');
  const style=document.createElement('style');style.id='aemeath-extension-style';style.textContent=payload.skin;
  const settingsButton=navigator.platform.startsWith('Win')?document.createElement('button'):null;
  if(settingsButton){
    settingsButton.type='button';settingsButton.id='aemeath-settings-button';
    settingsButton.textContent='Ảnh nền';settingsButton.title='Đổi ảnh nền và hoạt ảnh · Ctrl+Alt+B';
    Object.assign(settingsButton.style,{position:'fixed',right:'16px',bottom:'104px',zIndex:'2147483645',border:'1px solid #ffffff30',borderRadius:'8px',padding:'6px 10px',background:'#201b28e6',color:'#f5dbea',font:'12px system-ui',cursor:'pointer'});
    settingsButton.addEventListener('click',()=>show(true));
  }
  function removeOverlay(){
    clearTimeout(watchdog);observer?.disconnect();observer=null;
    frame?.remove();frame=null;
    if(!disposed)resumeBackground();
    if(priorFocus?.isConnected)priorFocus.focus();priorFocus=null;
  }
  function dispose(){
    if(disposed)return;disposed=true;removeOverlay();style.remove();settingsButton?.remove();
    clearVideo();document.removeEventListener('visibilitychange',visibility);
    if(wallpaperURL)URL.revokeObjectURL(wallpaperURL);wallpaperURL=null;lastImage=null;
    originalAttribute===null?root.removeAttribute('data-aemeath-skin'):root.setAttribute('data-aemeath-skin',originalAttribute);
    for(const [key,[value,priority]] of before)value?root.style.setProperty(key,value,priority):root.style.removeProperty(key);
    window.removeEventListener('message',message);window.removeEventListener('keydown',keyboard,true);
    delete window.__aemeathExtension;
  }
  function background(data){
    if(typeof data.image!=='string'||!/^data:(image\/(png|jpeg|webp|gif)|video\/(mp4|webm));base64,/.test(data.image))return;
    if(!style.isConnected)document.head.appendChild(style);
    if(settingsButton&&!settingsButton.isConnected)document.body.appendChild(settingsButton);
    const strength=Number.isFinite(data.strength)?Math.max(0,Math.min(75,data.strength)):42;
    // Large data URLs exceed CSS custom-property token limits in Chromium.
    // A short local Blob URL also avoids copying megabytes into each style value.
    if(strength>0&&data.image!==lastImage){
      clearVideo();
      const comma=data.image.indexOf(','),mime=data.image.slice(5,data.image.indexOf(';'));
      const binary=atob(data.image.slice(comma+1)),bytes=new Uint8Array(binary.length);
      for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
      const previous=wallpaperURL;wallpaperURL=URL.createObjectURL(new Blob([bytes],{type:mime}));lastImage=data.image;
      if(mime.startsWith('video/')){
        root.style.removeProperty('--aemeath-wallpaper');root.setAttribute('data-aemeath-video','');
        wallpaperVideo=document.createElement('video');wallpaperVideo.id='aemeath-wallpaper-video';wallpaperVideo.muted=true;wallpaperVideo.loop=true;wallpaperVideo.playsInline=true;wallpaperVideo.autoplay=true;wallpaperVideo.preload='auto';
        if(typeof data.poster==='string'&&/^data:image\/(png|jpeg|webp);base64,/.test(data.poster))wallpaperVideo.poster=data.poster;
        wallpaperVideo.src=wallpaperURL;document.body.prepend(wallpaperVideo);
        wallpaperVideo.addEventListener('loadeddata',resumeBackground,{once:true});
      }else root.style.setProperty('--aemeath-wallpaper',`url(${JSON.stringify(wallpaperURL)})`);
      if(previous)URL.revokeObjectURL(previous);
    }
    if(strength===0){clearVideo();root.style.removeProperty('--aemeath-wallpaper');if(wallpaperURL)URL.revokeObjectURL(wallpaperURL);wallpaperURL=null;lastImage=null;}
    if(wallpaperVideo){wallpaperVideo.style.opacity=String(strength/100);resumeBackground();}
    root.style.setProperty('--aemeath-wash',String(1-strength/100));
    root.toggleAttribute('data-aemeath-skin',strength>0);
  }
  function show(settings=false){
    if(disposed||frame)return;
    pauseBackground();
    priorFocus=document.activeElement;phase=settings?'settings':'loading';
    frame=document.createElement('iframe');frame.id='aemeath-extension-overlay';frame.title='Hoạt ảnh khởi động';
    Object.assign(frame.style,{position:'fixed',inset:'0',width:'100%',height:'100%',border:'0',zIndex:'2147483646',background:'transparent',colorScheme:'dark'});
    const current=frame;
    current.addEventListener('load',()=>{
      if(frame!==current||disposed)return;
      try{
        const win=current.contentWindow,doc=win.document;
        doc.documentElement.lang='vi';
        // No inline script, eval, network server, or CSP change is needed.
        doc.documentElement.innerHTML=payload.html;
        const css=doc.createElement('style');css.textContent=payload.css;doc.head.appendChild(css);
        win.AEMEATH_EXTERNAL=true;win.AEMEATH_ASSETS=payload.assets;win.AEMEATH_OPEN_SETTINGS=settings;
        win.AEMEATH_DEFAULT_MEDIA=payload.defaults;
        // The function is compiled in the parent realm. A closure-bound bridge
        // preserves frame identity without weakening postMessage source checks.
        win.AEMEATH_SEND=data=>message({source:win,data});
        mount(win);current.focus();
      }catch(error){phase='failed';console.error('Aemeath extension:',error.message);removeOverlay();}
    },{once:true});
    current.src='about:blank';document.body.appendChild(current);
    watchdog=setTimeout(()=>{phase='timeout';removeOverlay();},75000);
  }
  function message(event){
    if(!frame||event.source!==frame.contentWindow||event.data?.type!=='aemeath-boot')return;
    const data=event.data;
    if(data.action==='background')background(data);
    if(data.action==='ready'){ready=true;phase='playing';}
    if(data.action==='complete'){completed=true;phase='complete';removeOverlay();}
    if(data.action==='assetError'){phase='failed';removeOverlay();}
    if(data.action==='settings-open'){phase='settings';clearTimeout(watchdog);}
    if(data.action==='settings-close'){phase='playing';watchdog=setTimeout(removeOverlay,75000);}
    if(data.action==='restore')dispose();
  }
  function keyboard(event){
    if((event.metaKey||event.ctrlKey)&&event.altKey&&event.code==='KeyB'){event.preventDefault();show(true);}
  }
  window.addEventListener('message',message);window.addEventListener('keydown',keyboard,true);
  document.addEventListener('visibilitychange',visibility);
  window.__aemeathExtension={dispose,replay:()=>show(false),openSettings:()=>show(true),status:()=>({ready,completed,phase,overlay:!!frame,wallpaper:root.hasAttribute('data-aemeath-skin'),imageBytes:root.style.getPropertyValue('--aemeath-wallpaper').length})};
  if(document.body)show();
  else{observer=new MutationObserver(()=>{if(document.body){observer.disconnect();observer=null;show();}});observer.observe(document,{childList:true,subtree:true});}
  return {installed:true};
}
