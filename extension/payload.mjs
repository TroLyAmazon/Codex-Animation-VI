import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {installRenderer} from './renderer.mjs';
export async function buildInjection(root){
  const [html,css,skin,settings,animation]=await Promise.all([
    'index.html','style.css','extension/wallpaper.css','image-settings.js','animation.js'
  ].map(name=>readFile(join(root,name))));
  const [startupVideo,wallpaperVideo]=await Promise.all(['video/Start/codex_edited.mp4','video/wallpaper/girl_only_dark_blue_wallpaper.mp4'].map(name=>readFile(join(root,name))));
  const payload={html:html.toString().replace(/<!doctype[^>]*>/ig,'').replace(/<html[^>]*>|<\/html>/ig,'')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/ig,'').replace(/<link\b[^>]*>/ig,'')
    .replace(/<meta\b[^>]*http-equiv[^>]*>/ig,'').replace(/src="assets\/[^"]*"/g,'src=""'),
    css:css.toString(),skin:skin.toString(),assets:{avatar:'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',artwork:'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'}};
  // Bind animation globals to the temporary iframe so removing it stops its work.
  const mount=`function(window){const document=window.document,location=window.location,performance=window.performance,indexedDB=window.indexedDB,Image=window.Image,Path2D=window.Path2D,URL=window.URL,module=undefined;const requestAnimationFrame=window.requestAnimationFrame.bind(window),cancelAnimationFrame=window.cancelAnimationFrame.bind(window);\n${settings}\n${animation}\n}`;
  payload.defaults={startup:startupVideo.toString('base64'),wallpaper:wallpaperVideo.toString('base64')};
  return `(${installRenderer.toString()})(${JSON.stringify(payload)},${mount})`;
}
