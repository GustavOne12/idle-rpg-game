export const LUNA = {
  id: 'luna_01',
  nome: 'Luna',
  titulo: 'Tecelã da Noite',
  classe: 'Maga',
  especialidade: 'Dano em Área',
  tier: 'Comum',
  nivel: 1,
  estrelas: 1,
  xpAtual: 0,
  fatorDificuldade: 1.45,

  stats: {
    hp: 120,
    hpMax: 120,
    atk: 45,
    def: 5,
    velocidadeAtaque: 0.8,
    chanceCritica: 15,
    danoCritico: 150,
  },

  crescimento: {
    hp: 8,
    hpMax: 8,
    atk: 3,
    def: 0.2,
    velocidadeAtaque: 0,
    chanceCritica: 0.2,
    danoCritico: 1,
  },

  passiva: {
    id: 'ciclo_lunar',
    nome: 'Ciclo Lunar',
    descricao: 'A cada 15 segundos em combate, a fase da lua se alinha por 5 segundos. Durante esse período, os ataques básicos causam 100% de dano no alvo focado e 50% de dano em todos os inimigos ao redor.',
    intervalo: 15,
    efeito: {
      tipo: 'splash',
      duracao: 5,
      danoArea: 0.5,
    },
    icons: {
      ativo: 'chars/Luna/Luna passiva - Ativo.jpg',
      cooldown: 'chars/Luna/Luna passiva - cooldown.jpg',
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
      cooldown: 10,
      descricao: 'O campo escurece e ela invoca uma chuva de raios estelares, causando dano mágico massivo em todos os inimigos.',
      alvo: 'todos_inimigos',
      area: true,
    },
  ],

  equipamentos: {
    arma: null,
    armadura: null,
    acessorio: null,
  },
  magias: [],
};
