import { playerState } from '../state/playerState.js';

export function renderResourceBar(container) {
  const state = playerState.get();
  container.innerHTML = `
    <div class="resources-container">
      <div class="resource-item">
        <span class="resource-icon">🪙</span>
        <span class="resource-value">${state.moedas.toLocaleString()}</span>
      </div>
      <div class="resource-item">
        <span class="resource-icon">💎</span>
        <span class="resource-value">${state.gemas.toLocaleString()}</span>
      </div>
    </div>
  `;
}
