export function renderMenu(container, navigate) {
  container.innerHTML = `
    <div class="menu-page">
      <div class="menu-logo">⚔️</div>
      <h1 class="menu-title">IDLE RPG</h1>
      <p class="menu-subtitle">Monte sua equipe. Conquiste o mundo.</p>

      <div class="menu-actions">
        <button class="menu-btn" data-page="play">
          <span class="menu-btn-icon">⚔️</span>
          <span class="menu-btn-text">
            <span class="menu-btn-label">PLAY</span>
            <span class="menu-btn-desc">Iniciar uma run de combate</span>
          </span>
        </button>

        <button class="menu-btn" data-page="team">
          <span class="menu-btn-icon">👥</span>
          <span class="menu-btn-text">
            <span class="menu-btn-label">AJUSTAR EQUIPE</span>
            <span class="menu-btn-desc">Configure seus personagens</span>
          </span>
        </button>

        <button class="menu-btn" data-page="gacha">
          <span class="menu-btn-icon">🎰</span>
          <span class="menu-btn-text">
            <span class="menu-btn-label">GACHA</span>
            <span class="menu-btn-desc">Obtenha novos personagens</span>
          </span>
        </button>

        <button class="menu-btn" data-page="save">
          <span class="menu-btn-icon">💾</span>
          <span class="menu-btn-text">
            <span class="menu-btn-label">SALVAR</span>
            <span class="menu-btn-desc">Salvar e carregar progresso</span>
          </span>
        </button>
      </div>

      <div class="menu-version">v0.1.0 — Fundação da Interface</div>
    </div>
  `;

  container.querySelectorAll('.menu-btn').forEach((btn) => {
    btn.addEventListener('click', () => navigate(btn.dataset.page));
  });
}
