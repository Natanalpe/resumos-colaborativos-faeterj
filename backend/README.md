# Resumos Colaborativo Faeterj - Backend

## 📋 Sobre a Plataforma

A plataforma **Resumos Colaborativo Faeterj** é um sistema acadêmico desenvolvido para facilitar o compartilhamento e organização de resumos entre alunos e professores da instituição. O objetivo principal é criar um ambiente colaborativo onde estudantes podem postar, avaliar e salvar resumos de diferentes matérias, incentivando o aprendizado compartilhado.

## 🎯 Propósito

O sistema foi criado para resolver os seguintes problemas:
- **Centralização de Conteúdo**: Ter um local único onde todos os resumos e materiais de estudo ficam organizados
- **Compartilhamento Colaborativo**: Permitir que alunos compartilhem conhecimento entre si
- **Garantia de Qualidade**: Sistema de avaliação que ajuda a identificar os melhores resumos
- **Incentivo à Contribuição**: Sistema de ranking que gamifica a participação dos alunos
- **Organização Pessoal**: Permite que cada usuário organize seus resumos favoritos em coleções

## 👥 Tipos de Usuários

### 1. **Aluno**
- Pode postar resumos de diferentes formatos
- Pode avaliar resumos de outros usuários
- Pode salvar resumos em coleções pessoais
- Participa do sistema de ranking
- Pode visualizar advertências

### 2. **Professor**
- Todas as funcionalidades do aluno
- Suas avaliações têm peso 3x maior no sistema de pontuação
- Pode ser associado a matérias específicas
- Contribui para validar a qualidade do conteúdo

### 3. **Administrador**
- Gerencia todos os usuários (criar, editar, desabilitar)
- Gerencia matérias do sistema
- Gerencia notícias da plataforma
- Pode advertir usuários
- Pode deletar/restaurar resumos inadequados
- Acessa dashboard com estatísticas do sistema
- Gerencia regras da plataforma
- Controla modo de manutenção
- Acesso mesmo durante manutenção

## 📚 Funcionalidades Principais

### 1. Sistema de Autenticação

#### Login
- Autenticação por matrícula e senha
- Opção "manter conectado" (token válido por 1 mês)
- Detecção de primeiro login
- Bloqueio automático durante modo de manutenção (exceto administradores)
- Registro de logs de todas as ações de autenticação

#### Recuperação de Senha
- Envio de email com token de recuperação
- Token válido por 24 horas
- Validação de token antes da alteração
- Suporte para usuários que ainda não definiram senha

#### Definição de Senha Inicial
- Processo em duas etapas para novos usuários
- Envio de email com link seguro
- Validação de senha com requisitos mínimos (8 caracteres)
- Confirmação de senha obrigatória

#### Mudança de Senha
- Usuários autenticados podem solicitar mudança
- Email de confirmação obrigatório
- Validação da senha atual antes da mudança
- Marcação automática de uso de senha personalizada

### 2. Sistema de Resumos (Documentos)

#### Tipos de Resumos Suportados
1. **Texto (txt)**: Resumo em formato texto simples
2. **README**: Resumo formatado em Markdown
3. **Link do YouTube (youtube_link)**: Links para vídeos educativos
4. **Imagem**: Upload de imagens (com verificação de segurança)

#### Tags dos Resumos
Os resumos podem ser categorizados por tipo de conteúdo:
- P1, P2, P3 (provas)
- Outros

#### Funcionalidades de Resumos

**Criação de Resumos**
- Upload de diferentes formatos
- Verificação de segurança para imagens (detecção de scripts maliciosos)
- Associação automática com matéria
- Registro de logs de upload
- Validação de conteúdo antes do salvamento

**Busca de Resumos**
- Busca por termo no título ou conteúdo
- Filtros por:
  - Matéria
  - Professor responsável
  - Tipo de resumo (tag)
- Ordenação por data de criação
- Paginação (5 resumos por página)
- Busca de resumos de usuário específico
- Busca de últimos resumos postados

