(() => {
  const svg = document.querySelector('#cityscape svg');
  if (!svg) return;

  const far = [
    [0,104,172],[80,92,224],[156,115,195],[252,104,273],[344,84,215],
    [421,111,265],[520,96,230],[607,108,302],[708,100,226],[801,116,274],
    [908,90,207],[992,112,260],[1097,96,228],[1183,108,286],[1282,96,246],
    [1366,118,212],[1471,129,269]
  ];
  const near = [
    [8,126,244],[119,112,336],[221,139,287],[347,113,386],[450,131,340],
    [569,113,510],[674,124,312],[788,142,410],[918,120,350],[1028,118,492],
    [1135,139,382],[1261,122,449],[1372,121,326],[1481,119,275]
  ];
  const base = 520;
  const windowRows = (x, w, h, seed, layer) => {
    const gapX = layer === 'far' ? 19 : 20;
    const gapY = layer === 'far' ? 23 : 25;
    const cols = Math.max(2, Math.floor((w - 20) / gapX));
    const rows = Math.max(2, Math.floor((h - 28) / gapY));
    let markup = '';
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const lit = (row * 7 + col * 11 + seed * 3) % 9 < (layer === 'far' ? 1 : 3);
        const violet = (row + col + seed) % 4 === 0;
        const lightDelay = (2.3 + seed * .075 + row * .065 + col * .035).toFixed(2);
        const wx = x + 12 + col * ((w - 24) / cols);
        const wy = base - h + 17 + row * ((h - 32) / rows);
        markup += `<rect class="city-window${lit ? ' lit' : ''}${violet ? ' violet' : ''}" x="${wx.toFixed(1)}" y="${wy.toFixed(1)}" width="${layer === 'far' ? 5 : 6}" height="${layer === 'far' ? 8 : 9}" style="--light-delay:${lightDelay}s"/>`;
      }
    }
    return markup;
  };
  const building = ([x,w,h], index, layer) => {
    const top = base - h;
    const step = layer === 'far' ? 5 : 8;
    const roof = index % 4 === 0
      ? `M${x} ${top+step}h${w*.22}l${w*.08} -${step}h${w*.4}l${w*.08} ${step}H${x+w}`
      : `M${x} ${top}H${x+w}`;
    const shell = `M${x} ${base}V${top+step}h${w*.22}l${w*.08} -${step}h${w*.4}l${w*.08} ${step}H${x+w}V${base}Z`;
    const delay = (1.17 + index * .075 + (layer === 'far' ? 0 : .18)).toFixed(2);
    const antenna = index % 5 === 2 ? `<path class="city-edge" d="M${x+w/2} ${top}v-23m-6 7h12"/>` : '';
    const beacon = index % 5 === 2 ? `<circle class="city-roof-light" cx="${x+w/2}" cy="${top-23}" r="2.5"/>` : '';
    return `<g class="city-building city-${layer}" style="--rise-delay:${delay}s"><path class="city-shell" d="${shell}"/><path class="city-edge" d="${roof} M${x+6} ${base}V${top+step+12} M${x+w-7} ${top+step+12}V${base}"/>${antenna}${beacon}${windowRows(x,w,h,index,layer)}</g>`;
  };
  svg.innerHTML = `${far.map((item,index) => building(item,index,'far')).join('')}${near.map((item,index) => building(item,index,'near')).join('')}<path class="city-ground" d="M0 ${base}H1600"/>`;
})();
