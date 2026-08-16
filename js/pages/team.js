import { playerState } from '../state/playerState.js';

export function renderTeam(container, navigate) {
  const state = playerState.get();
  const equipe = playerState.getEquipe();

  const rosterHtml = equipe.map((char, i) => {
    if (char) {
      return `
        <div class="roster-slot filled">
          <div class="roster-slot-icon">🧙</div>
          <div class="roster-slot-info">
            <div class="roster-slot-number">Slot ${i + 1}</div>
            <div class="roster-slot-name">${char.nome}</div>
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
            <div class="stat-item">
              <span class="stat-label">HP</span>
              <span class="stat-value">--</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">ATK</span>
              <span class="stat-value">--</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">DEF</span>
              <span class="stat-value">--</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">SPD</span>
              <span class="stat-value">--</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">CRT</span>
              <span class="stat-value">--</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Dodge</span>
              <span class="stat-value">--</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  container.querySelectorAll('[data-page]').forEach((btn) => {
    btn.addEventListener('click', () => navigate(btn.dataset.page));
  });
}
