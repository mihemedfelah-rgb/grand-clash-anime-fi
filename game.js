(() => {
const canvas=document.getElementById('arena'),ctx=canvas.getContext('2d');
const $=id=>document.getElementById(id);
let W=0,H=0,dpr=1,last=0,elapsed=0,gameOver=false,shake=0,particles=[],slashes=[],keys={},touchActions=new Set();
const groundRatio=.80;
const player={x:.29,y:0,vx:0,vy:0,w:52,h:104,face:1,hp:100,energy:100,onGround:true,attack:0,attackCd:0,gatling:0,haki:0,dodge:0,invuln:0,hitFlash:0,walk:0};
const enemy={x:.72,y:0,vx:0,vy:0,w:58,h:108,face:-1,hp:100,energy:100,onGround:true,attack:0,attackCd:1.1,hitFlash:0,walk:0,aiTime:0};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)), rand=(a,b)=>a+Math.random()*(b-a);
function resize(){dpr=Math.min(window.devicePixelRatio||1,2);W=window.innerWidth;H=window.innerHeight;canvas.width=Math.floor(W*dpr);canvas.height=Math.floor(H*dpr);canvas.style.width=W+'px';canvas.style.height=H+'px';ctx.setTransform(dpr,0,0,dpr,0,0);player.w=clamp(W*.052,36,58);player.h=player.w*1.95;enemy.w=player.w*1.08;enemy.h=player.h*1.04;}
window.addEventListener('resize',resize);resize();
function floorY(){return H*groundRatio}
function reset(){Object.assign(player,{x:W*.29,y:0,vx:0,vy:0,face:1,hp:100,energy:100,onGround:true,attack:0,attackCd:0,gatling:0,haki:0,dodge:0,invuln:0,hitFlash:0,walk:0});Object.assign(enemy,{x:W*.72,y:0,vx:0,vy:0,face:-1,hp:100,energy:100,onGround:true,attack:0,attackCd:1.1,hitFlash:0,walk:0,aiTime:0});particles=[];slashes=[];elapsed=0;gameOver=false;shake=0;$('result').classList.add('hidden');$('message').textContent='FIGHT!';}
$('restart').addEventListener('click',reset);
function particle(x,y,color,n=8,power=1){for(let i=0;i<n;i++)particles.push({x,y,vx:rand(-180,180)*power,vy:rand(-220,90)*power,life:rand(.18,.55),max:.55,size:rand(1.5,4.5)*power,color,grav:rand(120,430)});}
function slash(x,y,dir,color='#ff4b61',big=false){slashes.push({x,y,dir,color,life:big?.32:.2,max:big?.32:.2,big});}
function act(a){if(gameOver)return;
if(a==='left')keys.left=true;if(a==='right')keys.right=true;
if(a==='jump'&&player.onGround){player.vy=-H*.67;player.onGround=false;particle(player.x,floorY()-12,'#f0f3fa',7,.5)}
if(a==='attack'&&player.attackCd<=0){player.attack=.20;player.attackCd=.34;strike(false)}
if(a==='gatling'&&player.energy>=12&&player.gatling<=0){player.gatling=1.05;player.energy-=12;$('message').textContent='GATLING RUSH';}
if(a==='haki'&&player.energy>=35&&player.haki<=0){player.haki=.85;player.energy-=35;shake=13;particle(player.x,floorY()-player.h, '#ff294e',36,1.8);particle(player.x,floorY()-player.h,'#111827',26,1.5);slash(player.x,floorY()-player.h*.6,player.face,'#ff284f',true);if(Math.abs(enemy.x-player.x)<W*.48){enemy.hp=Math.max(0,enemy.hp-24);enemy.hitFlash=.2;enemy.vx=player.face*W*.35;particle(enemy.x,floorY()-enemy.h*.5,'#ff3857',24,1.4)}}
if(a==='dodge'&&player.dodge<=0){player.dodge=.28;player.invuln=.34;player.vx=player.face*W*.65;particle(player.x,floorY()-25,'#9aa8c1',10,.7)}
}
function strike(gatling){const reach=player.w*1.7;if(Math.abs(enemy.x-player.x)<reach+enemy.w*.5&&Math.abs((floorY()-player.y)-(floorY()-enemy.y))<player.h*.8){enemy.hp=Math.max(0,enemy.hp-(gatling?2.2:7));enemy.hitFlash=.12;enemy.vx=player.face*(gatling?W*.04:W*.12);particle(enemy.x-player.face*enemy.w*.25,floorY()-enemy.h*.56,gatling?'#f5cbd0':'#ff435d',gatling?3:10,gatling?.45:.8);shake=gatling?2:4;}slash(player.x+player.face*player.w*.7,floorY()-player.h*.62,player.face,gatling?'#f5d2d6':'#ff4d62',false)}
function keyboardDown(e){let k=e.key.toLowerCase();if(['arrowleft','arrowright',' ','arrowup'].includes(k))e.preventDefault();if(k==='arrowleft'||k==='a')keys.left=true;if(k==='arrowright'||k==='d')keys.right=true;if((k===' '||k==='arrowup'||k==='w')&&!keys.jump){keys.jump=true;act('jump')}if(k==='j')act('attack');if(k==='k')act('gatling');if(k==='l')act('haki');if(k==='shift')act('dodge')}
function keyboardUp(e){let k=e.key.toLowerCase();if(k==='arrowleft'||k==='a')keys.left=false;if(k==='arrowright'||k==='d')keys.right=false;if(k===' '||k==='arrowup'||k==='w')keys.jump=false}
window.addEventListener('keydown',keyboardDown);window.addEventListener('keyup',keyboardUp);
document.querySelectorAll('[data-action]').forEach(btn=>{const a=btn.dataset.action;const down=e=>{e.preventDefault();btn.classList.add('pressed');if(a==='left'||a==='right'){keys[a]=true;touchActions.add(a)}else act(a)};const up=e=>{e.preventDefault();btn.classList.remove('pressed');if(a==='left'||a==='right'){keys[a]=false;touchActions.delete(a)}};btn.addEventListener('pointerdown',down);btn.addEventListener('pointerup',up);btn.addEventListener('pointercancel',up);btn.addEventListener('pointerleave',up)});
function update(dt){if(gameOver)return;elapsed+=dt;
player.attackCd=Math.max(0,player.attackCd-dt);player.attack=Math.max(0,player.attack-dt);player.gatling=Math.max(0,player.gatling-dt);player.haki=Math.max(0,player.haki-dt);player.dodge=Math.max(0,player.dodge-dt);player.invuln=Math.max(0,player.invuln-dt);player.hitFlash=Math.max(0,player.hitFlash-dt);enemy.hitFlash=Math.max(0,enemy.hitFlash-dt);enemy.attackCd-=dt;
const moving=(keys.left?-1:0)+(keys.right?1:0);if(moving){player.vx=moving*W*.31;player.face=moving;player.walk+=dt*12}else if(player.dodge<=0)player.vx*=Math.pow(.001,dt);
if(player.gatling>0){if(Math.random()<dt*13){strike(true);player.energy=Math.max(0,player.energy-.45);}}
player.x+=player.vx*dt;player.x=clamp(player.x,player.w*.6,W*.70);if(player.dodge<=0)player.vx*=Math.pow(.03,dt);
player.vy+=H*1.65*dt;player.y+=player.vy*dt;if(player.y>=0){player.y=0;player.vy=0;player.onGround=true}
const dx=enemy.x-player.x;enemy.face=dx>=0?-1:1;enemy.aiTime+=dt;enemy.walk+=dt*7;
if(Math.abs(dx)>player.w*1.5){enemy.vx+=(Math.sign(player.x-enemy.x)*W*.22-enemy.vx)*Math.min(1,dt*2.4)}else{enemy.vx*=Math.pow(.01,dt);if(enemy.attackCd<=0){enemy.attack=.22;enemy.attackCd=rand(1.0,1.55);if(player.invuln<=0&&Math.abs(dx)<player.w*1.7){player.hp=Math.max(0,player.hp-8);player.hitFlash=.18;player.vx=enemy.face*W*.09;particle(player.x,floorY()-player.h*.55,'#b7d8ff',10,.8);shake=4}}}
enemy.x=clamp(enemy.x+enemy.vx*dt,W*.3,W*.94);enemy.attack=Math.max(0,(enemy.attack||0)-dt);
for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=p.grav*dt;p.life-=dt}particles=particles.filter(p=>p.life>0);
for(const s of slashes)s.life-=dt;slashes=slashes.filter(s=>s.life>0);shake=Math.max(0,shake-dt*22);
player.energy=Math.min(100,player.energy+dt*5);enemy.energy=Math.min(100,enemy.energy+dt*3);
if(player.hp<=0||enemy.hp<=0||elapsed>=99){gameOver=true;$('result').classList.remove('hidden');const win=enemy.hp<=0||player.hp>enemy.hp;$('resultTitle').textContent=win?'VICTORY':'DEFEAT';$('resultText').textContent=win?'The storm bows to your will.':'The duel is not over until you rise.';$('message').textContent=win?'WINNER':'DEFEATED'}
$('playerHealth').style.width=player.hp+'%';$('enemyHealth').style.width=enemy.hp+'%';$('playerEnergy').style.width=player.energy+'%';$('enemyEnergy').style.width=enemy.energy+'%';$('timer').textContent=String(Math.max(0,99-Math.floor(elapsed))).padStart(2,'0');$('playerStatus').textContent=player.haki>0?'HAKI ACTIVE':player.gatling>0?'GATLING':'READY';$('enemyStatus').textContent=enemy.hp<30?'CRITICAL':'CPU';
}
function pathRound(x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r)}
function drawBackground(){const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#111927');g.addColorStop(.47,'#27364a');g.addColorStop(.72,'#111b2b');g.addColorStop(1,'#080b12');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
const sun=ctx.createRadialGradient(W*.52,H*.37,5,W*.52,H*.37,H*.42);sun.addColorStop(0,'#8b40514d');sun.addColorStop(1,'#8b405100');ctx.fillStyle=sun;ctx.fillRect(0,0,W,H);
ctx.fillStyle='#121c2a';ctx.beginPath();ctx.moveTo(0,H*.62);for(let i=0;i<=10;i++){let x=i*W/10;ctx.lineTo(x,H*(.43+Math.sin(i*2.4)*.055+Math.cos(i*1.3)*.03))}ctx.lineTo(W,H*.75);ctx.lineTo(0,H*.75);ctx.fill();
ctx.fillStyle='#1a293a';ctx.beginPath();ctx.moveTo(0,H*.69);for(let i=0;i<=14;i++){let x=i*W/14;ctx.lineTo(x,H*(.57+Math.sin(i*1.9)*.035))}ctx.lineTo(W,H*.8);ctx.lineTo(0,H*.8);ctx.fill();
for(let i=0;i<7;i++){let x=(i*W*.19+W*.03)%W,y=H*(.12+(i%3)*.07);ctx.strokeStyle=`rgba(208,220,238,${.025+i%3*.015})`;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+W*.22,y-H*.015);ctx.stroke()}
const floor=floorY();let fg=ctx.createLinearGradient(0,floor,0,H);fg.addColorStop(0,'#222b38');fg.addColorStop(1,'#080b11');ctx.fillStyle=fg;ctx.fillRect(0,floor,W,H-floor);
ctx.strokeStyle='#9aaac01b';ctx.lineWidth=1;for(let i=0;i<9;i++){let y=floor+(H-floor)*i/8;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}for(let i=-5;i<10;i++){ctx.beginPath();ctx.moveTo(W*.5,floor);ctx.lineTo(i*W*.18,H);ctx.stroke()}
ctx.strokeStyle='#e43a554c';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,floor);ctx.lineTo(W,floor);ctx.stroke();
}
function drawFighter(f,enemySide=false){const floor=floorY(),x=f.x,y=floor-f.h+f.y,w=f.w,h=f.h,dir=f.face,walking=Math.sin(f.walk)*2.5,attack=!!f.attack,glow=(!enemySide&&f.haki>0)||(!enemySide&&f.gatling>0);
ctx.save();ctx.translate(x,floor+f.y);ctx.scale(dir,1);ctx.globalAlpha=.32;ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(0,2,w*.8,9,0,0,Math.PI*2);ctx.fill();ctx.restore();
ctx.save();ctx.translate(x,y);ctx.scale(dir,1);
if(glow){ctx.shadowColor='#ff244c';ctx.shadowBlur=24;ctx.strokeStyle='#ff3456';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,h*.5,w*.8,h*.57,0,0,Math.PI*2);ctx.stroke();ctx.shadowBlur=0}
if(f.hitFlash>0){ctx.globalAlpha=.75}
const skin=enemySide?'#d9b49b':'#e8b995',shirt=enemySide?'#27364a':'#b62c40',pants=enemySide?'#161d2a':'#273244',dark='#10131b';
// legs
ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=dark;ctx.lineWidth=w*.24;ctx.beginPath();ctx.moveTo(-w*.16,h*.72);ctx.lineTo(-w*.22+walking,h*.92);ctx.moveTo(w*.15,h*.72);ctx.lineTo(w*.22-walking,h*.92);ctx.stroke();
ctx.strokeStyle=pants;ctx.lineWidth=w*.19;ctx.beginPath();ctx.moveTo(-w*.16,h*.7);ctx.lineTo(-w*.22+walking,h*.9);ctx.moveTo(w*.15,h*.7);ctx.lineTo(w*.22-walking,h*.9);ctx.stroke();
ctx.strokeStyle=skin;ctx.lineWidth=w*.13;ctx.beginPath();ctx.moveTo(-w*.22+walking,h*.92);ctx.lineTo(-w*.31+walking,h*.96);ctx.moveTo(w*.22-walking,h*.92);ctx.lineTo(w*.31-walking,h*.96);ctx.stroke();
// torso
ctx.fillStyle=shirt;ctx.beginPath();ctx.moveTo(-w*.28,h*.32);ctx.quadraticCurveTo(0,h*.26,w*.28,h*.32);ctx.lineTo(w*.24,h*.73);ctx.quadraticCurveTo(0,h*.8,-w*.24,h*.73);ctx.closePath();ctx.fill();ctx.strokeStyle='#ffffff1e';ctx.lineWidth=1;ctx.stroke();
// sash
if(!enemySide){ctx.fillStyle='#e8d3a0';ctx.fillRect(-w*.24,h*.58,w*.48,h*.07)}
else{ctx.strokeStyle='#a9c6e6';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-w*.19,h*.39);ctx.lineTo(w*.17,h*.58);ctx.stroke()}
// arms
const armSwing=attack?w*.28:walking;ctx.strokeStyle=skin;ctx.lineWidth=w*.14;ctx.beginPath();ctx.moveTo(-w*.22,h*.37);ctx.lineTo(-w*.38,h*.52+walking);ctx.moveTo(w*.22,h*.37);ctx.lineTo(w*.38+(attack?w*.55:armSwing),h*.48+(attack?-h*.05:walking));ctx.stroke();
ctx.fillStyle=enemySide?'#35455a':'#d4a66b';ctx.beginPath();ctx.arc(w*.38+(attack?w*.55:armSwing),h*.48+(attack?-h*.05:walking),w*.1,0,Math.PI*2);ctx.fill();
// neck and head
ctx.fillStyle=skin;ctx.fillRect(-w*.07,h*.23,w*.14,h*.13);ctx.beginPath();ctx.ellipse(0,h*.17,w*.22,h*.2,0,0,Math.PI*2);ctx.fill();
// hair
ctx.fillStyle=enemySide?'#171c25':'#1a1718';ctx.beginPath();ctx.moveTo(-w*.23,h*.15);ctx.lineTo(-w*.25,h*.02);ctx.lineTo(-w*.11,h*.06);ctx.lineTo(-w*.03,-h*.02);ctx.lineTo(w*.04,h*.04);ctx.lineTo(w*.18,h*.01);ctx.lineTo(w*.25,h*.15);ctx.lineTo(w*.14,h*.13);ctx.lineTo(-w*.2,h*.19);ctx.closePath();ctx.fill();
if(!enemySide){ctx.strokeStyle='#e5d6ad';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,h*.09,w*.22,Math.PI*1.05,Math.PI*1.95);ctx.stroke();ctx.fillStyle='#f3e2b6';ctx.fillRect(-w*.23,h*.07,w*.46,h*.035)}
// eyes
ctx.fillStyle='#11131a';ctx.fillRect(w*.06,h*.16,w*.07,2);ctx.fillRect(-w*.15,h*.16,w*.06,2);
if(enemySide){ctx.strokeStyle='#d9e5f3';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-w*.25,h*.1);ctx.lineTo(w*.24,h*.22);ctx.stroke()}
if(attack){ctx.strokeStyle=enemySide?'#b8d8ff':'#ff5269';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(w*.4,h*.48);ctx.lineTo(w*(enemySide?1.1:1.4),h*.43);ctx.stroke()}
if(!enemySide&&f.gatling>0){for(let i=0;i<3;i++){ctx.strokeStyle=`rgba(255,70,94,${.65-i*.15})`;ctx.lineWidth=3-i*.5;ctx.beginPath();ctx.moveTo(w*.45,h*.44+i*5);ctx.lineTo(w*(1.35+Math.random()*.2),h*.4+i*3);ctx.stroke()}}
if(!enemySide&&f.haki>0){ctx.strokeStyle='#111522';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(w*.34,h*.48);ctx.lineTo(w*.62,h*.44);ctx.stroke();ctx.strokeStyle='#ff344f';ctx.lineWidth=1.5;ctx.stroke()}
ctx.restore();
}
function drawEffects(){for(const s of slashes){let a=s.life/s.max;ctx.save();ctx.globalAlpha=a;ctx.strokeStyle=s.color;ctx.lineWidth=s.big?5:3;ctx.shadowColor=s.color;ctx.shadowBlur=s.big?22:9;ctx.beginPath();ctx.moveTo(s.x-s.dir*18,s.y+rand(-4,4));ctx.quadraticCurveTo(s.x+s.dir*25,s.y-20,s.x+s.dir*(s.big?W*.24:W*.1),s.y+rand(-12,12));ctx.stroke();ctx.restore()}
for(const p of particles){ctx.globalAlpha=clamp(p.life/p.max,0,1);ctx.fillStyle=p.color;ctx.shadowColor=p.color;ctx.shadowBlur=8;ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill()}ctx.globalAlpha=1;ctx.shadowBlur=0;
if(player.haki>0){ctx.save();ctx.globalAlpha=player.haki/.85*.6;for(let i=0;i<5;i++){let x=player.x+rand(-W*.2,W*.2),y=rand(H*.22,H*.7);ctx.strokeStyle=i%2?'#ff284e':'#dce6ff';ctx.lineWidth=rand(1,3);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+rand(-20,20),y+rand(10,45));ctx.lineTo(x+rand(-28,28),y+rand(40,80));ctx.stroke()}ctx.restore()}
}
function render(){ctx.save();if(shake>0)ctx.translate(rand(-shake,shake),rand(-shake,shake));drawBackground();drawEffects();drawFighter(player,false);drawFighter(enemy,true);ctx.restore();requestAnimationFrame(loop)}
function loop(now){let dt=Math.min(.033,(now-last)/1000||0);last=now;update(dt);render()}
reset();requestAnimationFrame(loop);
})();