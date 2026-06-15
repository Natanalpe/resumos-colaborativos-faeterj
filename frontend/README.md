# Resumos Colaborativo Faeterj - Frontend

## 📋 Sobre a Interface

O frontend da plataforma **Resumos Colaborativo Faeterj** é uma aplicação web desenvolvida em **React** com **TypeScript**, utilizando **Ant Design** como biblioteca de componentes UI. A interface foi projetada para oferecer uma experiência intuitiva e agradável tanto para desktop quanto para dispositivos móveis.

## 🎨 Características da Interface

### Design Responsivo
- **Mobile First**: Interface adaptada para smartphones e tablets
- **Breakpoints Responsivos**: Ajustes automáticos para diferentes tamanhos de tela
- **Menu Lateral Adaptável**: Menu hambúrguer em dispositivos móveis
- **Cards Flexíveis**: Componentes que se reorganizam conforme o dispositivo

### Experiência do Usuário
- **Interface Intuitiva**: Navegação clara e direta
- **Feedback Visual**: Mensagens, notificações e estados de carregamento
- **Animações Suaves**: Transições e efeitos visuais agradáveis
- **Temas Consistentes**: Paleta de cores e estilos padronizados
- **Acessibilidade**: Tooltips, labels claros e navegação por teclado

## 🛠️ Stack Tecnológico

### Frameworks e Bibliotecas Principais

**React 19.1.0**
- Framework base da aplicação
- Hooks modernos para gerenciamento de estado
- Context API para estado global

**TypeScript 5.8.3**
- Tipagem estática para maior segurança
- Interfaces e tipos bem definidos
- Autocompletar e detecção de erros

**Ant Design 5.26.2**
- Biblioteca de componentes UI rica
- Design system consistente
- Componentes acessíveis e responsivos

**React Router DOM 7.6.3**
- Roteamento declarativo
- Rotas protegidas e públicas
- Navegação programática

**TanStack Query 5.85.3**
- Gerenciamento de estado do servidor
- Cache inteligente de dados
- Refetch automático
- Estados de loading e erro

### Bibliotecas de Suporte

**Axios 1.10.0**
- Cliente HTTP para API
- Interceptors para autenticação
- Tratamento de erros centralizado

**Day.js 1.11.13**
- Manipulação de datas leve e moderna
- Formatação de datas em português
- Cálculos com datas

**React Markdown 10.1.0**
- Renderização de Markdown
- Suporte a GitHub Flavored Markdown (GFM)
- Syntax highlighting para código

**Quill 2.0.3**
- Editor de texto rico
- Usado para regras da plataforma e resumos textuais
- Formatação estilo Word/Google Docs

**Nivo Charts**
- Gráficos interativos e animados
- Visualização de métricas
- Dashboard administrativo

**XLSX 0.18.5**
- Leitura de arquivos Excel
- Importação em massa de usuários
- Parsing de planilhas

**Styled Components 6.1.19**
- CSS-in-JS
- Estilos dinâmicos
- Temas e variáveis

**Starry Night**
- Syntax highlighting avançado
- Suporte a múltiplas linguagens
- Estilo dark theme

## 📂 Estrutura de Pastas

```
frontend/src/
├── assets/           # Imagens, ícones e arquivos estáticos
├── components/       # Componentes reutilizáveis
├── context/          # Contextos do React (AuthContext)
├── Global/           # Estilos e configurações globais
├── hooks/            # Hooks customizados
├── pages/            # Páginas da aplicação
├── providers/        # Providers (ReactQuery)
├── routes/           # Configuração de rotas
├── service/          # Serviços de API
├── types/            # Definições de tipos TypeScript
├── utils/            # Funções utilitárias
├── App.tsx           # Componente raiz
├── main.tsx          # Entry point
└── index.css         # Estilos globais
```

## 🌐 Rotas da Aplicação

### Rotas Públicas (Não Autenticadas)

**`/login`** - Página de Login
- Autenticação com matrícula e senha
- Opção "Permanecer conectado"
- Recuperação de senha
- Animação de fundo
- Detecção de primeiro login
- Tratamento de modo de manutenção

