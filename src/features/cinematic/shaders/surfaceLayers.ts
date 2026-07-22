export const layerVertex = /* glsl */ `
varying vec2 vUv; varying vec3 vLocalPosition; varying vec3 vNormal;
void main() { vUv = uv; vLocalPosition = position; vNormal = normal; gl_Position = projectionMatrix * modelViewMatrix * vec4(position + normal * .004, 1.0); }
`

export const foamVertex = /* glsl */ `
uniform sampler2D uFoamDensityMap; uniform float uCoverage; uniform float uCleaningMask; uniform float uTime;
varying vec2 vUv; varying vec3 vLocalPosition; varying vec3 vNormal;
void main() {
  vUv=uv; vLocalPosition=position; vNormal=normal;
  vec2 drift=uv*2.1+vec2(sin(uv.y*17.+uTime*.65)*.008,-uTime*.018);
  float height=texture2D(uFoamDensityMap,drift).r;
  float active=smoothstep(.15,.7,uCoverage)*(1.-uCleaningMask);
  vec3 displaced=position+normal*(.003+height*active*.018);
  gl_Position=projectionMatrix*modelViewMatrix*vec4(displaced,1.0);
}
`

const noise = /* glsl */ `
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);} 
float noise2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);} 
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=noise2(p)*a;p=p*2.03+vec2(9.2,4.7);a*=.5;}return v;}
float cellular(vec2 p){vec2 i=floor(p),f=fract(p);float d=1.;for(int y=-1;y<=1;y++){for(int x=-1;x<=1;x++){vec2 g=vec2(float(x),float(y));vec2 o=vec2(hash(i+g),hash(i+g+13.7));d=min(d,length(g+o-f));}}return d;}
`

export const dirtFragment = /* glsl */ `
uniform float uDirtAmount; uniform float uCleaningMask; uniform float uTime; uniform float uLayerOpacity; uniform sampler2D uDirtMap;
varying vec2 vUv; varying vec3 vLocalPosition; varying vec3 vNormal;
${noise}
void main(){
  vec3 dirtTex=texture2D(uDirtMap,vUv*1.35+vec2(.03,.01)).rgb;
  float macro=dirtTex.r;
  float medium=texture2D(uDirtMap,vUv*2.7+vec2(.31,.17)).g;
  float micro=texture2D(uDirtMap,vUv*8.5+vec2(.11,.42)).b;
  float lower=smoothstep(1.15,-.65,vLocalPosition.y)*.36;
  float distribution=macro*.55+medium*.30+micro*.15+lower;
  float cleaning=fbm(vUv*2.0+vec2(0.,uTime*.025))+smoothstep(.7,-.6,vLocalPosition.y)*.22;
  float hoodDust=smoothstep(-.15,.85,vLocalPosition.y)*smoothstep(.2,.85,macro)*.18;
  float dirt=smoothstep(.38,.64,distribution+hoodDust)*uDirtAmount*(1.-smoothstep(.55,.9,cleaning+uCleaningMask*.55));
  if(dirt<.012) discard;
  float mud=smoothstep(.42,.73,cellular(vUv*8. + vec2(5.,1.))) * smoothstep(.42,-.58,vLocalPosition.y);
  vec3 dust=mix(vec3(.19,.20,.19),vec3(.49,.45,.38),micro*.7+mud*.3);
  gl_FragColor=vec4(dust,dirt*.88*uLayerOpacity);
}`

export const foamFragment = /* glsl */ `
uniform float uCoverage; uniform float uCleaningMask; uniform float uTime; uniform float uLayerOpacity; uniform sampler2D uFoamDensityMap;
uniform float uBubbleStrength; uniform float uMicroBubbleStrength;
varying vec2 vUv; varying vec3 vLocalPosition; varying vec3 vNormal;
${noise}
void main(){
  vec2 flow=vUv*2.1+vec2(sin(vUv.y*17.+uTime*.65)*.008,uCleaningMask*.18-uTime*.018);
  vec2 warped=flow+vec2(fbm(flow*2.+4.)-.5,fbm(flow*2.-7.)-.5)*.12;
  vec3 foamTex=texture2D(uFoamDensityMap,warped).rgb;
  float macro=foamTex.r; float medium=foamTex.g*(1.-cellular(warped*7.5)); float micro=foamTex.b*(1.-cellular(warped*23.));
  float directional=smoothstep(-.6,1.35,vLocalPosition.y)*.18;
  float field=macro*.5+medium*.28+micro*.22+directional;
  float cover=smoothstep(.82-uCoverage,.98-uCoverage,field);
  // Regional rinse: broken wash windows move down the panel instead of a global alpha fade.
  float rinseNoise=fbm(flow*1.25+vec2(0.,uTime*.035));
  float verticalTrail=smoothstep(.61,.85,texture2D(uFoamDensityMap,vec2(vUv.x*3.2+sin(uTime*.12)*.03,vUv.y*.72-uTime*.028)).a);
  float rinseField=rinseNoise*.74+verticalTrail*.26+smoothstep(.45,-.6,vLocalPosition.y)*.18;
  float clean=uCleaningMask*smoothstep(.42,.88,rinseField+uCleaningMask*.34);
  float foam=cover*(1.-clean);
  if(foam<.012) discard;
  float life=fract(hash(floor(warped*6.))+uTime*(.035+hash(floor(warped*6.)+4.)*.045));
  float activity=smoothstep(.08,.3,life)*(1.-smoothstep(.72,.96,life));
  float bubbles=medium*uBubbleStrength+micro*uMicroBubbleStrength+activity*.08;
  float light=.88+max(0.,dot(normalize(vNormal),normalize(vec3(.25,.8,.55))))*.18;
  vec3 wet=vec3(.78,.84,.88), dense=vec3(1.,1.,1.);
  vec3 color=mix(wet,dense,smoothstep(.15,.68,bubbles))*light;
  float vertical=smoothstep(.42,-.7,vLocalPosition.y);
  float dripSource=texture2D(uFoamDensityMap,vec2(vUv.x*5.7+sin(vUv.y*11.)*.03,vUv.y*.38-uTime*.04)).r;
  float drip=smoothstep(.72,.92,dripSource)*vertical*(1.-clean)*.48;
  // Thick base is mostly matte; only wet cells produce compact highlights.
  float wetHighlight=smoothstep(.67,.9,medium)*(1.-micro)*.18;
  gl_FragColor=vec4(color+wetHighlight,clamp(foam+drip,0.,1.)*(.9+smoothstep(.2,.85,bubbles)*.1)*uLayerOpacity);
}`
