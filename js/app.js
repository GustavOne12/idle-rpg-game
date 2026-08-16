import { playerState } from './state/playerState.js';
import { renderResourceBar } from './components/resourceBar.js';
import { renderMenu } from './pages/menu.js';
import { renderPlay } from './pages/play.js';
import { renderTeam } from './pages/team.js';
import { renderGacha } from './pages/gacha.js';
import { renderSave } from './pages/save.js';

const content = document.getElementById('content');
const resourceBar = document.getElementById('resource-bar');
const btnBack = document.getElementById('btn-back');
const navBtns = document.querySelectorAll('.nav-btn');

const pages = {
  menu: renderMenu,
  play: renderPlay,
  team: renderTeam,
  gacha: renderGacha,
  save: renderSave,
};

let currentPage = 'menu';

function navigate(page) {
  if (!pages[page]) return;
  currentPage = page;

  navBtns.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.page === page);
  });

  btnBack.style.display = page === 'menu' ? 'none' : 'inline-flex';

  pages[page](content, navigate);

  updateResourceBar();
  window.scrollTo(0, 0);
}

function updateResourceBar() {
  renderResourceBar(resourceBar);
}

navBtns.forEach((btn) => {
  btn.addEventListener('click', () => navigate(btn.dataset.page));
});

btnBack.addEventListener('click', () => navigate('menu'));

playerState.subscribe(() => updateResourceBar());

navigate('menu');
