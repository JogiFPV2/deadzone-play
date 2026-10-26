import{r as e}from"./structure-instances-5P00bB4I.js";var t=.15,n=.5,r=.5,i=.5,a=e-.25;function o(e,t,n,i,a,o=!1){let s=o?r:0,c=Math.sin(e.yaw),l=Math.cos(e.yaw),u=Math.hypot(i-t,a-n),d=Math.max(1,Math.ceil(u/.2));for(let r=0;r<=d;r++){let o=r/d,u=t+(i-t)*o-e.px,f=n+(a-n)*o-e.py;if(!(u*c+f*l<=.15-s)&&!(Math.abs(-u*l+f*c)>.8+s)&&!(Math.hypot(u,f)>3+s))return!0}return!1}function s(e,t,n){let r=Math.max(0,n)/200;return e<t?Math.min(t,e+r):Math.max(t,e-r)}var c=e=>e.toFixed(3),l=`varying float vDzFade;
varying float vDzH;
#ifdef DZ_FADE_ATTR
attribute float instanceFade;
#endif
`,u=`
#if defined( USE_BATCHING_COLOR )
  vDzFade = getBatchingColor( getIndirectIndex( gl_DrawID ) ).a;
#elif defined( DZ_FADE_ATTR )
  vDzFade = instanceFade;
#else
  vDzFade = 1.0;
#endif
`,d=`
#if defined( USE_BATCHING )
  vDzH = ( batchingMatrix * vec4( transformed, 1.0 ) ).y - batchingMatrix[3].y;
#elif defined( USE_INSTANCING )
  vDzH = ( instanceMatrix * vec4( transformed, 1.0 ) ).y - instanceMatrix[3].y;
#else
  vDzH = transformed.y;
#endif
`,f=`varying float vDzFade;
varying float vDzH;
float dzBayer( vec2 p ) {
  ivec2 q = ivec2( mod( p, 4.0 ) );
  int i = q.x + q.y * 4;
  int m[16] = int[16]( 0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5 );
  return ( float( m[i] ) + 0.5 ) / 16.0;
}
`,p=`
float dzFade = vDzFade < 0.999 && vDzH >= ${c(a)} ? max( vDzFade, ${c(i)} ) : vDzFade;
if ( dzFade < 0.999 && dzBayer( gl_FragCoord.xy ) >= dzFade ) discard;
`;function m(e,t){e.vertexShader=(t?`#define DZ_FADE_ATTR
`:``)+l+e.vertexShader,e.vertexShader=e.vertexShader.replace(`#include <color_vertex>`,`#include <color_vertex>\n${u}`),e.vertexShader=e.vertexShader.replace(`#include <begin_vertex>`,`#include <begin_vertex>\n${d}`),e.fragmentShader=f+e.fragmentShader,e.fragmentShader=e.fragmentShader.replace(`#include <clipping_planes_fragment>`,`#include <clipping_planes_fragment>${p}`)}var h=new WeakMap;function g(e){return h.get(e)??{onBeforeCompile:e.onBeforeCompile.bind(e),customProgramCacheKey:e.customProgramCacheKey.bind(e)}}function _(e,t=!1){let n=e.onBeforeCompile.bind(e),r=e.customProgramCacheKey.bind(e);return h.set(e,{onBeforeCompile:n,customProgramCacheKey:r}),e.onBeforeCompile=(e,r)=>{n(e,r),m(e,t)},e.customProgramCacheKey=()=>`${r()}|dz-fade${t?`-attr`:``}`,e}export{g as a,s as i,n,_ as o,o as r,t};