**Visualização de Resumos**
- Visualização completa do resumo
- Informações do autor
- Contagem de avaliações (perfeito, útil, confuso)
- Avaliação do usuário logado (se houver)
- Dados da matéria associada

**Exclusão de Resumos**
- **Usuário comum**: Pode deletar definitivamente seus próprios resumos
- **Administrador**: 
  - Marca resumo como "apagado" (soft delete)
  - Pode restaurar resumos marcados como apagados
  - Pode deletar definitivamente resumos do dashboard
  - Mantém histórico de conteúdo inadequado

**Gestão de Imagens**
- Armazenamento em base64 no banco de dados
- Verificação de segurança antes do upload
- Endpoint específico para recuperação de imagens
- Retorno de imagem como PNG

### 3. Sistema de Coleções

As coleções funcionam como "pastas" onde usuários podem organizar resumos salvos.

#### Características
- **Públicas**: Todos podem ver as coleções de qualquer usuário
- **Organizadas**: Resumos mantêm ordem dentro da coleção
- **Pesquisáveis**: Busca dentro das coleções com filtros
- **Sem limite**: Usuários podem criar quantas coleções quiserem

#### Funcionalidades de Coleções

**Gerenciamento de Coleções**
- Criar nova coleção (com nome personalizado)
- Editar nome da coleção
- Deletar coleção
- Visualizar coleções de qualquer usuário
- Paginação de coleções (4 por página)
- Contagem de documentos por coleção

**Gerenciamento de Documentos nas Coleções**
- Adicionar resumo à coleção
- Remover resumo da coleção
- Sistema de ordenação automática
- Busca de resumos dentro de coleção específica
- Busca em todos os resumos salvos (Coleção "Geral")
- Verificar em quais coleções um resumo está salvo

**Coleção Especial: "Geral"**
- Visualização de todos os resumos salvos, independente da coleção
- Mesmos filtros de busca disponíveis
- Facilita acesso rápido ao conteúdo salvo

### 4. Sistema de Avaliação (Reviews)

Sistema de feedback da qualidade dos resumos.

#### Tipos de Avaliação
1. **Perfeito**
   - Indica conteúdo de excelente qualidade
   - Vale 5 pontos para o autor
   - Vale 15 pontos se a avaliação for de um professor
   
2. **Útil**
   - Indica conteúdo bom e útil
   - Vale 3 pontos para o autor
   - Vale 9 pontos se a avaliação for de um professor
   
3. **Confuso**
   - Indica conteúdo que precisa melhorias
   - Vale 0 pontos para o autor

#### Características
- Cada usuário pode dar apenas uma avaliação por resumo
- Avaliação pode ser alterada a qualquer momento
- Avaliação pode ser removida
- Professores têm peso 3x maior nas avaliações
- Sistema automático de contabilização de pontos

### 5. Sistema de Ranking

Sistema de gamificação para incentivar contribuições de qualidade.

#### Como Funciona
- **Baseado em Pontos**: Cada interação positiva gera pontos
- **Apenas Alunos**: Somente alunos participam do ranking
- **Multiplicador de Professor**: Avaliações de professores valem 3x mais
- **Atualização Automática**: Pontuação calculada em tempo real

#### Cálculo de Pontos
```
Pontuação Total = total de avaliações dos resumos do usuário

Onde:
- "Perfeito" de aluno = 5 pontos
- "Perfeito" de professor = 15 pontos
- "Útil" de aluno = 3 pontos
- "Útil" de professor = 9 pontos
- "Confuso" = 0 pontos
```

#### Visualização do Ranking
- Paginação de 20 usuários por página
- Exibição de posição no ranking
- Nome completo do aluno
- Pontuação total
- Ordenação automática por pontuação (decrescente)

#### Objetivo
Incentivar alunos a:
- Postarem conteúdo de qualidade
- Contribuírem regularmente
- Ajudarem colegas com bons materiais
- Receberem reconhecimento da comunidade

