import './styles.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
const el=id=>document.getElementById(id),viewport=el('viewport'),stage=el('stage');
const scene=new THREE.Scene();
const camera=new THREE.OrthographicCamera(-.08,.08,.06,-.06,.001,10);
camera.position.set(.025,.041,.25);
let renderer;
try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});}catch(e){el('status').textContent='浏览器无法启用 3D，请使用支持 WebGL 的浏览器。';throw e;}
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.35;stage.appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xffffff,0x9aabb5,2.0));
const light=new THREE.DirectionalLight(0xffffff,3.2);light.position.set(-.08,.16,.15);scene.add(light);
const fillLight=new THREE.DirectionalLight(0xeaf6ff,1.2);fillLight.position.set(.14,.04,-.1);scene.add(fillLight);
const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(.025,.041,0);controls.enableDamping=true;controls.dampingFactor=.075;controls.minZoom=.4;controls.maxZoom=4;controls.autoRotateSpeed=.6;controls.update();
let meshes=[],soilMeshes=[],waterMeshes=[],shellMeshes=[],language='zh',ready=false;
const tags=[{position:new THREE.Vector3(-.007,.075,0),zh:'水位 · 10 mL',en:'Water · 10 mL',offset:-113},{position:new THREE.Vector3(-.007,.0618,0),zh:'土面 · 8 mL',en:'Soil · 8 mL',offset:-113,cls:'soil'},{position:new THREE.Vector3(.065,.074,0),zh:'样品出口',en:'Sample output',offset:8},{position:new THREE.Vector3(.065,.006,0),zh:'超纯水入口',en:'Water input',offset:8}];
for(const tag of tags){tag.node=document.createElement('div');tag.node.className='model-label '+(tag.cls||'');tag.node.textContent=tag.zh;el('label-layer').appendChild(tag.node);}
const mats={soil:new THREE.MeshStandardMaterial({color:0xb08b60,roughness:.93,transparent:true,opacity:.38,depthWrite:false,side:THREE.DoubleSide}),water:new THREE.MeshStandardMaterial({color:0x77bbdb,roughness:.25,transparent:true,opacity:.3,depthWrite:false,side:THREE.DoubleSide}),shell:new THREE.MeshStandardMaterial({color:0xbed7e1,roughness:.28,transparent:true,opacity:.14,depthWrite:false,side:THREE.DoubleSide}),silicone:new THREE.MeshStandardMaterial({color:0xc4dbde,roughness:.4,transparent:true,opacity:.68,depthWrite:false,side:THREE.DoubleSide}),pes:new THREE.MeshStandardMaterial({color:0xf6efda,roughness:.68}),ptfe:new THREE.MeshStandardMaterial({color:0xb3cdd7,roughness:.48}),seal:new THREE.MeshStandardMaterial({color:0x827a6d,roughness:.55}),ink:new THREE.MeshBasicMaterial({color:0x66828d}),line:new THREE.MeshBasicMaterial({color:0x4295b6,transparent:true,opacity:.7,depthWrite:false})};
new GLTFLoader().load('./EP-Rhizon.glb',g=>{
 const model=g.scene;scene.add(model);
 model.traverse(o=>{if(!o.isMesh)return;meshes.push(o);const n=o.name;
  if(n.startsWith('Soil')){o.material=mats.soil;soilMeshes.push(o);o.renderOrder=2;}
  else if(n.startsWith('Water_level')){o.material=mats.line;waterMeshes.push(o);o.renderOrder=3;}
  else if(n.startsWith('Water')){o.material=mats.water;waterMeshes.push(o);o.renderOrder=2;}
  else if(/EP_tube|Snap_cap|Flexible_cap|Cap_opening/.test(n)){o.material=mats.shell;shellMeshes.push(o);o.renderOrder=4;}
  else if(n.includes('silicone')){o.material=mats.silicone;o.renderOrder=1;}
  else if(n.includes('PES'))o.material=mats.pes;
  else if(n.includes('PTFE'))o.material=mats.ptfe;
  else if(n.includes('AB'))o.material=mats.seal;
  else if(/Graduation|Text/.test(n))o.material=mats.ink;
 });
 // Object names are sanitized by glTF. Check filled volumes, not only file availability.
 if(soilMeshes.length!==1||!waterMeshes.length)throw new Error('Missing fill volumes in the exported single-device scene');
 ready=true;el('status').textContent='模型已加载';window.epRhizon={model,soilMeshes,waterMeshes,shellMeshes,camera,controls,renderer,scene};
},p=>{if(p.total)el('status').textContent=`正在加载 ${Math.round(p.loaded/p.total*100)}%`;},e=>{console.error(e);el('status').textContent='模型加载失败，请刷新页面重试。';});
function front(){camera.position.set(.025,.041,.25);camera.up.set(0,1,0);controls.target.set(.025,.041,0);camera.zoom=1;camera.updateProjectionMatrix();controls.update();el('front').classList.add('active');el('angle').classList.remove('active');}
el('front').onclick=front;el('reset').onclick=()=>{el('auto').checked=false;controls.autoRotate=false;front();};
el('angle').onclick=()=>{camera.position.set(.13,.08,.21);controls.target.set(.025,.041,0);camera.zoom=1;camera.updateProjectionMatrix();controls.update();el('angle').classList.add('active');el('front').classList.remove('active');};
el('auto').onchange=e=>controls.autoRotate=e.target.checked;
el('soil').onchange=e=>soilMeshes.forEach(o=>o.visible=e.target.checked);
el('water').onchange=e=>waterMeshes.forEach(o=>o.visible=e.target.checked);
el('soilOpacity').oninput=e=>{mats.soil.opacity=+e.target.value;el('soilValue').textContent=Math.round(+e.target.value*100)+'%';};
el('shellOpacity').oninput=e=>{mats.shell.opacity=+e.target.value;el('shellValue').textContent=Math.round(+e.target.value*100)+'%';};
el('detail').onclick=()=>el('equilibration').scrollIntoView({behavior:'smooth'});
el('lang').onclick=()=>{language=language==='zh'?'en':'zh';document.documentElement.lang=language==='zh'?'zh-CN':'en';document.querySelectorAll('[data-zh]').forEach(o=>o.textContent=o.dataset[language]);tags.forEach(t=>t.node.textContent=t[language]);el('lang').textContent=language==='zh'?'EN':'中文';if(ready)el('status').textContent=language==='zh'?'模型已加载':'Model loaded';};
function resize(){const w=viewport.clientWidth,h=viewport.clientHeight;renderer.setSize(w,h);const span=Math.max(.103,.092*h/w);camera.top=span/2;camera.bottom=-span/2;camera.left=-span/2*w/h;camera.right=span/2*w/h;camera.updateProjectionMatrix();}new ResizeObserver(resize).observe(viewport);resize();
const v=new THREE.Vector3();function animate(){requestAnimationFrame(animate);controls.update();renderer.render(scene,camera);for(const t of tags){v.copy(t.position).project(camera);const x=Math.max(8,Math.min(viewport.clientWidth-125,(v.x*.5+.5)*viewport.clientWidth+t.offset)),y=(-v.y*.5+.5)*viewport.clientHeight;t.node.style.transform=`translate(${x}px,${y}px)`;t.node.style.display=ready&&el('labels').checked&&v.z<1&&v.z>-1?'block':'none';}}animate();
