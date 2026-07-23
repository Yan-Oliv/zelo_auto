export const layerVertex = /* glsl */ `
varying vec2 vUv; varying vec3 vLocalPosition; varying vec3 vNormal;
void main() { vUv = uv; vLocalPosition = position; vNormal = normal; gl_Position = projectionMatrix * modelViewMatrix * vec4(position + normal * .004, 1.0); }
`

export const foamVertex = /* glsl */ `
uniform sampler2D uFoamDensityMap; uniform sampler2D uFoamPackedMap; uniform float uCoverage; uniform float uCleaningMask; uniform float uTime; uniform float uFoamMicroTime; uniform float uPeakDisplacement; uniform float uFilmVertexDiagnostic;
varying vec2 vUv; varying vec3 vLocalPosition; varying vec3 vNormal; varying vec3 vWorldPosition; varying vec3 vWorldNormal;
void main() {
  vUv=uv; vLocalPosition=position; vNormal=normal; vWorldPosition=(modelMatrix*vec4(position,1.)).xyz; vWorldNormal=normalize(mat3(modelMatrix)*normal);
  vec2 drift=uv*2.1+vec2(sin(uv.y*17.+uFoamMicroTime*.10)*.003,-uTime*.018);
  float height=texture2D(uFoamPackedMap,drift).a;
  float foamActive=smoothstep(.15,.7,uCoverage)*(1.-uCleaningMask);
  float diagnosticBreath=sin(uFoamMicroTime*2.5)*.008*uFilmVertexDiagnostic;
  vec3 displaced=position+normal*(.003+height*foamActive*uPeakDisplacement+diagnosticBreath);
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
uniform float uCoverage; uniform float uCleaningMask; uniform float uTime; uniform float uFoamMicroTime; uniform float uFoamLife; uniform float uFilmDiagnostic; uniform float uBubbleSpeed; uniform float uBubbleActivity; uniform float uLayerOpacity; uniform sampler2D uFoamDensityMap; uniform sampler2D uFoamPackedMap; uniform sampler2D uFoamNormalMap; uniform float uMediumNormalStrength; uniform float uMicroNormalStrength; uniform float uDenseRoughness; uniform float uWetRoughness; uniform float uBubbleHighlightStrength; uniform float uPaintGapStrength;
uniform float uPeakDensity; uniform float uDrainProgress; uniform float uRinseProgress; uniform float uWetnessProgress; uniform float uDebugView;
uniform float uBubbleStrength; uniform float uMicroBubbleStrength;
uniform float uDrainEdgeSoftness; uniform float uDrainDistortion; uniform float uStreakLength; uniform float uStreakWidth; uniform float uStreakSpeed; uniform float uResidueStrength; uniform float uRegionalDrainDelay; uniform float uRegionalDrainVariation; uniform float uDrainCurveExponent; uniform float uResidualFoamStrength;
varying vec2 vUv; varying vec3 vLocalPosition; varying vec3 vNormal; varying vec3 vWorldPosition; varying vec3 vWorldNormal;
${noise}
void main(){
  vec2 flow=vUv*1.55+vec2(sin(vUv.y*9.+uFoamMicroTime*.10)*.003,-uTime*.006);
  vec2 warped=flow+vec2(fbm(flow*1.7+4.)-.5,fbm(flow*1.8-7.)-.5)*.075;
  vec3 foamTex=texture2D(uFoamDensityMap,warped).rgb;
  vec4 packed=texture2D(uFoamPackedMap,warped*1.12);
  float macro=foamTex.r; float medium=foamTex.g*(1.-cellular(warped*5.2)); float micro=foamTex.b*(1.-cellular(warped*15.));
  float directional=smoothstep(-.45,1.15,vLocalPosition.y)*.23;
  float field=macro*.70+medium*.22+micro*.08+directional;
  float baseFoamPresence=smoothstep(.84-uCoverage*.88,.96-uCoverage*.88,field);
  float paintGap=smoothstep(.72,.88,1.-packed.r)*uPaintGapStrength*(.35+.65*uPeakDensity);
  baseFoamPresence*=1.-paintGap;
  vec3 up=vec3(0.,1.,0.); float verticality=1.-abs(dot(normalize(vWorldNormal),up));
  float localHeight=clamp((vLocalPosition.y+1.15)/2.3,0.,1.);
  vec2 localFlowBase=vec2(vLocalPosition.x*.7,vLocalPosition.z*.45);
  float broadFlow=fbm(localFlowBase+vec2(2.1,7.3-uFoamMicroTime*.0045));
  float mediumFlow=fbm(vec2(vLocalPosition.x*2.4,vLocalPosition.z*1.1-uFoamMicroTime*uStreakSpeed));
  float fineFlow=fbm(vec2(vLocalPosition.x*7.5,vLocalPosition.z*2.-uFoamMicroTime*.011));
  float drainDistortion=(broadFlow*.52+mediumFlow*.32+fineFlow*.16-.5)*uDrainDistortion;
  float regionNoise=noise2(vec2(floor(vLocalPosition.x*1.4),floor(vLocalPosition.z*1.1)));
  float regionDelay=mix(-uRegionalDrainDelay,uRegionalDrainDelay,regionNoise);
  float localDrainProgress=clamp((uDrainProgress-regionDelay)/.72,0.,1.);
  localDrainProgress*=mix(1.-uRegionalDrainVariation,1.+uRegionalDrainVariation,regionNoise);
  float easedDrain=pow(clamp(localDrainProgress,0.,1.),uDrainCurveExponent);
  float drainExposure=smoothstep(.22,.92,localHeight+drainDistortion*.42);
  float gravityDrainField=1.-easedDrain*verticality*(.16+.76*drainExposure);
  float channelA=smoothstep(.67,.67+uStreakWidth,mediumFlow);
  float channelB=smoothstep(.76,.76+uStreakWidth*.75,fineFlow);
  float streakField=max(channelA*.78,channelB*.56)*verticality;
  float upperFoamSource=smoothstep(.18,.78,localHeight+drainDistortion*.18);
  float verticalTail=smoothstep(.05,uStreakLength,localHeight+.16+drainDistortion*.18);
  float connectedStreak=streakField*upperFoamSource*verticalTail;
  float heightField=clamp((vWorldPosition.y+2.0)/4.0,0.,1.);
  float longitudinalField=clamp((vWorldPosition.x+3.5)/7.0,0.,1.);
  float rinseField=(1.-heightField)*.58+longitudinalField*.16+fbm(vWorldPosition.xz*1.25+vec2(4.7,1.3))*.26;
  float rinseAmount=min(1.,uRinseProgress*1.42);
  // 1.0 means foam is still allowed to remain. The cleanup front lowers this
  // field only after it reaches a region; keeping this polarity explicit
  // prevents early drain from erasing the whole shell.
  float rinseRemovalField=smoothstep(rinseAmount-.15-uDrainEdgeSoftness,rinseAmount+.15+uDrainEdgeSoftness,rinseField);
  float rinseEdge=1.-abs(rinseField-rinseAmount);
  float residueBand=smoothstep(.82,1.,rinseEdge)*uResidueStrength;
  float drainTail=connectedStreak*easedDrain*(.22+.58*(1.-localHeight));
  float trailing=connectedStreak*(residueBand*.55+drainTail)*(1.-uRinseProgress*.72);
  float foamRemaining=baseFoamPresence*gravityDrainField*rinseRemovalField;
  float residualFloor=mix(uResidualFoamStrength,0.,smoothstep(.62,1.,easedDrain));
  foamRemaining=max(foamRemaining,baseFoamPresence*residualFloor*rinseRemovalField);
  float foam=max(foamRemaining,trailing);
  float aa=max(fwidth(foam),.004);
  float foamMask=smoothstep(.010-aa-uDrainEdgeSoftness*.18,.010+aa+uDrainEdgeSoftness*.18,foam);
  if(foamMask<.02) discard;
  vec2 bubbleGrid=warped*6.2; vec2 bubbleCell=floor(bubbleGrid); vec2 bubbleLocal=fract(bubbleGrid)-.5; float bubbleSeed=hash(bubbleCell);
  vec2 bubbleOffset=vec2(hash(bubbleCell+4.7),hash(bubbleCell+9.3))-.5; float bubbleDistance=length(bubbleLocal+bubbleOffset*.22);
  float bubbleRadius=.13+hash(bubbleCell+18.2)*.12;
  float bubbleShape=1.-smoothstep(bubbleRadius*.72,bubbleRadius,bubbleDistance);
  float bubbleRim=smoothstep(bubbleRadius*.65,bubbleRadius,bubbleDistance)*(1.-smoothstep(bubbleRadius,bubbleRadius*1.16,bubbleDistance));
  float life=fract(bubbleSeed+uFoamMicroTime*(uBubbleSpeed+ bubbleSeed*.045));
  float growth=smoothstep(.03,.20,life)*(1.-smoothstep(.82,.94,life));
  float bubblePop=smoothstep(.84,.89,life)*(1.-smoothstep(.89,.95,life))*bubbleShape*uFoamLife;
  float activity=growth*bubbleShape*uFoamLife*uBubbleActivity;
  float bubbles=medium*uBubbleStrength+micro*uMicroBubbleStrength*(.35+.65*uPeakDensity)+activity*.24;
  vec3 nMedium=texture2D(uFoamNormalMap,warped*3.1+vec2(.31,.17)).xyz*2.-1.;
  vec3 nMicro=texture2D(uFoamNormalMap,warped*8.5).xyz*2.-1.;
  vec3 foamNormal=normalize(vNormal+(nMedium-vec3(0.,0.,1.))*uMediumNormalStrength+(nMicro-vec3(0.,0.,1.))*uMicroNormalStrength);
  float light=.82+max(0.,dot(normalize(foamNormal),normalize(vec3(.25,.8,.55))))*.24;
  vec3 thin=vec3(.80,.86,.89), dense=vec3(.98,1.,1.);
  vec3 color=mix(thin,dense,smoothstep(.12,.62,bubbles+uPeakDensity*.2))*light;
  color=mix(color,vec3(.72,.79,.82),bubblePop*.24+activity*.08);
  float wetness=smoothstep(.48,.82,1.-packed.b);
  float wetHighlight=(smoothstep(.67,.9,medium)*(1.-micro)*.13+residueBand*.12+connectedStreak*easedDrain*.06+wetness*(1.-uWetRoughness)*.10+bubbleRim*activity*.32+bubbleRim*bubblePop*.44)*uBubbleHighlightStrength;
  if(uDebugView==1.) color=vec3(baseFoamPresence);
  if(uDebugView==2.) color=vec3(verticality);
  if(uDebugView==3.) color=vec3(connectedStreak);
  if(uDebugView==4.) color=vec3(rinseRemovalField);
  if(uDebugView==5.) color=vec3(residueBand);
  if(uDebugView==6.) color=vec3(residueBand*uWetnessProgress);
  vec3 filmColor=color+wetHighlight;
  float diagnosticPulse=.5+.5*sin(uFoamMicroTime*3.);
  vec3 diagnosticColor=mix(vec3(0.,1.,1.),vec3(1.,0.,1.),diagnosticPulse);
  filmColor=mix(filmColor,diagnosticColor,uFilmDiagnostic);
  gl_FragColor=vec4(filmColor,1.);
}`

