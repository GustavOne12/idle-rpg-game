import { playerState } from '../state/playerState.js';

export function renderGacha(container, navigate) {
  const state = playerState.get();

  container.innerHTML = `
    <div class="gacha-page">
      <h2 class="gacha-title">🎰 GACHA</h2>

      <div class="gacha-currency">
        <span class="gacha-currency-icon">🪙</span>
        <span>Moedas: </span>
        <span class="gacha-currency-value">${state.moedas.toLocaleString()}</span>
      </div>

      <div class="gacha-machine">
        <div class="gacha-machine-icon">🎰</div>
        <div class="gacha-machine-text">
          Sorteie novos personagens para sua equipe!<br/>
          <small style="color: var(--text-muted);">Sistema de Gacha será implementado em breve.</small>
        </div>
        <button class="btn-primary" disabled style="padding: 0.75rem 2.5rem; font-size: 1rem;">
          REALIZAR GACHA
        </button>
        <div class="gacha-cost">
          Custo: <span class="gacha-currency-value">----</span> 🪙
        </div>
      </div>

      <div class="gacha-tiers">
        <div class="gacha-tiers-title">Tiers de Raridade</div>
        <div class="tiers-grid">
          <div class="tier-item tier-common">Comum</div>
          <div class="tier-item tier-rare">Raro</div>
          <div class="tier-item tier-ultra">Ultra-Raro</div>
          <div class="tier-item tier-legendary">Lendário</div>
          <div class="tier-item tier-mythic">Mítico</div>
        </div>
      </div>

      <div class="gacha-result">
        <div class="panel-header">Último Resultado</div>
        <div class="gacha-result-placeholder">
          Nenhum personagem obtido ainda.<br/>
          Realize um Gacha para ver o resultado aqui.
        </div>
      </div>

      <button class="btn-secondary" data-page="team" style="margin-top: 0.5rem;">
        👥 Ir para Equipe
      </button>
    </div>
  `;

  container.querySelectorAll('[data-page]').forEach((btn) => {
    btn.addEventListener('click', () => navigate(btn.dataset.page));
  });
}