### 6. Sistema de Matérias

Gerenciamento das disciplinas oferecidas pela instituição.

#### Dados da Matéria
- **Nome**: Nome completo da disciplina
- **Sigla**: Abreviação da disciplina
- **Professores**: Lista de professores responsáveis

#### Funcionalidades

**CRUD de Matérias** (Apenas Administradores)
- Criar nova matéria
- Editar matéria existente
- Deletar matéria
- Associar/desassociar professores
- Buscar matéria por ID
- Listar todas as matérias

**Busca de Matérias**
- Busca por nome da matéria
- Busca por sigla
- Busca por nome do professor
- Com ou sem paginação (5 por página)
- Retorna professores associados

**Relação com Professores**
- Uma matéria pode ter vários professores
- Um professor pode lecionar várias matérias
- Associação via tabela pivot no banco de dados
- Atualização sincronizada de professores

#### Integração com Resumos
- Resumos são vinculados a matérias
- Filtros de busca utilizam matérias
- Facilita organização do conteúdo
- Permite busca por professor da matéria

### 7. Sistema de Notícias

Sistema de comunicação oficial da plataforma.

#### Características
- **Gestão**: Apenas administradores podem gerenciar
- **Visibilidade**: Todos os usuários podem visualizar
- **Organização**: Ordenadas por data de criação
- **Paginação**: 4 notícias por página

#### Funcionalidades

**CRUD de Notícias** (Apenas Administradores)
- Criar notícia (título + conteúdo)
- Editar notícia existente
- Deletar notícia
- Autor registrado automaticamente

**Visualização de Notícias**
- Listar todas as notícias (paginado)
- Buscar notícia por ID
- Exibe autor da notícia
- Ordenação cronológica

**Busca de Notícias** (Apenas administradores em seu dashboard)
Filtros disponíveis:
- Busca por termo (título ou conteúdo)
- Busca por data (dia/mês/ano)
- Busca por mês (por extenso)
- Busca por data formatada (DD/MM/YYYY)

Exemplos de busca:
- "prova" → encontra notícias com a palavra
- "2024" → encontra notícias do ano
- "janeiro" → encontra notícias de janeiro
- "15/03/2024" → encontra notícias específicas do dia

#### Casos de Uso
- Avisos importantes da instituição
- Comunicados sobre eventos
- Mudanças no sistema
- Datas de provas
- Informações administrativas

### 8. Sistema de Usuários

Gerenciamento completo de usuários da plataforma.

#### Dados do Usuário
- Nome e Sobrenome
- Matrícula (única)
- Email
- Role (aluno/professor/administrador)
- Senha (criptografada)
- Status ativo/inativo
- Permissão para postar
- Razão de desativação (quando aplicável)

#### Funcionalidades

**CRUD de Usuários** (Apenas Administradores)

**Criação Individual**
- Criar usuário manualmente
- Senha inicial = matrícula
- Marcação de primeiro login
- Validação de matrícula única
- Apenas admin principal pode criar outros admins

**Criação em Massa**
- Upload de múltiplos usuários de uma vez
- Validação individual de cada usuário
- Retorno de sucessos e falhas detalhado
- Ideal para início de semestre

**Atualização de Usuários**
- Editar dados pessoais
- Alterar role
- Alterar permissões
- Proteção: apenas admin principal pode editar admins

**Desativação de Usuários**
Sistema de desativação (não deleta do banco):

Desativação Individual:
- Requer razão da desativação
- Remove tokens de acesso
- Impede login do usuário
- Mantém histórico completo

Desativação em Massa:
- Desativar múltiplos usuários por matrícula
- Motivos disponíveis:
  - Professor saiu
  - Aluno abandonou curso
  - Aluno concluiu curso
  - Aluno trancou curso
- Retorno de sucessos e falhas

Proteções de Segurança:
- Admin não pode desativar a si mesmo
- Admin principal não pode ser desativado
- Admin comum não pode desativar outros admins

