(()=>{
  if(!document.getElementById('studio-light-ink')){
    document.body.insertAdjacentHTML('afterbegin','<svg aria-hidden="true" width="0" height="0" style="position:absolute;pointer-events:none"><defs><filter id="studio-light-ink" color-interpolation-filters="sRGB"><feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -1 0 -1 1 0" result="dark-ink"/><feFlood flood-color="#f5eff8" result="light-ink-color"/><feComposite in="light-ink-color" in2="dark-ink" operator="in" result="light-ink"/><feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="light-ink"/></feMerge></filter></defs></svg>');
  }
  document.body.classList.add('has-studio-watermarks');
  const corner=document.createElement('img');
  corner.className='site-corner-watermark';
  corner.src='assets/studio-watermark.png';
  corner.alt='红花龙胆工作室';
  document.body.append(corner);
  const addMark=container=>{
    if(container.querySelector(':scope > .studio-photo-watermark'))return;
    const mark=document.createElement('span');
    mark.className='studio-photo-watermark';
    mark.setAttribute('aria-hidden','true');
    container.append(mark);
  };
  document.querySelectorAll('.pack-body,.card-face,.process-photo,.portrait,.detail-photo,.wear-detail').forEach(addMark);
  const dialogImage=document.querySelector('.detail-dialog > img');
  if(dialogImage){
    const wrap=document.createElement('div');
    wrap.className='studio-dialog-image';
    dialogImage.before(wrap);
    wrap.append(dialogImage);
    addMark(wrap);
  }
})();
