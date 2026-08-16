import { playerState } from '../state/playerState.js';

export function renderPlay(container, navigate) {
  const state = playerState.get();
  const equipe = playerState.getEquipe();

  const teamSlotsHtml = equipe.map((char, i) => {
    if (char) {
      return `
        <div class="team-slot-card filled">
          <div class="team-slot-header">
            <span class="team-slot-number">Slot ${i + 1}</span>
            <span class="badge badge-gold">Lv ${char.nivel}</span>
          </div>
          <div class="team-slot-icon">🧙</div>
          <div class="team-slot-name">${char.nome}</div>
          <div class="team-slot-class">${char.classe}</div>
          <div class="team-hp-bar"><div class="team-hp-fill" style="width:100%"></div></div>
          <div class="team-slot-info">
            <span>HP ${char.hp}/${char.hpMax}</span>
            <span>ATK ${char.atk}</span>
          </div>
        </div>
      `;
    }
    return `
      <div class="team-slot-card">
        <div class="team-slot-empty">
          <div class="empty-icon">👤</div>
          <div class="empty-label">Slot ${i + 1} — Vazio</div>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="play-page">
      <div class="play-team">
        <div class="panel-header">Sua Equipe</div>
        ${teamSlotsHtml}
      </div>

      <div class="play-battle">
        <div class="battle-header">
          <span class="battle-wave">WAVE ${state.progresso.waveAtual}</span>
          <span class="battle-difficulty">Dificuldade ${state.progresso.dificuldade}</span>
        </div>
        <div class="battle-field">
          <div class="battle-players-area">
            ${equipe.map((c) =>
              c
                ? `<div class="battle-player-slot active">🧙</div>`
                : `<div class="battle-player-slot"></div>`
            ).join('')}
          </div>
          <div class="battle-vs">VS</div>
          <div class="battle-enemies-area">
            <div class="battle-enemy-slot active">👹</div>
            <div class="battle-enemy-slot active">👹</div>
          </div>
        </div>
        <div class="battle-controls">
          <button class="btn-primary btn-start-run" disabled title="Sistema de combate será implementado em breve">
            ▶ INICIAR RUN
          </button>
        </div>
      </div>

      <div class="play-enemies">
        <div class="panel-header">Inimigos</div>
        <div class="enemy-card">
          <div class="enemy-header">
            <span class="enemy-name">Goblin</span>
            <span class="enemy-level">Lv 1</span>
          </div>
          <div class="enemy-icon">👹</div>
          <div class="enemy-hp-bar"><div class="enemy-hp-fill"></div></div>
          <div class="enemy-hp-text">??/??</div>
        </div>
        <div class="enemy-card">
          <div class="enemy-header">
            <span class="enemy-name">Orc</span>
            <span class="enemy-level">Lv 2</span>
          </div>
          <div class="enemy-icon">👹</div>
          <div class="enemy-hp-bar"><div class="enemy-hp-fill"></div></div>
          <div class="enemy-hp-text">??/??</div>
        </div>
        <div class="enemy-card boss">
          <div class="enemy-header">
            <span class="enemy-name">Boss</span>
            <span class="badge badge-red">BOSS</span>
          </div>
          <div class="enemy-icon">🐉</div>
          <div class="enemy-hp-bar"><div class="enemy-hp-fill"></div></div>
          <div class="enemy-hp-text">??/??</div>
        </div>
      </div>

      <div class="play-drops">
        <div class="drops-header">
          <span class="drops-title">📦 Drop de Itens</span>
        </div>
        <div class="drops-list">
          <span class="drop-placeholder">Os drops aparecerão durante a gameplay...</span>
        </div>
      </div>
    </div>
  `;
}
