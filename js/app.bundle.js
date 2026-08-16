/* =============================================
   IDLE RPG — Bundle (single file, no modules)
   ============================================= */

(function () {
  'use strict';

  // ─── DATA: Luna ────────────────────────────
  const LUNA = {
    id: 'luna_01',
    nome: 'Luna',
    titulo: 'Tecelã da Noite',
    classe: 'Maga',
    especialidade: 'Dano em Área',
    tier: 'Comum',
    nivel: 1,
    estrelas: 1,
    stats: {
      hp: 120, hpMax: 120,
      atk: 45,
      def: 5,
      velocidadeAtaque: 0.8,
      chanceCritica: 15,
      danoCritico: 150,
    },
    passiva: {
      id: 'ciclo_lunar',
      nome: 'Ciclo Lunar',
      descricao: 'A cada 15 segundos em combate, a fase da lua muda. Ao atingir Lua Cheia, dano entra em sobrecarga com dano extra em área ao redor do alvo.',
      intervalo: 15,
      fases: ['Nova', 'Crescente', 'Cheia'],
      efeito: {
        tipo: 'sobrecarga',
        duracao: 5,
        danoExtraArea: 0.3,
      },
    },
    habilidades: [
      {
        id: 'orbe_de_prata',
        nome: 'Orbe de Prata',
        tipo: 'basico',
        multiplicador: 1.0,
        descricao: 'Dispara uma esfera rápida de luz lunar no inimigo mais próximo.',
        alvo: 'inimigo_mais_proximo',
        area: false,
      },
      {
        id: 'eclipse_total',
        nome: 'Eclipse Total',
        tipo: 'unica',
        multiplicador: 1.5,
        descricao: 'O campo escurece e ela invoca uma chuva de raios estelares, causando dano mágico massivo em todos os inimigos.',
        alvo: 'todos_inimigos',
        area: true,
      },
    ],
    equipamentos: { arma: null, armadura: null, acessorio: null },
    magias: [],
  };

  const CHARACTER_TEMPLATES = { luna_01: LUNA };

  function getCharacter(id) {
    const t = CHARACTER_TEMPLATES[id];
    return t ? JSON.parse(JSON.stringify(t)) : null;
  }

  // ─── STATE ─────────────────────────────────
  const STORAGE_KEY = 'idle-rpg-save';

  function createDefaultState() {
    const luna = getCharacter('luna_01');
    return {
      moedas: 0, gemas: 0,
      personagens: [luna],
      equipe: [luna.id, null, null],
      progresso: { waveAtual: 1, waveMax: 1, bossDerrotados: 0, dificuldade: 1 },
      config: { volume: 50, notificacoes: true },
    };
  }

  const listeners = new Set();
  let state = loadSave() || createDefaultState();

  function getState() { return state; }

  function setState(s) {
    state = Object.assign({}, state, s);
    notify();
  }

  function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }
  function notify() { listeners.forEach((fn) => fn(state)); }

  function saveGame() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); return true; }
    catch { return false; }
  }

  function loadSave() {
    try { const d = localStorage.getItem(STORAGE_KEY); return d ? JSON.parse(d) : null; }
    catch { return null; }
  }

  function hasSave() { return localStorage.getItem(STORAGE_KEY) !== null; }

  function getSaveInfo() {
    if (!hasSave()) return null;
    const d = loadSave();
    if (!d) return null;
    return { moedas: d.moedas, personagens: d.personagens?.length || 0, waveMax: d.progresso?.waveMax || 1, bossDerrotados: d.progresso?.bossDerrotados || 0 };
  }

  function resetState() {
    state = createDefaultState();
    localStorage.removeItem(STORAGE_KEY);
    notify();
  }

  function getEquipe() {
    return state.equipe.map((id) => {
      if (!id) return null;
      return state.personagens.find((p) => p.id === id) || null;
    });
  }

  // ─── RENDER: Resource Bar ──────────────────
  function renderResourceBar(el) {
    el.innerHTML =
      '<div class="resources-container">' +
        '<div class="resource-item"><span class="resource-icon">🪙</span><span class="resource-value">' + state.moedas.toLocaleString() + '</span></div>' +
        '<div class="resource-item"><span class="resource-icon">💎</span><span class="resource-value">' + state.gemas.toLocaleString() + '</span></div>' +
      '</div>';
  }

  // ─── RENDER: Menu ──────────────────────────
  function renderMenu(c) {
    c.innerHTML =
      '<div class="menu-page">' +
        '<div class="menu-logo">⚔️</div>' +
        '<h1 class="menu-title">IDLE RPG</h1>' +
        '<p class="menu-subtitle">Monte sua equipe. Conquiste o mundo.</p>' +
        '<div class="menu-actions">' +
          '<button class="menu-btn" data-page="play"><span class="menu-btn-icon">⚔️</span><span class="menu-btn-text"><span class="menu-btn-label">PLAY</span><span class="menu-btn-desc">Iniciar uma run de combate</span></span></button>' +
          '<button class="menu-btn" data-page="team"><span class="menu-btn-icon">👥</span><span class="menu-btn-text"><span class="menu-btn-label">AJUSTAR EQUIPE</span><span class="menu-btn-desc">Configure seus personagens</span></span></button>' +
          '<button class="menu-btn" data-page="gacha"><span class="menu-btn-icon">🎰</span><span class="menu-btn-text"><span class="menu-btn-label">GACHA</span><span class="menu-btn-desc">Obtenha novos personagens</span></span></button>' +
          '<button class="menu-btn" data-page="save"><span class="menu-btn-icon">💾</span><span class="menu-btn-text"><span class="menu-btn-label">SALVAR</span><span class="menu-btn-desc">Salvar e carregar progresso</span></span></button>' +
        '</div>' +
        '<div class="menu-version">v0.1.0 — Fundação da Interface</div>' +
      '</div>';
    c.querySelectorAll('.menu-btn').forEach(function (btn) {
      btn.addEventListener('click', function () { navigate(btn.dataset.page); });
    });
  }

  // ─── RENDER: Play ──────────────────────────
  function renderPlay(c) {
    var equipe = getEquipe();

    var teamSlotsHtml = equipe.map(function (char, i) {
      if (char) {
        var hpPct = Math.round((char.stats.hp / char.stats.hpMax) * 100);
        return '<div class="team-slot-card filled">' +
          '<div class="team-slot-header"><span class="team-slot-number">Slot ' + (i+1) + '</span><span class="badge badge-gold">Lv ' + char.nivel + '</span></div>' +
          '<div class="team-slot-icon">🌙</div>' +
          '<div class="team-slot-name">' + char.nome + '</div>' +
          '<div class="team-slot-class">' + char.classe + ' — ' + char.especialidade + '</div>' +
          '<div class="team-hp-bar"><div class="team-hp-fill" style="width:' + hpPct + '%"></div></div>' +
          '<div class="team-slot-info"><span>HP ' + char.stats.hp + '/' + char.stats.hpMax + '</span><span>ATK ' + char.stats.atk + '</span></div>' +
        '</div>';
      }
      return '<div class="team-slot-card"><div class="team-slot-empty"><div class="empty-icon">👤</div><div class="empty-label">Slot ' + (i+1) + ' — Vazio</div></div></div>';
    }).join('');

    var battlePlayers = equipe.map(function (c) {
      return c ? '<div class="battle-player-slot active">🌙</div>' : '<div class="battle-player-slot"></div>';
    }).join('');

    c.innerHTML =
      '<div class="play-page">' +
        '<div class="play-team"><div class="panel-header">Sua Equipe</div>' + teamSlotsHtml + '</div>' +
        '<div class="play-battle">' +
          '<div class="battle-header"><span class="battle-wave">WAVE ' + state.progresso.waveAtual + '</span><span class="battle-difficulty">Dificuldade ' + state.progresso.dificuldade + '</span></div>' +
          '<div class="battle-field">' +
            '<div class="battle-players-area">' + battlePlayers + '</div>' +
            '<div class="battle-vs">VS</div>' +
            '<div class="battle-enemies-area"><div class="battle-enemy-slot active">👹</div><div class="battle-enemy-slot active">👹</div></div>' +
          '</div>' +
          '<div class="battle-controls"><button class="btn-primary btn-start-run" disabled title="Sistema de combate será implementado em breve">▶ INICIAR RUN</button></div>' +
        '</div>' +
        '<div class="play-enemies">' +
          '<div class="panel-header">Inimigos</div>' +
          '<div class="enemy-card"><div class="enemy-header"><span class="enemy-name">Goblin</span><span class="enemy-level">Lv 1</span></div><div class="enemy-icon">👹</div><div class="enemy-hp-bar"><div class="enemy-hp-fill"></div></div><div class="enemy-hp-text">??/??</div></div>' +
          '<div class="enemy-card"><div class="enemy-header"><span class="enemy-name">Orc</span><span class="enemy-level">Lv 2</span></div><div class="enemy-icon">👹</div><div class="enemy-hp-bar"><div class="enemy-hp-fill"></div></div><div class="enemy-hp-text">??/??</div></div>' +
          '<div class="enemy-card boss"><div class="enemy-header"><span class="enemy-name">Boss</span><span class="badge badge-red">BOSS</span></div><div class="enemy-icon">🐉</div><div class="enemy-hp-bar"><div class="enemy-hp-fill"></div></div><div class="enemy-hp-text">??/??</div></div>' +
        '</div>' +
        '<div class="play-drops"><div class="drops-header"><span class="drops-title">📦 Drop de Itens</span></div><div class="drops-list"><span class="drop-placeholder">Os drops aparecerão durante a gameplay...</span></div></div>' +
      '</div>';
  }

  // ─── RENDER: Team ──────────────────────────
  function renderTeam(c) {
    var equipe = getEquipe();

    var rosterHtml = equipe.map(function (char, i) {
      if (char) {
        return '<div class="roster-slot filled">' +
          '<div class="roster-slot-icon">🌙</div>' +
          '<div class="roster-slot-info"><div class="roster-slot-number">Slot ' + (i+1) + '</div>' +
          '<div class="roster-slot-name">' + char.nome + (char.titulo ? ', ' + char.titulo : '') + '</div>' +
          '<div class="roster-slot-class">' + char.classe + ' — ' + char.tier + '</div></div>' +
          '<span class="badge badge-gold">Lv ' + char.nivel + '</span></div>';
      }
      return '<div class="roster-slot"><div class="roster-slot-info" style="width:100%"><div class="roster-slot-number">Slot ' + (i+1) + '</div><div class="roster-slot-empty">Vazio — Obtenha personagens pelo Gacha</div></div></div>';
    }).join('');

    var selected = equipe.find(function (c) { return c !== null; });

    var statsHtml = selected ?
      '<div class="stat-item"><span class="stat-label">HP</span><span class="stat-value">' + selected.stats.hp + '/' + selected.stats.hpMax + '</span></div>' +
      '<div class="stat-item"><span class="stat-label">ATK</span><span class="stat-value">' + selected.stats.atk + '</span></div>' +
      '<div class="stat-item"><span class="stat-label">DEF</span><span class="stat-value">' + selected.stats.def + '%</span></div>' +
      '<div class="stat-item"><span class="stat-label">SPD ATK</span><span class="stat-value">' + selected.stats.velocidadeAtaque + '</span></div>' +
      '<div class="stat-item"><span class="stat-label">CRT</span><span class="stat-value">' + selected.stats.chanceCritica + '%</span></div>' +
      '<div class="stat-item"><span class="stat-label">DMG CRT</span><span class="stat-value">' + selected.stats.danoCritico + '%</span></div>'
      :
      '<div class="stat-item"><span class="stat-label">HP</span><span class="stat-value">--</span></div>' +
      '<div class="stat-item"><span class="stat-label">ATK</span><span class="stat-value">--</span></div>' +
      '<div class="stat-item"><span class="stat-label">DEF</span><span class="stat-value">--</span></div>' +
      '<div class="stat-item"><span class="stat-label">SPD ATK</span><span class="stat-value">--</span></div>' +
      '<div class="stat-item"><span class="stat-label">CRT</span><span class="stat-value">--</span></div>' +
      '<div class="stat-item"><span class="stat-label">DMG CRT</span><span class="stat-value">--</span></div>';

    var skillsHtml = selected ? selected.habilidades.map(function (h) {
      var typeClass = h.tipo === 'basico' ? 'badge-blue' : 'badge-red';
      var typeLabel = h.tipo === 'basico' ? 'Básico' : 'Única';
      var targetLabel = h.alvo === 'todos_inimigos' ? 'Todos os Inimigos' : 'Inimigo mais próximo';
      return '<div class="skill-card">' +
        '<div class="skill-header"><span class="skill-name">' + h.nome + '</span><span class="skill-type ' + typeClass + '">' + typeLabel + '</span></div>' +
        '<div class="skill-mult">x' + h.multiplicador + '</div>' +
        '<div class="skill-desc">' + h.descricao + '</div>' +
        '<div class="skill-target">Alvo: ' + targetLabel + '</div></div>';
    }).join('') : '<div class="empty-state"><div class="empty-state-text">Nenhuma habilidade disponível</div></div>';

    var passivaHtml = '';
    if (selected && selected.passiva) {
      passivaHtml = '<div class="detail-section"><div class="detail-section-header">🌙 Passiva</div>' +
        '<div class="passiva-card"><div class="passiva-header"><span class="passiva-icon">🌕</span><span class="passiva-name">' + selected.passiva.nome + '</span></div>' +
        '<div class="passiva-desc">' + selected.passiva.descricao + '</div>' +
        '<div class="passiva-details"><span>Ciclo: ' + selected.passiva.fases.join(' → ') + ' (' + selected.passiva.intervalo + 's cada)</span></div></div></div>';
    }

    c.innerHTML =
      '<div class="team-page">' +
        '<div class="team-page-header"><h2 class="team-page-title">👥 Ajustar Equipe</h2><button class="btn-secondary" data-page="gacha">🎰 Ir para Gacha</button></div>' +
        '<div class="team-roster"><div class="panel-header">Equipe Atual</div>' + rosterHtml + '</div>' +
        '<div class="team-details">' +
          '<div class="detail-section"><div class="detail-section-header">⚔️ Equipamentos</div>' +
            '<div class="detail-grid">' +
              '<div class="detail-slot"><div class="detail-slot-icon">🗡️</div><div class="detail-slot-label">Arma</div></div>' +
              '<div class="detail-slot"><div class="detail-slot-icon">🛡️</div><div class="detail-slot-label">Armadura</div></div>' +
              '<div class="detail-slot"><div class="detail-slot-icon">💍</div><div class="detail-slot-label">Acessório</div></div>' +
              '<div class="detail-slot"><div class="detail-slot-icon">✨</div><div class="detail-slot-label">Magia</div></div>' +
            '</div></div>' +
          '<div class="detail-section"><div class="detail-section-header">📊 Status</div><div class="detail-stats">' + statsHtml + '</div></div>' +
          '<div class="detail-section"><div class="detail-section-header">🔮 Habilidades</div><div class="skills-list">' + skillsHtml + '</div></div>' +
          passivaHtml +
        '</div>' +
      '</div>';

    c.querySelectorAll('[data-page]').forEach(function (btn) {
      btn.addEventListener('click', function () { navigate(btn.dataset.page); });
    });
  }

  // ─── RENDER: Gacha ─────────────────────────
  function renderGacha(c) {
    c.innerHTML =
      '<div class="gacha-page">' +
        '<h2 class="gacha-title">🎰 GACHA</h2>' +
        '<div class="gacha-currency"><span class="gacha-currency-icon">🪙</span><span>Moedas: </span><span class="gacha-currency-value">' + state.moedas.toLocaleString() + '</span></div>' +
        '<div class="gacha-machine">' +
          '<div class="gacha-machine-icon">🎰</div>' +
          '<div class="gacha-machine-text">Sorteie novos personagens para sua equipe!<br/><small style="color: var(--text-muted);">Sistema de Gacha será implementado em breve.</small></div>' +
          '<button class="btn-primary" disabled style="padding: 0.75rem 2.5rem; font-size: 1rem;">REALIZAR GACHA</button>' +
          '<div class="gacha-cost">Custo: <span class="gacha-currency-value">----</span> 🪙</div>' +
        '</div>' +
        '<div class="gacha-tiers"><div class="gacha-tiers-title">Tiers de Raridade</div>' +
          '<div class="tiers-grid">' +
            '<div class="tier-item tier-common">Comum</div>' +
            '<div class="tier-item tier-rare">Raro</div>' +
            '<div class="tier-item tier-ultra">Ultra-Raro</div>' +
            '<div class="tier-item tier-legendary">Lendário</div>' +
            '<div class="tier-item tier-mythic">Mítico</div>' +
          '</div></div>' +
        '<div class="gacha-result"><div class="panel-header">Último Resultado</div><div class="gacha-result-placeholder">Nenhum personagem obtido ainda.<br/>Realize um Gacha para ver o resultado aqui.</div></div>' +
        '<button class="btn-secondary" data-page="team" style="margin-top: 0.5rem;">👥 Ir para Equipe</button>' +
      '</div>';

    c.querySelectorAll('[data-page]').forEach(function (btn) {
      btn.addEventListener('click', function () { navigate(btn.dataset.page); });
    });
  }

  // ─── RENDER: Save ──────────────────────────
  function renderSave(c) {
    var info = getSaveInfo();
    var statusRows = info ?
      '<div class="save-info-row"><span class="save-info-label">Moedas</span><span class="save-info-value">' + info.moedas.toLocaleString() + '</span></div>' +
      '<div class="save-info-row"><span class="save-info-label">Personagens</span><span class="save-info-value">' + info.personagens + '</span></div>' +
      '<div class="save-info-row"><span class="save-info-label">Wave Max</span><span class="save-info-value">' + info.waveMax + '</span></div>' +
      '<div class="save-info-row"><span class="save-info-label">Boss Derrotados</span><span class="save-info-value">' + info.bossDerrotados + '</span></div>'
      :
      '<div class="save-info-row"><span class="save-info-label">Status</span><span class="save-info-value empty">Nenhum progresso salvo</span></div>';

    var dataPreview = JSON.stringify(state, null, 2);

    c.innerHTML =
      '<div class="save-page">' +
        '<h2 class="save-title">💾 Salvamento</h2>' +
        '<div class="save-status-panel"><div class="save-status-header">Status do Save</div><div class="save-status-info">' + statusRows + '</div></div>' +
        '<div class="save-actions">' +
          '<button class="btn-primary save-btn" id="btn-save">💾 SALVAR PROGRESSO</button>' +
          '<button class="btn-secondary save-btn" id="btn-load"' + (!hasSave() ? ' disabled' : '') + '>📂 CARREGAR PROGRESSO</button>' +
          '<button class="btn-danger save-btn" id="btn-reset"' + (!hasSave() ? ' disabled' : '') + '>🗑️ LIMPAR SAVE</button>' +
        '</div>' +
        '<div class="save-data-preview"><div class="save-data-title">Dados do Save (Preview)</div><div class="save-data-content" id="save-preview">' + dataPreview + '</div></div>' +
        '<div class="save-warning">Os dados são salvos localmente no navegador (LocalStorage).<br/>Limpar os dados do navegador apagará o progresso.</div>' +
      '</div>';

    document.getElementById('btn-save').addEventListener('click', function () {
      var ok = saveGame();
      if (ok) {
        this.textContent = '✅ Salvo com Sucesso!';
        var self = this;
        setTimeout(function () { self.textContent = '💾 SALVAR PROGRESSO'; }, 1500);
        renderSave(c);
      }
    });

    var btnLoad = document.getElementById('btn-load');
    if (btnLoad) {
      btnLoad.addEventListener('click', function () {
        var loaded = loadSave();
        if (loaded) {
          setState(loaded);
          this.textContent = '✅ Carregado!';
          var self = this;
          setTimeout(function () { self.textContent = '📂 CARREGAR PROGRESSO'; renderSave(c); }, 1500);
        }
      });
    }

    var btnReset = document.getElementById('btn-reset');
    if (btnReset) {
      btnReset.addEventListener('click', function () {
        if (confirm('Tem certeza que deseja apagar todo o progresso salvo?')) {
          resetState();
          renderSave(c);
        }
      });
    }
  }

  // ─── ROUTER ────────────────────────────────
  var pages = {
    menu: renderMenu,
    play: renderPlay,
    team: renderTeam,
    gacha: renderGacha,
    save: renderSave,
  };

  var content = document.getElementById('content');
  var resourceBar = document.getElementById('resource-bar');
  var btnBack = document.getElementById('btn-back');
  var navBtns = document.querySelectorAll('.nav-btn');
  var currentPage = 'menu';

  function navigate(page) {
    if (!pages[page]) return;
    currentPage = page;

    navBtns.forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.page === page);
    });

    btnBack.style.display = page === 'menu' ? 'none' : 'inline-flex';

    pages[page](content);

    renderResourceBar(resourceBar);
    window.scrollTo(0, 0);
  }

  navBtns.forEach(function (btn) {
    btn.addEventListener('click', function () { navigate(btn.dataset.page); });
  });

  btnBack.addEventListener('click', function () { navigate('menu'); });

  subscribe(function () { renderResourceBar(resourceBar); });

  navigate('menu');

})();