**Reativação de Usuários**

Reativação Individual:
- Remove razão de desativação
- Permite login novamente

Reativação em Massa:
- Reativar múltiplos usuários por matrícula
- Retorno de sucessos e falhas
- Validação de cada matrícula

**Busca de Usuários** (Apenas administradores)
- Busca por nome
- Busca por sobrenome
- Busca por matrícula
- Busca por nome completo
- Filtros:
  - Por role (aluno/professor/todos)
  - Por status ativo
  - Por permissão de postar
- Paginação (5 por página)

**Visualização de Usuários**
- Listar todos (exceto administradores)
- Buscar por ID
- Buscar apenas professores (para associação com matérias)
- Buscar por role específica
- Ordenação por status ativo

**Perfil do Usuário**
Dados exibidos no perfil:
- Informações básicas (nome, sobrenome, role)
- Contagem de resumos postados
- Estatísticas de avaliações recebidas:
  - Quantidade de "perfeito"
  - Quantidade de "útil"
  - Quantidade de "confuso" não é mostrado para não constranger o usuário

#### Primeiro Login
- Usuário é criado com senha = matrícula
- No primeiro login, é forçado a alterar senha
- Flag `primeiro_login` é alterada após definir nova senha
- Senha deve ter mínimo 8 caracteres

#### Senha Inicial
- Todos os usuários são criados com senha = matrícula
- Marcados como "usando primeira senha"
- Devem alterar no primeiro acesso
- Sistema de recuperação disponível

### 9. Sistema de Advertências

Sistema de controle disciplinar para usuários.

#### Características
- **Gestão**: Apenas administradores podem criar/deletar
- **Privacidade**: Usuário só vê suas próprias advertências
- **Notificação**: Contador visível no perfil do usuário
- **Histórico**: Mantém registro de todas as advertências

#### Funcionalidades

**Gestão de Advertências** (Apenas Administradores)
- Criar advertência para usuário específico
- Deletar advertência
- Adicionar motivo/descrição da advertência

**Visualização de Advertências**
- Usuário visualiza apenas suas advertências
- Administrador visualiza todas
- Buscar advertência específica por ID
- Listar todas de um usuário (paginado)
- Contador de advertências total

**Segurança e Privacidade**
- Validação de autorização em todas as requisições
- Usuário comum não acessa advertências de outros
- Administrador tem acesso completo
- Logs de todas as ações

#### Integração com Perfil
- Notificação no perfil quando há advertências
- Quantidade exibida de forma destacada
- Link para visualizar detalhes
- Incentiva usuário a manter bom comportamento

#### Casos de Uso por exemplo:
- Conteúdo inadequado postado
- Comportamento impróprio
- Violação das regras da plataforma

### 10. Sistema de Gerenciamento (SystemController)

Funcionalidades administrativas do sistema.

#### Dashboard do Administrador

**Estatísticas em Tempo Real**

1. **Divisão de Usuários**
   - Contagem de alunos ativos
   - Contagem de professores ativos
   - Contagem de administradores ativos
   - Visualização gráfica da distribuição

2. **Resumos por Matéria**
   - Quantidade total de resumos por disciplina
   - Ordenação por quantidade (mais populares)
   - Identificação de matérias com mais conteúdo
   - Pode auxilia na identificação de lacunas de conteúdo

3. **Atividade de Upload**
   - Histórico de quantidade dos últimos 6 meses
   - Agrupamento por mês
   - Visualização de tendências
   - Identificação de períodos de maior atividade
   - Formato: YYYY-MM

**Casos de Uso do Dashboard**
- Identificação de tendências
- Planejamento de ações administrativas
- Relatórios gerenciais
- Tomada de decisões baseada em dados

#### Regras da Plataforma

**Gerenciamento de Regras**
- Criação/atualização de regras
- Armazenamento em formato JSON (para a biblioteca Quill)
- Formatação rica de texto
- Editor visual no frontend

