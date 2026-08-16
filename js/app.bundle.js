(function () {
  'use strict';

  // ─── LUNA DATA ───────────────────────────
  var LUNA = {
    id: 'luna_01', nome: 'Luna', titulo: 'Tecelã da Noite',
    classe: 'Maga', especialidade: 'Dano em Área', tier: 'Comum', nivel: 1, estrelas: 1,
    stats: { hp: 120, hpMax: 120, atk: 45, def: 5, velocidadeAtaque: 0.8, chanceCritica: 15, danoCritico: 150 },
    passiva: {
      id: 'ciclo_lunar', nome: 'Ciclo Lunar',
      descricao: 'A cada 15s, a fase da lua muda. Na Lua Cheia, sobrecarga com dano extra em área ao redor do alvo.',
      intervalo: 15, fases: ['Nova', 'Crescente', 'Cheia'],
      efeito: { tipo: 'sobrecarga', duracao: 5, danoExtraArea: 0.3 },
    },
    habilidades: [
      { id: 'orbe_de_prata', nome: 'Orbe de Prata', tipo: 'basico', multiplicador: 1.0,
        descricao: 'Esfera rápida de luz lunar no inimigo mais próximo.', alvo: 'inimigo_mais_proximo', area: false },
      { id: 'eclipse_total', nome: 'Eclipse Total', tipo: 'unica', multiplicador: 1.5,
        descricao: 'Chuva de raios estelares causando dano mágico em todos os inimigos.', alvo: 'todos_inimigos', area: true },
    ],
    equipamentos: { arma: null, armadura: null, acessorio: null }, magias: [],
    images: { perfil: 'chars/Luna/Perfil - LUNA.png', combat: 'chars/Luna/Combat - Luna.png' },
  };

  // ─── STATE ───────────────────────────────
  var STORAGE_KEY = 'idle-rpg-save';
  var listeners = [];
  var state;

  function defaultState() {
    var l = JSON.parse(JSON.stringify(LUNA));
    return {
      moedas: 250, gemas: 10,
      personagens: [l], equipe: [l.id, null, null],
      progresso: { waveAtual: 1, waveMax: 1, bossDerrotados: 0, dificuldade: 1 },
      config: { volume: 50 }
    };
  }

  function loadSave() {
    try { var d = localStorage.getItem(STORAGE_KEY); return d ? JSON.parse(d) : null; } catch { return null; }
  }
  function hasSave() { return localStorage.getItem(STORAGE_KEY) !== null; }
  function getSaveInfo() {
    if (!hasSave()) return null;
    var d = loadSave(); if (!d) return null;
    return { moedas: d.moedas, personagens: d.personagens ? d.personagens.length : 0, waveMax: d.progresso ? d.progresso.waveMax : 1, bossDerrotados: d.progresso ? d.progresso.bossDerrotados : 0 };
  }
  function saveGame() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); return true; } catch { return false; } }
  function resetState() { state = defaultState(); localStorage.removeItem(STORAGE_KEY); notify(); }

  state = loadSave() || defaultState();
  migrateCharacters();

  function getState() { return state; }
  function setState(s) { state = Object.assign({}, state, s); notify(); }
  function subscribe(fn) { listeners.push(fn); }
  function notify() { listeners.forEach(function (fn) { fn(state); }); }

  function getEquipe() {
    return state.equipe.map(function (id) {
      if (!id) return null;
      return state.personagens.find(function (p) { return p.id === id; }) || null;
    });
  }

  function migrateCharacters() {
    var changed = false;
    state.personagens.forEach(function (p) {
      var template = CHARACTER_TEMPLATES[p.id];
      if (template) {
        if (!p.images && template.images) { p.images = template.images; changed = true; }
        if (template.stats) {
          Object.keys(template.stats).forEach(function (k) {
            if (p.stats[k] === undefined) { p.stats[k] = template.stats[k]; changed = true; }
          });
        }
      }
    });
    if (changed) notify();
  }

  // ─── DOM HELPERS ─────────────────────────
  var $ = function (id) { return document.getElementById(id); };
  var content = $('content');
  var resBar = $('resource-bar');
  var bottomNav = $('bottom-nav');
  var headerRight = null;

  function renderResBar() {
    resBar.innerHTML =
      '<div class="res-item"><span class="res-icon">🪙</span><span class="res-val">' + state.moedas.toLocaleString() + '</span></div>' +
      '<div class="res-item"><span class="res-icon">💎</span><span class="res-val">' + state.gemas.toLocaleString() + '</span></div>';
  }

  function initHeaderRight() {
    headerRight = $('header-right');
  }

  function updateBackButton(page) {
    if (!headerRight) initHeaderRight();
    if (page === 'hub') {
      headerRight.innerHTML = '';
    } else {
      headerRight.innerHTML = '<button class="btn-back" id="btn-back-hub">← Menu</button>';
      $('btn-back-hub').addEventListener('click', function () { navigate('hub'); });
    }
  }

  // ─── PAGE: HUB ───────────────────────────
  function renderHub() {
    var eq = getEquipe();
    var heroCount = state.personagens.length;
    var wave = state.progresso.waveMax;

    content.innerHTML =
      '<div class="hub-page">' +
        '<div class="hub-logo">⚔️</div>' +
        '<h1 class="hub-title">IDLE RPG</h1>' +
        '<p class="hub-sub">Monte sua equipe. Conquiste o mundo.</p>' +
        '<button class="btn-gold hub-battle-btn" id="btn-enter-battle">⚔️ Entrar em Combate</button>' +
        '<div class="hub-info">' +
          '<div class="hub-info-item"><span class="hub-info-label">Heróis</span><span class="hub-info-val">' + heroCount + '</span></div>' +
          '<div class="hub-info-item"><span class="hub-info-label">Wave Max</span><span class="hub-info-val">' + wave + '</span></div>' +
          '<div class="hub-info-item"><span class="hub-info-label">Dificuldade</span><span class="hub-info-val">' + state.progresso.dificuldade + '</span></div>' +
        '</div>' +
      '</div>';

    $('btn-enter-battle').addEventListener('click', function () { navigate('battle'); });
  }

  // ─── PAGE: BATTLE ────────────────────────
  function renderBattle() {
    var eq = getEquipe();

    var heroCards = eq.map(function (c, i) {
      if (!c) return '<div class="hero-empty">Slot ' + (i + 1) + ' vazio</div>';
      var hpPct = Math.round((c.stats.hp / c.stats.hpMax) * 100);

      var skills = c.habilidades || [];
      var skill1 = skills[0];
      var skill2 = skills[1];

      var skillSlot1 = skill1
        ? '<div class="hero-skill-slot" title="' + skill1.nome + '"><div class="hero-skill-cd-overlay" id="cd-' + skill1.id + '"><div class="hero-skill-cd-ring"></div><span class="hero-skill-cd-text"></span></div><span class="hero-skill-icon">⚡</span><span class="hero-skill-name">' + skill1.nome + '</span></div>'
        : '<div class="hero-skill-slot"><span class="hero-skill-icon">—</span><span class="hero-skill-name">Vazio</span></div>';

      var skillSlot2 = skill2
        ? '<div class="hero-skill-slot" title="' + skill2.nome + '"><div class="hero-skill-cd-overlay" id="cd-' + skill2.id + '"><div class="hero-skill-cd-ring"></div><span class="hero-skill-cd-text"></span></div><span class="hero-skill-icon">💫</span><span class="hero-skill-name">' + skill2.nome + '</span></div>'
        : '<div class="hero-skill-slot"><span class="hero-skill-icon">—</span><span class="hero-skill-name">Vazio</span></div>';

      var perfilSrc = c.images && c.images.perfil ? c.images.perfil : '';

      return '<div class="hero-card filled">' +
        '<div class="hero-card-top">' +
          '<div class="hero-card-avatar">' + (perfilSrc ? '<img src="' + perfilSrc + '" alt="' + c.nome + '" />' : '🌙') + '</div>' +
          '<div class="hero-card-info">' +
            '<div class="hero-card-name-row"><span class="hero-card-name">' + c.nome + '</span><span class="hero-card-lv">Lv ' + c.nivel + '</span></div>' +
            '<div class="hero-card-bars">' +
              '<div class="hero-bar-row"><span class="hero-bar-icon">❤️</span><div class="hero-bar"><div class="hero-bar-fill hp" style="width:' + hpPct + '%"></div><div class="hero-bar-text">' + c.stats.hp + '/' + c.stats.hpMax + '</div></div></div>' +
            '</div>' +
            '<div class="hero-card-stats">' +
              '<div class="hero-stat-pill"><span class="stat-label">ATK</span><span class="stat-num">' + c.stats.atk + '</span></div>' +
              '<div class="hero-stat-pill"><span class="stat-label">DEF</span><span class="stat-num">' + c.stats.def + '%</span></div>' +
              '<div class="hero-stat-pill"><span class="stat-label">CRT</span><span class="stat-num">' + c.stats.chanceCritica + '%</span></div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="hero-card-skills">' + skillSlot1 + skillSlot2 + '</div>' +
      '</div>';
    }).join('');

    var arenaHeroes = eq.map(function (c) {
      if (!c) return '';
      var combatSrc = c.images && c.images.combat ? c.images.combat : '';
      var inner = combatSrc ? '<img src="' + combatSrc + '" alt="' + c.nome + '" class="arena-unit-img" />' : '🌙';
      return '<div class="arena-unit hero-unit">' + inner + '<div class="arena-unit-bar"><div class="arena-unit-bar-fill" style="width:100%;background:var(--hp-green)"></div></div></div>';
    }).join('');

    var enemies = [
      { nome: 'Goblin', lv: 1, hp: 60, hpMax: 60, alive: true },
      { nome: 'Orc', lv: 2, hp: 90, hpMax: 90, alive: true },
      { nome: 'Troll', lv: 3, hp: 140, hpMax: 140, alive: true },
    ];

    var arenaEnemies = enemies.filter(function (e) { return e.alive; }).map(function () {
      return '<div class="arena-unit enemy-unit">👹<div class="arena-unit-bar"><div class="arena-unit-bar-fill" style="width:100%;background:var(--hp-red)"></div></div></div>';
    }).join('');

    var enemyBars = enemies.filter(function (e) { return e.alive; }).map(function (e) {
      var pct = Math.round((e.hp / e.hpMax) * 100);
      return '<div class="enemy-bar-card">' +
        '<div class="enemy-bar-top"><span class="enemy-bar-name">' + e.nome + '</span><span class="enemy-bar-level">Lv ' + e.lv + '</span></div>' +
        '<div class="enemy-hp"><div class="enemy-hp-fill" style="width:' + pct + '%"></div></div>' +
        '<div class="enemy-hp-text">' + e.hp + ' / ' + e.hpMax + '</div></div>';
    }).join('');

    content.innerHTML =
      '<div class="battle-page">' +
        '<div class="battle-left"><div class="battle-left-title">Sua Equipe</div>' + heroCards + '</div>' +
        '<div class="battle-center">' +
          '<div class="battle-wave-bar"><span class="wave-label">WAVE ' + state.progresso.waveAtual + '</span><span class="diff-label">Dificuldade ' + state.progresso.dificuldade + '</span></div>' +
          '<div class="battle-arena"><div class="arena-side">' + arenaHeroes + '</div><div class="arena-vs">VS</div><div class="arena-side">' + arenaEnemies + '</div></div>' +
        '</div>' +
        '<div class="battle-right"><div class="battle-right-title">Barra de Vida dos Inimigos</div>' + enemyBars + '</div>' +
        '<div class="battle-loot">' +
          '<div class="loot-header"><span class="loot-title">📦 Drop de Itens</span></div>' +
          '<div class="loot-items" id="loot-log">' +
            '<div class="loot-placeholder">Os drops aparecerão durante o combate...</div>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  // ─── PAGE: HEROES ────────────────────────
  function renderHeroes() {
    var eq = getEquipe();

    var heroCards = eq.map(function (c) {
      if (!c) return '';
      var hpPct = Math.round((c.stats.hp / c.stats.hpMax) * 100);

      var skillsHtml = c.habilidades.map(function (h) {
        var typeLabel = h.tipo === 'basico' ? 'Básico' : 'Única';
        var typeClass = h.tipo === 'basico' ? 'badge-blue' : 'badge-red';
        return '<div class="skill-row"><div class="skill-top"><span class="skill-name">' + h.nome + ' <span class="badge ' + typeClass + '">' + typeLabel + '</span></span><span class="skill-mult">x' + h.multiplicador + '</span></div><div class="skill-desc">' + h.descricao + '</div></div>';
      }).join('');

      var passivaHtml = '';
      if (c.passiva) {
        passivaHtml = '<div class="hero-passive"><div class="passive-title">🌕 ' + c.passiva.nome + '</div><div class="passive-desc">' + c.passiva.descricao + '</div></div>';
      }

      var perfilSrc = c.images && c.images.perfil ? c.images.perfil : '';

      return '<div class="hero-detail-card">' +
        '<div class="hero-detail-header"><div class="hero-avatar">' + (perfilSrc ? '<img src="' + perfilSrc + '" alt="' + c.nome + '" />' : '🌙') + '</div><div class="hero-info-text"><div class="hero-detail-name">' + c.nome + '</div><div class="hero-detail-title">' + c.titulo + '</div><div class="hero-detail-class">' + c.classe + ' — ' + c.especialidade + ' <span class="badge badge-purple">' + c.tier + '</span></div></div></div>' +
        '<div class="hero-bars">' +
          '<div class="hero-stat-row"><span class="hero-stat-label">❤️ HP</span><span class="hero-stat-val">' + c.stats.hp + ' / ' + c.stats.hpMax + '</span></div>' +
          '<div class="hero-bar"><div class="hero-bar-fill hp" style="width:' + hpPct + '%"></div></div>' +
        '</div>' +
        '<div class="stats-grid">' +
          '<div class="stat-box"><div class="stat-box-label">ATK</div><div class="stat-box-val">' + c.stats.atk + '</div></div>' +
          '<div class="stat-box"><div class="stat-box-label">DEF</div><div class="stat-box-val">' + c.stats.def + '%</div></div>' +
          '<div class="stat-box"><div class="stat-box-label">SPD</div><div class="stat-box-val">' + c.stats.velocidadeAtaque + '</div></div>' +
          '<div class="stat-box"><div class="stat-box-label">CRT</div><div class="stat-box-val">' + c.stats.chanceCritica + '%</div></div>' +
          '<div class="stat-box"><div class="stat-box-label">DMG CRT</div><div class="stat-box-val">' + c.stats.danoCritico + '%</div></div>' +
          '<div class="stat-box"><div class="stat-box-label">ESTRELA</div><div class="stat-box-val">★' + c.estrelas + '</div></div>' +
        '</div>' +
        '<div class="hero-skills"><div class="hero-skills-title">🔮 Habilidades</div>' + skillsHtml + '</div>' +
        passivaHtml +
      '</div>';
    }).join('');

    var emptySlots = eq.filter(function (c) { return c === null; }).length;

    content.innerHTML =
      '<div class="heroes-page">' +
        '<h2 class="heroes-page-title">🛡️ Heróis</h2>' +
        heroCards +
        (emptySlots > 0 ? '<div style="text-align:center;padding:1rem;color:var(--text-muted);font-size:0.8rem;">' + emptySlots + ' slot(s) vazio(s) — Obtenha heróis na Loja</div>' : '') +
      '</div>';
  }

  // ─── PAGE: INVENTORY ─────────────────────
  function renderInventory() {
    var slots = 12;
    var html = '';
    for (var i = 0; i < slots; i++) {
      html += '<div class="inv-slot"><div class="inv-slot-icon">—</div><div class="inv-slot-label">Vazio</div></div>';
    }

    content.innerHTML =
      '<div class="inventory-page">' +
        '<h2 class="inventory-title">🎒 Inventário</h2>' +
        '<div class="inventory-grid">' + html + '</div>' +
        '<div style="text-align:center;padding:1rem;color:var(--text-muted);font-size:0.8rem;">Itens coletados em combate aparecerão aqui.</div>' +
      '</div>';
  }

  // ─── PAGE: SHOP ──────────────────────────
  function renderShop() {
    content.innerHTML =
      '<div class="shop-page">' +
        '<h2 class="shop-title">🏪 Loja</h2>' +
        '<div class="shop-card">' +
          '<div class="shop-card-icon">🎰</div>' +
          '<div class="shop-card-text">Sorteie novos heróis para sua equipe!<br><small style="color:var(--text-muted);">Sistema de Gacha será implementado em breve.</small></div>' +
          '<button class="btn-gold" disabled style="font-size:1rem;">REALIZAR GACHA</button>' +
          '<div style="margin-top:0.75rem;font-size:0.8rem;color:var(--text-secondary);">Custo: <span style="color:var(--accent-gold);font-weight:700;">----</span> 🪙</div>' +
        '</div>' +
        '<div class="shop-card">' +
          '<div class="shop-card-title" style="font-size:0.75rem;font-weight:700;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:0.5rem;">Tiers de Raridade</div>' +
          '<div class="tiers-row">' +
            '<span class="tier-chip tier-common">Comum</span>' +
            '<span class="tier-chip tier-rare">Raro</span>' +
            '<span class="tier-chip tier-ultra">Ultra-Raro</span>' +
            '<span class="tier-chip tier-legendary">Lendário</span>' +
            '<span class="tier-chip tier-mythic">Mítico</span>' +
          '</div>' +
        '</div>' +
        '<div class="shop-card" style="padding:1rem;">' +
          '<div style="font-size:0.75rem;color:var(--text-muted);font-style:italic;">Último resultado: Nenhum personagem obtido ainda.</div>' +
        '</div>' +
      '</div>';
  }

  // ─── PAGE: SAVE (hidden, accessible via long-press title or future settings) ───
  function renderSave() {
    var info = getSaveInfo();
    var statusHtml = info
      ? '<div class="save-row"><span class="save-row-label">Moedas</span><span class="save-row-val">' + info.moedas + '</span></div>' +
        '<div class="save-row"><span class="save-row-label">Heróis</span><span class="save-row-val">' + info.personagens + '</span></div>' +
        '<div class="save-row"><span class="save-row-label">Wave Max</span><span class="save-row-val">' + info.waveMax + '</span></div>' +
        '<div class="save-row"><span class="save-row-label">Boss Derrotados</span><span class="save-row-val">' + info.bossDerrotados + '</span></div>'
      : '<div class="save-row"><span class="save-row-label">Status</span><span class="save-row-val empty">Nenhum progresso salvo</span></div>';

    content.innerHTML =
      '<div class="save-page">' +
        '<h2 class="save-title">💾 Salvamento</h2>' +
        '<div class="save-panel"><div class="save-panel-header">Status do Save</div>' + statusHtml + '</div>' +
        '<div class="save-actions">' +
          '<button class="btn-gold save-btn" id="btn-save" style="font-size:0.9rem;">💾 Salvar Progresso</button>' +
          '<button class="btn-secondary save-btn" id="btn-load"' + (!hasSave() ? ' disabled' : '') + '>📂 Carregar Progresso</button>' +
          '<button class="btn-danger save-btn" id="btn-reset"' + (!hasSave() ? ' disabled' : '') + '>🗑️ Limpar Save</button>' +
        '</div>' +
        '<div style="width:100%;max-width:400px;text-align:center;font-size:0.7rem;color:var(--text-muted);padding:0.5rem;">Dados salvos localmente no navegador (LocalStorage).</div>' +
      '</div>';

    $('btn-save').addEventListener('click', function () {
      if (saveGame()) { this.textContent = '✅ Salvo!'; var self = this; setTimeout(function () { self.textContent = '💾 Salvar Progresso'; }, 1200); }
    });
    var bl = $('btn-load');
    if (bl) bl.addEventListener('click', function () {
      var d = loadSave(); if (d) { setState(d); this.textContent = '✅ Carregado!'; var self = this; setTimeout(function () { self.textContent = '📂 Carregar Progresso'; }, 1200); }
    });
    var br = $('btn-reset');
    if (br) br.addEventListener('click', function () {
      if (confirm('Apagar todo o progresso salvo?')) { resetState(); navigate('save'); }
    });
  }

  // ─── ROUTER ──────────────────────────────
  var routes = {
    hub: renderHub, battle: renderBattle, heroes: renderHeroes,
    inventory: renderInventory, shop: renderShop, save: renderSave,
  };

  var currentPage = 'hub';
  var navBtns = document.querySelectorAll('.nav-btn');

  function navigate(page) {
    if (!routes[page]) return;
    currentPage = page;

    navBtns.forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.page === page);
    });

    bottomNav.style.display = page === 'battle' ? 'none' : 'flex';
    updateBackButton(page);

    routes[page]();
    renderResBar();
    content.scrollTop = 0;
  }

  navBtns.forEach(function (btn) {
    btn.addEventListener('click', function () { navigate(btn.dataset.page); });
  });

  // tap title 5 times to open save
  var titleTapCount = 0;
  var titleTapTimer = null;
  document.querySelector('.game-title').addEventListener('click', function () {
    titleTapCount++;
    clearTimeout(titleTapTimer);
    titleTapTimer = setTimeout(function () { titleTapCount = 0; }, 1000);
    if (titleTapCount >= 5) { titleTapCount = 0; navigate('save'); }
  });

  subscribe(function () { renderResBar(); });

  navigate('hub');

})();
