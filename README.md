# ⚔️ Idle RPG

Jogo web Idle RPG com progressão, coleção de personagens, equipamentos e sistema de merge.

## Etapa Atual

**v0.1.0 — Fundação da Interface e Navegação**

Esta primeira versão estabelece a base visual e de navegação do jogo, incluindo:

- Tela inicial com navegação completa
- Tela de PLAY com layout de batalha (placeholder)
- Tela de AJUSTAR EQUIPE com slots e áreas reservadas
- Tela de GACHA com interface visual
- Tela de SALVAR com persistência via LocalStorage
- Design responsivo para Desktop, Tablet e Mobile
- Arquitetura modular preparada para expansão

## Como Executar Localmente

### Opção 1 — Abrir direto no navegador

Basta abrir o arquivo `index.html` no navegador.

```bash
# No Windows:
start index.html

# No macOS:
open index.html

# No Linux:
xdg-open index.html
```

### Opção 2 — Servidor local (recomendado)

Para melhor experiência com módulos ES:

```bash
# Usando Python
python -m http.server 8000

# Usando Node.js (npx)
npx serve .

# Usando VS Code
# Instale a extensão "Live Server" e clique em "Go Live"
```

Acesse `http://localhost:8000` no navegador.

## Estrutura do Projeto

```
idle-rpg/
├── index.html              # Ponto de entrada
├── README.md               # Documentação
├── css/
│   ├── main.css            # Estilos globais e variáveis
│   ├── navigation.css      # Header, nav e footer
│   ├── menu.css            # Tela do Menu
│   ├── play.css            # Tela de Play/Batalha
│   ├── team.css            # Tela de Equipe
│   ├── gacha.css           # Tela de Gacha
│   ├── save.css            # Tela de Salvamento
│   └── responsive.css      # Media queries
├── js/
│   ├── app.js              # Router e inicialização
│   ├── state/
│   │   └── playerState.js  # Gerenciamento de estado
│   ├── components/
│   │   └── resourceBar.js  # Barra de recursos
│   └── pages/
│       ├── menu.js         # Página do Menu
│       ├── play.js         # Página de Play
│       ├── team.js         # Página de Equipe
│       ├── gacha.js        # Página de Gacha
│       └── save.js         # Página de Salvamento
└── assets/                 # (futuro: imagens, sons)
```

## Tecnologias

- HTML5
- CSS3 (Grid, Flexbox, Custom Properties)
- JavaScript ES Modules (Vanilla)
- LocalStorage para persistência

## Roadmap

- [x] v0.1.0 — Fundação da Interface
- [ ] v0.2.0 — Sistema de Personagens
- [ ] v0.3.0 — Sistema de Combate
- [ ] v0.4.0 — Equipamentos e Itens
- [ ] v0.5.0 — Progressão e Waves
- [ ] v0.6.0 — Gacha Funcional
- [ ] v0.7.0 — Merge e Evolução
- [ ] v0.8.0 — UI/UX Polish
- [ ] v1.0.0 — Release

## Licença

Projeto privado.