**Formato Quill**
- Biblioteca para edição de texto rico
- Suporta formatação (negrito, itálico, listas)
- Permite estruturação de documentos
- Renderização consistente

**Visualização de Regras**
- Todos os usuários podem visualizar
- Formato similar a documento Word/Google Docs
- Sempre disponível para consulta

**Casos de Uso**
- Termos de uso da plataforma
- Diretrizes de postagem
- Código de conduta
- Políticas acadêmicas

#### Modo de Manutenção

**Funcionalidades**

Ativação/Desativação:
- Apenas administradores podem controlar
- Previsão de término da manutenção
- Data/hora estimada de retorno

Comportamento Durante Manutenção:
- Bloqueia acesso de usuários comuns(alunos e professores)
- Permite acesso de administradores
- Exibe mensagem com previsão de retorno

Middleware de Verificação:
- Verificação automática em toda requisição
- Retorna código 503 (Service Unavailable)
- Inclui estimativa de fim da manutenção
- Exceção apenas para administradores

**Dados Armazenados**
- Status de manutenção (ativo/inativo)
- Data/hora de início
- Previsão de término
- Data/hora de última atualização

**Casos de Uso**
- Atualizações do sistema
- Manutenção do banco de dados
- Correção de bugs críticos
- Implementação de novas funcionalidades
- Backup do sistema

**Endpoint de Verificação**
- Endpoint público para verificar status
- Frontend pode adaptar interface
- Mensagem personalizada para usuários
- Informação de quando voltará

### 11. Sistema de Email

Sistema de comunicação por email com os usuários.

#### Tipos de Email

1. **Email de Definição de Senha Inicial**
   - Enviado quando usuário precisa definir senha pela primeira vez
   - Contém token único válido por 24 horas
   - Link direto para página de definição
   - Nome do usuário personalizado

2. **Email de Recuperação de Senha**
   - Enviado quando usuário esquece a senha
   - Token seguro de uso único
   - Válido por 24 horas
   - Remove tokens antigos automaticamente

3. **Email de Confirmação de Mudança de Senha**
   - Enviado quando usuário autenticado solicita mudança
   - Requer confirmação por email
   - Token de segurança
   - Válido por 1 hora

#### Fluxo de Definição de Senha Inicial

**Etapa 1: Solicitação**
- Usuário novo acessa plataforma
- Informa email para cadastro
- Sistema valida se email já existe
- Gera token único de 64 caracteres

**Etapa 2: Envio do Email**
- Email com link personalizado
- Token criptografado no banco
- Data de criação registrada
- Nome do usuário incluído

**Etapa 3: Validação do Token**
- Usuário clica no link
- Sistema valida se token existe
- Verifica se não está expirado (24h)
- Retorna email associado se válido

**Etapa 4: Definição da Senha**
- Usuário define nova senha
- Mínimo 8 caracteres
- Confirmação obrigatória
- Token marcado como usado
- Flag `primeiro_login` atualizada

#### Fluxo de Recuperação de Senha

**Etapa 1: Solicitação**
- Usuário informa email
- Sistema verifica se email existe
- Remove requisições antigas
- Gera novo token de 64 caracteres

**Etapa 2: Envio do Email**
- Email com link de recuperação
- Token criptografado
- Nome do usuário
- Instruções claras

**Etapa 3: Validação**
- Sistema valida token
- Verifica expiração (24h)
- Confirma que não foi usado
- Retorna email se válido

**Etapa 4: Reset da Senha**
- Usuário define nova senha
- Mínimo 8 caracteres
- Confirmação obrigatória
- Token marcado como usado
- Flag `usando_primeira_senha` = false

#### Fluxo de Mudança de Senha (Autenticado)

**Etapa 1: Solicitação**
- Usuário logado solicita mudança
- Informa senha atual
- Informa nova senha
- Sistema valida senha atual

**Etapa 2: Verificações**
- Valida se email está cadastrado
- Valida senha atual
- Remove solicitações antigas não confirmadas
- Gera token único