export const wetFilmVertex = /* glsl */ `
varying vec2 vUv; varying vec3 vWorldPosition;
void main(){vUv=uv;vWorldPosition=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position+normal*.006,1.);}
`

export const wetFilmFragment = /* glsl */ `
uniform sampler2D uFoamDensityMap; uniform float uWetness; uniform float uRinseProgress; uniform float uTime;
varying vec2 vUv; varying vec3 vWorldPosition;
${noise}
void main(){
  vec2 uv=vUv*1.5+vec2(0.,-uTime*.01); float grain=texture2D(uFoamDensityMap,uv).g*.58+fbm(vWorldPosition.xz*1.5)*.42;
  float lower=clamp(1.-(vWorldPosition.y+1.5)/3.7,0.,1.);
  float rinseField=(1.-clamp((vWorldPosition.y+2.0)/4.0,0.,1.))*.58+clamp((vWorldPosition.x+3.5)/7.0,0.,1.)*.16+fbm(vWorldPosition.xz*1.25+vec2(4.7,1.3))*.26;
  float rinseAmount=min(1.,uRinseProgress*1.42);
  float rinsed=1.-smoothstep(rinseAmount-.15,rinseAmount+.15,rinseField);
  float wet=uWetness*rinsed*(.12+.35*smoothstep(.45,.78,grain)+lower*.18);
  if(wet<.018) discard;
  gl_FragColor=vec4(vec3(.10,.15,.18),min(wet*.26,.22));
}`

