var e=.15,t=.5;function n(e,t,n,r,i,a=!1){let o=a?.5:0,s=Math.sin(e.yaw),c=Math.cos(e.yaw),l=Math.hypot(r-t,i-n),u=Math.max(1,Math.ceil(l/.2));for(let a=0;a<=u;a++){let l=a/u,d=t+(r-t)*l-e.px,f=n+(i-n)*l-e.py;if(!(d*s+f*c<=.15-o)&&!(Math.abs(-d*c+f*s)>.8+o)&&!(Math.hypot(d,f)>3+o))return!0}return!1}function r(e,t,n){let r=Math.max(0,n)/200;return e<t?Math.min(t,e+r):Math.max(t,e-r)}function i(e,t){e.vertexShader=(t?`#define DZ_FADE_ATTR
`:``)+`varying float vDzFade;
#ifdef DZ_FADE_ATTR
attribute float instanceFade;
#endif
`+e.vertexShader,e.vertexShader=e.vertexShader.replace(`#include <color_vertex>`,`#include <color_vertex>

#if defined( USE_BATCHING_COLOR )
  vDzFade = getBatchingColor( getIndirectIndex( gl_DrawID ) ).a;
#elif defined( DZ_FADE_ATTR )
  vDzFade = instanceFade;
#else
  vDzFade = 1.0;
#endif
`),e.fragmentShader=`varying float vDzFade;
float dzBayer( vec2 p ) {
  ivec2 q = ivec2( mod( p, 4.0 ) );
  int i = q.x + q.y * 4;
  int m[16] = int[16]( 0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5 );
  return ( float( m[i] ) + 0.5 ) / 16.0;
}
`+e.fragmentShader,e.fragmentShader=e.fragmentShader.replace(`#include <clipping_planes_fragment>`,`#include <clipping_planes_fragment>
if ( vDzFade < 0.999 && dzBayer( gl_FragCoord.xy ) >= vDzFade ) discard;
`)}var a=new WeakMap;function o(e){return a.get(e)??{onBeforeCompile:e.onBeforeCompile.bind(e),customProgramCacheKey:e.customProgramCacheKey.bind(e)}}function s(e,t=!1){let n=e.onBeforeCompile.bind(e),r=e.customProgramCacheKey.bind(e);return a.set(e,{onBeforeCompile:n,customProgramCacheKey:r}),e.onBeforeCompile=(e,r)=>{n(e,r),i(e,t)},e.customProgramCacheKey=()=>`${r()}|dz-fade${t?`-attr`:``}`,e}export{o as a,r as i,t as n,s as o,n as r,e as t};