**Etapa 3: Email de Confirmação**
- Envia email de confirmação
- Token válido por 1 hora
- Nome do usuário
- Link de confirmação

**Etapa 4: Confirmação**
- Usuário clica no link do email
- Sistema valida token
- Verifica expiração (1h)
- Aplica nova senha
- Marca solicitação como confirmada

#### Segurança

**Tokens**
- Gerados com 64 caracteres aleatórios
- Armazenados com hash no banco
- Válidos por tempo limitado
- Uso único (marcados após uso)
- Remoção automática de tokens antigos

**Validações**
- Email deve existir no sistema
- Verificação de senha atual (quando aplicável)
- Confirmação de senha obrigatória
- Senhas com requisitos mínimos
- Limite de tempo para tokens

**Proteções**
- Não revela se email existe (recuperação)
- Tokens criptografados
- Remoção de tokens expirados
- Logs de todas as ações
- Validação de origem da requisição

#### Dados Armazenados

**Tabela `password_resets`**
- Email do usuário
- Token (hash)
- Status usado/não usado
- Data de criação
- Data de atualização

**Tabela `password_change_requests`**
- ID do usuário
- Token (hash)
- Hash da nova senha
- Status confirmado
- Data de criação

#### Templates de Email

Todos os emails incluem:
- Nome personalizado do usuário
- Link direto para ação
- Instruções claras
- Tempo de validade

## 🗄️ Arquitetura do Sistema

### Models (Modelos de Dados)

1. **User**: Usuários do sistema (alunos, professores, administradores)
2. **Summaries (Documentos)**: Resumos postados na plataforma
3. **Subjects (Matérias)**: Disciplinas da instituição
4. **Collections (Coleções)**: Pastas de organização de resumos
5. **CollectionDocument**: Relação entre coleções e documentos
6. **Reviews**: Avaliações dos resumos
7. **News (Notícias)**: Comunicados da plataforma
8. **Warnings (Advertências)**: Advertências aos usuários
9. **Logs**: Registro de ações no sistema
10. **PasswordResets**: Solicitações de reset de senha
11. **PasswordChangeRequest**: Solicitações de mudança de senha
12. **AppRules**: Regras da plataforma
13. **System**: Configurações do sistema

### Controllers (Controladores)

1. **AuthController**: Autenticação e autorização
2. **UserController**: Gerenciamento de usuários
3. **SummaryController**: CRUD de resumos
4. **SubjectController**: CRUD de matérias
5. **CollectionController**: Gerenciamento de coleções
6. **ReviewController**: Sistema de avaliações
7. **RankingController**: Sistema de pontuação
8. **NewsController**: Gerenciamento de notícias
9. **WarningsController**: Sistema de advertências
10. **EmailController**: Envio de emails
11. **PasswordController**: Recuperação e alteração de senha
12. **SystemController**: Configurações e dashboard

### Middleware

O sistema possui middleware personalizado para:
- Verificação de modo de manutenção
- Autenticação via token
- Verificação de permissões por role
- Logs de requisições

### Validations (Validações)

Cada funcionalidade possui validações específicas:
- AuthValidations
- UserValidations
- SummaryValidations
- CollectionsValidations
- SubjectsValidations
- ReviewsValidations
- NewsValidations
- WarningsValidations
- MailValidations
- MaintenanceValidations
- QuerySearchValidations
- CustomValidations

### Services (Serviços)

**ImageSecurityService**: 
- Verificação de segurança em imagens
- Detecção básica de scripts maliciosos
- Validação de formato
- Análise de conteúdo base64

## 🔒 Segurança

### Autenticação
- Sistema de tokens (Laravel Sanctum)
- Tokens com expiração configurável
- Logout remove todos os tokens do usuário
- Verificação em cada requisição

### Autorização
- Três níveis de acesso (aluno, professor, administrador)
- Validação de permissões por endpoint
- Proteções específicas para administrador principal
- Middleware de verificação de role

