export const LUNA = {
  id: 'char_001',
  nome: 'Luna',
  titulo: 'A Tecelã da Noite',
  classe: 'Maga',
  especialidade: 'Dano em Área',
  tier: 'Comum',
  nivel: 1,
  estrelas: 1,
  xpAtual: 0,
  fatorDificuldade: 1.45,

  // Atributos base no nível 1.
  stats: {
    hp: 45,
    hpMax: 45,
    atk: 15,
    def: 3,
    velocidadeAtaque: 1.5,
    chanceCritica: 15,
    danoCritico: 150,
  },

  // Crescimento por nível (Base + ((Nível - 1) * Crescimento)). Campos fixos usam 0.
  crescimento: {
    hp: 6,
    hpMax: 6,
    atk: 3,
    def: 0,
    velocidadeAtaque: 0,
    chanceCritica: 0,
    danoCritico: 0,
  },

  passiva: {
    id: 'ciclo_lunar',
    nome: 'Ciclo Lunar',
    descricao: 'A cada 15s, a fase da lua se alinha. Durante o período ativo, ataques básicos causam 100% de dano no alvo e uma porcentagem em todos os inimigos ao redor.',
    intervalo: 15,
    // Progressão por estrela (índice 1-5 + Despertar = 6): duração ativa e dano em área.
    efeitos: [
      null,
      { duracao: 7, danoArea: 0.30 },
      { duracao: 8, danoArea: 0.38 },
      { duracao: 9, danoArea: 0.46 },
      { duracao: 10, danoArea: 0.54 },
      { duracao: 11, danoArea: 0.62 },
      { duracao: 13, danoArea: 0.70 },
    ],
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
      descricao: 'Dispara uma esfera rápida de luz lunar no inimigo mais próximo.',
      alvo: 'inimigo_mais_proximo',
      area: false,
      // Multiplicador de dano baseado no ATK (índice 1-5 + Despertar = 6).
      multiplicadores: [null, 1.0, 1.15, 1.35, 1.55, 1.75, 2.0],
    },
    {
      id: 'eclipse_total',
      nome: 'Eclipse Total',
      tipo: 'unica',
      cooldown: 10,
      descricao: 'O campo escurece e ela invoca uma chuva de raios estelares, causando dano mágico massivo em todos os inimigos.',
      alvo: 'todos_inimigos',
      area: true,
      // Multiplicador de dano baseado no ATK (índice 1-5 + Despertar = 6).
      multiplicadores: [null, 1.5, 1.8, 2.2, 2.6, 3.0, 3.5],
    },
  ],

  equipamentos: {
    arma: null,
    armadura: null,
    acessorio: null,
  },
  magias: [],
};
