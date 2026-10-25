(() => {
  const items = [
    ['lihuowang','李火旺'],['baizhanhupi','百战虎皮'],['tulaoshi','兔老师'],
    ['huituban','秽土斑'],['xiaozhuyou','晓朱鼬'],['baimianju','白面具']
  ];
  const cabinet = document.getElementById('cabinet');
  const art = cabinet.querySelector('.wardrobe-art');
  const labels = [...art.querySelectorAll('.label')];
  let busy = false;
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (n) => Math.max(0,Math.min(1,n));
  const notice = document.createElement('div');
  notice.className='transition-notice';notice.setAttribute('role','status');document.body.append(notice);

  function cardSnapshot(label, rect) {
    const matrix=art.getScreenCTM().inverse();
    const a=new DOMPoint(rect.left,rect.top).matrixTransform(matrix);
    const b=new DOMPoint(rect.right,rect.bottom).matrixTransform(matrix);
    const card=label.cloneNode(true);
    card.querySelector('.details').remove();
    card.removeAttribute('tabindex');card.removeAttribute('role');card.removeAttribute('aria-label');
    card.setAttribute('style','animation:none!important;transform:none!important');
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('viewBox',`${a.x} ${a.y} ${b.x-a.x} ${b.y-a.y}`);
    svg.append(art.querySelector('defs').cloneNode(true),art.querySelector('style').cloneNode(true),card);
    // Give each snapshot its own paint servers, so it stays independent of the rack.
    let source=new XMLSerializer().serializeToString(svg);
    source=source.replace(/id="(glow|tag|fabric)"/g,'id="fall-$1"').replace(/url\(#(glow|tag|fabric)\)/g,'url(#fall-$1)');
    return source;
  }

  async function openCard(label,index) {
    if(busy || !cabinet.classList.contains('move'))return;
    // Let the entrance finish before detaching a moving tag.
    if(!reduced() && cabinet.getAnimations().some(a=>a.playState==='running'))return;
    busy=true;document.body.classList.add('tag-transition');
    const [slug,name]=items[index], target=`work-${slug}.html`;
    notice.textContent=`正在打开${name}的展示页`;
    if(reduced()){location.href=target;return;}
    const card=label.querySelector('.tag');
    const rect=card.getBoundingClientRect();
    const snapshot=cardSnapshot(label,rect);
    const texture=`data:image/svg+xml;charset=utf-8,${encodeURIComponent(snapshot)}`;
    const textureImage=new Image();textureImage.src=texture;
    await textureImage.decode();
    const rope=label.querySelector('.details');
    const length=rope.getTotalLength(),start=rope.getPointAtLength(0),mid=rope.getPointAtLength(length*.44),lower=rope.getPointAtLength(length*.62),end=rope.getPointAtLength(length);
    rope.setAttribute('d',`M${start.x} ${start.y} L${mid.x} ${mid.y}`);
    const loose=rope.cloneNode();
    loose.setAttribute('d',`M${lower.x} ${lower.y} L${end.x} ${end.y}`);label.prepend(loose);
    const playbackRate=2;
    rope.animate([{transform:'translate(0,0)'},{transform:'translate(-3px,-4px)'},{transform:'translate(0,0)'}],{duration:260/playbackRate,easing:'ease-out'});
    await loose.animate([{opacity:1,transform:'translate(0,0)'},{opacity:0,transform:'translate(3px,16px)'}],{duration:220/playbackRate,easing:'ease-in',fill:'forwards'}).finished;
    const falling=document.createElement('div');falling.className='falling-tag';falling.setAttribute('aria-hidden','true');
    Object.assign(falling.style,{left:rect.left+'px',top:rect.top+'px',width:rect.width+'px',height:rect.height+'px'});
    // Both pieces initially meet exactly. Deform small continuous bands of the
    // original artwork so its lettering and colours bend with the paper.
    const count=96,halves=[];
    for(const side of [-1,1]){
      const half=document.createElement('div');half.className=`paper-half ${side<0?'left':'right'}`;
      const strips=[];
      for(let row=0;row<count;row++){
        const strip=document.createElement('div');strip.className='paper-strip';
        strip.style.backgroundImage=`url("${texture}")`;
        const top=Math.max(0,row*100/count-.15),bottom=Math.max(0,100-(row+1)*100/count-.15);
        strip.style.clipPath=`inset(${top}% ${side<0?50:0}% ${bottom}% ${side<0?0:50}%)`;
        half.append(strip);strips.push(strip);
      }
      const edge=document.createElementNS('http://www.w3.org/2000/svg','svg');edge.classList.add('paper-edge');
      edge.setAttribute('viewBox',`0 0 ${rect.width} ${rect.height}`);
      const edgePath=document.createElementNS('http://www.w3.org/2000/svg','path');edge.append(edgePath);half.append(edge);
      falling.append(half);halves.push({side,half,strips,edgePath});
    }
    const dots=document.createElement('div');dots.className='tear-dots';dots.innerHTML='<i class="upper"></i><i class="lower"></i>';falling.append(dots);
    const upper=dots.querySelector('.upper'),lowerDots=dots.querySelector('.lower');
    [...label.children].forEach(el=>{if(el!==rope)el.style.visibility='hidden'});
    document.body.append(falling);
    const distance=innerHeight-rect.top+rect.height+50;
    const openingTravel=Math.min(210,Math.max(48,(innerHeight-rect.bottom)*.45));
    const smooth=x=>{const t=clamp(x);return t*t*(3-2*t)};
    const duration=2910;
    let begin;
    function tick(time){
      if(begin===undefined)begin=time;
      const elapsed=(time-begin)*playbackRate,tear=smooth((elapsed-420)/800),flip=smooth((elapsed-1220)/540),exit=clamp((elapsed-2160)/750);
      falling.dataset.phase=elapsed<420?'guide':elapsed<1220?'tear':elapsed<1760?'open':elapsed<2160?'hold':'exit';
      falling.dataset.tear=tear.toFixed(3);
      // Keep moving through the guide, tear and opening phases; pause only
      // after both halves have fully opened.
      const y=openingTravel*smooth(elapsed/1760)+(distance-openingTravel)*exit*exit;
      falling.style.transform=`translateY(${y}px)`;
      // The central opening erases the black guide in both directions.
      upper.style.height=lowerDots.style.height=`${50*(1-tear)}%`;
      dots.style.visibility=tear===1?'hidden':'visible';
      const reach=tear*.5;
      for(const {side,half,strips,edgePath} of halves){
        half.style.transform=`translateX(${side*rect.width*.18*flip}px) rotateY(${-side*24*flip}deg) rotateZ(${side*8*flip}deg)`;
        half.style.setProperty('--curl-light',String(flip*.7));
        const points=[];
        const offsetAt=t=>{
          const opened=reach>0?smooth(1-Math.abs(t-.5)/reach):0;
          const pull=rect.width*(.075*opened+.018*smooth((tear-.94)/.06));
          const bend=rect.width*(.07*Math.sin(Math.PI*t)+.14*t*t)*flip;
          return side*(pull+bend);
        };
        strips.forEach((strip,row)=>{
          const t=(row+.5)/count;
          strip.style.transform=`translateX(${offsetAt(t)}px)`;
        });
        if(tear>0){
          const from=.5-reach,to=.5+reach;
          for(let j=0;j<=40;j++){
            const t=from+(to-from)*j/40;
            points.push(`${j?'L':'M'}${rect.width/2+offsetAt(t)} ${t*rect.height}`);
          }
        }
        edgePath.setAttribute('d',points.join(' '));
      }
      if(elapsed<duration)requestAnimationFrame(tick);
      else location.href=target; // Only navigate once the whole card is below the viewport.
    }
    requestAnimationFrame(tick);
  }
  labels.forEach((label,index)=>{
    label.setAttribute('role','link');label.setAttribute('tabindex','0');
    label.setAttribute('aria-label',`查看${items[index][1]}的成品展示`);
    label.addEventListener('click',()=>openCard(label,index));
    label.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openCard(label,index)}});
  });
  addEventListener('pageshow',e=>{if(e.persisted)location.reload()});
})();