**`/recuperar-senha`** - Recuperação de Senha
- Formulário para envio de email
- Validação de email
- Confirmação de envio

**`/definir-senha`** - Definição de Senha Inicial
- Para novos usuários
- Validação do token
- Formulário de nova senha
- Confirmação de senha

**`/confirmar-mudanca-senha`** - Confirmação de Mudança de Senha
- Confirmação via email
- Validação do token de mudança
- Atualização de senha

### Rotas Protegidas (Autenticadas)

**`/`** - Home (Página Inicial)
- Feed de notícias da instituição
- Últimos 5 resumos postados (carrossel)
- Botão para criar resumo (alunos/professores)
- Botão para explorar resumos
- Modal de regras (primeiro acesso)
- Visualização dos últimos resumos postados

**`/summary`** - Explorar Resumos
- Busca avançada de resumos
- Filtros por:
  - Termo de busca (título/conteúdo do resúmo)
  - Matéria
  - Tipo (P1/P2/P3/PF/Outros)
  - Professor
- Paginação infinita (scroll)
- Botão para criar resumo
- Cards de resumos com preview
- Visualização completa ao clicar

**`/profile/:user_id`** - Perfil do Usuário
- Informações do usuário:
  - Nome completo
  - Role (Aluno/Professor/Administrador)
  - Contagem de resumos postados
  - Avaliações recebidas (perfeito/útil)
- Abas:
  - **Resumos postados**: Grid com resumos do usuário
  - **Salvos**: Coleções e resumos salvos
- Configurações (apenas perfil próprio):
  - Alterar senha
  - Ver advertências
- Busca e filtros nos resumos
- Paginação

**`/profile/:user_id/collection/:collection_id`** - Visualizar Coleção
- Resumos de uma coleção específica
- Mesmos filtros da página de resumos
- Opção de remover resumos da coleção
- Nome da coleção
- Contagem de itens

**`/profile/:user_id/saved`** - Resumos Salvos (Sem Coleção)
- Coleção "Geral"
- Todos os resumos salvos
- Mesmos filtros e funcionalidades das coleções criadas

**`/primeiroacesso`** - Primeiro Acesso
- Troca de senha obrigatória
- Validação de senha atual
- Definição de nova senha
- Redirecionamento após conclusão

**`/registeremail`** - Registro de Email
- Cadastro de email pelo usuário
- Validação de formato
- Envio de email de confirmação

### Rotas Administrativas (Apenas Administradores)

**`/configurations/users`** - Painel de Usuários
- Tabela com todos os usuários
- Colunas:
  - Nome completo
  - Tipo (Aluno/Professor/Admin)
  - Status (Ativo/Desativado)
  - Pode postar (Sim/Não)
  - Ações (Editar/Advertir)
- Filtros:
  - Busca por nome/matrícula
  - Tipo de usuário
  - Apenas ativos/desativados
  - Pode/não pode postar
- Funcionalidades:
  - Criar usuário individual
  - Criar usuários em massa (via planilhas)
  - Editar usuário
  - Desabilitar/habilitar usuários (Individual ou em massa)
  - Gerenciar advertências
- Paginação (5 por página)

**`/configurations/news`** - Painel de Notícias
- Cards com todas as notícias
- Informações visíveis:
  - Título
  - Conteúdo
  - Data de criação
- Busca por:
  - Termo no título/conteúdo
  - Data específica (DatePicker)
- Funcionalidades:
  - Criar notícia
  - Editar notícia
  - Deletar notícia
- Paginação (4 por página)

**`/configurations/subjects`** - Painel de Matérias
- Tabela com todas as matérias
- Colunas:
  - Sigla (Ex.: PRJ, PAV, IT2)
  - Nome da matéria
  - Professores associados
  - Ações (Editar)
- Busca por:
  - Nome da matéria
  - Sigla
  - Nome do professor
- Funcionalidades:
  - Criar matéria
  - Editar matéria
  - Deletar matéria
  - Associar/desassociar professores
- Paginação (5 por página)

**`/configurations/system`** - Configurações do Sistema
Dividido em 4 abas:

**Aba 1: Métricas**
- Gráfico de pizza: Divisão de usuários por tipo
- Gráfico de barras: Resumos por matéria
- Gráfico de linha: Uploads nos últimos 6 meses
- Estatísticas gerais do sistema

**Aba 2: Regras**
- Editor Quill para editar regras
- Toolbar de formatação
- Preview em tempo real
- Salvar alterações

**Aba 3: Manutenção**
- Ativar/desativar modo de manutenção
- Definir previsão de término
- Data e hora configuráveis
- Aviso que bloqueia todos (exceto admins)

**Aba 4: Resumos Removidos**
- Listagem de resumos marcados como apagados
- Mesmos filtros da página de resumos
- Funcionalidades:
  - Visualizar resumo deletado
  - Restaurar resumo
  - Deletar permanentemente

## 🧩 Componentes Principais

### Layout e Navegação

**MainLayout**
- Layout principal da aplicação
- Header, SideMenu e Content
- Responsivo
- Contexto de autenticação

**SideMenu**
- Menu lateral de navegação
- Itens baseados na role do usuário
- Versão mobile (drawer)
- Links para:
  - Home
  - Resumos
  - Perfil (exceto admin)
  - Configurações (apenas admin)
  - Regras
  - Sair
- Indicador visual da página atual

**Header**
- Header fixo no topo
- Logo da aplicação

### Visualização de Resumos

**CardSummary**
- Card de preview de resumo
- Informações exibidas:
  - Título
  - Tipo (P1, P2 e etc. com tag colorida)
  - Matéria e sigla
  - Nome do autor
  - Data de criação
- Click para visualizar completo

**ViewSummary**
- Modal/Drawer de visualização completa
- Renderização por tipo:
  - **Texto**: TextArea readonly
  - **Imagem**: Visualizador com zoom, rotação, flip
  - **YouTube**: Player embed responsivo
  - **Markdown**: Renderização com syntax highlight
- Informações do autor com link para perfil
- Botões de avaliação (perfeito/útil/confuso)
- Botão de salvar em coleção
- Botões de compartilhamento:
  - Copiar link
  - QR Code
  - Redes sociais (via navigator.share)
- Contador de avaliações em tempo real
- Download de imagens

### Criação de Resumos

**UploadSummary**
- Modal para criar resumo
- Formulário:
  - Título (obrigatório)
  - Matéria (obrigatório)
  - Tipo de conteúdo:
    - Texto
    - Imagem
    - Markdown (README)
    - Link do YouTube
  - Tag (obrigatório): P1/P2/P3/PF/Outros
  - Conteúdo (varia por tipo)
- Validações:
  - Campos obrigatórios
  - Formato de imagem
  - Link do YouTube válido
  - Tamanho de imagem
- Preview:
  - Markdown em tempo real
  - Imagem antes do upload
  - YouTube embed
- Conversão automática de links do YouTube
- Verificação de segurança em imagens

### Coleções

**SaveToCollection**
- Modal para salvar resumo em coleções
- Lista de coleções do usuário
- Checkbox para cada coleção
- Indicação visual se resumo já está na coleção
- Botão para criar nova coleção
- Salvar/remover de múltiplas coleções

**CreateCollection**
- Modal para criar coleção
- Input para nome da coleção
- Criação instantânea

**ProfileBookmarks**
- Grid de coleções do usuário
- Coleção "Geral" fixa
- Contagem de itens por coleção
- Click para abrir coleção
- Opções de editar/deletar
- Criação de nova coleção

### Gerenciamento (Admin)

**EditViewUser**
- Modal de edição de usuário
- Formulário com:
  - Nome
  - Sobrenome
  - Matrícula
  - Ativo
  - Pode postar
  - Razão da desativação (se inativo)
- Validações
- Opção de desativar usuário (impossibilita de acessar a plataforma)

**InsertUsers**
- Modal para criar usuários em massa
- Radio button:
  - Criação individual
  - Criação em massa (Excel)
- Upload de arquivo Excel
- Template disponível para download
- Preview dos dados
- Validação linha por linha
- Relatório de sucessos/falhas
- Campos por usuário:
  - Nome
  - Sobrenome
  - Matrícula

