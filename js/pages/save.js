import { playerState } from '../state/playerState.js';

export function renderSave(container, navigate) {
  const hasSave = playerState.hasSave();
  const saveInfo = playerState.getSaveInfo();

  const statusRows = saveInfo
    ? `
      <div class="save-info-row">
        <span class="save-info-label">Moedas</span>
        <span class="save-info-value">${saveInfo.moedas.toLocaleString()}</span>
      </div>
      <div class="save-info-row">
        <span class="save-info-label">Personagens</span>
        <span class="save-info-value">${saveInfo.personagens}</span>
      </div>
      <div class="save-info-row">
        <span class="save-info-label">Wave Max</span>
        <span class="save-info-value">${saveInfo.waveMax}</span>
      </div>
      <div class="save-info-row">
        <span class="save-info-label">Boss Derrotados</span>
        <span class="save-info-value">${saveInfo.bossDerrotados}</span>
      </div>
    `
    : `
      <div class="save-info-row">
        <span class="save-info-label">Status</span>
        <span class="save-info-value empty">Nenhum progresso salvo</span>
      </div>
    `;

  const state = playerState.get();
  const dataPreview = JSON.stringify(state, null, 2);

  container.innerHTML = `
    <div class="save-page">
      <h2 class="save-title">💾 Salvamento</h2>

      <div class="save-status-panel">
        <div class="save-status-header">Status do Save</div>
        <div class="save-status-info">
          ${statusRows}
        </div>
      </div>

      <div class="save-actions">
        <button class="btn-primary save-btn" id="btn-save">
          💾 SALVAR PROGRESSO
        </button>
        <button class="btn-secondary save-btn" id="btn-load" ${!hasSave ? 'disabled' : ''}>
          📂 CARREGAR PROGRESSO
        </button>
        <button class="btn-danger save-btn" id="btn-reset" ${!hasSave ? 'disabled' : ''}>
          🗑️ LIMPAR SAVE
        </button>
      </div>

      <div class="save-data-preview">
        <div class="save-data-title">Dados do Save (Preview)</div>
        <div class="save-data-content" id="save-preview">${dataPreview}</div>
      </div>

      <div class="save-warning">
        Os dados são salvos localmente no navegador (LocalStorage).<br/>
        Limpar os dados do navegador apagará o progresso.
      </div>
    </div>
  `;

  const btnSave = container.querySelector('#btn-save');
  const btnLoad = container.querySelector('#btn-load');
  const btnReset = container.querySelector('#btn-reset');
  const preview = container.querySelector('#save-preview');

  btnSave.addEventListener('click', () => {
    const ok = playerState.save();
    if (ok) {
      btnSave.textContent = '✅ Salvo com Sucesso!';
      setTimeout(() => {
        btnSave.textContent = '💾 SALVAR PROGRESSO';
      }, 1500);
      renderSave(container, navigate);
    }
  });

  btnLoad.addEventListener('click', () => {
    const loaded = playerState.load();
    if (loaded) {
      playerState.set(loaded);
      btnLoad.textContent = '✅ Carregado!';
      setTimeout(() => {
        btnLoad.textContent = '📂 CARREGAR PROGRESSO';
        renderSave(container, navigate);
      }, 1500);
    }
  });

  btnReset.addEventListener('click', () => {
    if (confirm('Tem certeza que deseja apagar todo o progresso salvo?')) {
      playerState.reset();
      renderSave(container, navigate);
    }
  });
}
