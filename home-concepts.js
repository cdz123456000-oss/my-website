(() => {
  const hero=document.querySelector('.hero');
  const concept=document.documentElement.dataset.concept;
  if(!hero || !['a','b'].includes(concept))return;

  const layer=document.createElement('div');layer.className='concept-atmos';layer.setAttribute('aria-hidden','true');
  layer.innerHTML=`<div class="fabric-shadow"></div><svg class="concept-lines" viewBox="0 0 1600 900" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <g class="atelier">
      <path d="M525 93C600 130 642 213 629 289L595 426C584 526 668 660 704 805 M568 89C654 143 703 233 681 313L648 443C640 505 689 574 733 654"/>
      <path class="dashed" d="M477 142C531 190 552 242 542 309 M617 397c-25 106-2 178 43 251 M439 736c125-92 204-85 293 12"/>
      <path d="M524 92c27 17 48 16 78 5 M566 94c19 13 35 14 57 4 M595 426c17 13 35 12 53 17 M704 805l29-151"/>
      <path d="M403 153l137 99m-127-60 128 86 M375 733l73-40m-54 72 73-40"/>
      <circle cx="595" cy="426" r="3"/><circle cx="704" cy="805" r="3"/>
    </g>
    <g class="digital">
      <path d="M940 70h398l123 107v514l-121 112H936L814 693V174Z M1002 113h276l135 105v438l-135 105h-276L866 657V216Z"/>
      <path class="soft" d="M800 432h682 M1138 75v729 M877 196h530 M869 670h538 M944 71l139 160m260-160-139 160 M944 803l139-154m260 154-139-154"/>
      <path d="M806 435 776 462v170 M1482 435l29 27v171 M1138 76l-26-25H984 M1138 804l27 24h121"/>
      <path class="active" d="M814 174 938 70h110 M1413 216l48-39v145 M1277 761l64 42h-105 M823 691l71 63"/>
      <circle class="active" cx="940" cy="70" r="5"/><circle class="active" cx="1461" cy="176" r="5"/><circle class="active" cx="1342" cy="803" r="5"/><circle class="active" cx="815" cy="691" r="5"/>
      <path class="soft" d="M750 108h56v55 M1528 756h-73v42 M770 769h83"/>
    </g>
  </svg>`;
  hero.prepend(layer);
  if(location.pathname.includes('mockup-home-')){
    const caption=document.createElement('div');caption.className='concept-caption';caption.setAttribute('aria-hidden','true');
    caption.textContent=concept==='a'?'A / FASHION DARKROOM':'B / DIGITAL STAGE';hero.append(caption);
  }

  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  if(!reduced.matches && matchMedia('(pointer: fine)').matches){
    let frame=0,point=null;
    hero.addEventListener('pointermove',event=>{
      point={x:event.clientX,y:event.clientY};
      if(frame)return;
      frame=requestAnimationFrame(()=>{
        frame=0;const rect=hero.getBoundingClientRect();
        const x=((point.x-rect.left)/rect.width-.5)*2,y=((point.y-rect.top)/rect.height-.5)*2;
        const set=(name,value)=>hero.style.setProperty(name,`${value.toFixed(2)}px`);
        set('--far-x',x*-3);set('--far-y',y*-3);
        set('--mid-x',x*-5);set('--mid-y',y*-5);
        set('--rack-x',x*2);set('--rack-y',y*2);
        set('--copy-x',x*1.5);set('--copy-y',y*1.5);
      });
    });
    hero.addEventListener('pointerleave',()=>{
      for(const name of ['--far-x','--far-y','--mid-x','--mid-y','--rack-x','--rack-y','--copy-x','--copy-y'])hero.style.setProperty(name,'0px');
    });
    const cloths=[...hero.querySelectorAll('#garments .cloth')];
    cloths.forEach(cloth=>{
      cloth.addEventListener('pointerenter',()=>{
        const box=cloth.getBoundingClientRect(),heroBox=hero.getBoundingClientRect();
        const focus=((box.left+box.width/2-heroBox.left)/heroBox.width*100).toFixed(1)+'%';
        hero.style.setProperty('--focus-x',focus);
      });
      cloth.addEventListener('pointerleave',()=>hero.style.removeProperty('--focus-x'));
    });
  }
})();