**EnableDisableUsers**
- Modal para habilitar/desabilitar múltiplos usuários
- Radio button: Habilitar ou Desabilitar
- Upload de arquivo Excel com matrículas
- Razão da desativação (se desabilitar):
  - Professor saiu
  - Aluno abandonou curso
  - Aluno concluiu curso
  - Aluno trancou curso
- Validação de cada matrícula
- Relatório de sucessos/falhas

**EditWarnings**
- Modal de advertências do usuário
- Lista de advertências recebidas
- Criar nova advertência:
  - Motivo
  - Descrição
- Deletar advertência
- Paginação
- Modo visualização (para o próprio usuário)

**EditViewSubject**
- Modal de edição de matéria
- Formulário:
  - Nome da matéria
  - Sigla
  - Professores (select múltiplo)
- Validações
- Opção de deletar matéria

**EditViewNews**
- Modal de edição de notícia
- Formulário:
  - Título
  - Conteúdo (textarea)
- Validações
- Opção de deletar notícia

**Rules**
- Componente de visualização/edição de regras
- Dois modos:
  - **Visualização**: Apenas leitura
  - **Edição**: Editor Quill ativo
- Toolbar de formatação (modo edição):
  - Negrito, itálico, sublinhado
  - Listas ordenadas/não ordenadas
  - Links
  - Cabeçalhos
  - Citações
  - Código
- Renderização estilo documento

**Maintenance**
- Componente de controle de manutenção
- Switch para ativar/desativar
- DatePicker para previsão de término
- Aviso visual quando ativo
- Salvamento automático

**Metrics**
- Componente de visualização de métricas
- Gráficos Nivo:
  - Pie Chart: Usuários por tipo
  - Bar Chart: Resumos por matéria
  - Line Chart: Uploads mensais
- Animações suaves
- Cores personalizadas
- Legendas interativas

**DeletedSummaries**
- Lista de resumos apagados
- Mesma estrutura da página de resumos
- Filtros e busca
- Ações:
  - Visualizar
  - Restaurar
  - Deletar permanentemente
- Confirmação antes de ações

### Utilitários e Feedback

**Loading/LoadingPage**
- Tela de carregamento
- Spinner animado
- Mensagens contextuais

**NoData**
- Componente de dados vazios
- Imagem ilustrativa (Doodle)
- Mensagem customizável
- Usado em listas vazias

**Doodle**
- Personagem ilustrativo
- Expressões customizáveis:
  - Olhos (posição)
  - Boca (estilo)
- Usado para feedback visual

**Trophy**
- Componente de troféu
- Cores por posição:
  - 1º: Colorido
  - 2º: Diamante
  - 3º: Ouro

**ChangePassword**
- Modal de mudança de senha
- Formulário:
  - Senha atual
  - Nova senha
  - Confirmação
- Validações
- Envio de email de confirmação

**ReadmeMarkdown**
- Renderizador de Markdown
- Syntax highlighting
- GitHub Flavored Markdown
- Estilos customizados

**LinkCard**
- Transforma URLs de texto em links clicáveis
- Detecção automática de URLs
- Abertura em nova aba
- Estilos consistentes

## 🎨 Temas e Estilos

### Paleta de Cores

**Cores Principais**
- Azul primário: `#1890ff`
- Azul escuro: `#001529`
- Verde sucesso: `#52c41a`
- Vermelho erro: `#ff4d4f`
- Amarelo aviso: `#faad14`

**Cores de Tags (Tipos de Resumo)**
- P1: `#31ff64` (Verde)
- P2: `#1affec` (Ciano)
- P3: `#ff29bf` (Rosa)
- PF: `#ff4545` (Vermelho)
- Outros: `#ff9924` (Laranja)

**Cores de Roles**
- Professor: `#108ee9` (Azul)
- Administrador: `#eb5656` (Vermelho)
- Aluno: `#b86ded` (Roxo)

**Gradientes**
- Header cards: Gradiente linear azul

### Responsividade

**Breakpoints (Padrão do Ant Design)**
- `xs`: < 576px (Mobile pequeno)
- `sm`: ≥ 576px (Mobile)
- `md`: ≥ 768px (Tablet)
- `lg`: ≥ 992px (Desktop pequeno)
- `xl`: ≥ 1200px (Desktop)
- `xxl`: ≥ 1600px (Desktop grande)

