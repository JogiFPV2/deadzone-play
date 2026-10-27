import{B as e,Ct as t,Fn as n,K as r,Kn as i,Ln as a,Lt as o,M as s,Nt as c,Ot as l,Pn as u,Q as d,Ut as f,Wn as p,_ as m,br as h,d as g,ft as _,gr as v,hr as y,j as b,jt as x,k as S,kt as C,l as w,lr as T,or as E,pt as D,q as O,qn as k,qt as A,rr as ee,sr as te,tn as ne,u as j,v as M,wt as N,zt as re}from"./three.core-CA_PUE9s.js";import{a as ie,n as ae,r as oe}from"./loader-CCWP-n9j.js";import{t as P}from"./GLTFLoader--o73VQH1.js";import{t as F}from"./meshopt_decoder.module-DDLmvpjg.js";import"./chunk-CUrhWjn1.js";import{o as I}from"./cutaway-2WG8PSSs.js";import{n as L}from"./real-car-Boh4b3yD.js";import{o as se}from"./wall-fade-BvUO32YP.js";var R={asfalt:0,plyty:1,kostka:2,trawa:3,ziemia:4,beton:5,tynk:6,cegla:7,papa:8,blacha:9,drewno:10,szklo:11,gladki:12},ce=e=>typeof e==`object`&&!!e&&!Array.isArray(e),z=e=>typeof e==`number`&&Number.isFinite(e);function le(e){if(!ce(e)||e.version!==1||!Array.isArray(e.layers))throw Error(`layers.json: nieobsługiwany format`);let t=e.layers.map((e,t)=>{let n=`layers.json layers[${t}]`;if(!ce(e))throw Error(`${n}: oczekiwano obiektu`);let r=e.meanLinear;if(e.index!==t)throw Error(`${n}: index ${String(e.index)} ≠ ${t}`);if(typeof e.id!=`string`||!e.id)throw Error(`${n}.id: oczekiwano tekstu`);if(!z(e.tileMeters)||e.tileMeters<=0)throw Error(`${n}.tileMeters > 0`);if(!Array.isArray(r)||r.length!==3||!r.every(e=>z(e)&&e>0))throw Error(`${n}.meanLinear: trzy liczby > 0`);return{index:t,id:e.id,tileMeters:e.tileMeters,tint:e.tint===`natural`?`natural`:`tint`,meanLinear:[r[0],r[1],r[2]],meanRoughness:z(e.meanRoughness)?e.meanRoughness:.8}});if(t.length===0||t.length>16)throw Error(`layers.json: 1..16 warstw`);return{material:typeof e.material==`string`?e.material:`deadzone-pbr`,layers:t}}function ue(e){let t=new Float32Array(16).fill(2),n=new Float32Array(48).fill(.5),r=new Float32Array(16);for(let i of e.layers)t[i.index]=i.tileMeters,n.set(i.meanLinear,i.index*3),r[i.index]=+(i.tint===`natural`);return{tile:t,mean:n,natural:r}}var B={tint:4,natural:25,maxAlbedo:.75},V=16,de={model:`attribute vec2 pbrUv; attribute vec2 pbrL; varying vec2 vPUv; varying vec2 vPL;`,kit:``,terrain:`attribute vec4 dmask; varying vec4 vMask;`},fe={model:`vPUv = pbrUv; vPL = pbrL;`,kit:``,terrain:`vMask = dmask;`},pe={model:`varying vec2 vPUv; varying vec2 vPL;`,kit:`uniform sampler2D tLut;`,terrain:`varying vec4 vMask;`},me={model:`pLay = floor(vPL.x + 0.5); pDirt = vPL.y; pUv = vPUv; pOn = true; pTint = vec3(1.0);`,kit:`{
  float l = floor(texture2D(tLut, vMapUv).r * 255.0 + 0.5);
  pOn = l < 250.0;
  pLay = pOn ? l : 0.0;
  vec3 wn = abs(normalize(cross(dFdx(pW), dFdy(pW))));
  vec2 m = wn.y > max(wn.x, wn.z) ? pW.xz : (wn.x > wn.z ? pW.zy : pW.xy);
  pUv = m / uTile[int(pLay)];
  pDirt = wn.y > 0.7 ? 0.25 : clamp(1.0 - pW.y / 1.6, 0.0, 1.0) * 0.8;
  if (pOn) { pTint = pPalette(diffuseColor.rgb); diffuseColor.rgb = pCol; }
}`,terrain:`{
  vec4 k = vMask;
  float s = k.x + k.y + k.z + k.w;
  pOn = s > 0.01;
  pLay = 0.0;
  float best = k.x;
  if (k.y > best) { best = k.y; pLay = 3.0; }
  if (k.z > best) { best = k.z; pLay = 1.0; }
  if (k.w > best) { best = k.w; pLay = 4.0; }
  pUv = pW.xz / uTile[int(pLay)];
  pDirt = pLay == 3.0 ? 0.25 : 0.2 + k.w * 0.4;
  if (pOn) { pTint = pPalette(diffuseColor.rgb); diffuseColor.rgb = pCol; }
}`},he=`
precision highp sampler2DArray;
uniform sampler2DArray tAlb; uniform sampler2DArray tNrm; uniform sampler2DArray tOrm;
uniform float uNrmK; uniform float uGrime; uniform float uAO; uniform vec3 uOrigin;
uniform float uTile[${V}]; uniform vec3 uMean[${V}]; uniform float uNat[${V}];
uniform vec3 uLift; /* kit / terrain palette → STYLE.md albedo: tint ×, natural ×, max albedo */
varying vec3 vPW;
vec3 pW; vec2 pUv; float pLay; float pDirt; bool pOn; vec3 pTint; vec3 pORM; float pGrime; vec4 pA;
/*
 * Palette colour (in diffuseColor) → STYLE.md tint rules. tint layers: the (dark, night-tuned)
 * palette colour lifted to the style's albedo range, texture normalised by its mean; natural
 * layers: the texture's own colour times a grey 0.55–1 (±15 % hue from the palette).
 */
vec3 pCol;
vec3 pPalette(vec3 col) {
  vec3 pal = max(col, vec3(1e-4));
  float lum = dot(pal, vec3(0.2126, 0.7152, 0.0722));
  // Bright marks on natural ground (road paint, zebras: linear > 0.2) keep their colour.
  if (uNat[int(pLay)] > 0.5 && lum < 0.2) {
    float g = clamp(lum * uLift.y, 0.55, 1.0);
    pCol = g * (1.0 + clamp(pal / lum - 1.0, -0.15, 0.15));
    return vec3(1.0);
  }
  pCol = min(pal * uLift.x, vec3(uLift.z));
  return 1.0 / uMean[int(pLay)];
}`,ge=e=>`
pW = vPW + uOrigin;
${me[e]}
if (pOn) {
  pA = texture(tAlb, vec3(pUv, pLay));
  if (abs(pLay - 3.0) < 0.5 && pDirt > 0.01) { /* worn patches in lawns */
    float wm = texture(tAlb, vec3(pW.xz * 0.021 + 0.7, 4.0)).r * 1.9;
    pA.rgb = mix(pA.rgb, texture(tAlb, vec3(pUv * 0.8, 4.0)).rgb * 0.8 * (pTint.x == 1.0 ? vec3(1.0) : uMean[3] / uMean[4]),
      smoothstep(0.95, 1.25, wm) * min(1.0, pDirt * 2.2));
  }
  pORM = texture(tOrm, vec3(pUv, pLay)).rgb;
  float pN = texture(tAlb, vec3(pW.xz * 0.045 + pW.y * 0.06, 4.0)).r * 1.9; /* grime mask */
  pGrime = clamp(pDirt * pN * pN, 0.0, 1.0) * uGrime;
  float pM = texture(tAlb, vec3(pW.xz * 0.013 + 0.31, 4.0)).g * 1.9; /* macro variation */
  diffuseColor.rgb *= pA.rgb * pTint * mix(1.0, pORM.r, uAO) * mix(1.0, clamp(pM, 0.7, 1.3), 0.5);
  diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(0.60, 0.56, 0.50), pGrime * 0.75);
}`,_e=`
if (pOn) roughnessFactor = clamp(pORM.g + pGrime * 0.15, 0.03, 1.0);`,ve=`
if (pOn) metalnessFactor = pORM.b;`,ye=`
if (pOn) {
  vec4 nt = texture(tNrm, vec3(pUv, pLay));
  vec2 nxy = (vec2(nt.r, nt.a) * 2.0 - 1.0) * uNrmK;
  vec3 tn = vec3(nxy, sqrt(max(0.0, 1.0 - dot(nxy, nxy))));
  vec3 dp1 = dFdx(-vViewPosition), dp2 = dFdy(-vViewPosition);
  vec2 du1 = dFdx(pUv), du2 = dFdy(pUv);
  vec3 d2p = cross(dp2, normal), d1p = cross(normal, dp1);
  vec3 T = d2p * du1.x + d1p * du2.x; vec3 B = d2p * du1.y + d1p * du2.y;
  float im = inversesqrt(max(max(dot(T, T), dot(B, B)), 1e-12));
  normal = normalize(mat3(T * im, B * im, normal) * tn);
}`;function H(e,t,n,r){if(!e.includes(t))throw Error(`deadzone-pbr: brak ${t} w shaderze`);return e.replace(t,r===`after`?`${t}\n${n}`:`${n}\n${t}`)}function U(e,t){e.vertexShader=H(e.vertexShader,`#include <common>`,`${de[t]}\nvarying vec3 vPW;`,`after`),e.vertexShader=H(e.vertexShader,`#include <worldpos_vertex>`,`${fe[t]}\n{ vec4 pw = vec4(transformed, 1.0);
#ifdef USE_BATCHING
  pw = batchingMatrix * pw;
#endif
#ifdef USE_INSTANCING
  pw = instanceMatrix * pw;
#endif
  vPW = (modelMatrix * pw).xyz; }`,`after`);let n=e.fragmentShader;n=H(n,`#include <common>`,`${he}\n${pe[t]}`,`after`),n=H(n,t===`terrain`?`#include <color_fragment>`:`#include <map_fragment>`,ge(t),`after`),n=H(n,`#include <roughnessmap_fragment>`,_e,`after`),n=H(n,`#include <metalnessmap_fragment>`,ve,`after`),n=H(n,`#include <normal_fragment_maps>`,ye,`after`),e.fragmentShader=n}function W(e,t,n){let{tile:r,mean:i,natural:a}=ue(t);return{tAlb:{value:e.alb},tNrm:{value:e.nrm},tOrm:{value:e.orm},uNrmK:{value:n.normalScale},uGrime:{value:1},uAO:{value:n.textureAO},uOrigin:{value:new v},uTile:{value:r},uMean:{value:i},uNat:{value:a},uLift:{value:new v(B.tint,B.natural,B.maxAlbedo)}}}function G(e,t,n,r={}){let i=e.onBeforeCompile.bind(e);return e.onBeforeCompile=(e,a)=>{i(e,a),Object.assign(e.uniforms,t,r),U(e,n)},e.customProgramCacheKey=()=>`deadzone-pbr-${n}`,e}function K(e){let t=new x({vertexColors:!0,roughness:1,metalness:0});return t.name=`deadzone-pbr`,G(t,e,`model`)}function be(e,t){let r=new S(e,t,t,n);return r.magFilter=r.minFilter=c,r.generateMipmaps=!1,r.flipY=!1,r.needsUpdate=!0,r}function xe(e,t,n){let r=e.clone();return r.name=`deadzone-pbr/kit`,r.roughness=1,r.metalness=0,se(G(r,t,`kit`,{tLut:{value:n}}))}function Se(e){let t=new x({vertexColors:!0,roughness:1,metalness:0});return t.name=`deadzone-pbr/terrain`,G(t,e,`terrain`)}function Ce(e){let t=e.getAttribute(`uv`);t&&(e.setAttribute(`pbrUv`,t),e.deleteAttribute(`uv`));let n=e.getAttribute(`uv1`);return n&&(e.setAttribute(`pbrL`,n),e.deleteAttribute(`uv1`)),e}var we=`models/`,q={sedan:1.69},J=e=>(e.split(`/`).pop()??e).replace(/(\.pbr)?\.glb$/i,``);function Y(e){let t=[];for(let n of e){let e=n.lods[0]?.file;if(n.material!==`pbr`||!e)continue;let r=J(e);t.push({id:r,url:`${we}${e}`,scale:n.scale??q[r]??1})}return t}function X(e){let t=e.clone();for(let[e,n]of Object.entries(t.attributes)){if(n.array instanceof Float32Array&&!n.normalized&&n instanceof j)continue;let r=new Float32Array(n.count*n.itemSize);for(let e=0;e<n.count;e++)for(let t=0;t<n.itemSize;t++)r[e*n.itemSize+t]=n.getComponent(e,t);t.setAttribute(e,new j(r,n.itemSize))}return t}function Z(e,t){e.updateMatrixWorld(!0);let n;if(e.traverse(e=>{let t=e;t.isMesh&&!n&&(n=Ce(X(t.geometry).applyMatrix4(t.matrixWorld)))}),!n)throw Error(`deadzone-pbr: brak siatki w ${e.name}`);return t!==1&&n.scale(t,t,t),n.computeBoundingBox(),n.computeBoundingSphere(),n}function Te(e,t,n,r){let i=new d(e,t,Math.max(1,n.length));return i.name=`pbr:${r}`,n.forEach((e,t)=>i.setMatrixAt(t,e)),i.count=n.length,i.castShadow=!0,i.receiveShadow=!0,i.computeBoundingSphere(),i}function Ee(e,t,n){let r=e.index?e:e.clone(),i=r.getAttribute(`position`),a=r.getAttribute(`pbrL`),o=new Float32Array(i.count*2);for(let e=0;e<i.count;e++){let[n,r]=t(a?Math.round(a.getX(e)):12);o[e*2]=n,o[e*2+1]=r}let s=new g;s.setAttribute(`position`,i.clone()),s.setAttribute(`uv`,new j(o,2));let c=r.getAttribute(`normal`);c?s.setAttribute(`normal`,c.clone()):s.computeVertexNormals(),r.index?s.setIndex(r.index.clone()):s.setIndex([...Array(i.count).keys()]),s.computeBoundingBox();let l=s.boundingBox,u=n&&l.max.y>l.min.y?n/(l.max.y-l.min.y):1;return s.translate(0,-l.min.y,0),u!==1&&s.scale(u,u,u),s.computeBoundingBox(),s.computeBoundingSphere(),s}var De={name:`CopyShader`,uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`},Q=class{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error(`THREE.Pass: .render() must be implemented in derived pass.`)}dispose(){}},Oe=new re(-1,1,1,-1,0,1),ke=new class extends g{constructor(){super(),this.setAttribute(`position`,new e([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute(`uv`,new e([0,2,0,0,2,0],2))}},Ae=class{constructor(e){this._mesh=new N(ke,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,Oe)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}},je=class extends Q{constructor(e,t=`tDiffuse`){super(),this.textureID=t,this.uniforms=null,this.material=null,e instanceof k?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=E.clone(e.uniforms),this.material=new k({name:e.name===void 0?`unspecified`:e.name,defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this._fsQuad=new Ae(this.material)}render(e,t,n){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=n.texture),this._fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}},Me=class extends Q{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,n){let r=e.getContext(),i=e.state;i.buffers.color.setMask(!1),i.buffers.depth.setMask(!1),i.buffers.color.setLocked(!0),i.buffers.depth.setLocked(!0);let a,o;this.inverse?(a=0,o=1):(a=1,o=0),i.buffers.stencil.setTest(!0),i.buffers.stencil.setOp(r.REPLACE,r.REPLACE,r.REPLACE),i.buffers.stencil.setFunc(r.ALWAYS,a,4294967295),i.buffers.stencil.setClear(o),i.buffers.stencil.setLocked(!0),e.setRenderTarget(n),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),i.buffers.color.setLocked(!1),i.buffers.depth.setLocked(!1),i.buffers.color.setMask(!0),i.buffers.depth.setMask(!0),i.buffers.stencil.setLocked(!1),i.buffers.stencil.setFunc(r.EQUAL,1,4294967295),i.buffers.stencil.setOp(r.KEEP,r.KEEP,r.KEEP),i.buffers.stencil.setLocked(!0)}},Ne=class extends Q{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}},Pe=class{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){let n=e.getSize(new y);this._width=n.width,this._height=n.height,t=new h(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:O}),t.texture.name=`EffectComposer.rt1`}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name=`EffectComposer.rt2`,this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new je(De),this.copyPass.material.blending=0,this.timer=new ee}swapBuffers(){let e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){let t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){this.timer.update(),e===void 0&&(e=this.timer.getDelta());let t=this.renderer.getRenderTarget(),n=!1;for(let t=0,r=this.passes.length;t<r;t++){let r=this.passes[t];if(r.enabled!==!1){if(r.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(t),r.render(this.renderer,this.writeBuffer,this.readBuffer,e,n),r.needsSwap){if(n){let t=this.renderer.getContext(),n=this.renderer.state.buffers.stencil;n.setFunc(t.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),n.setFunc(t.EQUAL,1,4294967295)}this.swapBuffers()}Me!==void 0&&(r instanceof Me?n=!0:r instanceof Ne&&(n=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){let t=this.renderer.getSize(new y);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;let n=this._width*this._pixelRatio,r=this._height*this._pixelRatio;this.renderTarget1.setSize(n,r),this.renderTarget2.setSize(n,r);for(let e=0;e<this.passes.length;e++)this.passes[e].setSize(n,r)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}},Fe={name:`GTAOShader`,defines:{PERSPECTIVE_CAMERA:1,SAMPLES:16,NORMAL_VECTOR_TYPE:1,DEPTH_SWIZZLING:`x`,SCREEN_SPACE_RADIUS:0,SCREEN_SPACE_RADIUS_SCALE:100,SCENE_CLIP_BOX:0},uniforms:{tNormal:{value:null},tDepth:{value:null},tNoise:{value:null},resolution:{value:new y},cameraNear:{value:null},cameraFar:{value:null},cameraProjectionMatrix:{value:new t},cameraProjectionMatrixInverse:{value:new t},cameraWorldMatrix:{value:new t},radius:{value:.25},distanceExponent:{value:1},thickness:{value:1},distanceFallOff:{value:1},scale:{value:1},sceneBoxMin:{value:new v(-1,-1,-1)},sceneBoxMax:{value:new v(1,1,1)}},vertexShader:`

		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,fragmentShader:`
		varying vec2 vUv;
		uniform highp sampler2D tNormal;
		uniform highp sampler2D tDepth;
		uniform sampler2D tNoise;
		uniform vec2 resolution;
		uniform float cameraNear;
		uniform float cameraFar;
		uniform mat4 cameraProjectionMatrix;
		uniform mat4 cameraProjectionMatrixInverse;
		uniform mat4 cameraWorldMatrix;
		uniform float radius;
		uniform float distanceExponent;
		uniform float thickness;
		uniform float distanceFallOff;
		uniform float scale;
		#if SCENE_CLIP_BOX == 1
			uniform vec3 sceneBoxMin;
			uniform vec3 sceneBoxMax;
		#endif

		#include <common>
		#include <packing>

		#ifndef FRAGMENT_OUTPUT
		#define FRAGMENT_OUTPUT vec4(vec3(ao), 1.)
		#endif

		vec3 getViewPosition( const in vec2 screenPosition, const in float depth ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				vec4 clipSpacePosition = vec4( vec2( screenPosition ) * 2.0 - 1.0, depth, 1.0 );
			#else
				vec4 clipSpacePosition = vec4( vec3( screenPosition, depth ) * 2.0 - 1.0, 1.0 );
			#endif
			vec4 viewSpacePosition = cameraProjectionMatrixInverse * clipSpacePosition;
			return viewSpacePosition.xyz / viewSpacePosition.w;
		}

		float getDepth(const vec2 uv) {
			return textureLod(tDepth, uv.xy, 0.0).DEPTH_SWIZZLING;
		}

		float fetchDepth(const ivec2 uv) {
			return texelFetch(tDepth, uv.xy, 0).DEPTH_SWIZZLING;
		}

		float getViewZ(const in float depth) {
			#if PERSPECTIVE_CAMERA == 1
				return perspectiveDepthToViewZ(depth, cameraNear, cameraFar);
			#else
				return orthographicDepthToViewZ(depth, cameraNear, cameraFar);
			#endif
		}

		vec3 computeNormalFromDepth(const vec2 uv) {
			vec2 size = vec2(textureSize(tDepth, 0));
			ivec2 p = ivec2(uv * size);
			float c0 = fetchDepth(p);
			float l2 = fetchDepth(p - ivec2(2, 0));
			float l1 = fetchDepth(p - ivec2(1, 0));
			float r1 = fetchDepth(p + ivec2(1, 0));
			float r2 = fetchDepth(p + ivec2(2, 0));
			float b2 = fetchDepth(p - ivec2(0, 2));
			float b1 = fetchDepth(p - ivec2(0, 1));
			float t1 = fetchDepth(p + ivec2(0, 1));
			float t2 = fetchDepth(p + ivec2(0, 2));
			float dl = abs((2.0 * l1 - l2) - c0);
			float dr = abs((2.0 * r1 - r2) - c0);
			float db = abs((2.0 * b1 - b2) - c0);
			float dt = abs((2.0 * t1 - t2) - c0);
			vec3 ce = getViewPosition(uv, c0).xyz;
			vec3 dpdx = (dl < dr) ? ce - getViewPosition((uv - vec2(1.0 / size.x, 0.0)), l1).xyz : -ce + getViewPosition((uv + vec2(1.0 / size.x, 0.0)), r1).xyz;
			vec3 dpdy = (db < dt) ? ce - getViewPosition((uv - vec2(0.0, 1.0 / size.y)), b1).xyz : -ce + getViewPosition((uv + vec2(0.0, 1.0 / size.y)), t1).xyz;
			return normalize(cross(dpdx, dpdy));
		}

		vec3 getViewNormal(const vec2 uv) {
			#if NORMAL_VECTOR_TYPE == 2
				return normalize(textureLod(tNormal, uv, 0.).rgb);
			#elif NORMAL_VECTOR_TYPE == 1
				return unpackRGBToNormal(textureLod(tNormal, uv, 0.).rgb);
			#else
				return computeNormalFromDepth(uv);
			#endif
		}

		vec3 getSceneUvAndDepth(vec3 sampleViewPos) {
			vec4 sampleClipPos = cameraProjectionMatrix * vec4(sampleViewPos, 1.);
			vec2 sampleUv = sampleClipPos.xy / sampleClipPos.w * 0.5 + 0.5;
			float sampleSceneDepth = getDepth(sampleUv);
			return vec3(sampleUv, sampleSceneDepth);
		}

		void main() {
			float depth = getDepth(vUv.xy);

			#ifdef USE_REVERSED_DEPTH_BUFFER
				if (depth <= 0.0) {
					discard;
					return;
				}
			#else
				if (depth >= 1.0) {
					discard;
					return;
				}
			#endif
			
			vec3 viewPos = getViewPosition(vUv, depth);
			vec3 viewNormal = getViewNormal(vUv);

			float radiusToUse = radius;
			float distanceFalloffToUse = thickness;
			#if SCREEN_SPACE_RADIUS == 1
				float radiusScale = getViewPosition(vec2(0.5 + float(SCREEN_SPACE_RADIUS_SCALE) / resolution.x, 0.0), depth).x;
				radiusToUse *= radiusScale;
				distanceFalloffToUse *= radiusScale;
			#endif

			#if SCENE_CLIP_BOX == 1
				vec3 worldPos = (cameraWorldMatrix * vec4(viewPos, 1.0)).xyz;
				float boxDistance = length(max(vec3(0.0), max(sceneBoxMin - worldPos, worldPos - sceneBoxMax)));
				if (boxDistance > radiusToUse) {
					discard;
					return;
				}
			#endif

			vec2 noiseResolution = vec2(textureSize(tNoise, 0));
			vec2 noiseUv = vUv * resolution / noiseResolution;
			vec4 noiseTexel = textureLod(tNoise, noiseUv, 0.0);
			vec3 randomVec = noiseTexel.xyz * 2.0 - 1.0;
			vec3 tangent = normalize(vec3(randomVec.xy, 0.));
			vec3 bitangent = vec3(-tangent.y, tangent.x, 0.);
			mat3 kernelMatrix = mat3(tangent, bitangent, vec3(0., 0., 1.));

			const int DIRECTIONS = SAMPLES < 30 ? 3 : 5;
			const int STEPS = (SAMPLES + DIRECTIONS - 1) / DIRECTIONS;
			float ao = 0.0;
			for (int i = 0; i < DIRECTIONS; ++i) {

				float angle = float(i) / float(DIRECTIONS) * PI;
				vec4 sampleDir = vec4(cos(angle), sin(angle), 0., 0.5 + 0.5 * noiseTexel.w);
				sampleDir.xyz = normalize(kernelMatrix * sampleDir.xyz);

				vec3 viewDir = normalize(-viewPos.xyz);
				vec3 sliceBitangent = normalize(cross(sampleDir.xyz, viewDir));
				vec3 sliceTangent = cross(sliceBitangent, viewDir);
				vec3 normalInSlice = normalize(viewNormal - sliceBitangent * dot(viewNormal, sliceBitangent));

				vec3 tangentToNormalInSlice = cross(normalInSlice, sliceBitangent);
				vec2 cosHorizons = vec2(dot(viewDir, tangentToNormalInSlice), dot(viewDir, -tangentToNormalInSlice));

				for (int j = 0; j < STEPS; ++j) {
					vec3 sampleViewOffset = sampleDir.xyz * radiusToUse * sampleDir.w * pow(float(j + 1) / float(STEPS), distanceExponent);

					vec3 sampleSceneUvDepth = getSceneUvAndDepth(viewPos + sampleViewOffset);
					vec3 sampleSceneViewPos = getViewPosition(sampleSceneUvDepth.xy, sampleSceneUvDepth.z);
					vec3 viewDelta = sampleSceneViewPos - viewPos;
					if (abs(viewDelta.z) < thickness) {
						float sampleCosHorizon = dot(viewDir, normalize(viewDelta));
						cosHorizons.x += max(0., (sampleCosHorizon - cosHorizons.x) * mix(1., 2. / float(j + 2), distanceFallOff));
					}

					sampleSceneUvDepth = getSceneUvAndDepth(viewPos - sampleViewOffset);
					sampleSceneViewPos = getViewPosition(sampleSceneUvDepth.xy, sampleSceneUvDepth.z);
					viewDelta = sampleSceneViewPos - viewPos;
					if (abs(viewDelta.z) < thickness) {
						float sampleCosHorizon = dot(viewDir, normalize(viewDelta));
						cosHorizons.y += max(0., (sampleCosHorizon - cosHorizons.y) * mix(1., 2. / float(j + 2), distanceFallOff));
					}
				}

				vec2 sinHorizons = sqrt(1. - cosHorizons * cosHorizons);
				float nx = dot(normalInSlice, sliceTangent);
				float ny = dot(normalInSlice, viewDir);
				float nxb = 1. / 2. * (acos(cosHorizons.y) - acos(cosHorizons.x) + sinHorizons.x * cosHorizons.x - sinHorizons.y * cosHorizons.y);
				float nyb = 1. / 2. * (2. - cosHorizons.x * cosHorizons.x - cosHorizons.y * cosHorizons.y);
				float occlusion = nx * nxb + ny * nyb;
				ao += occlusion;
			}

			ao = clamp(ao / float(DIRECTIONS), 0., 1.);
		#if SCENE_CLIP_BOX == 1
			ao = mix(ao, 1., smoothstep(0., radiusToUse, boxDistance));
		#endif
			ao = pow(ao, scale);

			gl_FragColor = FRAGMENT_OUTPUT;
		}`},Ie={name:`GTAODepthShader`,defines:{PERSPECTIVE_CAMERA:1},uniforms:{tDepth:{value:null},cameraNear:{value:null},cameraFar:{value:null}},vertexShader:`
		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,fragmentShader:`
		uniform sampler2D tDepth;
		uniform float cameraNear;
		uniform float cameraFar;
		varying vec2 vUv;

		#include <packing>

		float getLinearDepth( const in vec2 screenPosition ) {
			#if PERSPECTIVE_CAMERA == 1
				float fragCoordZ = texture2D( tDepth, screenPosition ).x;
				float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
				return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );
			#else
				return texture2D( tDepth, screenPosition ).x;
			#endif
		}

		void main() {
			float depth = getLinearDepth( vUv );
			gl_FragColor = vec4( vec3( 1.0 - depth ), 1.0 );

		}`},Le={name:`GTAOBlendShader`,uniforms:{tDiffuse:{value:null},intensity:{value:1}},vertexShader:`
		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,fragmentShader:`
		uniform float intensity;
		uniform sampler2D tDiffuse;
		varying vec2 vUv;

		void main() {
			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = vec4(mix(vec3(1.), texel.rgb, intensity), texel.a);
		}`};function Re(e=5){let t=Math.floor(e)%2==0?Math.floor(e)+1:Math.floor(e),n=ze(t),r=n.length,i=new Uint8Array(r*4);for(let e=0;e<r;++e){let t=n[e],a=2*Math.PI*t/r,o=new v(Math.cos(a),Math.sin(a),0).normalize();i[e*4]=(o.x*.5+.5)*255,i[e*4+1]=(o.y*.5+.5)*255,i[e*4+2]=127,i[e*4+3]=255}let o=new S(i,t,t);return o.wrapS=a,o.wrapT=a,o.needsUpdate=!0,o}function ze(e){let t=Math.floor(e)%2==0?Math.floor(e)+1:Math.floor(e),n=t*t,r=Array(n).fill(0),i=Math.floor(t/2),a=t-1;for(let e=1;e<=n;){if(i===-1&&a===t?(a=t-2,i=0):(a===t&&(a=0),i<0&&(i=t-1)),r[i*t+a]!==0){a-=2,i++;continue}r[i*t+a]=e++,a++,i--}return r}var Be={name:`PoissonDenoiseShader`,defines:{SAMPLES:16,SAMPLE_VECTORS:Ve(16,2,1),NORMAL_VECTOR_TYPE:1,DEPTH_VALUE_SOURCE:0},uniforms:{tDiffuse:{value:null},tNormal:{value:null},tDepth:{value:null},tNoise:{value:null},resolution:{value:new y},cameraProjectionMatrixInverse:{value:new t},lumaPhi:{value:5},depthPhi:{value:5},normalPhi:{value:5},radius:{value:4},index:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,fragmentShader:`

		varying vec2 vUv;

		uniform sampler2D tDiffuse;
		uniform sampler2D tNormal;
		uniform sampler2D tDepth;
		uniform sampler2D tNoise;
		uniform vec2 resolution;
		uniform mat4 cameraProjectionMatrixInverse;
		uniform float lumaPhi;
		uniform float depthPhi;
		uniform float normalPhi;
		uniform float radius;
		uniform int index;

		#include <common>
		#include <packing>

		#ifndef SAMPLE_LUMINANCE
		#define SAMPLE_LUMINANCE dot(vec3(0.2125, 0.7154, 0.0721), a)
		#endif

		#ifndef FRAGMENT_OUTPUT
		#define FRAGMENT_OUTPUT vec4(denoised, 1.)
		#endif

		float getLuminance(const in vec3 a) {
			return SAMPLE_LUMINANCE;
		}

		const vec3 poissonDisk[SAMPLES] = SAMPLE_VECTORS;

		vec3 getViewPosition( const in vec2 screenPosition, const in float depth ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				vec4 clipSpacePosition = vec4( vec2( screenPosition ) * 2.0 - 1.0, depth, 1.0 );
			#else
				vec4 clipSpacePosition = vec4( vec3( screenPosition, depth ) * 2.0 - 1.0, 1.0 );
			#endif
			vec4 viewSpacePosition = cameraProjectionMatrixInverse * clipSpacePosition;
			return viewSpacePosition.xyz / viewSpacePosition.w;
		}

		float getDepth(const vec2 uv) {
		#if DEPTH_VALUE_SOURCE == 1
			return textureLod(tDepth, uv.xy, 0.0).a;
		#else
			return textureLod(tDepth, uv.xy, 0.0).r;
		#endif
		}

		float fetchDepth(const ivec2 uv) {
			#if DEPTH_VALUE_SOURCE == 1
				return texelFetch(tDepth, uv.xy, 0).a;
			#else
				return texelFetch(tDepth, uv.xy, 0).r;
			#endif
		}

		vec3 computeNormalFromDepth(const vec2 uv) {
			vec2 size = vec2(textureSize(tDepth, 0));
			ivec2 p = ivec2(uv * size);
			float c0 = fetchDepth(p);
			float l2 = fetchDepth(p - ivec2(2, 0));
			float l1 = fetchDepth(p - ivec2(1, 0));
			float r1 = fetchDepth(p + ivec2(1, 0));
			float r2 = fetchDepth(p + ivec2(2, 0));
			float b2 = fetchDepth(p - ivec2(0, 2));
			float b1 = fetchDepth(p - ivec2(0, 1));
			float t1 = fetchDepth(p + ivec2(0, 1));
			float t2 = fetchDepth(p + ivec2(0, 2));
			float dl = abs((2.0 * l1 - l2) - c0);
			float dr = abs((2.0 * r1 - r2) - c0);
			float db = abs((2.0 * b1 - b2) - c0);
			float dt = abs((2.0 * t1 - t2) - c0);
			vec3 ce = getViewPosition(uv, c0).xyz;
			vec3 dpdx = (dl < dr) ?  ce - getViewPosition((uv - vec2(1.0 / size.x, 0.0)), l1).xyz
									: -ce + getViewPosition((uv + vec2(1.0 / size.x, 0.0)), r1).xyz;
			vec3 dpdy = (db < dt) ?  ce - getViewPosition((uv - vec2(0.0, 1.0 / size.y)), b1).xyz
									: -ce + getViewPosition((uv + vec2(0.0, 1.0 / size.y)), t1).xyz;
			return normalize(cross(dpdx, dpdy));
		}

		vec3 getViewNormal(const vec2 uv) {
		#if NORMAL_VECTOR_TYPE == 2
			return normalize(textureLod(tNormal, uv, 0.).rgb);
		#elif NORMAL_VECTOR_TYPE == 1
			return unpackRGBToNormal(textureLod(tNormal, uv, 0.).rgb);
		#else
			return computeNormalFromDepth(uv);
		#endif
		}

		void denoiseSample(in vec3 center, in vec3 viewNormal, in vec3 viewPos, in vec2 sampleUv, inout vec3 denoised, inout float totalWeight) {
			vec4 sampleTexel = textureLod(tDiffuse, sampleUv, 0.0);
			float sampleDepth = getDepth(sampleUv);
			vec3 sampleNormal = getViewNormal(sampleUv);
			vec3 neighborColor = sampleTexel.rgb;
			vec3 viewPosSample = getViewPosition(sampleUv, sampleDepth);

			float normalDiff = dot(viewNormal, sampleNormal);
			float normalSimilarity = pow(max(normalDiff, 0.), normalPhi);
			float lumaDiff = abs(getLuminance(neighborColor) - getLuminance(center));
			float lumaSimilarity = max(1.0 - lumaDiff / lumaPhi, 0.0);
			float depthDiff = abs(dot(viewPos - viewPosSample, viewNormal));
			float depthSimilarity = max(1. - depthDiff / depthPhi, 0.);
			float w = lumaSimilarity * depthSimilarity * normalSimilarity;

			denoised += w * neighborColor;
			totalWeight += w;
		}

		void main() {
			float depth = getDepth(vUv.xy);
			vec3 viewNormal = getViewNormal(vUv);
			if (depth == 1. || dot(viewNormal, viewNormal) == 0.) {
				discard;
				return;
			}
			vec4 texel = textureLod(tDiffuse, vUv, 0.0);
			vec3 center = texel.rgb;
			vec3 viewPos = getViewPosition(vUv, depth);

			vec2 noiseResolution = vec2(textureSize(tNoise, 0));
			vec2 noiseUv = vUv * resolution / noiseResolution;
			vec4 noiseTexel = textureLod(tNoise, noiseUv, 0.0);
      		vec2 noiseVec = vec2(sin(noiseTexel[index % 4] * 2. * PI), cos(noiseTexel[index % 4] * 2. * PI));
    		mat2 rotationMatrix = mat2(noiseVec.x, -noiseVec.y, noiseVec.x, noiseVec.y);

			float totalWeight = 1.0;
			vec3 denoised = texel.rgb;
			for (int i = 0; i < SAMPLES; i++) {
				vec3 sampleDir = poissonDisk[i];
				vec2 offset = rotationMatrix * (sampleDir.xy * (1. + sampleDir.z * (radius - 1.)) / resolution);
				vec2 sampleUv = vUv + offset;
				denoiseSample(center, viewNormal, viewPos, sampleUv, denoised, totalWeight);
			}

			if (totalWeight > 0.) {
				denoised /= totalWeight;
			}
			gl_FragColor = FRAGMENT_OUTPUT;
		}`};function Ve(e,t,n){let r=He(e,t,n),i=`vec3[SAMPLES](`;for(let t=0;t<e;t++){let n=r[t];i+=`vec3(${n.x}, ${n.y}, ${n.z})${t<e-1?`,`:`)`}`}return i}function He(e,t,n){let r=[];for(let i=0;i<e;i++){let a=2*Math.PI*t*i/e,o=(i/(e-1))**n;r.push(new v(Math.cos(a),Math.sin(a),o))}return r}var Ue=class{constructor(e=Math){this.grad3=[[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]],this.grad4=[[0,1,1,1],[0,1,1,-1],[0,1,-1,1],[0,1,-1,-1],[0,-1,1,1],[0,-1,1,-1],[0,-1,-1,1],[0,-1,-1,-1],[1,0,1,1],[1,0,1,-1],[1,0,-1,1],[1,0,-1,-1],[-1,0,1,1],[-1,0,1,-1],[-1,0,-1,1],[-1,0,-1,-1],[1,1,0,1],[1,1,0,-1],[1,-1,0,1],[1,-1,0,-1],[-1,1,0,1],[-1,1,0,-1],[-1,-1,0,1],[-1,-1,0,-1],[1,1,1,0],[1,1,-1,0],[1,-1,1,0],[1,-1,-1,0],[-1,1,1,0],[-1,1,-1,0],[-1,-1,1,0],[-1,-1,-1,0]],this.p=[];for(let t=0;t<256;t++)this.p[t]=Math.floor(e.random()*256);this.perm=[];for(let e=0;e<512;e++)this.perm[e]=this.p[e&255];this.simplex=[[0,1,2,3],[0,1,3,2],[0,0,0,0],[0,2,3,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,3,0],[0,2,1,3],[0,0,0,0],[0,3,1,2],[0,3,2,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,3,2,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,0,3],[0,0,0,0],[1,3,0,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,3,0,1],[2,3,1,0],[1,0,2,3],[1,0,3,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,3,1],[0,0,0,0],[2,1,3,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,1,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,0,1,2],[3,0,2,1],[0,0,0,0],[3,1,2,0],[2,1,0,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,1,0,2],[0,0,0,0],[3,2,0,1],[3,2,1,0]]}noise(e,t){let n,r,i,a=.5*(Math.sqrt(3)-1),o=(e+t)*a,s=Math.floor(e+o),c=Math.floor(t+o),l=(3-Math.sqrt(3))/6,u=(s+c)*l,d=s-u,f=c-u,p=e-d,m=t-f,h,g;p>m?(h=1,g=0):(h=0,g=1);let _=p-h+l,v=m-g+l,y=p-1+2*l,b=m-1+2*l,x=s&255,S=c&255,C=this.perm[x+this.perm[S]]%12,w=this.perm[x+h+this.perm[S+g]]%12,T=this.perm[x+1+this.perm[S+1]]%12,E=.5-p*p-m*m;E<0?n=0:(E*=E,n=E*E*this._dot(this.grad3[C],p,m));let D=.5-_*_-v*v;D<0?r=0:(D*=D,r=D*D*this._dot(this.grad3[w],_,v));let O=.5-y*y-b*b;return O<0?i=0:(O*=O,i=O*O*this._dot(this.grad3[T],y,b)),70*(n+r+i)}noise3d(e,t,n){let r,i,a,o,s=(e+t+n)*(1/3),c=Math.floor(e+s),l=Math.floor(t+s),u=Math.floor(n+s),d=1/6,f=(c+l+u)*d,p=c-f,m=l-f,h=u-f,g=e-p,_=t-m,v=n-h,y,b,x,S,C,w;g>=_?_>=v?(y=1,b=0,x=0,S=1,C=1,w=0):g>=v?(y=1,b=0,x=0,S=1,C=0,w=1):(y=0,b=0,x=1,S=1,C=0,w=1):_<v?(y=0,b=0,x=1,S=0,C=1,w=1):g<v?(y=0,b=1,x=0,S=0,C=1,w=1):(y=0,b=1,x=0,S=1,C=1,w=0);let T=g-y+d,E=_-b+d,D=v-x+d,O=g-S+2*d,k=_-C+2*d,A=v-w+2*d,ee=g-1+3*d,te=_-1+3*d,ne=v-1+3*d,j=c&255,M=l&255,N=u&255,re=this.perm[j+this.perm[M+this.perm[N]]]%12,ie=this.perm[j+y+this.perm[M+b+this.perm[N+x]]]%12,ae=this.perm[j+S+this.perm[M+C+this.perm[N+w]]]%12,oe=this.perm[j+1+this.perm[M+1+this.perm[N+1]]]%12,P=.6-g*g-_*_-v*v;P<0?r=0:(P*=P,r=P*P*this._dot3(this.grad3[re],g,_,v));let F=.6-T*T-E*E-D*D;F<0?i=0:(F*=F,i=F*F*this._dot3(this.grad3[ie],T,E,D));let I=.6-O*O-k*k-A*A;I<0?a=0:(I*=I,a=I*I*this._dot3(this.grad3[ae],O,k,A));let L=.6-ee*ee-te*te-ne*ne;return L<0?o=0:(L*=L,o=L*L*this._dot3(this.grad3[oe],ee,te,ne)),32*(r+i+a+o)}noise4d(e,t,n,r){let i=this.grad4,a=this.simplex,o=this.perm,s=(Math.sqrt(5)-1)/4,c=(5-Math.sqrt(5))/20,l,u,d,f,p,m=(e+t+n+r)*s,h=Math.floor(e+m),g=Math.floor(t+m),_=Math.floor(n+m),v=Math.floor(r+m),y=(h+g+_+v)*c,b=h-y,x=g-y,S=_-y,C=v-y,w=e-b,T=t-x,E=n-S,D=r-C,O=w>T?32:0,k=w>E?16:0,A=T>E?8:0,ee=w>D?4:0,te=T>D?2:0,ne=+(E>D),j=O+k+A+ee+te+ne,M=+(a[j][0]>=3),N=+(a[j][1]>=3),re=+(a[j][2]>=3),ie=+(a[j][3]>=3),ae=+(a[j][0]>=2),oe=+(a[j][1]>=2),P=+(a[j][2]>=2),F=+(a[j][3]>=2),I=+(a[j][0]>=1),L=+(a[j][1]>=1),se=+(a[j][2]>=1),R=+(a[j][3]>=1),ce=w-M+c,z=T-N+c,le=E-re+c,ue=D-ie+c,B=w-ae+2*c,V=T-oe+2*c,de=E-P+2*c,fe=D-F+2*c,pe=w-I+3*c,me=T-L+3*c,he=E-se+3*c,ge=D-R+3*c,_e=w-1+4*c,ve=T-1+4*c,ye=E-1+4*c,H=D-1+4*c,U=h&255,W=g&255,G=_&255,K=v&255,be=o[U+o[W+o[G+o[K]]]]%32,xe=o[U+M+o[W+N+o[G+re+o[K+ie]]]]%32,Se=o[U+ae+o[W+oe+o[G+P+o[K+F]]]]%32,Ce=o[U+I+o[W+L+o[G+se+o[K+R]]]]%32,we=o[U+1+o[W+1+o[G+1+o[K+1]]]]%32,q=.6-w*w-T*T-E*E-D*D;q<0?l=0:(q*=q,l=q*q*this._dot4(i[be],w,T,E,D));let J=.6-ce*ce-z*z-le*le-ue*ue;J<0?u=0:(J*=J,u=J*J*this._dot4(i[xe],ce,z,le,ue));let Y=.6-B*B-V*V-de*de-fe*fe;Y<0?d=0:(Y*=Y,d=Y*Y*this._dot4(i[Se],B,V,de,fe));let X=.6-pe*pe-me*me-he*he-ge*ge;X<0?f=0:(X*=X,f=X*X*this._dot4(i[Ce],pe,me,he,ge));let Z=.6-_e*_e-ve*ve-ye*ye-H*H;return Z<0?p=0:(Z*=Z,p=Z*Z*this._dot4(i[we],_e,ve,ye,H)),27*(l+u+d+f+p)}_dot(e,t,n){return e[0]*t+e[1]*n}_dot3(e,t,n,r){return e[0]*t+e[1]*n+e[2]*r}_dot4(e,t,n,r,i){return e[0]*t+e[1]*n+e[2]*r+e[3]*i}},We=class e extends Q{constructor(e,t,n=512,r=512,i,a,o){super(),this.width=n,this.height=r,this.clear=!0,this.camera=t,this.scene=e,this.output=0,this._renderGBuffer=!0,this._visibilityCache=[],this.blendIntensity=1,this.pdRings=2,this.pdRadiusExponent=2,this.pdSamples=16,this.gtaoNoiseTexture=Re(),this.pdNoiseTexture=this._generateNoise(),this.gtaoRenderTarget=new h(this.width,this.height,{type:O,depthBuffer:!1}),this.pdRenderTarget=this.gtaoRenderTarget.clone(),this.gtaoMaterial=new k({defines:Object.assign({},Fe.defines),uniforms:E.clone(Fe.uniforms),vertexShader:Fe.vertexShader,fragmentShader:Fe.fragmentShader,blending:0,depthTest:!1,depthWrite:!1}),this.gtaoMaterial.defines.PERSPECTIVE_CAMERA=+!!this.camera.isPerspectiveCamera,this.gtaoMaterial.uniforms.tNoise.value=this.gtaoNoiseTexture,this.gtaoMaterial.uniforms.resolution.value.set(this.width,this.height),this.gtaoMaterial.uniforms.cameraNear.value=this.camera.near,this.gtaoMaterial.uniforms.cameraFar.value=this.camera.far,this.normalMaterial=new C,this.normalMaterial.blending=0,this.pdMaterial=new k({defines:Object.assign({},Be.defines),uniforms:E.clone(Be.uniforms),vertexShader:Be.vertexShader,fragmentShader:Be.fragmentShader,depthTest:!1,depthWrite:!1}),this.pdMaterial.uniforms.tDiffuse.value=this.gtaoRenderTarget.texture,this.pdMaterial.uniforms.tNoise.value=this.pdNoiseTexture,this.pdMaterial.uniforms.resolution.value.set(this.width,this.height),this.pdMaterial.uniforms.lumaPhi.value=10,this.pdMaterial.uniforms.depthPhi.value=2,this.pdMaterial.uniforms.normalPhi.value=3,this.pdMaterial.uniforms.radius.value=8,this.depthRenderMaterial=new k({defines:Object.assign({},Ie.defines),uniforms:E.clone(Ie.uniforms),vertexShader:Ie.vertexShader,fragmentShader:Ie.fragmentShader,blending:0}),this.depthRenderMaterial.uniforms.cameraNear.value=this.camera.near,this.depthRenderMaterial.uniforms.cameraFar.value=this.camera.far,this.copyMaterial=new k({uniforms:E.clone(De.uniforms),vertexShader:De.vertexShader,fragmentShader:De.fragmentShader,transparent:!0,depthTest:!1,depthWrite:!1,blendSrc:208,blendDst:200,blendEquation:100,blendSrcAlpha:206,blendDstAlpha:200,blendEquationAlpha:100}),this.blendMaterial=new k({uniforms:E.clone(Le.uniforms),vertexShader:Le.vertexShader,fragmentShader:Le.fragmentShader,transparent:!0,depthTest:!1,depthWrite:!1,blending:5,blendSrc:208,blendDst:200,blendEquation:100,blendSrcAlpha:206,blendDstAlpha:200,blendEquationAlpha:100}),this._fsQuad=new Ae(null),this._originalClearColor=new m,this.setGBuffer(i?i.depthTexture:void 0,i?i.normalTexture:void 0),a!==void 0&&this.updateGtaoMaterial(a),o!==void 0&&this.updatePdMaterial(o)}setSize(e,t){this.width=e,this.height=t,this.gtaoRenderTarget.setSize(e,t),this.normalRenderTarget.setSize(e,t),this.pdRenderTarget.setSize(e,t),this.gtaoMaterial.uniforms.resolution.value.set(e,t),this.gtaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix),this.gtaoMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this.pdMaterial.uniforms.resolution.value.set(e,t),this.pdMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse)}dispose(){this.gtaoNoiseTexture.dispose(),this.pdNoiseTexture.dispose(),this.normalRenderTarget.dispose(),this.gtaoRenderTarget.dispose(),this.pdRenderTarget.dispose(),this.normalMaterial.dispose(),this.pdMaterial.dispose(),this.copyMaterial.dispose(),this.depthRenderMaterial.dispose(),this._fsQuad.dispose()}get gtaoMap(){return this.pdRenderTarget.texture}setGBuffer(e,t){e===void 0?(this.depthTexture=new s,this.depthTexture.format=b,this.depthTexture.type=T,this.normalRenderTarget=new h(this.width,this.height,{minFilter:c,magFilter:c,type:O,depthTexture:this.depthTexture}),this.normalTexture=this.normalRenderTarget.texture,this._renderGBuffer=!0):(this.depthTexture=e,this.normalTexture=t,this._renderGBuffer=!1);let n=+!!this.normalTexture,r=this.depthTexture===this.normalTexture?`w`:`x`;this.gtaoMaterial.defines.NORMAL_VECTOR_TYPE=n,this.gtaoMaterial.defines.DEPTH_SWIZZLING=r,this.gtaoMaterial.uniforms.tNormal.value=this.normalTexture,this.gtaoMaterial.uniforms.tDepth.value=this.depthTexture,this.pdMaterial.defines.NORMAL_VECTOR_TYPE=n,this.pdMaterial.defines.DEPTH_SWIZZLING=r,this.pdMaterial.uniforms.tNormal.value=this.normalTexture,this.pdMaterial.uniforms.tDepth.value=this.depthTexture,this.depthRenderMaterial.uniforms.tDepth.value=this.normalRenderTarget.depthTexture}setSceneClipBox(e){e?(this.gtaoMaterial.needsUpdate=this.gtaoMaterial.defines.SCENE_CLIP_BOX!==1,this.gtaoMaterial.defines.SCENE_CLIP_BOX=1,this.gtaoMaterial.uniforms.sceneBoxMin.value.copy(e.min),this.gtaoMaterial.uniforms.sceneBoxMax.value.copy(e.max)):(this.gtaoMaterial.needsUpdate=this.gtaoMaterial.defines.SCENE_CLIP_BOX===0,this.gtaoMaterial.defines.SCENE_CLIP_BOX=0)}updateGtaoMaterial(e){e.radius!==void 0&&(this.gtaoMaterial.uniforms.radius.value=e.radius),e.distanceExponent!==void 0&&(this.gtaoMaterial.uniforms.distanceExponent.value=e.distanceExponent),e.thickness!==void 0&&(this.gtaoMaterial.uniforms.thickness.value=e.thickness),e.distanceFallOff!==void 0&&(this.gtaoMaterial.uniforms.distanceFallOff.value=e.distanceFallOff,this.gtaoMaterial.needsUpdate=!0),e.scale!==void 0&&(this.gtaoMaterial.uniforms.scale.value=e.scale),e.samples!==void 0&&e.samples!==this.gtaoMaterial.defines.SAMPLES&&(this.gtaoMaterial.defines.SAMPLES=e.samples,this.gtaoMaterial.needsUpdate=!0),e.screenSpaceRadius!==void 0&&+!!e.screenSpaceRadius!==this.gtaoMaterial.defines.SCREEN_SPACE_RADIUS&&(this.gtaoMaterial.defines.SCREEN_SPACE_RADIUS=+!!e.screenSpaceRadius,this.gtaoMaterial.needsUpdate=!0)}updatePdMaterial(e){let t=!1;e.lumaPhi!==void 0&&(this.pdMaterial.uniforms.lumaPhi.value=e.lumaPhi),e.depthPhi!==void 0&&(this.pdMaterial.uniforms.depthPhi.value=e.depthPhi),e.normalPhi!==void 0&&(this.pdMaterial.uniforms.normalPhi.value=e.normalPhi),e.radius!==void 0&&e.radius!==this.radius&&(this.pdMaterial.uniforms.radius.value=e.radius),e.radiusExponent!==void 0&&e.radiusExponent!==this.pdRadiusExponent&&(this.pdRadiusExponent=e.radiusExponent,t=!0),e.rings!==void 0&&e.rings!==this.pdRings&&(this.pdRings=e.rings,t=!0),e.samples!==void 0&&e.samples!==this.pdSamples&&(this.pdSamples=e.samples,t=!0),t&&(this.pdMaterial.defines.SAMPLES=this.pdSamples,this.pdMaterial.defines.SAMPLE_VECTORS=Ve(this.pdSamples,this.pdRings,this.pdRadiusExponent),this.pdMaterial.needsUpdate=!0)}render(t,n,r){switch(this._renderGBuffer&&(this._overrideVisibility(),this._renderOverride(t,this.normalMaterial,this.normalRenderTarget,7829503,1),this._restoreVisibility()),this.gtaoMaterial.uniforms.cameraNear.value=this.camera.near,this.gtaoMaterial.uniforms.cameraFar.value=this.camera.far,this.gtaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix),this.gtaoMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this.gtaoMaterial.uniforms.cameraWorldMatrix.value.copy(this.camera.matrixWorld),this._renderPass(t,this.gtaoMaterial,this.gtaoRenderTarget,16777215,1),this.pdMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this._renderPass(t,this.pdMaterial,this.pdRenderTarget,16777215,1),this.output){case e.OUTPUT.Off:break;case e.OUTPUT.Diffuse:this.copyMaterial.uniforms.tDiffuse.value=r.texture,this.copyMaterial.blending=0,this._renderPass(t,this.copyMaterial,this.renderToScreen?null:n);break;case e.OUTPUT.AO:this.copyMaterial.uniforms.tDiffuse.value=this.gtaoRenderTarget.texture,this.copyMaterial.blending=0,this._renderPass(t,this.copyMaterial,this.renderToScreen?null:n);break;case e.OUTPUT.Denoise:this.copyMaterial.uniforms.tDiffuse.value=this.pdRenderTarget.texture,this.copyMaterial.blending=0,this._renderPass(t,this.copyMaterial,this.renderToScreen?null:n);break;case e.OUTPUT.Depth:this.depthRenderMaterial.uniforms.cameraNear.value=this.camera.near,this.depthRenderMaterial.uniforms.cameraFar.value=this.camera.far,this._renderPass(t,this.depthRenderMaterial,this.renderToScreen?null:n);break;case e.OUTPUT.Normal:this.copyMaterial.uniforms.tDiffuse.value=this.normalRenderTarget.texture,this.copyMaterial.blending=0,this._renderPass(t,this.copyMaterial,this.renderToScreen?null:n);break;case e.OUTPUT.Default:this.copyMaterial.uniforms.tDiffuse.value=r.texture,this.copyMaterial.blending=0,this._renderPass(t,this.copyMaterial,this.renderToScreen?null:n),this.blendMaterial.uniforms.intensity.value=this.blendIntensity,this.blendMaterial.uniforms.tDiffuse.value=this.pdRenderTarget.texture,this._renderPass(t,this.blendMaterial,this.renderToScreen?null:n);break;default:console.warn(`THREE.GTAOPass: Unknown output type.`)}}_renderPass(e,t,n,r,i){e.getClearColor(this._originalClearColor);let a=e.getClearAlpha(),o=e.autoClear;e.setRenderTarget(n),e.autoClear=!1,r!=null&&(e.setClearColor(r),e.setClearAlpha(i||0),e.clear()),this._fsQuad.material=t,this._fsQuad.render(e),e.autoClear=o,e.setClearColor(this._originalClearColor),e.setClearAlpha(a)}_renderOverride(e,t,n,r,i){e.getClearColor(this._originalClearColor);let a=e.getClearAlpha(),o=e.autoClear;e.setRenderTarget(n),e.autoClear=!1,r=t.clearColor||r,i=t.clearAlpha||i,r!=null&&(e.setClearColor(r),e.setClearAlpha(i||0),e.clear()),this.scene.overrideMaterial=t,e.render(this.scene,this.camera),this.scene.overrideMaterial=null,e.autoClear=o,e.setClearColor(this._originalClearColor),e.setClearAlpha(a)}_overrideVisibility(){let e=this.scene,t=this._visibilityCache;e.traverse(function(e){(e.isPoints||e.isLine||e.isLine2)&&e.visible&&(e.visible=!1,t.push(e))})}_restoreVisibility(){let e=this._visibilityCache;for(let t=0;t<e.length;t++)e[t].visible=!0;e.length=0}_generateNoise(e=64){let t=new Ue,n=e*e*4,r=new Uint8Array(n);for(let n=0;n<e;n++)for(let i=0;i<e;i++){let a=n,o=i;r[(n*e+i)*4]=(t.noise(a,o)*.5+.5)*255,r[(n*e+i)*4+1]=(t.noise(a+e,o)*.5+.5)*255,r[(n*e+i)*4+2]=(t.noise(a,o+e)*.5+.5)*255,r[(n*e+i)*4+3]=(t.noise(a+e,o+e)*.5+.5)*255}let i=new S(r,e,e,ne,te);return i.wrapS=a,i.wrapT=a,i.needsUpdate=!0,i}};We.OUTPUT={Off:-1,Default:0,Diffuse:1,Depth:2,Normal:3,AO:4,Denoise:5};var Ge={name:`OutputShader`,uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
		precision highp float;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		precision highp float;

		uniform sampler2D tDiffuse;

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

			#ifdef LINEAR_TONE_MAPPING

				gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );

			#elif defined( REINHARD_TONE_MAPPING )

				gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );

			#elif defined( CINEON_TONE_MAPPING )

				gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );

			#elif defined( ACES_FILMIC_TONE_MAPPING )

				gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );

			#elif defined( AGX_TONE_MAPPING )

				gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );

			#elif defined( NEUTRAL_TONE_MAPPING )

				gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );

			#elif defined( CUSTOM_TONE_MAPPING )

				gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );

			#endif

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`},Ke=class extends Q{constructor(){super(),this.isOutputPass=!0,this.uniforms=E.clone(Ge.uniforms),this.material=new u({name:Ge.name,uniforms:this.uniforms,vertexShader:Ge.vertexShader,fragmentShader:Ge.fragmentShader}),this._fsQuad=new Ae(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,t,n){this.uniforms.tDiffuse.value=n.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,(this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping)&&(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},M.getTransfer(this._outputColorSpace)===`srgb`&&(this.material.defines.SRGB_TRANSFER=``),this._toneMapping===1?this.material.defines.LINEAR_TONE_MAPPING=``:this._toneMapping===2?this.material.defines.REINHARD_TONE_MAPPING=``:this._toneMapping===3?this.material.defines.CINEON_TONE_MAPPING=``:this._toneMapping===4?this.material.defines.ACES_FILMIC_TONE_MAPPING=``:this._toneMapping===6?this.material.defines.AGX_TONE_MAPPING=``:this._toneMapping===7?this.material.defines.NEUTRAL_TONE_MAPPING=``:this._toneMapping===5&&(this.material.defines.CUSTOM_TONE_MAPPING=``),this.material.needsUpdate=!0),this.renderToScreen===!0?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}},qe=class extends Q{constructor(e,t,n=null,r=null,i=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=n,this.clearColor=r,this.clearAlpha=i,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this.isRenderPass=!0,this._oldClearColor=new m}render(e,t,n){let r=e.autoClear;e.autoClear=!1;let i,a;this.overrideMaterial!==null&&(a=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(i=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==1&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:n),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(i),this.overrideMaterial!==null&&(this.scene.overrideMaterial=a),e.autoClear=r}},Je=class extends i{constructor(){super(),this.name=`RoomEnvironment`,this.position.y=-3.5;let e=new w;e.deleteAttribute(`uv`);let t=new x({side:1}),n=new x,r=new f(16777215,900,28,2);r.position.set(.418,16.199,.3),this.add(r);let i=new N(e,t);i.position.set(-.757,13.219,.717),i.scale.set(31.713,28.305,28.591),this.add(i);let a=new d(e,n,6),s=new o;s.position.set(-10.906,2.009,1.846),s.rotation.set(0,-.195,0),s.scale.set(2.328,7.905,4.651),s.updateMatrix(),a.setMatrixAt(0,s.matrix),s.position.set(-5.607,-.754,-.758),s.rotation.set(0,.994,0),s.scale.set(1.97,1.534,3.955),s.updateMatrix(),a.setMatrixAt(1,s.matrix),s.position.set(6.167,.857,7.803),s.rotation.set(0,.561,0),s.scale.set(3.927,6.285,3.687),s.updateMatrix(),a.setMatrixAt(2,s.matrix),s.position.set(-2.017,.018,6.124),s.rotation.set(0,.333,0),s.scale.set(2.002,4.566,2.064),s.updateMatrix(),a.setMatrixAt(3,s.matrix),s.position.set(2.291,-.756,-2.621),s.rotation.set(0,-.286,0),s.scale.set(1.546,1.552,1.496),s.updateMatrix(),a.setMatrixAt(4,s.matrix),s.position.set(-2.193,-.369,-5.547),s.rotation.set(0,.516,0),s.scale.set(3.875,3.487,2.986),s.updateMatrix(),a.setMatrixAt(5,s.matrix),this.add(a);let c=new N(e,$(50));c.position.set(-16.116,14.37,8.208),c.scale.set(.1,2.428,2.739),this.add(c);let l=new N(e,$(50));l.position.set(-16.109,18.021,-8.207),l.scale.set(.1,2.425,2.751),this.add(l);let u=new N(e,$(17));u.position.set(14.904,12.198,-1.832),u.scale.set(.15,4.265,6.331),this.add(u);let p=new N(e,$(43));p.position.set(-.462,8.89,14.52),p.scale.set(4.38,5.441,.088),this.add(p);let m=new N(e,$(20));m.position.set(3.235,11.486,-12.541),m.scale.set(2.5,2,.1),this.add(m);let h=new N(e,$(100));h.position.set(0,20,0),h.scale.set(1,.1,1),this.add(h)}dispose(){let e=new Set;this.traverse(t=>{t.isMesh&&(e.add(t.geometry),e.add(t.material))});for(let t of e)t.dispose()}};function $(e){return new l({color:0,emissive:16777215,emissiveIntensity:e})}var Ye={bias:-5e-4,normalBias:.09},Xe={low:{textureSize:512,anisotropy:1,shadow:{mapSize:1024,radius:1,...Ye},ssao:{mode:`off`},envIntensity:0,normalScale:.8,textureAO:.8,pixelRatioMax:1,msaa:0,maxDrawCalls:250,targetFps:60},medium:{textureSize:1024,anisotropy:4,shadow:{mapSize:2048,radius:2.5,...Ye},ssao:{mode:`gtao`,resolutionScale:.5,samples:8},envIntensity:0,normalScale:1,textureAO:.8,pixelRatioMax:1.5,msaa:4,maxDrawCalls:400,targetFps:60},high:{textureSize:1024,anisotropy:8,shadow:{mapSize:4096,radius:4,...Ye},ssao:{mode:`gtao`,resolutionScale:1,samples:16},envIntensity:.12,normalScale:1,textureAO:.8,pixelRatioMax:2,msaa:4,maxDrawCalls:600,targetFps:60}},Ze=(e,t)=>({calls:e,max:t.maxDrawCalls,ok:e<t.maxDrawCalls}),Qe=class extends We{scale;constructor(e,t,n){super(e,t,512,512),this.scale=n}setSize(e,t){super.setSize(Math.max(1,Math.round(e*this.scale)),Math.max(1,Math.round(t*this.scale)))}render(...e){let t=e[0],n=t.shadowMap.autoUpdate;t.shadowMap.autoUpdate=!1,super.render(...e),t.shadowMap.autoUpdate=n}};function $e(e,t){let n=e.shadow;n.mapSize.x!==t.shadow.mapSize&&(n.mapSize.set(t.shadow.mapSize,t.shadow.mapSize),n.map?.dispose(),n.map=null),n.radius=t.shadow.radius,n.bias=t.shadow.bias,n.normalBias=t.shadow.normalBias}var et=class{renderer;scene;camera;q;composer;ao;env;size=new y;lastCalls=0;constructor(e,t,n,r,i){if(this.renderer=e,this.scene=t,this.camera=n,this.q=r,e.setPixelRatio(Math.min(i,r.pixelRatioMax)),r.envIntensity>0){let n=new ie(e);this.env=n.fromScene(new Je,.04).texture,n.dispose(),t.environment=this.env,t.environmentIntensity=r.envIntensity}if(r.ssao.mode===`gtao`){e.getSize(this.size);let i=new h(Math.max(1,this.size.x*e.getPixelRatio()),Math.max(1,this.size.y*e.getPixelRatio()),{type:O,samples:r.msaa});i.depthTexture=new s(i.width,i.height);let a=new Pe(e,i);a.addPass(new qe(t,n));let o=new Qe(t,n,r.ssao.resolutionScale);o.setGBuffer(i.depthTexture),o.updateGtaoMaterial({samples:r.ssao.samples,radius:.6,distanceFallOff:1}),o.blendIntensity=1,a.addPass(o),this.ao=o,a.addPass(new Ke),this.composer=a}}get preset(){return this.q}setSize(e,t){this.composer?.setPixelRatio(this.renderer.getPixelRatio()),this.composer?.setSize(e,t)}render(){let e=this.renderer,t=e.info.autoReset;e.info.autoReset=!1,e.info.reset();let n=this.composer;if(n){let e=n.readBuffer.depthTexture;this.ao&&e&&this.ao.depthTexture!==e&&this.ao.setGBuffer(e),n.render()}else e.setRenderTarget(null),e.render(this.scene,this.camera);this.lastCalls=e.info.render.calls,e.info.autoReset=t}budget(){return Ze(this.lastCalls,this.q)}dispose(){this.composer?.dispose(),this.env?.dispose()}},tt=[[/^glass-lit$/,null],[/glass/,`szklo`],[/brick|chimney/,`cegla`],[/wood|plank|door-panel/,`drewno`],[/^(metal|gutter)$/,`blacha`],[/^roof-/,`papa`],[/^grass/,`trawa`],[/^(asphalt|parking)$/,`asfalt`],[/^sidewalk$/,`plyty`],[/^(curb|concrete|stain)$/,`beton`],[/^dirt$/,`ziemia`],[/wall|stub|doorway|kostka|char/,`tynk`],[/^(blood|carpet|kitchen-tiles)$/,null]];function nt(e){for(let[t,n]of tt)if(t.test(e))return n===null?255:R[n];return R.gladki}function rt(e,t=16){let n=new Uint8Array(t*t).fill(255);for(let[r,{uv:i}]of Object.entries(e)){let e=Math.min(t-1,Math.max(0,Math.floor(i[0]*t))),a=Math.min(t-1,Math.max(0,Math.floor(i[1]*t)));n[a*t+e]=nt(r)}return n}var it={"prop-tree":`drzewo-lisciaste`,"prop-tree-autumn":`drzewo-lisciaste`,"prop-tree-large":`drzewo-lisciaste`,"prop-tree-small":`drzewo-lisciaste`,"prop-tree-tall":`drzewo-lisciaste`,"prop-grass-large":`krzak`},at={"prop-grass-large":.85},ot={[R.trawa]:`grass-b`,[R.drewno]:`trim-wood`,[R.beton]:`concrete`,[R.papa]:`roof-gravel`,[R.szklo]:`glass`};function st(e){if(!e)return;e.computeBoundingBox();let t=e.boundingBox;return t?t.max.y-t.min.y:void 0}function ct(e,t,n){let r=e.cellIndex??{},i=be(rt(r,16),16),a=xe(e.material,t,i),o=new Map(e.geometries),s=t=>r[ot[t]??`paint`]?.uv??e.cells.uv(`paint`);for(let[e,t]of Object.entries(it)){let r=n.get(t);if(!r||!o.has(e))continue;let i=at[e]??st(o.get(e));o.set(e,Ee(r,s,i))}return{geometries:o,material:a,cells:e.cells,detail:e.detail,cellIndex:r,terrainMaterial:Se(t)}}function lt(e,t,n){return e.wrapS=e.wrapT=a,e.minFilter=D,e.magFilter=_,e.anisotropy=n,e.colorSpace=t===`albedo`?p:``,e.needsUpdate=!0,e}function ut(e,t){let n=e===512&&t.lowRes?t.lowRes:t;return{albedo:n.albedo,normal:n.normal,orm:n.orm,layers:t.layers}}async function dt(e,t,n,r){let i={albedo:n.albedo,normal:n.normal,orm:n.orm},a=async n=>lt(await e.loadAsync(t+i[n]),n,r),[o,s,c]=await Promise.all([a(`albedo`),a(`normal`),a(`orm`)]);return{alb:o,nrm:s,orm:c}}var ft=[{id:`blok-p4`,x:-34,z:-34},{id:`blok-p10`,x:28,z:-36},{id:`dom-kostka-namiot`,x:-24,z:6},{id:`dom-90`,x:8,z:8},{id:`smietnik`,x:-6,z:-14},{id:`sedan`,x:-9,z:-6,rotY:Math.PI/2},{id:`sedan`,x:-2,z:-6,rotY:Math.PI/2},{id:`sedan`,x:7,z:-5.5,rotY:-Math.PI/2},{id:`drzewo-lisciaste`,x:-12,z:2},{id:`drzewo-lisciaste`,x:4,z:-14,scale:1.1},{id:`drzewo-lisciaste`,x:22,z:-2,scale:.9},{id:`drzewo-lisciaste`,x:-30,z:-6,scale:1.05},{id:`krzak`,x:5,z:3},{id:`krzak`,x:6.5,z:4.2,scale:.8},{id:`krzak`,x:-15,z:8},{id:`krzak`,x:-14,z:9.6,scale:1.2}],pt=3,mt={"blok-p4":{id:`blok-p4`,x0:0,x1:57.6,z0:0,z1:12,storeys:5,storeyM:3.3,floors:[4,7],repeat:!0},"blok-p10":{id:`blok-p10`,x0:0,x1:28.8,z0:0,z1:13,storeys:11,storeyM:3.1,floors:[8,13],repeat:!0},"dom-90":{id:`dom-90`,x0:0,x1:14.2,z0:0,z1:9.4,storeys:2,storeyM:2.8,floors:[1,3],repeat:!1},"dom-kostka-namiot":{id:`dom-kostka-namiot`,x0:0,x1:9.4,z0:0,z1:9.4,storeys:2,storeyM:2.8,floors:[1,3],repeat:!1}},ht=[.65,1.5],gt=.12,_t={block:[`blok-p4`,`blok-p10`],house:[`dom-90`,`dom-kostka-namiot`],kostka:[`dom-kostka-namiot`,`dom-90`]},vt=(e,[t,n])=>e>=t&&e<=n,yt=e=>(Math.imul(e|0,2654435761)>>>0)/4294967296;function bt(e){if(!e.rect||e.outline)return;let t=_t[e.kind??``];if(!t)return;let n=e.x1-e.x0+1-2*gt,r=e.y1-e.y0+1-2*gt,i=Math.max(n,r),a=Math.min(n,r),o=n>=r,s=(e.x0+e.x1+1)/2,c=(e.y0+e.y1+1)/2;for(let n of t){let t=mt[n];if(!vt(e.floors,t.floors))continue;let r=t.x1-t.x0,l=t.z1-t.z0,u=t.repeat?Math.max(1,Math.round(i/r)):1,d=i/(u*r),f=a/l;if(!vt(d,ht)||!vt(f,ht))continue;let p=e.floors*pt/(t.storeys*t.storeyM),m=yt(e.id)<.5?0:Math.PI,h=(o?0:-Math.PI/2)+m,g=i/u,_=[];for(let e=0;e<u;e++){let t=-i/2+g*(e+.5);_.push({id:n,x:o?s+t:s,z:o?c:c+t,rotY:h,sx:d,sy:p,sz:f})}return _}}var xt=`base:dumpster`,St={id:`smietnik`,x0:-.15,x1:6.55,z0:-.15,z1:2.85},Ct=.6;function wt(e){let t=e.filter(e=>e.contentId===xt),n=(e,t)=>`${e},${t}`,r=new Map(t.map(e=>[n(e.tx,e.ty),e])),i=new Set,a=[];for(let e of t){let t=n(e.tx,e.ty);if(i.has(t))continue;let o=[],s=[e];for(i.add(t);s.length;){let e=s.pop();o.push(e);for(let[t,a]of[[1,0],[-1,0],[0,1],[0,-1]]){let o=n(e.tx+t,e.ty+a),c=r.get(o);c&&!i.has(o)&&(i.add(o),s.push(c))}}let c=1/0,l=-1/0,u=1/0,d=-1/0;for(let e of o)c=Math.min(c,e.tx),l=Math.max(l,e.tx+1),u=Math.min(u,e.ty),d=Math.max(d,e.ty+1);let f=o.length===1,p=f?Ct:1,m=f?-e.rot*Math.PI/2+Math.PI:l-c>=d-u?0:-Math.PI/2;a.push({id:St.id,x:(c+l)/2,z:(u+d)/2,rotY:m,sx:p,sy:p,sz:p})}return a}var Tt=`krzak`,Et={low:.05,medium:.1,high:.14};function Dt(e,t,n){let r=Math.imul(e|0,374761393)^Math.imul(t|0,668265263)^Math.imul(n,2246822519);return r=Math.imul(r^r>>>13,1274126177),((r^r>>>16)>>>0)/4294967296}function Ot(e,t){let n=Et[t],r=[];for(let t of e)for(let e=t.y;e<t.y+t.h;e++)for(let i=t.x;i<t.x+t.w;i++){if(r.length>=160)return r;if(Dt(i,e,1)>=n)continue;let t=.7+Dt(i,e,2)*.5;r.push({id:Tt,x:i+.2+Dt(i,e,3)*.6,z:e+.2+Dt(i,e,4)*.6,rotY:Dt(i,e,5)*Math.PI*2,sx:t,sy:t,sz:t})}return r}function kt(e){let t=mt[e];return t?{x:(t.x0+t.x1)/2,z:(t.z0+t.z1)/2}:e===St.id?{x:(St.x0+St.x1)/2,z:(St.z0+St.z1)/2}:{x:0,z:0}}var At=new v(0,1,0);function jt(e,n=new t){let r=kt(e.id),i=new t().makeTranslation(-r.x,0,-r.z);return n.compose(new v(e.x,0,e.z),new A().setFromAxisAngle(At,e.rotY),new v(e.sx,e.sy,e.sz)),n.multiply(i)}var Mt=class{models;material;propShadows;root=new r;chunks=new Map;buildings=new Map;meshes=new Map;dirty=!1;cutKey=``;cut=new Set;constructor(e,t,n){this.models=e,this.material=t,this.propShadows=n,this.root.name=`pbr-map`}loadChunk(e,t,n){this.unloadChunk(e,t),this.chunks.set(`${e},${t}`,n);for(let[e,t]of n.buildings){let n=this.buildings.get(e);n?n.refs++:this.buildings.set(e,{list:t,refs:1})}this.dirty=!0}unloadChunk(e,t){let n=`${e},${t}`,r=this.chunks.get(n);if(r){this.chunks.delete(n);for(let e of r.buildings.keys()){let t=this.buildings.get(e);t&&--t.refs<=0&&this.buildings.delete(e)}this.dirty=!0}}setCutaway(e){let t=new Set;e.building!==0&&t.add(e.building);for(let n of e.occluders??[])I(e,n)&&t.add(n);let n=[...t].sort((e,t)=>e-t).join(`,`);n!==this.cutKey&&(this.cutKey=n,this.cut=t,this.dirty=!0)}update(){if(!this.dirty)return;this.dirty=!1;let e=new Map,n=t=>{let n=e.get(t.id);n||e.set(t.id,n=[]),n.push(t)};for(let[e,t]of this.buildings)this.cut.has(e)||t.list.forEach(n);for(let e of this.chunks.values())e.props.forEach(n);let r=new t;for(let[t,n]of this.meshes)e.has(t)||(this.root.remove(n),n.dispose(),this.meshes.delete(t));for(let[t,n]of e){let e=this.models.get(t);if(!e)continue;let i=this.meshes.get(t);(!i||i.instanceMatrix.count<n.length)&&(i&&(this.root.remove(i),i.dispose()),i=new d(e,this.material,Math.max(16,Math.ceil(n.length*1.5))),i.name=`pbr-map:${t}`,i.castShadow=t!==`krzak`||this.propShadows,i.receiveShadow=!0,this.meshes.set(t,i),this.root.add(i)),n.forEach((e,t)=>i.setMatrixAt(t,jt(e,r))),i.count=n.length,i.instanceMatrix.needsUpdate=!0,i.computeBoundingSphere()}}counts(){let e={};for(let[t,n]of this.meshes)e[t]=n.count;return e}dispose(){for(let e of this.meshes.values())e.dispose();this.meshes.clear(),this.root.clear()}};async function Nt(e){let t=await fetch(e);if(!t.ok)throw Error(`${e}: HTTP ${t.status}`);return t.json()}var Pt=class e{renderer;quality;preset;layers;uniforms;sources;models;modelMaterial;pipeline;light;constructor(e,t,n,r,i,a,o){this.renderer=e,this.quality=t,this.preset=n,this.layers=r,this.uniforms=i,this.sources=a,this.models=o,this.modelMaterial=K(i)}static async load(t,n,r,i){let a=Xe[r],o=Math.min(a.anisotropy,t.capabilities.getMaxAnisotropy()),s=oe(await Nt(`${i}models/manifest.json`)),c=s.assets.find(e=>e.material===`pbr`&&e.pbr)?.pbr;if(!c)throw Error(`deadzone-pbr: manifest bez danych pbr (styl real niedostępny)`);let l=ut(a.textureSize,c),u=Y(s.assets),[d,f]=await Promise.all([Nt(`${i}${l.layers}`),dt(n,i,l,o)]),p=le(d),m=new P().setMeshoptDecoder(F),h=new Map;await Promise.all(u.map(async e=>{try{let t=await m.loadAsync(`${i}${e.url}`);h.set(e.id,Z(t.scene,e.scale))}catch(t){console.warn(`deadzone-pbr: ${e.url} nie wczytany`,t)}}));let g=new e(t,r,a,p,W(f,p,a),u,h);return ae({material:g.modelMaterial,prepare:Ce}),g}townKit(e){return ct(e,this.uniforms,this.models)}buildingShell(e){let t=bt(e);return t?.every(e=>this.models.has(e.id))?t:void 0}chunkModels(e){let t=new Map;for(let n of e.buildings??[]){let e=this.buildingShell(n);e&&t.set(n.id,e)}let n=e.cx*32,r=e.cy*32;return{buildings:t,props:[...wt((e.levels.get(0)?.objects??[]).map(e=>({contentId:e.contentId,tx:n+e.x,ty:r+e.y,rot:e.rot}))),...Ot(e.bushes??[],this.quality)].filter(e=>this.models.has(e.id))}}mapLayer(){return new Mt(this.models,this.modelMaterial,this.quality!==`low`)}get hasShelters(){return this.models.has(`smietnik`)}sedan(){let e=this.models.get(`sedan`);return e?L(e,this.modelMaterial):void 0}attach(e,t,n,r){this.light=n,$e(n,this.preset),this.pipeline=new et(this.renderer,e,t,this.preset,r)}afterLighting(){this.light&&(this.light.shadow.radius=this.preset.shadow.radius)}setOrigin(e,t){this.uniforms.uOrigin.value.set(e,0,t)}setSize(e,t){this.pipeline?.setSize(e,t)}render(){this.pipeline?.render()}budget(){return this.pipeline?.budget()}demo(e,n,i=ft){let a=new r;a.name=`pbr-demo`;let o=new Map,s=new A,c=new v(0,1,0);for(let r of i){let i=new t().compose(new v(e+r.x,0,n+r.z),s.setFromAxisAngle(c,r.rotY??0).clone(),new v().setScalar(r.scale??1));o.set(r.id,[...o.get(r.id)??[],i])}for(let[e,t]of o){let n=this.models.get(e);n&&a.add(Te(n,this.modelMaterial,t,e))}return a}};export{Pt as RealStyle};