export const foamFlowVertex = /* glsl */ `
varying vec3 vWorldPosition; varying vec3 vWorldNormal;
void main(){vWorldPosition=(modelMatrix*vec4(position,1.)).xyz;vWorldNormal=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position+normal*.010,1.);}
`

export const foamFlowFragment = /* glsl */ `
uniform float uDrainProgress; uniform float uRinseProgress; uniform float uTime;
uniform float uFlowCoverage; uniform float uFlowWidth; uniform float uFlowSpeed; uniform float uFlowAlpha; uniform float uFlowVerticality; uniform float uLowerAccumulation; uniform float uBroadTrailStrength; uniform float uMediumTrailStrength; uniform float uFineTrailStrength;
${noise}
varying vec3 vWorldPosition; varying vec3 vWorldNormal;
void main(){
  float verticality=1.-abs(dot(normalize(vWorldNormal),vec3(0.,1.,0.)));
  vec2 flowP=vec2(vWorldPosition.x*7.2+sin(vWorldPosition.y*1.3)*.18,vWorldPosition.y*.34);
  // Broad, medium and fine channels share the same direction but never slide
  // as a single texture sheet.
  float broad=fbm(flowP+vec2(0.,-uTime*.0045));
  float medium=fbm(flowP*2.15+vec2(8.1,2.4-uTime*uFlowSpeed));
  float fine=fbm(flowP*4.1+vec2(1.7,7.4-uTime*.011));
  float wide=smoothstep(.74,.88,broad)*uBroadTrailStrength;
  float mid=smoothstep(.72,.86,medium)*uMediumTrailStrength;
  float thin=smoothstep(.78,.91,fine)*uFineTrailStrength;
  // uFlowCoverage is an intended screen-density budget, not a raw noise threshold.
  // This remap keeps sparseSlow visible without turning the layer into a white plate.
  float streak=smoothstep(uFlowCoverage*.28,uFlowCoverage*.28+uFlowWidth,wide+mid+thin)*verticality*uFlowVerticality;
  float height=clamp((vWorldPosition.y+2.)/4.,0.,1.);
  float rinseField=(1.-height)*.58+clamp((vWorldPosition.x+3.5)/7.,0.,1.)*.16+fbm(vWorldPosition.xz*1.25+vec2(4.7,1.3))*.26;
  float rinseAmount=min(1.,uRinseProgress*1.42); float rinse=1.-smoothstep(rinseAmount-.15,rinseAmount+.15,rinseField);
  float edge=smoothstep(.08,.38,rinse)*(1.-smoothstep(.38,.76,rinse));
  float incoming=streak*uDrainProgress*(.18+.42*(1.-height));
  float lower=min(streak*uDrainProgress*(1.-height)*.26,uLowerAccumulation);
  float residue=streak*(incoming*(1.-uRinseProgress*.82)+edge*.38*(1.-uRinseProgress))+lower;
  if(residue<.26) discard;
  vec3 color=mix(vec3(.74,.81,.84),vec3(.98,1.,1.),smoothstep(.2,.72,residue));
  gl_FragColor=vec4(color,clamp(residue*uFlowAlpha,0.,.58));
}`