**Adaptações por Dispositivo**
- **Mobile**: Menu hambúrguer, cards em coluna, fontes menores
- **Tablet**: Layout intermediário, 2 colunas em grid
- **Desktop**: Menu lateral fixo, múltiplas colunas, sidebar

## 🔐 Autenticação e Autorização

### Contexto de Autenticação

**AuthContext**
Gerencia o estado de autenticação:
- `user`: Dados do usuário logado
- `setUser`: Atualiza dados do usuário
- `checkAuth`: Verifica autenticação
- `loading`: Estado de carregamento

Armazenamento:
- `localStorage`: Token (se "manter conectado")
- `sessionStorage`: Token (sessão temporária)
- Limpeza automática ao fazer logout

### Rotas Protegidas

**ProtectedRoute**
- Verifica se usuário está autenticado
- Redireciona para login se não autenticado
- Verifica token válido
- Mantém query parameters de redirecionamento

**LoginRoute**
- Redireciona usuários autenticados
- Permite acesso apenas sem autenticação
- Preserva rota de destino

### Interceptors Axios

**Request Interceptor**
- Adiciona token em todas as requisições
- Header: `Authorization: Bearer {token}`
- Busca token em localStorage ou sessionStorage

**Response Interceptor**
- Detecta erro 401 (Não autorizado)
- Redireciona automaticamente para login
- Limpa tokens inválidos
- Preserva rota para retorno

### Controle por Role

Funcionalidades por tipo de usuário:

**Aluno**
- Ver resumos
- Criar resumos
- Avaliar resumos
- Deletar seus resumos (definitivamente e somente se o administrador não tiver deletado = 'soft delete')
- Salvar em coleções
- Ver perfil próprio/de outros usuários
- Compartilhar resumos

**Professor**
- Tudo do aluno

**Administrador**
- Ver resumos (não criar)
- Não avaliar resumos
- Acesso a dashboards administrativos
- Gerenciar usuários/matérias/notícias
- Ver métricas do sistema
- Configurar manutenção
- Editar regras
- Deletar resumos ('soft delete' ou definitivamente)
- Ver resumos deletados (pelo soft delete)

Menu lateral mostra opções conforme role.

## 📊 Gerenciamento de Estado

### React Query (TanStack Query)

**Configuração**
- Stale time: 5 minutos (padrão)
- Refetch on window focus: Desabilitado
- Retry: 1 tentativa
- Cache automático

**Queries Principais**
- `users`: Lista de usuários (admin)
- `subjects`: Lista de matérias
- `news`: Lista de notícias
- `summaries`: Lista de resumos
- `userProfile`: Perfil de usuário
- `collections`: Coleções do usuário

**Infinite Queries**
- Resumos com scroll infinito
- Cache de páginas anteriores

### Hooks Personalizados

**useDebounce**
- Debounce de 500ms
- Usado em campos de busca
- Evita requisições excessivas
- Melhora performance

**useStorageMonitor**
- Monitora mudanças em localStorage/sessionStorage
- Atualiza estado de autenticação

**useSetUser**
- Salva dados do usuário após login
- Armazena em localStorage ou sessionStorage
- Define header de autenticação
- Retorna função `setUser`

### Estado Local (useState)

Usado para:
- Estados de formulários
- Modais abertos/fechados
- Filtros de busca
- Estados de loading
- Dados temporários
- UI states (mobile menu, etc)

## 🔄 Fluxos de Usuário

### Fluxo de Login e Primeiro Acesso

1. **Login Inicial**
   - Usuário acessa `/login`
   - Informa matrícula e senha (senha = matrícula inicialmente)
   - Sistema detecta primeiro login
   - Redireciona para `/primeiroacesso`
   - Flag `firstLogin` salva em sessionStorage

2. **Primeiro Acesso**
   - Usuário obrigado a trocar senha
   - Valida senha atual (matrícula)
   - Define nova senha (mínimo 8 caracteres)
   - Confirmação de senha obrigatória
   - Sistema salva nova senha
   - Remove flag `primeiro_login` no backend
   - Redireciona para home

