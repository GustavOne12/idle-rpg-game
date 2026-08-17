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

  var CHARACTER_TEMPLATES = { luna_01: LUNA };

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
  var ENEMY_TEMPLATES = {
    goblin: { nome: 'Goblin', lv: 1, hpMax: 9999, atk: 1, velocidadeAtaque: 1.0, emoji: '👹' },
    orc: { nome: 'Orc', lv: 2, hpMax: 90, atk: 1, velocidadeAtaque: 0.8, emoji: '👺' },
    troll: { nome: 'Troll', lv: 3, hpMax: 140, atk: 1, velocidadeAtaque: 0.6, emoji: '👿' },
  };

  var WAVE_ENEMIES = { 1: ['goblin'] };

  function getWaveEnemies(n) {
    return WAVE_ENEMIES[n] || ['goblin'];
  }

  var battle = null;
  var battleTimer = null;

  function startBattle() {
    var eq = getEquipe();

    var heroes = eq.filter(Boolean).map(function (c) {
      return {
        id: c.id, nome: c.nome,
        stats: {
          hp: c.stats.hpMax, hpMax: c.stats.hpMax, atk: c.stats.atk, def: c.stats.def,
          velocidadeAtaque: c.stats.velocidadeAtaque, chanceCritica: c.stats.chanceCritica, danoCritico: c.stats.danoCritico
        },
        habilidades: c.habilidades,
        cds: (c.habilidades || []).reduce(function (acc, sk) {
          var total = sk.tipo === 'basico' ? (1 / c.stats.velocidadeAtaque) : (sk.cooldown || 8);
          acc[sk.id] = { total: total, restante: total };
          return acc;
        }, {}),
        atkTempo: 0,
        morto: false,
      };
    });

    var enemies = getWaveEnemies(state.progresso.waveAtual).map(function (key) {
      var t = ENEMY_TEMPLATES[key];
      return {
        id: key, nome: t.nome, lv: t.lv,
        hp: t.hpMax, hpMax: t.hpMax, atk: t.atk, velocidadeAtaque: t.velocidadeAtaque, emoji: t.emoji,
        atkTempo: 0, morto: false,
      };
    });

    battle = { heroes: heroes, enemies: enemies, concluida: false, derrota: false };
  }

  function renderBattle() {
    startBattle();
    var eq = getEquipe();

    var heroCards = eq.map(function (c, i) {
      var num = ['①', '②', '③'][i] || (i + 1);
      if (!c) {
        return '<div class="hero-empty">' +
          '<span class="hero-empty-num">' + num + '</span>' +
          '<span class="hero-empty-icon">👤</span>' +
          '<span class="hero-empty-text">Vazio</span>' +
        '</div>';
      }
      var skills = c.habilidades || [];

      function skillSlot(sk, icon) {
        if (!sk) return '<div class="hero-skill-slot empty"><span class="hero-skill-icon">—</span></div>';
        return '<div class="hero-skill-slot cd" data-cd-id="' + sk.id + '" title="' + sk.nome + '">' +
          '<div class="hero-skill-ring"></div>' +
          '<span class="hero-skill-icon">' + icon + '</span>' +
          '<span class="hero-skill-cd-text"></span>' +
        '</div>';
      }

      var perfilSrc = c.images && c.images.perfil ? c.images.perfil : '';

      return '<div class="hero-card filled" data-hero-id="' + c.id + '">' +
        '<div class="hero-card-top">' +
          '<span class="hero-slot-num">' + num + '</span>' +
          '<div class="hero-card-avatar">' + (perfilSrc ? '<img src="' + perfilSrc + '" alt="' + c.nome + '" />' : '🌙') + '</div>' +
          '<div class="hero-card-info">' +
            '<div class="hero-card-name-row"><span class="hero-card-name">' + c.nome + '</span><span class="hero-card-lv">Lv ' + c.nivel + '</span></div>' +
          '</div>' +
        '</div>' +
        '<div class="hero-hp-row">' +
          '<div class="hero-bar"><div class="hero-bar-fill hp" style="width:100%"></div></div>' +
          '<span class="hero-hp-text">' + c.stats.hpMax + '/' + c.stats.hpMax + '</span>' +
        '</div>' +
        '<div class="hero-card-skills">' + skillSlot(skills[0], '🔮') + skillSlot(skills[1], '💫') + '</div>' +
      '</div>';
    }).join('');

    var arenaHeroes = battle.heroes.map(function (h) {
      var heroChar = state.personagens.find(function (p) { return p.id === h.id; });
      var combatSrc = heroChar && heroChar.images && heroChar.images.combat ? heroChar.images.combat : '';
      var inner = combatSrc ? '<img src="' + combatSrc + '" alt="' + h.nome + '" class="arena-unit-img" />' : '🌙';
      return '<div class="arena-side-item">' +
        '<div class="arena-unit hero-unit" data-hero-id="' + h.id + '">' + inner +
          '<div class="arena-unit-bar"><div class="arena-unit-bar-fill" style="width:100%;background:var(--hp-green)"></div></div>' +
        '</div>' +
        '<div class="arena-unit-label">' + h.nome + '</div>' +
      '</div>';
    }).join('');

    var arenaEnemies = battle.enemies.map(function (e) {
      return '<div class="arena-side-item">' +
        '<div class="arena-unit enemy-unit" data-enemy-id="' + e.id + '">' + e.emoji +
          '<div class="arena-unit-bar"><div class="arena-unit-bar-fill" style="width:100%;background:var(--hp-red)"></div></div>' +
        '</div>' +
        '<div class="arena-unit-label">' + e.nome + '</div>' +
      '</div>';
    }).join('');

    var enemyBars = battle.enemies.map(function (e) {
      var pct = 100;
      return '<div class="enemy-bar-card" data-enemy-id="' + e.id + '">' +
        '<div class="enemy-bar-top"><span class="enemy-bar-icon">' + e.emoji + '</span><span class="enemy-bar-name">' + e.nome + '</span><span class="enemy-bar-level">Lv ' + e.lv + '</span></div>' +
        '<div class="enemy-hp"><div class="enemy-hp-fill" style="width:' + pct + '%"></div></div>' +
        '<div class="enemy-hp-text">' + e.hp + ' / ' + e.hpMax + '</div></div>';
    }).join('');

    content.innerHTML =
      '<div class="battle-page">' +
        '<div class="battle-left"><div class="battle-left-title">Sua Equipe</div>' + heroCards + '</div>' +
        '<div class="battle-center">' +
          '<div class="battle-wave-bar"><span class="wave-label">WAVE ' + state.progresso.waveAtual + ' / ' + state.progresso.waveMax + '</span><span class="diff-label">Dificuldade ' + state.progresso.dificuldade + '</span></div>' +
          '<div class="battle-arena">' +
            '<div class="arena-side">' + arenaHeroes + '</div>' +
            '<div class="arena-vs">VS</div>' +
            '<div class="arena-side">' + arenaEnemies + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="battle-loot">' +
          '<div class="loot-header"><span class="loot-title">📦 Drop de Itens</span></div>' +
          '<div class="loot-items" id="loot-log">' +
            '<div class="loot-placeholder">Os drops aparecerão durante o combate...</div>' +
          '</div>' +
        '</div>' +
        '<div class="battle-right"><div class="battle-right-title">Inimigos</div>' + enemyBars + '</div>' +
        '<div class="battle-banner hidden" id="battle-banner"></div>' +
      '</div>';

    updateBattleUI();
    startBattleTimer();
  }

  function startBattleTimer() {
    stopBattleTimer();
    battleTimer = setInterval(battleTick, 100);
  }

  function stopBattleTimer() {
    if (battleTimer) { clearInterval(battleTimer); battleTimer = null; }
  }

  function battleTick() {
    if (!battle || battle.concluida || battle.derrota) return;

    var dt = 0.1;

    // Heroes attack
    battle.heroes.forEach(function (h) {
      if (h.morto) return;
      h.atkTempo += dt;
      var intervalo = 1 / h.stats.velocidadeAtaque;
      while (h.atkTempo >= intervalo) {
        h.atkTempo -= intervalo;
        var alvo = battle.enemies.find(function (e) { return !e.morto; });
        if (!alvo) break;
        var habilidade = h.habilidades && h.habilidades[0] ? h.habilidades[0] : null;
        var mult = habilidade ? (habilidade.multiplicador || 1) : 1;
        var dano = Math.max(1, Math.round(h.stats.atk * mult));
        alvo.hp = Math.max(0, alvo.hp - dano);
        if (alvo.hp <= 0) alvo.morto = true;
        animarAtaque('hero', h.id);
        if (habilidade && h.cds[habilidade.id]) h.cds[habilidade.id].restante = h.cds[habilidade.id].total;
      }
      // tick down all skill cooldowns
      Object.keys(h.cds).forEach(function (k) {
        if (h.cds[k].restante > 0) h.cds[k].restante = Math.max(0, h.cds[k].restante - dt);
      });
    });

    // Enemies attack
    battle.enemies.forEach(function (e) {
      if (e.morto) return;
      e.atkTempo += dt;
      var intervalo = 1 / e.velocidadeAtaque;
      while (e.atkTempo >= intervalo) {
        e.atkTempo -= intervalo;
        var alvo = battle.heroes.find(function (h) { return !h.morto; });
        if (!alvo) break;
        var danoE = Math.max(1, e.atk);
        alvo.stats.hp = Math.max(0, alvo.stats.hp - danoE);
        if (alvo.stats.hp <= 0) alvo.morto = true;
        animarAtaque('enemy', e.id);
      }
    });

    updateBattleUI();

    var todosMortos = battle.enemies.every(function (e) { return e.morto; });
    var heroisMortos = battle.heroes.every(function (h) { return h.morto; });

    if (todosMortos && !battle.concluida) {
      battle.concluida = true;
      stopBattleTimer();
      mostrarBanner('WAVE ' + state.progresso.waveAtual + ' CONCLUÍDA!', 'Em breve você avançará para a próxima wave. Por enquanto, reinicie os testes.');
    } else if (heroisMortos && !battle.derrota) {
      battle.derrota = true;
      stopBattleTimer();
      mostrarBanner('DERROTA!', 'Sua equipe foi derrotada. Reinicie os testes.');
    }
  }

  function animarAtaque(tipo, id) {
    var sel = tipo === 'hero' ? '.arena-unit.hero-unit[data-hero-id="' + id + '"]' : '.arena-unit.enemy-unit[data-enemy-id="' + id + '"]';
    var el = document.querySelector(sel);
    if (!el) return;
    el.classList.remove('atacando');
    void el.offsetWidth;
    el.classList.add('atacando');
    setTimeout(function () {
      el.classList.remove('atacando');
    }, 260);
  }

  function updateBattleUI() {
    if (!battle) return;
    battle.heroes.forEach(function (h) {
      var pct = Math.max(0, Math.round((h.stats.hp / h.stats.hpMax) * 100));
      var card = document.querySelector('.hero-card[data-hero-id="' + h.id + '"]');
      if (card) {
        var fill = card.querySelector('.hero-bar-fill.hp');
        var txt = card.querySelector('.hero-hp-text');
        if (fill) fill.style.width = pct + '%';
        if (txt) txt.textContent = h.stats.hp + '/' + h.stats.hpMax;

        (h.habilidades || []).forEach(function (sk) {
          var slot = card.querySelector('.hero-skill-slot[data-cd-id="' + sk.id + '"]');
          var cd = h.cds[sk.id];
          if (!slot || !cd) return;
          var ring = slot.querySelector('.hero-skill-ring');
          var cdText = slot.querySelector('.hero-skill-cd-text');
          var restante = cd.restante;
          var cdPct = cd.total > 0 ? (restante / cd.total) * 100 : 0;
          if (ring) ring.style.setProperty('--cd-pct', cdPct);
          if (restante > 0) {
            slot.classList.add('cd');
            slot.classList.remove('ready');
            if (cdText) cdText.textContent = restante.toFixed(1).replace('.', ',') + 's';
          } else {
            slot.classList.remove('cd');
            slot.classList.add('ready');
            if (cdText) cdText.textContent = '';
          }
        });
      }
      var aUnit = document.querySelector('.arena-unit.hero-unit[data-hero-id="' + h.id + '"]');
      if (aUnit) {
        var af = aUnit.querySelector('.arena-unit-bar-fill');
        if (af) af.style.width = pct + '%';
      }
    });
    battle.enemies.forEach(function (e) {
      var pct = Math.max(0, Math.round((e.hp / e.hpMax) * 100));
      var bar = document.querySelector('.enemy-bar-card[data-enemy-id="' + e.id + '"]');
      if (bar) {
        var fill = bar.querySelector('.enemy-hp-fill');
        var txt = bar.querySelector('.enemy-hp-text');
        if (fill) fill.style.width = pct + '%';
        if (txt) txt.textContent = e.hp + ' / ' + e.hpMax;
      }
      var aUnit = document.querySelector('.arena-unit.enemy-unit[data-enemy-id="' + e.id + '"]');
      if (aUnit) {
        var af = aUnit.querySelector('.arena-unit-bar-fill');
        if (af) af.style.width = pct + '%';
      }
    });
  }

  function mostrarBanner(titulo, texto) {
    var banner = $('battle-banner');
    if (!banner) return;
    banner.innerHTML =
      '<div class="battle-banner-box">' +
        '<div class="battle-banner-title">' + titulo + '</div>' +
        '<div class="battle-banner-text">' + texto + '</div>' +
        '<button class="btn-gold" id="btn-reset-battle" style="font-size:0.85rem;">🔄 Reiniciar Teste</button>' +
      '</div>';
    banner.classList.remove('hidden');
    var btn = $('btn-reset-battle');
    if (btn) btn.addEventListener('click', function () { navigate('battle'); });
  }

  // ─── PAGE: HEROES ────────────────────────
  function renderHeroes() {
    var allChars = state.personagens;

    function tierClass(tier) {
      var t = (tier || '').toLowerCase();
      if (t.indexOf('raro') !== -1 && t.indexOf('ultra') !== -1) return 'tier-ultra';
      if (t.indexOf('lend') !== -1) return 'tier-legendary';
      if (t.indexOf('mit') !== -1) return 'tier-mythic';
      if (t.indexOf('raro') !== -1) return 'tier-rare';
      return 'tier-common';
    }

    function starsHtml(n) {
      var s = '';
      for (var i = 0; i < n; i++) s += '★';
      return s || '☆';
    }

    function renderTokens() {
      var list = document.getElementById('hero-token-list');
      if (!list) return;
      list.innerHTML = allChars.map(function (c) {
        var perfilSrc = c.images && c.images.perfil ? c.images.perfil : '';
        return '<button class="hero-token ' + tierClass(c.tier) + '" data-hero="' + c.id + '" title="' + c.nome + '">' +
          '<div class="hero-token-img">' + (perfilSrc ? '<img src="' + perfilSrc + '" alt="' + c.nome + '" />' : '🌙') + '</div>' +
          '<div class="hero-token-stars">' + starsHtml(c.estrelas) + '</div>' +
        '</button>';
      }).join('');
      list.querySelectorAll('.hero-token').forEach(function (btn) {
        btn.addEventListener('click', function () {
          list.querySelectorAll('.hero-token').forEach(function (b) { b.classList.remove('selected'); });
          btn.classList.add('selected');
          renderDetails(btn.dataset.hero);
        });
      });
    }

    function renderDetails(id) {
      var panel = document.getElementById('hero-details');
      if (!panel) return;
      var c = state.personagens.find(function (p) { return p.id === id; });
      if (!c) { panel.innerHTML = '<div class="empty-state"><div class="empty-state-text">Selecione um herói à esquerda.</div></div>'; return; }

      var hpPct = Math.round((c.stats.hp / c.stats.hpMax) * 100);
      var perfilSrc = c.images && c.images.perfil ? c.images.perfil : '';

      var skillsHtml = c.habilidades.map(function (h) {
        var typeLabel = h.tipo === 'basico' ? 'Básico' : 'Única';
        var typeClass = h.tipo === 'basico' ? 'badge-blue' : 'badge-red';
        return '<div class="skill-row"><div class="skill-top"><span class="skill-name">' + h.nome + ' <span class="badge ' + typeClass + '">' + typeLabel + '</span></span><span class="skill-mult">x' + h.multiplicador + '</span></div><div class="skill-desc">' + h.descricao + '</div></div>';
      }).join('');

      var passivaHtml = '';
      if (c.passiva) {
        passivaHtml = '<div class="hero-passive"><div class="passive-title">🌕 ' + c.passiva.nome + '</div><div class="passive-desc">' + c.passiva.descricao + '</div></div>';
      }

      panel.innerHTML =
        '<div class="hero-detail-card">' +
          '<div class="hero-detail-header">' +
            '<div class="hero-avatar">' + (perfilSrc ? '<img src="' + perfilSrc + '" alt="' + c.nome + '" />' : '🌙') + '</div>' +
            '<div class="hero-info-text">' +
              '<div class="hero-name-row">' +
                '<span class="hero-detail-name">' + c.nome + '</span>' +
                '<span class="hero-detail-lv">LV ' + c.nivel + '</span>' +
              '</div>' +
              '<div class="hero-detail-title">' + c.titulo + '</div>' +
              '<div class="hero-detail-class">' + c.classe + ' — ' + c.especialidade + ' <span class="badge ' + tierClass(c.tier) + '">' + c.tier + '</span></div>' +
            '</div>' +
            '<button class="btn-evoluir" disabled title="Evoluir (máx. LV 99)">EVOLUIR</button>' +
          '</div>' +
          '<div class="hero-detail-bars">' +
            '<div class="hero-stat-row"><span class="hero-stat-label">❤️ HP</span><span class="hero-stat-val">' + c.stats.hp + ' / ' + c.stats.hpMax + '</span></div>' +
            '<div class="hero-bar"><div class="hero-bar-fill hp" style="width:' + hpPct + '%"></div></div>' +
          '</div>' +
          '<div class="stats-grid">' +
            '<div class="stat-box"><div class="stat-box-label">ATK</div><div class="stat-box-val">' + c.stats.atk + '</div></div>' +
            '<div class="stat-box"><div class="stat-box-label">DEF</div><div class="stat-box-val">' + c.stats.def + '%</div></div>' +
            '<div class="stat-box"><div class="stat-box-label">SPD</div><div class="stat-box-val">' + c.stats.velocidadeAtaque + '</div></div>' +
            '<div class="stat-box"><div class="stat-box-label">CRT</div><div class="stat-box-val">' + c.stats.chanceCritica + '%</div></div>' +
            '<div class="stat-box"><div class="stat-box-label">DMG CRT</div><div class="stat-box-val">' + c.stats.danoCritico + '%</div></div>' +
            '<div class="stat-box"><div class="stat-box-label">ESTRELA</div><div class="stat-box-val">' + starsHtml(c.estrelas) + '</div></div>' +
          '</div>' +
          '<div class="hero-skills"><div class="hero-skills-title">🔮 Habilidades</div>' + skillsHtml + '</div>' +
          passivaHtml +
          '<div class="hero-equip">' +
            '<div class="hero-skills-title">⚔️ Equipamento</div>' +
            '<div class="equip-grid">' +
              '<div class="equip-slots">' +
                '<div class="equip-slot" title="Slot de equipamento"><div class="equip-slot-icon">—</div></div>' +
                '<div class="equip-slot" title="Slot de equipamento"><div class="equip-slot-icon">—</div></div>' +
              '</div>' +
              '<div class="equip-stats-preview"><span class="equip-stats-empty">Nenhum item equipado</span></div>' +
            '</div>' +
          '</div>' +
        '</div>';
    }

    content.innerHTML =
      '<div class="heroes-page">' +
        '<h2 class="heroes-page-title">🛡️ Heróis</h2>' +
        '<div class="heroes-layout">' +
          '<div class="hero-tokens-panel">' +
            '<div class="panel-subtitle">Personagens</div>' +
            '<div class="hero-token-list" id="hero-token-list"></div>' +
          '</div>' +
          '<div class="hero-details-panel" id="hero-details">' +
            '<div class="empty-state"><div class="empty-state-text">Selecione um herói à esquerda.</div></div>' +
          '</div>' +
        '</div>' +
      '</div>';

    renderTokens();
    if (allChars.length > 0) {
      var first = allChars[0];
      var firstBtn = document.querySelector('.hero-token[data-hero="' + first.id + '"]');
      if (firstBtn) { firstBtn.classList.add('selected'); }
      renderDetails(first.id);
    }
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

    if (page !== 'battle') stopBattleTimer();

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