### Proteção de Dados
- Senhas criptografadas com bcrypt
- Tokens de recuperação com hash
- Validação de entrada em todas as requisições
- Proteção contra SQL injection (uso de Eloquent ORM sempre)
- Sanitização de dados

### Logs
- Registro de login/logout
- Registro de uploads
- Registro de ações críticas
- Marcação de sucesso/falha

### Verificação de Imagens
- Scan de segurança em uploads
- Detecção de scripts embutidos
- Validação de formato
- Rejeição de conteúdo suspeito

## 📊 Sistema de Logs

Todas as ações importantes são registradas:
- **Login/Logout**: Registra tentativas de autenticação
- **Upload de Documentos**: Registra uploads bem-sucedidos e falhas
- **Ações Administrativas**: Registra modificações no sistema
- **Sucesso/Falha**: Cada log indica se a ação foi bem-sucedida

Dados do Log:
- ID do usuário
- Ação realizada
- Status (sucesso/falha)
- Timestamp

## 🔄 Fluxos Principais

### Fluxo do Novo Usuário

1. **Criação pelo Administrador**
   - Admin cria usuário no sistema
   - Senha inicial = matrícula
   - Email pode ser definido depois

2. **Primeiro Acesso**
   - Usuário faz login com matrícula/senha(=matrícula)
   - Sistema detecta primeiro login
   - Usuário é direcionado para definir nova senha
   - O usuário cadastra seu email
   - Recebe um link em seu email
   - Retorna a plataforma
   - Altera sua senha inicia

3. **Uso Normal**
   - Login com matrícula e senha personalizada
   - Acesso a todas as funcionalidades

### Fluxo de Postagem de Resumo

1. **Criação**
   - Usuário seleciona matéria
   - Escolhe tipo de resumo (texto/imagem/link do youtube/readme)
   - Define tag (P1/P2/P3/PF/Outros)
   - Adiciona título e conteúdo
   - Sistema valida e salva

2. **Disponibilização**
   - Resumo fica visível para todos
   - Aparece nas buscas
   - Outros usuários podem avaliar
   - Pode ser salvo em coleções

3. **Avaliação**
   - Usuários avaliam como perfeito/útil/confuso
   - Autor recebe pontos
   - Pontuação afeta ranking

4. **Organização**
   - Usuários salvam em suas coleções
   - Resumo aparece no perfil do autor
   - Fica disponível para busca

### Fluxo do Sistema de Ranking

1. **Postagem**: Aluno posta resumo
2. **Avaliação**: Outros usuários avaliam
3. **Pontuação**: Sistema calcula pontos automaticamente
4. **Ranking**: Posição atualizada em tempo real
5. **Visualização**: Todos podem ver ranking completo

### Fluxo de Modo de Manutenção

1. **Ativação**
   - Administrador ativa modo de manutenção
   - Define previsão de término
   - Sistema salva configurações

2. **Durante Manutenção**
   - Middleware verifica todas as requisições
   - Bloqueia usuários comuns (código 503)
   - Permite administradores
   - Retorna previsão de término

3. **Desativação**
   - Administrador desativa modo
   - Sistema volta ao normal
   - Todos usuários podem acessar

## 🎨 Padrões de Resposta

### Resposta de Sucesso
```json
{
  "data": { /* dados retornados */ },
  "message": "mensagem de sucesso",
  "status": 200
}
```

### Resposta de Erro
```json
{
  "data": { /* detalhes do erro */ },
  "message": "mensagem de erro",
  "status": código_de_erro
}
```

### Códigos HTTP Utilizados
- **200 OK**: Operação bem-sucedida
- **201 Created**: Recurso criado com sucesso
- **204 No Content**: Operação bem-sucedida sem conteúdo
- **401 Unauthorized**: Não autorizado
- **403 Forbidden**: Proibido (sem permissão)
- **404 Not Found**: Recurso não encontrado
- **410 Gone**: Conteúdo deletado
- **422 Unprocessable Entity**: Erro de validação
- **500 Internal Server Error**: Erro interno
- **503 Service Unavailable**: Em manutenção