3. **Definição de Email**
   - Modal pode aparecer sugerindo cadastro
   - Usuário informa email
   - Recebe email de confirmação
   - Clica no link do email
   - Email é validado e salvo

4. **Apresentação das Regras**
   - No primeiro login, modal de regras abre automaticamente
   - Usuário lê as regras da plataforma
   - Pode reabrir pelo menu lateral a qualquer momento

### Fluxo de Criação de Resumo

1. **Acesso ao Formulário**
   - Usuário clica em "Criar resumo" (Página Inicio ou Resumos)
   - Modal `UploadSummary` abre
   - Carrega lista de matérias

2. **Preenchimento**
   - Seleciona matéria (obrigatório)
   - Define título (obrigatório)
   - Seleciona tipo de conteúdo:
     - **Texto**: TextArea simples
     - **Imagem**: Upload com preview e validação
     - **Markdown**: Editor com preview em tempo real
     - **YouTube**: Input de link com conversão automática
   - Seleciona tag: P1/P2/P3/PF/Outros (obrigatório)

3. **Validações**
   - Campos obrigatórios preenchidos
   - Imagem: formato válido, tamanho, segurança
   - YouTube: link válido e conversível
   - Markdown: não vazio

4. **Submissão**
   - Click em "Publicar"
   - Loading durante upload
   - Mensagem de sucesso/erro
   - Modal fecha
   - Lista de resumos atualiza automaticamente (React Query)

### Fluxo de Visualização e Avaliação

1. **Acesso ao Resumo**
   - Usuário clica em card de resumo
   - Modal `ViewSummary` abre
   - Carrega dados completos do resumo
   - Se tipo imagem, carrega imagem

2. **Visualização**
   - Renderiza conteúdo conforme tipo
   - Mostra informações do autor
   - Exibe contadores de avaliações
   - Mostra avaliação do usuário (se houver)

3. **Avaliação**
   - Usuário clica em botão de avaliação
   - Opções: Perfeito / Útil / Confuso
   - Se já avaliou, pode mudar ou remover
   - Requisição para API
   - Contadores atualizam em tempo real
   - Botão selecionado destaca visualmente

4. **Outras Ações**
   - **Salvar em coleção**: Abre modal SaveToCollection
   - **Compartilhar**: 
     - Copia link
     - Gera QR Code
     - Baixar QR Code
     - Share nativo
   - **Download** (Exceto tipo do tipo youtube): Baixa arquivo
   - **Copiar conteúdo** (Exceto tipo do tipo youtube): Copia o conteúdo do resumo

### Fluxo de Coleções

1. **Criação de Coleção**
   - Usuário vai ao perfil
   - Aba "Salvos"
   - Click em "Nova coleção"
   - Informa nome
   - Coleção criada

2. **Salvar Resumo**
   - Em qualquer resumo, click em "Salvar"
   - Modal lista coleções do usuário
   - Checkbox em coleções desejadas
   - Indicação visual se já está salvo
   - Click em "Salvar"
   - Resumo adicionado às coleções

3. **Visualizar Coleção**
   - No perfil, aba "Salvos"
   - Grid de coleções
   - Click em uma coleção
   - Navega para `/profile/:user_id/collection/:collection_id`
   - Lista resumos da coleção
   - Filtros e busca disponíveis

4. **Gerenciar**
   - Editar nome da coleção
   - Remover resumos da coleção
   - Deletar coleção

### Fluxo Administrativo

**Gerenciamento de Usuários**

1. **Acesso**
   - Admin acessa `/configurations/users`
   - Tabela com todos os usuários carrega

2. **Criação Individual**
   - Click em "Adicionar usuário(s)"
   - Seleciona "Individual"
   - Preenche formulário:
     - Nome, sobrenome, matrícula
     - Role (aluno/professor/admin)
   - Submete
   - Usuário criado com senha = matrícula

3. **Criação em Massa**
   - Click em "Adicionar usuário(s)"
   - Seleciona "Em massa"
   - Faz download do template Excel
   - Preenche planilha:
     - Nome, Sobrenome, Matrícula por linha
   - Upload do arquivo
   - Sistema valida cada linha
   - Exibe relatório de sucessos e falhas
   - Usuários válidos são criados

