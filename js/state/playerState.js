import { getCharacter } from '../data/characterRegistry.js';

const STORAGE_KEY = 'idle-rpg-save';

function createDefaultState() {
  const luna = getCharacter('luna_01');
  return {
    moedas: 0,
    gemas: 0,
    personagens: [luna],
    equipe: [luna.id, null, null],
    progresso: {
      waveAtual: 1,
      waveMax: 1,
      bossDerrotados: 0,
      dificuldade: 1,
    },
    config: {
      volume: 50,
      notificacoes: true,
    },
  };
}

const defaultState = createDefaultState();
  progresso: {
    waveAtual: 1,
    waveMax: 1,
    bossDerrotados: 0,
    dificuldade: 1,
  },
  config: {
    volume: 50,
    notificacoes: true,
  },
};

class PlayerState {
  constructor() {
    this.state = this.load() || JSON.parse(JSON.stringify(defaultState));
    this.listeners = new Set();
  }

  get() {
    return this.state;
  }

  set(newState) {
    this.state = { ...this.state, ...newState };
    this.notify();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach((fn) => fn(this.state));
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      return true;
    } catch {
      return false;
    }
  }

  load() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  hasSave() {
    return localStorage.getItem(STORAGE_KEY) !== null;
  }

  getSaveInfo() {
    if (!this.hasSave()) return null;
    const data = this.load();
    if (!data) return null;
    return {
      moedas: data.moedas,
      personagens: data.personagens?.length || 0,
      waveMax: data.progresso?.waveMax || 1,
      bossDerrotados: data.progresso?.bossDerrotados || 0,
    };
  }

  reset() {
    this.state = JSON.parse(JSON.stringify(defaultState));
    localStorage.removeItem(STORAGE_KEY);
    this.notify();
  }

  getEquipe() {
    return this.state.equipe.map((id) => {
      if (!id) return null;
      return this.state.personagens.find((p) => p.id === id) || null;
    });
  }
}

export const playerState = new PlayerState();
