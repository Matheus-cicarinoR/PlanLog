# 🚜 PlanLog — Documentação Técnica do Sistema

Sistema web de alta performance para **Gestão Operacional, Financeira, de Frotas e Telemetria de Retroescavadeiras e Maquinário Pesado**.

---

## 📑 Sumário

1. [Visão Geral e Arquitetura](#-1-visão-geral-e-arquitetura)
2. [Tecnologias Utilizadas](#-2-tecnologias-utilizadas)
3. [Estrutura de Diretórios](#-3-estrutura-de-diretórios)
4. [Módulos e Funcionalidades](#-4-módulos-e-funcionalidades)
5. [Camada de Dados & Persistência (Supabase + Cache Local)](#-5-camada-de-dados--persistência)
6. [Modelo de Banco de Dados (Schema SQL)](#-6-modelo-de-banco-de-dados)
7. [Controle de Acesso & Autenticação (RBAC)](#-7-controle-de-acesso--autenticação)
8. [Exportação, Relatórios & Comprovantes (PDF / WhatsApp / CSV)](#-8-exportação-relatórios--comprovantes)
9. [Guia de Instalação e Execução](#-9-guia-de-instalação-e-execução)

---

## 🏗️ 1. Visão Geral e Arquitetura

O **PlanLog** foi projetado seguindo as melhores práticas modernas de desenvolvimento web (Clean Architecture, Single Source of Truth e desacoplamento de componentes):

- **Arquitetura SPA (Single Page Application)** com React 19 e React Router v7.
- **Camada de Estado Centralizada**: Toda a aplicação consome dados reativos através do `SystemProvider` (`src/context/SystemContext.tsx`).
- **Resiliência Offline-First / Cloud-Sync**: O sistema lê e grava no banco de dados **Supabase PostgreSQL** em tempo real, mantendo cache local (`LocalStorage`) para tolerância a falhas de rede.
- **Design System com Alta Acessibilidade e Estética**: Suporte nativo e instantâneo a **Dark Mode** e **Light Mode**, tipografia Inter e feedback auditivo/visual com toasts e modais travados contra rolagem fantasma.

---

## ⚡ 2. Tecnologias Utilizadas

- **Frontend**: React 19, TypeScript, Vite
- **Roteamento**: React Router v7
- **Estilização**: Tailwind CSS v4, Lucide React (ícones), Base UI
- **Backend / Database**: Supabase (PostgreSQL, Supabase Auth, Row Level Security)
- **Geração de Documentos**: `jspdf`, `jspdf-autotable`, `html2canvas`
- **Componentes Utilitários**: `sonner` (toasts modernos), `simplebar-react`, `date-fns`

---

## 📂 3. Estrutura de Diretórios

```
src/
├── assets/                  # Imagens, logotipos e estilos globais
├── components/              # Componentes de módulos de negócio e modais
│   ├── ui/                  # Componentes reutilizáveis do Design System (Button, Card, Input, Badge, etc.)
│   ├── shared/              # Componentes de infraestrutura (ErrorBoundary, ScrollableContainer, TablePagination)
│   ├── Dashboard.tsx        # Dashboard executivo e KPIs analíticos
│   ├── FleetCalendar.tsx    # Agenda e calendário visual de serviços da frota
│   ├── ServicesManager.tsx   # Tabela e cards inteligentes de serviços e deslocamentos
│   ├── ServiceModal.tsx     # Modal dual-mode de cadastro (Serviço Cliente vs Deslocamento Frota)
│   ├── ClientsManager.tsx   # Gestão de clientes com paginação e histórico financeiro
│   ├── MachinesManager.tsx  # Gestão da frota, horímetros e alertas de óleo
│   ├── MaintenanceManager.tsx # Controle de manutenções preventivas e corretivas
│   ├── MaintenanceModal.tsx # Lançamento de serviços de oficina e peças
│   ├── FuelManager.tsx      # Telemetria de combustível e eficiência (L/h)
│   ├── FuelModal.tsx        # Registro de abastecimentos de diesel
│   ├── OperatorManager.tsx  # Prestação de contas e comissões de operadores
│   ├── UserManager.tsx      # Gestão de usuários do sistema e perfis de permissão
│   ├── ReportsManager.tsx   # Fechamentos contábeis e relatórios analíticos
│   ├── ReceiptModal.tsx     # Gerador de recibos e comprovantes para clientes
│   └── LoginScreen.tsx      # Autenticação segura com troca de perfis e modo demonstração
├── context/                 # Context API central do sistema
│   └── SystemContext.tsx    # Estado global, carregamento assíncrono e handlers de dados
├── layouts/                 # Layouts da aplicação
│   ├── full/                # Layout autenticado com Sidebar retrátil, Topbar e alternador Dark/Light
│   └── blank/               # Layout limpo para Login, Registro e Erro 404
├── lib/                     # Utilitários, serviços e integrações
│   ├── supabase.ts          # Inicializador do cliente Supabase
│   ├── storage.ts           # StorageService com persistência e sincronização em lote
│   ├── pdfGenerator.ts      # Motor de exportação de relatórios em PDF com formatação profissional
│   ├── whatsapp.ts         # Formatador de mensagens e links diretos para WhatsApp Web/App
│   └── formatters.ts        # Utilitários de moeda (BRL), datas e horas formatadas
├── routes/                  # Configuração declarativa de rotas (Router.tsx)
├── sql/                     # Scripts de banco de dados
│   └── schema.sql           # Schema SQL completo e atualizado com RLS
├── types/                   # Definições de tipos TypeScript (index.ts)
└── views/                   # Páginas wrappers conectadas ao roteador
```

---

## 🎯 4. Módulos e Funcionalidades

### 1. 📊 Dashboard Executivo
- **Métricas em Tempo Real**: Faturamento total, Horas faturadas, Horas reais operadas, Recebimentos confirmados, Inadimplência / Saldo a receber, Despesas com Diesel e Manutenções.
- **Telemetria de Motor**: Cálculo exato de consumo médio de diesel (**L/h**), custo por hora operada e autonomia.
- **Alertas de Manutenção**: Indicador visual do horímetro para a próxima troca de óleo do motor (preventiva de 250h).
- **Filtro Global por Máquina e Período**: Permite filtrar todos os KPIs por máquina específica ou visão geral da frota. Se todas as máquinas estiverem selecionadas, alguns painéis avisarão que o cálculo só é feito para uma máquina específica, evitando dados incorretos e erros em tela.

### 2. 📅 Agenda & Calendário de Máquinas
- Visualização mensal e semanal com badges coloridos de status (Concluído, Pendente, Agendado).
- Navegação interativa para detalhes do cliente e ações diretas.

### 3. 🚜 Gestão de Serviços & Deslocamentos de Frota
- **Cadastro Dual-Mode**:
  - **Serviço do Cliente**: Registra horas trabalhadas, valor/hora, cliente, operador, forma de pagamento e repasse.
  - **🛣️ Deslocamento / Trânsito Embutido**: Campo protegido (`🔒 Custo Interno`) para registrar horas de viagem da máquina que computam no horímetro e diesel, mas são **100% invisíveis** no recibo do cliente.
  - **Deslocamento de Frota Avulso**: Mobilizações entre bases, garagens ou oficinas sem faturamento a clientes (`R$ 0,00`).
- **Quitação Rápida**: Botão de 1 clique para dar baixa em pagamentos recebidos em dinheiro ou PIX.
- **Filtros Avançados**: Filtre por status (*Todos, Pagos, Em Aberto, Parciais, Deslocamentos*) e por destinatário do repasse (*Erica, Jurandir*).

### 4. 👥 Gestão de Clientes
- Cadastro completo com telefone, documento, endereço, cidade e observações.
- Histórico completo de serviços contratados, total investido e saldo devedor por cliente.
- Paginação configurável e busca em tempo real.

### 5. 🚜 Controle de Frota & Horímetros
- Cadastro de múltiplas máquinas com horímetro inicial, horímetro atual, valor/hora padrão e intervalo de óleo.
- Exclusão total permitida para todas as máquinas (sem restrições), com o sistema adaptando-se automaticamente a um "Estado Vazio" e pausando os cálculos no Dashboard.
- Histórico operacional por máquina.

### 6. 🔧 Manutenções & Oficina
- Controle de manutenções preventivas, corretivas, filtros, sistema hidráulico, material rodante/esteiras e dentes de caçamba.
- Registro de peças substituídas, oficina/mecânico responsável e custo total.

### 7. ⛽ Abastecimentos & Diesel
- Registro de abastecimentos com horímetro, litros, preço por litro e posto fornecedor.
- Indicador de consumo médio ($L/h$) e custo por hora.

### 8. 👷 Operadores & Prestação de Contas
- Balanço de valores recebidos em mãos pelos operadores vs. valores repassados à empresa.
- Cálculo de comissões e diárias.
- **Gestão Dinâmica**: Cadastro (CRUD completo) de Profissionais de Campo, com lista suspensa (dropdown) alinhada ao design global.
- Modal dedicado para inclusão e edição de novos operadores diretamente da tela.
- **Geração de Comprovantes**: O Histórico de Serviço na página de Operadores possui a opção direta de gerar o comprovante em PDF e Whatsapp.

### 9. 📈 Relatórios & Fechamento
- Balanço DRE simplificado (Receitas, Custos de Combustível, Custos de Manutenção, Lucro Líquido Operacional).
- O período exibido no fechamento obedece de forma dinâmica o período que o usuário escolher na barra lateral.
- Exportação em PDF executivo de toda a frota (Consolidada) ou de uma máquina em específico, garantindo que o cabeçalho do PDF deixe clara a máquina (ou "Frota Consolidada") e o Período.
- Geração de planilhas CSV.

---

## 🗄️ 5. Camada de Dados & Persistência

A aplicação utiliza o **Supabase** como banco de dados relacional oficial. Todas as operações de leitura e escrita passam pelo `SystemContext.tsx` e pelo `StorageService.ts`:

- **Carregamento Automático**: Ao iniciar a aplicação, um `Promise.all` consulta paralelamente as tabelas do banco de dados.
- **Envio Imediato**: Cada inclusão, edição ou exclusão executa um `upsert` ou `delete` diretamente no Supabase.
- **Cache Local & Contingência**: Em caso de falha de conexão ou durante testes locais, os dados são preservados no `localStorage` sem travar a navegação do operador.

---

## 📜 6. Modelo de Banco de Dados

O arquivo [`src/sql/schema.sql`](file:///home/boxsol/Documents/PROJETO%20ESCAVADERA/src/sql/schema.sql) contém a estrutura DDL completa:

```sql
-- Tabelas Principais:
1. public.maquinas        -- Registro da frota e horímetros
2. public.clientes        -- Cadastro de clientes
3. public.servicos        -- Serviços prestados e deslocamentos internos
4. public.manutencoes     -- Ordens de manutenção e revisões
5. public.abastecimentos  -- Abastecimentos de combustível e fluidos
6. public.operadores      -- Equipe de operadores e comissões
7. public.usuarios        -- Usuários com acesso ao sistema web
8. public.configuracoes   -- Parâmetros da empresa em formato JSONB
```

---

## 🔐 7. Controle de Acesso & Autenticação

O sistema conta com proteção de rotas via [`ProtectedRoute.tsx`](file:///home/boxsol/Documents/PROJETO%20ESCAVADERA/src/components/ProtectedRoute.tsx):

- **Níveis de Acesso (RBAC)**:
  - **👑 Administrador Master**: Acesso irrestrito a todos os módulos, configurações, exclusões e cadastros de novos usuários.
  - **💼 Financeiro / Gestão**: Acesso a relatórios financeiros, faturamento, recebimentos e controle de inadimplência.
  - **🚜 Operador**: Focado no lançamento de serviços, horímetro, abastecimentos e manutenções do maquinário.
- **Proteção contra Erros Inesperados**: O [`ErrorBoundary.tsx`](file:///home/boxsol/Documents/PROJETO%20ESCAVADERA/src/components/shared/ErrorBoundary.tsx) intercepta falhas de renderização, permitindo recarregar o sistema sem perder dados salvos.

---

## 📄 8. Exportação, Relatórios & Comprovantes

1. **Recibos em PDF**: Gerados via `jspdf` com cabeçalho da empresa, dados do cliente, discriminativo de horas trabalhadas e valor total.
2. **Envio via WhatsApp**: Cria links no padrão `https://wa.me/...` com mensagem formatada em Markdown com emojis e detalhes do serviço.
3. **Relatórios em CSV**: Exportação para Excel e planilhas de todos os serviços filtrados.

---

## 🚀 9. Guia de Instalação e Execução

### Pré-requisitos
- Node.js (versão 18 ou superior)
- Gerenciador de pacotes npm

### Instalação

```bash
# 1. Instalar as dependências do projeto
npm install

# 2. Iniciar o servidor de desenvolvimento local
npm run dev

# 3. Compilar para produção (Vite Build + TypeScript Check)
npm run build

# 4. Pré-visualizar o build de produção localmente
npm run preview
```

### Variáveis de Ambiente (`.env`)

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-publica
```

## 🗺️ 10. Dicionário de Arquivos e Componentes

A estrutura de pastas principal (`src/`) contém as regras de negócios, views e contextos. Abaixo está o dicionário que explica a função técnica dos principais arquivos:

### 10.1 Contextos (`src/context/`)
- **`SystemContext.tsx`**: É o "coração" da aplicação. Componente Single Source of Truth que armazena os arrays de serviços, máquinas, clientes, peças e operadores. Ele injeta funções de CRUD (`addService`, `deleteMachine`, etc.) para todo o sistema através de React Context, garantindo reatividade síncrona nos gráficos do Dashboard e atualizando tabelas em tempo real.

### 10.2 Bibliotecas e Serviços (`src/lib/`)
- **`supabase.ts`**: Contém a inicialização do cliente oficial do Supabase utilizando variáveis de ambiente (Vite).
- **`storage.ts`**: Camada abstrata (Design Pattern de Repositório) que tenta realizar operações (Insert, Update, Delete) diretamente no Supabase. Caso a internet falhe ou o banco esteja indisponível, ele faz "fallback" gravando em cache local (`localStorage`), garantindo que o sistema funcione offline.
- **`pdfGenerator.ts`**: Biblioteca customizada utilizando `jsPDF` e `jspdf-autotable`. Formata arrays de serviços ou manutenções e converte-os visualmente em folhas A4 com cabeçalhos estruturados para a logo da empresa.
- **`whatsapp.ts`**: Define funções para geração da URL `api.whatsapp.com` preenchida com textos formatados e dados de faturamento para compartilhar comprovantes diretamente pelo WhatsApp Web ou celular.

### 10.3 Componentes (Managers) de Negócio (`src/components/`)
A pasta `components` armazena os "Managers", componentes pesados que lidam com lógica de CRUD, paginação, filtros e chamadas modais, separados da responsabilidade da View.
- **`Dashboard.tsx`**: Painel principal. Puxa os dados consolidados ou selecionados de faturamento e converte em gráficos (Recharts) e cartões de métricas.
- **`ServicesManager.tsx` / `ServiceModal.tsx`**: Gerencia todo o fluxo de receitas. Controla a listagem (paginada) de serviços de maquinário e o modal extenso (ServiceModal) que permite a entrada de valores, cálculo de horas trabalhadas e anexos.
- **`FuelManager.tsx` / `FuelModal.tsx`**: Cuida do fluxo de despesas com Abastecimento. Mostra os registros de litros de óleo diesel, posto e máquina atrelada.
- **`MaintenanceManager.tsx` / `MaintenanceModal.tsx`**: Cuida das Despesas Fixas (peças, manutenções, funilaria). Controla mecânicos, número da nota fiscal e status.
- **`MachinesManager.tsx`**: CRUD das Retroescavadeiras e equipamentos da frota. Controla a disponibilidade, consumo e exclusão lógica de máquinas.
- **`OperatorManager.tsx` / `OperatorModal.tsx`**: Gerencia a equipe e o RH de motoristas/operadores em campo (nome, CNH, comissão fixa/hora e geração de recibo de pagamento).
- **`ClientsManager.tsx`**: Gerencia o banco de dados de contratantes/clientes com documentação e endereço.
- **`ReportsManager.tsx`**: Componente de apresentação de Relatórios de DRE (Demonstrativo de Resultados). Exibe lucros, filtra períodos customizados e invoca a exportação do PDF unificado.
- **`UserManager.tsx`**: Painel Administrativo de Usuários, com suporte a troca de permissões, redefinições de senha no Supabase e bloqueio de acessos.
- **`WikiManager.tsx`**: Central de Ajuda interativa com tutoriais da base de conhecimento (Documentação in-app).

### 10.4 Telas (Views - `src/views/`)
- As **Views** (`DashboardView.tsx`, `ServicesView.tsx`, etc.) funcionam apenas como *Containers* visuais. O propósito técnico delas é definir a estilização principal da página e renderizar os Componentes Managers (item 10.3) injetando estado caso necessário, isolando lógica de navegação do React Router.