4. **Desabilitar Múltiplos**
   - Click em "Habilitar/Desabilitar usuário(s)"
   - Seleciona "Desabilitar"
   - Upload Excel com matrículas
   - Seleciona razão da desativação
   - Sistema processa cada matrícula
   - Exibe relatório

5. **Edição Individual**
   - Click em editar ao lado do usuário
   - Modal abre com dados atuais
   - Modifica campos desejados:
     - Nome
     - Sobrenome
     - Matrícula
     - Pode postar
     - Ativo/Desativado
   - Salva alterações

6. **Advertências**
   - Click em advertir ao lado do aluno
   - Lista advertências existentes
   - Pode criar nova ou deletar
   - Aluno vê no perfil dele

**Gerenciamento de Matérias**

1. **Criação**
   - Click em "Adicionar"
   - Preenche nome e sigla
   - Seleciona professores (múltiplo)
   - Salva matéria

2. **Edição**
   - Click em editar
   - Modifica campos
   - Adiciona/remove professores
   - Salva alterações

**Gerenciamento de Notícias**

1. **Criação**
   - Click em "Adicionar"
   - Preenche título e conteúdo
   - Preview do conteúdo
   - Publica notícia

2. **Edição**
   - Click em editar
   - Modifica campos
   - Salva alterações

## 🎯 Funcionalidades Especiais

### Busca Inteligente

**Características**
- Debounce de 500ms
- Busca em múltiplos campos simultaneamente
- Filtros combinados (matéria + tipo + professor + termo)
- Resultados em tempo real
- Paginação/scroll infinito
- Cache de resultados

**Onde Está Disponível**
- Página de resumos
- Coleções
- Perfil de usuário
- Dashboards administrativos
- Busca de matérias
- Busca de notícias

### Preview em Tempo Real

**Markdown/README**
- Editor
- Preview
- Debounce de 1s (para desempenho)
- Syntax highlighting

**Imagem**
- Preview antes do upload
- Dimensões e tamanho
- Validação visual

**YouTube**
- Conversão automática do link
- Embed player
- Thumbnail preview

### Compartilhamento

**Link Direto**
- Copia URL do resumo
- Query parameter `?summary=ID`
- Abre resumo diretamente ao acessar

**QR Code**
- Gera QR Code do link

**Share Nativo (Mobile)**
- Usa API `navigator.share`
- Compartilha via apps do dispositivo
- Fallback para copiar link

### Responsividade Avançada

**Adaptações Mobile**
- Menu hambúrguer com overlay
- Cards em coluna única
- Tabs scrolláveis
- Formulários empilhados
- Botões full-width
- Fontes maiores para legibilidade

**Adaptações Tablet**
- Menu lateral colapsável
- Cards médios

**Adaptações Desktop**
- Menu lateral fixo
- Múltiplas colunas
- Sidebar com últimos resumos
- Carrosséis e grids
- Tabelas completas

### Upload de Arquivos

**Excel (.xlsx)**
- Parsing com biblioteca XLSX
- Validação de estrutura
- Leitura de múltiplas linhas
- Relatório detalhado
- Templates disponíveis

**Imagens**
- Formatos: JPEG, JPG, PNG, GIF, SVG, WEBP, AVIF
- Conversão para Base64
- Verificação de segurança
- Compressão automática (se necessário)
- Preview antes do upload

### Animações e Transições

**Carregamentos**
- Skeletons em cards
- Spinners contextualizados
- Fade in/out suaves

**Modais e Drawers**
- Slide in/out
- Backdrop com fade
- Bounce effect em alguns elementos

**Hover Effects**
- Mudança de cor em botões
- Shadow em cards
- Underline em links

**Navegação**
- Page transitions suaves
- Highlight de item ativo no menu

### Validações de Formulários

**Campos Obrigatórios**
- Marcação visual com *
- Mensagem de erro específica
- Bloqueio de submissão

**Formatos Específicos**
- Email: validação de formato
- URL: validação de link
- Senha: mínimo 8 caracteres

