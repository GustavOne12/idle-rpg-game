export const LUNA = {
  id: 'luna_01',
  nome: 'Luna',
  titulo: 'Tecelã da Noite',
  classe: 'Maga',
  especialidade: 'Dano em Área',
  tier: 'Comum',
  nivel: 1,
  estrelas: 1,

  stats: {
    hp: 120,
    hpMax: 120,
    atk: 45,
    def: 5,
    velocidadeAtaque: 0.8,
    chanceCritica: 15,
    danoCritico: 150,
  },

  passiva: {
    id: 'ciclo_lunar',
    nome: 'Ciclo Lunar',
    descricao: 'A cada 15 segundos em combate, a fase da lua muda. Ao atingir Lua Cheia, dano entra em sobrecarga com dano extra em área ao redor do alvo.',
    intervalo: 15,
    fases: ['Nova', 'Crescente', 'Cheia'],
    efeito: {
      tipo: 'sobrecarga',
      duracao: 5,
      danoExtraArea: 0.3,
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