## 📦 Dependências Principais

- **Laravel**: Framework PHP principal
- **Laravel Sanctum**: Autenticação via tokens
- **Laravel Mail**: Sistema de envio de emails
- **Carbon**: Manipulação de datas
- **Eloquent ORM**: Gerenciamento de banco de dados

## 🚀 Recursos Técnicos

### Paginação
- Maioria das listagens paginadas
- Configurável por requisição
- Metadados completos (total, páginas, etc)

### Busca Avançada
- Múltiplos filtros simultâneos
- Busca por texto em múltiplos campos
- Busca por datas (múltiplos formatos)
- Busca por relacionamentos

### Transações
- Uso de DB::beginTransaction() e commit()
- Rollback automático em caso de erro
- Garantia de integridade dos dados

### Soft Delete
- Resumos não são deletados definitivamente
- Marcados como "apagado"
- Administrador pode restaurar
- Mantém histórico completo

### Relacionamentos
- Eager loading para otimização
- Relacionamentos many-to-many
- Contagens eficientes
- Queries otimizadas

## 💡 Diferenciais da Plataforma

1. **Sistema de Pontuação Inteligente**: Professores têm peso maior nas avaliações
2. **Múltiplos Formatos**: Suporta texto, imagem, links e markdown
3. **Organização Flexível**: Sistema de coleções públicas
4. **Gamificação**: Ranking incentiva contribuições de qualidade
5. **Segurança em Imagens**: Verificação automática de conteúdo malicioso
6. **Gestão Completa**: Administrador tem controle total do sistema
7. **Logs Detalhados**: Rastreabilidade de todas as ações
8. **Modo de Manutenção**: Sistema de manutenção sem perda de acesso admin
9. **Emails Automatizados**: Comunicação automática com usuários
10. **Busca Avançada**: Múltiplos filtros e formatos de busca

## 📈 Métricas e Estatísticas

O sistema fornece várias métricas:
- Distribuição de usuários por tipo
- Resumos por matéria
- Atividade de upload mensal
- Contagem de avaliações por resumo
- Pontuação individual no ranking
- Estatísticas de perfil do usuário

## 🎓 Casos de Uso Acadêmicos

### Para Alunos
- Compartilhar resumos de estudo
- Salvar e baixar resumos de colegas
- Organizar material de estudo
- Competir no ranking

### Para Professores
- Compartilhar material complementar
- Validar conteúdo dos alunos
- Acompanhar produção acadêmica
- Guiar estudantes

### Para Administradores
- Gerenciar comunidade acadêmica
- Monitorar qualidade do conteúdo
- Moderar comportamentos
- Analisar métricas de uso
- Tomar decisões baseadas em dados

## 🔧 Manutenção e Suporte

### Advertências
Sistema de advertências para:
- Conteúdo inadequado
- Comportamento impróprio
- Violações das regras

### Moderação de Conteúdo
- Administrador pode remover conteúdo
- Sistema de soft delete
- Possibilidade de restauração
- Histórico completo mantido

### Gestão de Usuários
- Desativação temporária
- Controle de permissões
- Motivos de desativação registrados
- Reativação simplificada

## 📝 Notas Finais

Esta plataforma foi desenvolvida com foco em:
- **Colaboração**: Facilitar compartilhamento de conhecimento
- **Qualidade**: Sistema de avaliação garante conteúdo útil
- **Organização**: Coleções e filtros facilitam encontrar conteúdo
- **Incentivo**: Ranking gamifica e motiva contribuições
- **Segurança**: Múltiplas camadas de proteção
- **Usabilidade**: Interface intuitiva e funcional
- **Escalabilidade**: Arquitetura preparada para crescimento

---

**Versão**: 1.0.0
**Autor**: Natan Altomar <natan.altomar14@gmail.com>
