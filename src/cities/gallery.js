import { catalog, cityUrl } from './catalog.js';
import './gallery.css';

let region = '全部';
const regions = ['全部', ...new Set(catalog.map(city => city.region))];
const app = document.querySelector('#app');

app.innerHTML = `
  <header class="atlas-header">
    <a href="/" class="atlas-brand"><span class="atlas-seal">境</span><span>城市小境<small>CITIES IN MINIATURE</small></span></a>
    <a href="/">回到姑苏 <span>↗</span></a>
  </header>
  <main class="atlas">
    <section class="atlas-intro">
      <div class="atlas-kicker">${catalog.length} CITIES. A THOUSAND PERSPECTIVES.</div>
      <div class="atlas-headline"><h1>把中国，<em>放在掌心。</em></h1><p>从江南的水巷，到雪域与沙洲。<br>选一座城，走进它的山水与街巷。</p></div>
      <div class="atlas-baseline"><span>一城一景 · 可旋转 · 可漫游 · 可入夜</span><span>${catalog.length} 座城市 · 山河各有风景</span></div>
    </section>
    <section class="atlas-browser" aria-label="选择一座城市">
      <div class="atlas-filter">
        <nav aria-label="按地区筛选">${regions.map(r => `<button data-region="${r}" class="${r === region ? 'active' : ''}" aria-pressed="${r === region}">${r}</button>`).join('')}</nav>
        <label class="atlas-search"><span>⌕</span><input type="search" placeholder="寻找一座城市" aria-label="搜索城市"></label>
      </div>
      <div class="atlas-grid" id="city-grid"></div>
      <div class="atlas-empty" hidden>还没有找到这座城市，试试其他关键词。</div>
    </section>
    <footer class="atlas-footer"><span>以真实地标为线索的艺术化缩景 · 非实测地图</span><span>每一座城，都值得慢慢看。</span></footer>
  </main>
`;

const grid = document.querySelector('#city-grid');
const search = document.querySelector('.atlas-search input');

function render() {
  const query = search.value.trim().toLowerCase();
  const matches = catalog.filter(c =>
    (region === '全部' || c.region === region) &&
    (!query || (c.name + c.en + c.features + (c.id === 'datong' ? '山西大同' : '')).toLowerCase().includes(query))
  );

  grid.innerHTML = matches.map(c => {
    const index = catalog.indexOf(c);
    return `<a class="city-card" href="${cityUrl(c.id)}" data-city="${c.id}" aria-label="进入${c.name}小境" style="--city-tone:${c.tone}">
      <div class="city-card-top"><span>${String(index + 1).padStart(2, '0')}</span><span>${c.region}${c.id === 'datong' ? ' · 山西' : ''}</span><span class="city-select-mark" aria-hidden="true">↗</span></div>
      <div class="city-vignette"><img src="/city-previews/${c.id}.webp" alt="${c.name}微缩场景全景" width="728" height="462" loading="${index < 8 ? 'eager' : 'lazy'}" decoding="async"></div>
      <div class="city-card-heading"><h2>${c.name}</h2><span>${c.en}</span></div>
      <p>${c.subtitle}</p><small>${c.features}</small>
    </a>`;
  }).join('');
  document.querySelector('.atlas-empty').hidden = matches.length > 0;
}

document.querySelectorAll('[data-region]').forEach(button => {
  button.addEventListener('click', () => {
    region = button.dataset.region;
    document.querySelectorAll('[data-region]').forEach(item => {
      item.classList.toggle('active', item === button);
      item.setAttribute('aria-pressed', String(item === button));
    });
    render();
  });
});
search.addEventListener('input', render);
render();