**Validações Assíncronas**
- Email único
- Matrícula única
- Token válido (recuperação senha)

**Feedback Imediato**
- Mensagens de erro embaixo do campo
- Ícone de erro/sucesso
- Cor do border alterada

### Tratamento de Erros

**Erros de Rede**
- Mensagem amigável
- Mantém estado do formulário

**Erros de Validação**
- Lista de erros múltiplos

**Erros de Autenticação**
- Redirecionamento para login
- Mensagem de sessão expirada
- Preserva rota de retorno

### Otimizações de Performance

**Memoization**
- `useMemo` para cálculos/componentes custosos
- `useCallback` para funções
- React Query cache

**Debounce**
- Campos de busca

## 📱 Experiência Mobile

### Menu Mobile
- Hambúrguer no topo
- Overlay escurece fundo
- Menu slide from left
- Itens empilhados verticalmente
- Fechamento automático ao navegar

### Gestures
- Zoom em imagens


### Layout Adaptado
- Cards ocupam largura total
- Tabs horizontais scrolláveis
- Botões full-width
- Espaçamento otimizado para toque
- Fontes maiores

### Otimizações
- Imagens responsivas
- Vídeos adaptados
- Cache agressivo

## 🔧 Configuração e Deploy

### Variáveis de Ambiente

```env
VITE_API_URL=https://api.exemplo.com
VITE_APP_NAME=Resumos Colaborativo
```

### Build

```bash
# Instalar dependências
npm install

# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview

# Lint
npm run lint
```

### Estrutura do Build

```
dist/
├── assets/        # JS, CSS, imagens
├── index.html     # HTML principal
└── ...
```

## 📊 Métricas e Analytics

### Dados Coletados (Admin)

**Usuários**
- Total por tipo

**Resumos**
- Total geral
- Por matéria
- Uploads por mês

**Engajamento**
- Avaliações por resumo
- Resumos salvos
- Usuários ativos

## 🎓 Boas Práticas Implementadas

### Código

✅ **TypeScript em todo o projeto**
- Tipos definidos para todas as entidades
- Interfaces para props de componentes
- Type safety em requisições

✅ **Componentização**
- Componentes pequenos e reutilizáveis
- Props bem definidas

✅ **Hooks personalizados**
- Lógica reutilizável
- Abstração de complexidade

✅ **Error Boundaries**
- Captura de erros em componentes

### Performance

✅ **Lazy Loading**
- Imagens carregadas progressivamente
- Componentes sob demanda
- Infinite scroll

✅ **Caching Inteligente**
- React Query gerencia cache

### UX/UI

✅ **Loading States**
- Feedback visual em toda ação assíncrona
- Skeletons em carregamentos

✅ **Error Handling**
- Mensagens amigáveis
- Opções de recuperação
- Não trava a aplicação

✅ **Acessibilidade**
- Semântica HTML correta
- ARIA labels onde necessário
- Navegação por teclado
- Contraste adequado

✅ **Responsividade**
- Mobile
- Breakpoints bem definidos

### Segurança

✅ **Sanitização de Inputs**
- Validação de dados do usuário
- Escape de HTML em renders
- Prevenção de XSS

✅ **Tokens Seguros**
- Armazenamento apropriado
- Renovação automática
- Limpeza ao logout


## 🚀 Roadmap Futuro

### Funcionalidades Planejadas

**Notificações**
- Push notifications
- Badge de notificações não lidas

**Chat**
- Comentários em resumos
- Chat entre usuários

**Modo Escuro**
- Toggle dark/light theme
- Persistência de preferência
- Transição suave

**Melhorias de Busca**
- Filtros salvos
- Histórico de busca
- Sugestões inteligentes baseado no histórico

**Gamificação Avançada**
- Badges e conquistas
- Níveis de usuário
- Desafios semanais

**Relatórios (Admin)**
- Exportar dados em PDF
- Gráficos customizados
- Dashboards personalizados
- Relatórios automáticos

**Integrações**
- Google Drive
- OneDrive
- Notion
- Trello


*

---

**Versão**: 1.0.0  
**Autor**: Natan Altomar <natan.altomar14@gmail.com>
