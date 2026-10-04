import{Ct as e,Kn as t,St as n,g as r}from"./three.core-BiUc8ZVb.js";import{C as i,b as a,t as o,w as s}from"./player-view-1mkSudmS.js";var c={value:{toon:0,step:1,soft:1.25}},l={value:{px:2,resX:1280,resY:720}},u={character:1182987,vehicle:9076080},d=`
#ifndef DZ_STYLE_NO_RAMP
if ( dzStyle.toon > 0.5 ) {
  // 3-band ramp on the diffuse irradiance (albedo divided out, palette and ACES untouched):
  // log2 steps rounded to the nearest band, the border softened over ~2-3 px (fwidth).
  vec3 dzAlb = max( diffuseColor.rgb, vec3( 0.02 ) );
  vec3 dzIrr = ( reflectedLight.directDiffuse + reflectedLight.indirectDiffuse ) / dzAlb;
  float dzI = max( dot( dzIrr, vec3( 0.2126, 0.7152, 0.0722 ) ), 1e-5 );
  float dzS = log2( dzI ) / dzStyle.step;
  float dzW = clamp( fwidth( dzS ) * dzStyle.soft, 0.02, 0.5 );
  float dzQ = floor( dzS ) + smoothstep( 0.5 - dzW, 0.5 + dzW, fract( dzS ) );
  float dzR = clamp( exp2( dzQ * dzStyle.step ) / dzI, 0.55, 1.6 );
  reflectedLight.directDiffuse *= dzR;
  reflectedLight.indirectDiffuse *= dzR;
}
#endif
`,f=!1;function p(){if(f)return;f=!0;let e=i;e.lights_pars_begin=`struct DzStyle { float toon; float step; float soft; };
uniform DzStyle dzStyle;
`+e.lights_pars_begin,e.lights_fragment_end+=d;for(let e of[`lambert`,`phong`,`standard`,`physical`,`toon`]){let t=s[e];t&&(t.uniforms.dzStyle=c)}}var m=new Set,h=!1;function g(){return h}var _=new Map,v=0;function y(e){_.has(e)||(_.set(e,e.emissiveIntensity),e.emissiveIntensity+=v)}function b(e){p(),c.value.toon=+!!e.toon,h=e.hulls;for(let t of m)t.visible=e.hulls;v=e.lift;for(let[e,t]of _)e.emissiveIntensity=t+v}function x(e,t,n){let r=l.value;r.px=e,r.resX=t,r.resY=n}var S=`#include <project_vertex>
  {
    #ifdef USE_SKINNING
      vec3 dzN = objectNormal;
    #else
      vec3 dzN = normal;
    #endif
    #ifdef USE_INSTANCING
      dzN = mat3( instanceMatrix ) * dzN;
    #endif
    vec2 dzD = ( projectionMatrix * vec4( normalMatrix * dzN, 0.0 ) ).xy;
    float dzL = length( dzD );
    if ( dzL > 1e-6 ) {
      gl_Position.xy += dzD / dzL * dzHull.px * 2.0 / vec2( dzHull.resX, dzHull.resY ) * gl_Position.w;
    }
  }`;function C(e){let t=e.onBeforeCompile.bind(e),n=e.customProgramCacheKey.bind(e);return e.onBeforeCompile=(e,n)=>{t(e,n),e.uniforms.dzHull=l,e.vertexShader=e.vertexShader.replace(`void main() {`,`struct DzHull { float px; float resX; float resY; };
uniform DzHull dzHull;
void main() {`).replace(`#include <project_vertex>`,S)},e.customProgramCacheKey=()=>`${n()}|dz-hull`,e}function w(t=`character`){let n=new e({color:new r(u[t]),side:1});return n.toneMapped=!1,n.fog=!1,n}function T(e){e.visible=h,m.add(e),e.addEventListener(`removed`,()=>m.delete(e))}function E(e,n=`character`){p();let r=C(w(n)),i=[];e.traverse(e=>{let t=e;t.isSkinnedMesh&&!t.userData.dzHull&&!t.userData.dzHulled&&i.push(t)});for(let e of i){let n=new t(e.geometry,r);n.userData.dzHull=!0,e.userData.dzHulled=!0,n.name=`${e.name}-hull`,n.bindMode=e.bindMode,n.bind(e.skeleton,e.bindMatrix),n.castShadow=n.receiveShadow=!1,n.frustumCulled=e.frustumCulled,e.add(n),T(n)}}var D=7309914,O=.22;function k(e,t){e.traverse(e=>{if(!(e instanceof n))return;let r=(Array.isArray(e.material)?e.material:[e.material]).map(e=>{let n=e.clone();return t(n),y(n),n});e.material=Array.isArray(e.material)?r:r[0]})}function A(e,t=O){k(e,e=>{e.emissive.copy(e.color),e.emissiveIntensity=t})}function j(e){k(e,e=>{/skin/i.test(e.name)?e.color.setHex(D):e.color.multiplyScalar(.7),e.emissive.copy(e.color),e.emissiveIntensity=O})}async function M(e){let t=[];for(let n of a)try{let r=await e.character(n,o);j(r.object),t.push(r)}catch(e){console.warn(`zombie model ${n}`,e)}return t}export{E as a,g as c,T as d,x as f,j as i,p as l,A as n,b as o,C as p,M as r,w as s,O as t,y as u};