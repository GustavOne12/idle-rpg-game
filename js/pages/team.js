import { playerState } from '../state/playerState.js';

export function renderTeam(container, navigate) {
  const state = playerState.get();
  const equipe = playerState.getEquipe();

  const rosterHtml = equipe.map((char, i) => {
    if (char) {
      return `
        <div class="roster-slot filled">
          <div class="roster-slot-icon">🌙</div>
          <div class="roster-slot-info">
            <div class="roster-slot-number">Slot ${i + 1}</div>
            <div class="roster-slot-name">${char.nome}${char.titulo ? ', ' + char.titulo : ''}</div>
            <div class="roster-slot-class">${char.classe} — ${char.tier}</div>
          </div>
          <span class="badge badge-gold">Lv ${char.nivel}</span>
        </div>
      `;
    }
    return `
      <div class="roster-slot">
        <div class="roster-slot-info" style="width:100%">
          <div class="roster-slot-number">Slot ${i + 1}</div>
          <div class="roster-slot-empty">Vazio — Obtenha personagens pelo Gacha</div>
        </div>
      </div>
    `;
  }).join('');

  const selectedChar = equipe.find((c) => c !== null);

  const statsHtml = selectedChar
    ? `
      <div class="stat-item">
        <span class="stat-label">HP</span>
        <span class="stat-value">${selectedChar.stats.hp}/${selectedChar.stats.hpMax}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">ATK</span>
        <span class="stat-value">${selectedChar.stats.atk}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">DEF</span>
        <span class="stat-value">${selectedChar.stats.def}%</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">SPD ATK</span>
        <span class="stat-value">${selectedChar.stats.velocidadeAtaque}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">CRT</span>
        <span class="stat-value">${selectedChar.stats.chanceCritica}%</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">DMG CRT</span>
        <span class="stat-value">${selectedChar.stats.danoCritico}%</span>
      </div>
    `
    : `
      <div class="stat-item"><span class="stat-label">HP</span><span class="stat-value">--</span></div>
      <div class="stat-item"><span class="stat-label">ATK</span><span class="stat-value">--</span></div>
      <div class="stat-item"><span class="stat-label">DEF</span><span class="stat-value">--</span></div>
      <div class="stat-item"><span class="stat-label">SPD ATK</span><span class="stat-value">--</span></div>
      <div class="stat-item"><span class="stat-label">CRT</span><span class="stat-value">--</span></div>
      <div class="stat-item"><span class="stat-label">DMG CRT</span><span class="stat-value">--</span></div>
    `;

  const skillsHtml = selectedChar
    ? selectedChar.habilidades.map((h) => `
        <div class="skill-card">
          <div class="skill-header">
            <span class="skill-name">${h.nome}</span>
            <span class="skill-type ${h.tipo === 'basico' ? 'badge-blue' : 'badge-red'}">${h.tipo === 'basico' ? 'Básico' : 'Única'}</span>
          </div>
          <div class="skill-mult">x${h.multiplicador}</div>
          <div class="skill-desc">${h.descricao}</div>
          <div class="skill-target">Alvo: ${h.alvo === 'todos_inimigos' ? 'Todos os Inimigos' : 'Inimigo mais próximo'}</div>
        </div>
      `).join('')
    : '<div class="empty-state"><div class="empty-state-text">Nenhuma habilidade disponível</div></div>';

  const passivaHtml = selectedChar && selectedChar.passiva
    ? `
      <div class="passiva-card">
        <div class="passiva-header">
          <span class="passiva-icon">🌕</span>
          <span class="passiva-name">${selectedChar.passiva.nome}</span>
        </div>
        <div class="passiva-desc">${selectedChar.passiva.descricao}</div>
        <div class="passiva-details">
          <span>Ciclo: ${selectedChar.passiva.fases.join(' → ')} (${selectedChar.passiva.intervalo}s cada)</span>
        </div>
      </div>
    `
    : '';

  container.innerHTML = `
    <div class="team-page">
      <div class="team-page-header">
        <h2 class="team-page-title">👥 Ajustar Equipe</h2>
        <button class="btn-secondary" data-page="gacha">🎰 Ir para Gacha</button>
      </div>

      <div class="team-roster">
        <div class="panel-header">Equipe Atual</div>
        ${rosterHtml}
      </div>

      <div class="team-details">
        <div class="detail-section">
          <div class="detail-section-header">⚔️ Equipamentos</div>
          <div class="detail-grid">
            <div class="detail-slot">
              <div class="detail-slot-icon">🗡️</div>
              <div class="detail-slot-label">Arma</div>
            </div>
            <div class="detail-slot">
              <div class="detail-slot-icon">🛡️</div>
              <div class="detail-slot-label">Armadura</div>
            </div>
            <div class="detail-slot">
              <div class="detail-slot-icon">💍</div>
              <div class="detail-slot-label">Acessório</div>
            </div>
            <div class="detail-slot">
              <div class="detail-slot-icon">✨</div>
              <div class="detail-slot-label">Magia</div>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <div class="detail-section-header">📊 Status</div>
          <div class="detail-stats">
            ${statsHtml}
          </div>
        </div>

        <div class="detail-section">
          <div class="detail-section-header">🔮 Habilidades</div>
          <div class="skills-list">
            ${skillsHtml}
          </div>
        </div>

        ${passivaHtml ? `
        <div class="detail-section">
          <div class="detail-section-header">🌙 Passiva</div>
          ${passivaHtml}
        </div>
        ` : ''}
      </div>
    </div>
  `;

  container.querySelectorAll('[data-page]').forEach((btn) => {
    btn.addEventListener('click', () => navigate(btn.dataset.page));
  });
}
