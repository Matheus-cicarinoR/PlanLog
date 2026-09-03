/**
 * WikiManager.tsx
 * 
 * PROPÓSITO:
 * Componente responsável pela listagem e manipulação de registros de WikiManager.
 * 
 * RESPONSABILIDADES:
 * - Integrar com o SystemContext para consumir dados.
 * - Renderizar a interface gráfica para interação com a entidade correspondente.
 */
import React, { useState, useMemo } from 'react';
import { 
 Search, 
 BookOpen, 
 HelpCircle, 
 Tractor, 
 Calendar, 
 FileText, 
 Wrench, 
 Fuel, 
 Users, 
 ShieldCheck, 
 BarChart3, 
 CheckCircle2, 
 ChevronRight, 
 ChevronDown, 
 Sparkles, 
 ArrowRight,
 MessageCircle,
 Download,
 AlertTriangle,
 Lightbulb,
 Clock,
 DollarSign
} from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useNavigate } from 'react-router';

interface TutorialArticle {
 id: string;
 category: string;
 categoryIcon: any;
 categoryColor: string;
 title: string;
 shortDesc: string;
 targetRoute?: string;
 steps: {
  title: string;
  description: string;
  tip?: string;
 }[];
 importantNotes?: string[];
 keywords: string[];
}

interface FAQItem {
 question: string;
 answer: string;
 category: string;
}

const TUTORIALS: TutorialArticle[] = [
 {
  id: 'servicos-deslocamento',
  category: 'Serviços & Deslocamentos',
  categoryIcon: Tractor,
  categoryColor: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
  title: 'Como Lançar Serviços e Deslocamentos de Máquinas',
  shortDesc: 'Aprenda a cadastrar trabalhos de clientes, horas cobradas, trânsito de máquinas e horas internas protegidas.',
  targetRoute: '/servicos',
  keywords: ['serviço', 'deslocamento', 'transito', 'trânsito', 'hora', 'horimetro', 'lançar', 'cadastro', 'recibo', 'cliente'],
  steps: [
   {
    title: '1. Abrir a Tela de Serviços',
    description: 'Clique no menu lateral em "Serviços" e em seguida no botão "+ Adicionar Serviço".',
   },
   {
    title: '2. Escolha o Tipo de Registro',
    description: 'No topo do formulário, selecione entre "🚜 Serviço Cliente" (para trabalhos faturados) ou "🛣️ Deslocamento" (para viagens avulsas entre garagens/oficinas a custo zero para o cliente).',
   },
   {
    title: '3. Preencha as Horas de Trabalho',
    description: 'Selecione o Cliente, a Máquina utilizada e digite a quantidade de Horas Cobradas (ex: 4.0h) e o Valor por Hora.',
   },
   {
    title: '4. Registrar Tempo de Deslocamento (Opcional & Invisível no Recibo)',
    description: 'Se a máquina precisou de tempo de estrada/trânsito para chegar à obra, informe no campo "Tempo de Deslocamento". O sistema somará esse tempo ao horímetro real da máquina e ao cálculo de diesel, mas deixará 100% oculto do recibo e WhatsApp do cliente!',
    tip: 'Dica: O cliente só verá as horas trabalhadas e o valor total acordado, preservando sua margem operacional.'
   },
   {
    title: '5. Pagamento e Destino do Repasse',
    description: 'Defina a forma de pagamento (PIX, Dinheiro, etc.), o valor pago de entrada e para quem o valor foi entregue (ex: Jurandir ou Erica).',
   }
  ],
  importantNotes: [
   'Você pode dar baixa rápida em serviços pendentes clicando no botão verde "Quitar Saldo" direto na tabela de serviços.',
   'O horímetro da máquina é atualizado automaticamente conforme os serviços são cadastrados.'
  ]
 },
 {
  id: 'recibos-whatsapp',
  category: 'Recibos & WhatsApp',
  categoryIcon: FileText,
  categoryColor: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30',
  title: 'Como Gerar Recibos em PDF e Enviar pelo WhatsApp',
  shortDesc: 'Emita comprovantes profissionais timbrados e envie direto no WhatsApp do cliente com 1 clique.',
  targetRoute: '/servicos',
  keywords: ['recibo', 'whatsapp', 'pdf', 'comprovante', 'enviar', 'imprimir', 'cliente', 'pagamento'],
  steps: [
   {
    title: '1. Localize o Serviço Realizado',
    description: 'Na lista de serviços, encontre o atendimento que deseja comprovar.',
   },
   {
    title: '2. Clique no Ícone de Recibo',
    description: 'Clique no botão de recibo (ícone de documento/impressora) na coluna de ações do serviço.',
   },
   {
    title: '3. Visualize o Comprovante Timbrado',
    description: 'Uma pré-visualização profissional será exibida com os dados da empresa, nome do cliente, discriminativo de horas e valor pago.',
   },
   {
    title: '4. Enviar no WhatsApp ou Baixar PDF',
    description: 'Clique em "📲 Enviar WhatsApp" para abrir o WhatsApp Web/App com a mensagem pronta ou "📥 Baixar Recibo em PDF" para salvar no seu aparelho.',
    tip: 'Se o cliente tiver telefone cadastrado, o WhatsApp abre diretamente na conversa dele.'
   }
  ],
  importantNotes: [
   'Horas de deslocamento operacional interno NUNCA aparecem no recibo do cliente.',
   'Você também pode exportar relatórios completos de todos os serviços em PDF e CSV no topo da tela.'
  ]
 },
 {
  id: 'agenda-calendario',
  category: 'Agenda & Calendário',
  categoryIcon: Calendar,
  categoryColor: 'text-blue-500 bg-blue-500/10 border-blue-500/30',
  title: 'Como Utilizar a Agenda e Programação da Frota',
  shortDesc: 'Acompanhe obras agendadas, evite conflitos de horário entre máquinas e planeje os próximos dias.',
  targetRoute: '/agenda',
  keywords: ['agenda', 'calendario', 'calendário', 'agendar', 'horario', 'data', 'programação', 'planejamento'],
  steps: [
   {
    title: '1. Acessar a Agenda',
    description: 'Clique em "Agenda & Calendário" no menu lateral para visualizar a grade mensal ou semanal.',
   },
   {
    title: '2. Alternar Visualizações',
    description: 'Use os botões de navegação no topo para alternar entre visão de Mês, Semana ou Dia.',
   },
   {
    title: '3. Identificar os Serviços por Cores',
    description: 'Verde = Serviço Concluído e Pago; Amarelo = Serviço Agendado / Pendente; Azul = Deslocamento de Frota.',
   },
   {
    title: '4. Clicar no Evento para Detalhes',
    description: 'Clique sobre qualquer serviço no calendário para abrir os detalhes, editar horas ou gerar o comprovante imediatamente.',
   }
  ]
 },
 {
  id: 'manutencao-oleo',
  category: 'Manutenções & Oficina',
  categoryIcon: Wrench,
  categoryColor: 'text-purple-500 bg-purple-500/10 border-purple-500/30',
  title: 'Controle de Manutenções e Troca de Óleo (Preventiva de 250h)',
  shortDesc: 'Monitore revisões preventivas, troca de óleo do motor, filtros, hidráulico e histórico de custos de oficina.',
  targetRoute: '/manutencoes',
  keywords: ['manutenção', 'manutencao', 'oleo', 'óleo', 'filtro', 'revisão', 'revisao', 'oficina', 'mecanico', 'peças', '250h'],
  steps: [
   {
    title: '1. Acessar o Módulo de Manutenções',
    description: 'Clique em "Manutenções" no menu lateral.',
   },
   {
    title: '2. Verificar o Indicador da Troca de Óleo',
    description: 'O card no topo da tela calcula as horas restantes para a próxima revisão preventiva (padrão 250 horas). Se o horímetro estiver próximo, o sistema exibirá um aviso em amarelo ou vermelho.',
   },
   {
    title: '3. Registrar Nova Manutenção',
    description: 'Clique em "+ Nova Manutenção", informe o Título (ex: Troca de Óleo e Filtros), o Tipo, o Horímetro da Máquina no momento e o Valor Total gasto.',
   },
   {
    title: '4. Discriminar Peças e Mecânico',
    description: 'Preencha as peças substituídas e a oficina/mecânico para manter o histórico de garantias.',
   }
  ],
  importantNotes: [
   'Ao registrar uma manutenção do tipo "Troca de Óleo", o horímetro base para a próxima revisão é resetado automaticamente!'
  ]
 },
 {
  id: 'combustivel-consumo',
  category: 'Diesel & Combustível',
  categoryIcon: Fuel,
  categoryColor: 'text-orange-500 bg-orange-500/10 border-orange-500/30',
  title: 'Como Lançar Diesel e Medir Consumo Médio (L/h)',
  shortDesc: 'Calcule a média exata de litros por hora operada, custo do diesel por hora e notas fiscais de postos.',
  targetRoute: '/combustivel',
  keywords: ['diesel', 'combustivel', 'combustível', 'abastecimento', 'litros', 'consumo', 'posto', 'autonomia'],
  steps: [
   {
    title: '1. Acessar o Módulo de Combustível',
    description: 'Clique em "Combustível" no menu lateral.',
   },
   {
    title: '2. Lançar Abastecimento',
    description: 'Clique em "+ Novo Abastecimento". Informe a data, o horímetro atual da máquina, a quantidade de Litros abastecidos e o Preço por Litro.',
   },
   {
    title: '3. Acompanhar a Eficiência da Máquina',
    description: 'O sistema divide automaticamente os litros totais pelas horas reais de motor operadas (incluindo serviços e deslocamentos), gerando a média em Litros/Hora (L/h) e o Custo Operacional por Hora.',
   }
  ]
 },
 {
  id: 'clientes-gestao',
  category: 'Clientes & Cobrança',
  categoryIcon: Users,
  categoryColor: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/30',
  title: 'Cadastro de Clientes e Histórico de Cobranças',
  shortDesc: 'Cadastre seus clientes, consulte extratos individuais de serviços e acompanhe saldos pendentes.',
  targetRoute: '/clientes',
  keywords: ['cliente', 'cadastro', 'telefone', 'endereço', 'cidade', 'devedor', 'inadimplencia', 'histórico'],
  steps: [
   {
    title: '1. Acessar Clientes',
    description: 'Clique em "Clientes" no menu lateral.',
   },
   {
    title: '2. Cadastrar Novo Cliente',
    description: 'Clique em "+ Novo Cliente" e preencha Nome, Telefone/WhatsApp, Endereço e Cidade.',
   },
   {
    title: '3. Consultar Ficha do Cliente',
    description: 'No card do cliente, você vê instantaneamente a quantidade de serviços feitos, total já pago e se há algum saldo devedor pendente.',
   }
  ]
 },
 {
  id: 'usuarios-permissoes',
  category: 'Acesso & Usuários',
  categoryIcon: ShieldCheck,
  categoryColor: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/30',
  title: 'Gerenciamento de Usuários e Perfis de Permissão',
  shortDesc: 'Saiba como cadastrar operadores, equipe de escritório e gerenciar senhas com segurança.',
  targetRoute: '/usuarios',
  keywords: ['usuario', 'usuário', 'perfil', 'senha', 'administrador', 'financeiro', 'operador', 'permissão', 'login'],
  steps: [
   {
    title: '1. Perfis Disponíveis',
    description: '👑 Administrador (acesso irrestrito); 💼 Financeiro (faturamento, relatórios e cobranças); 🚜 Operador (lançamentos de serviços e abastecimentos).',
   },
   {
    title: '2. Criar Nova Conta',
    description: 'Acesse "Configurações → Usuários" e clique em "+ Novo Usuário". Defina nome, e-mail, senha e o cargo.',
   },
   {
    title: '3. Bloqueio e Ativação',
    description: 'Você pode desativar o acesso de qualquer operador ou usuário a qualquer momento trocando o status para "Bloqueado".',
   }
  ]
 },
 {
  id: 'operadores-comissao',
  category: 'Operadores & Equipe',
  categoryIcon: Users,
  categoryColor: 'text-rose-500 bg-rose-500/10 border-rose-500/30',
  title: 'Gestão Dinâmica de Operadores e Comprovantes',
  shortDesc: 'Aprenda a cadastrar operadores de máquinas, gerar histórico de serviços e emitir recibos direto da aba do operador.',
  targetRoute: '/operadores',
  keywords: ['operador', 'equipe', 'funcionário', 'recibo', 'histórico', 'comissão', 'comprovante'],
  steps: [
   {
    title: '1. Acessar Módulo de Operadores',
    description: 'No menu principal, clique em "Operadores" para ver a lista de profissionais de campo.',
   },
   {
    title: '2. Cadastrar ou Selecionar Operador',
    description: 'Você pode adicionar um novo operador pelo modal ou simplesmente selecionar um operador existente no menu suspenso para visualizar a sua ficha.',
   },
   {
    title: '3. Histórico e Emissão de Recibo',
    description: 'Na ficha do operador selecionado, você verá a lista de todos os serviços atrelados a ele. Clicando no ícone de "PDF" ou "WhatsApp" ao lado de um serviço, o sistema emite imediatamente o comprovante com os dados deste trabalho.',
   }
  ]
 }
];

const FAQS: FAQItem[] = [
 {
  category: 'Serviços & Deslocamentos',
  question: 'O cliente consegue ver as horas de deslocamento no recibo?',
  answer: 'Não! O tempo de deslocamento/trânsito é um campo 100% interno e protegido. Ele atualiza o horímetro da máquina e calcula o consumo de diesel, mas o recibo e a mensagem do WhatsApp exibem estritamente as horas trabalhadas cobradas do cliente.'
 },
 {
  category: 'Serviços & Deslocamentos',
  question: 'Como faço para quitar um serviço que estava em aberto?',
  answer: 'Na tela de "Serviços", localize o registro pendente e clique no botão verde "Quitar Saldo". O sistema registrará o recebimento integral e mudará o status para "Pago" instantaneamente.'
 },
 {
  category: 'Manutenções',
  question: 'Como funciona o alerta de troca de óleo de 250 horas?',
  answer: 'Cada máquina possui o campo de horímetro da última troca. Conforme os serviços e deslocamentos são registrados, o sistema calcula a diferença. Ao faltar menos de 25 horas para 250h, o card de aviso fica amarelo (Atenção). Se ultrapassar, fica vermelho (Revisão Urgente).'
 },
 {
  category: 'Sistema & Navegação',
  question: 'Como alternar entre Dark Mode (Modo Escuro) e Light Mode (Modo Claro)?',
  answer: 'No canto inferior do menu lateral (ou na barra superior), há o botão com o ícone de Sol ☀️ e Lua 🌙. Basta clicar para alternar o tema instantaneamente em todas as telas.'
 },
 {
  category: 'Exportação & Impressão',
  question: 'Como exportar um relatório mensal completo para a contabilidade ou sócios?',
  answer: 'No módulo "Relatórios" (ou no topo da tela de "Serviços"), clique no botão "Exportar PDF" ou "Exportar CSV". Você pode aplicar filtros de data (Período) e máquina antes de exportar.'
 },
 {
  category: 'Exportação & Impressão',
  question: 'O relatório em PDF detalha se estou exportando todas as máquinas juntas?',
  answer: 'Sim! Se você deixar o filtro em "Todas as Máquinas (Consolidado)", o cabeçalho do PDF mostrará "Frota Consolidada" no campo da Máquina e exibirá o período que você escolheu na barra lateral. O Dashboard também pausa cálculos paralelos e alerta visualmente quando você está no modo consolidado.'
 },
 {
  category: 'Conexão & Dados',
  question: 'O que acontece se a internet cair enquanto estou na obra?',
  answer: 'O sistema conta com tolerância a falhas e cache local inteligente. Suas ações permanecem armazenadas no navegador e são sincronizadas com o banco de dados em nuvem assim que a conexão for reestabelecida.'
 }
];

export const WikiManager: React.FC = () => {
 const navigate = useNavigate();
 const [searchTerm, setSearchTerm] = useState('');
 const [selectedCategory, setSelectedCategory] = useState<string>('todos');
 const [activeArticleId, setActiveArticleId] = useState<string | null>(null);
 const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

 // Categorias únicas para tabs
 const categories = useMemo(() => {
  const set = new Set(TUTORIALS.map(t => t.category));
  return ['todos', ...Array.from(set)];
 }, []);

 // Filtragem dos tutoriais por busca e categoria
 const filteredTutorials = useMemo(() => {
  return TUTORIALS.filter(t => {
   const matchesCategory = selectedCategory === 'todos' || t.category === selectedCategory;
   const cleanSearch = searchTerm.toLowerCase().trim();
   if (!cleanSearch) return matchesCategory;

   const matchesText = 
    t.title.toLowerCase().includes(cleanSearch) ||
    t.shortDesc.toLowerCase().includes(cleanSearch) ||
    t.keywords.some(k => k.toLowerCase().includes(cleanSearch)) ||
    t.steps.some(s => s.title.toLowerCase().includes(cleanSearch) || s.description.toLowerCase().includes(cleanSearch));

   return matchesCategory && matchesText;
  });
 }, [searchTerm, selectedCategory]);

 // Filtragem dos FAQs por busca
 const filteredFaqs = useMemo(() => {
  const cleanSearch = searchTerm.toLowerCase().trim();
  if (!cleanSearch) return FAQS;
  return FAQS.filter(f => 
   f.question.toLowerCase().includes(cleanSearch) || 
   f.answer.toLowerCase().includes(cleanSearch) ||
   f.category.toLowerCase().includes(cleanSearch)
  );
 }, [searchTerm]);

 const activeArticle = useMemo(() => {
  return TUTORIALS.find(t => t.id === activeArticleId) || null;
 }, [activeArticleId]);

 return (
  <div className="space-y-8 pb-16">
   
   {/* HERO BANNER & BUSCA RÁPIDA */}
   <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white p-6 sm:p-10 border border-slate-700/60 shadow-2xl">
    {/* Glow de fundo */}
    <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
    <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

    <div className="relative z-10 max-w-3xl space-y-4">
     <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold font-mono">
      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
      Central de Ajuda & Tutoriais Interativos
     </div>

     <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
      Como podemos te ajudar hoje?
     </h1>

     <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
      Consulte manuais detalhados de cada função do sistema, aprenda a emitir recibos, calcular consumo de diesel, gerenciar horímetros e evitar erros operacionais.
     </p>

     {/* BARRA DE PESQUISA */}
     <div className="pt-2">
      <div className="relative max-w-xl">
       <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
       <Input
        type="text"
        value={searchTerm}
        onChange={(e) => {
         setSearchTerm(e.target.value);
         if (activeArticleId) setActiveArticleId(null);
        }}
        placeholder="Ex: como lançar deslocamento, trocar óleo, recibo whatsapp, quitar cliente..."
        className="pl-12 pr-4 py-3 h-12 bg-white/10 backdrop-blur-md border-slate-600/80 text-white placeholder:text-slate-400 rounded-2xl text-sm focus:border-amber-400 focus:ring-amber-400/20 shadow-inner"
       />
       {searchTerm && (
        <button
         onClick={() => setSearchTerm('')}
         className="absolute right-3.5 top-3.5 text-xs bg-white/20 hover:bg-white/30 text-slate-200 px-2 py-1 rounded-md transition-colors"
        >
         Limpar
        </button>
       )}
      </div>
     </div>
    </div>
   </div>

   {/* TABS DE CATEGORIAS */}
   <div className="flex flex-wrap items-center gap-2 pb-2">
    {categories.map((cat) => (
     <button
      key={cat}
      onClick={() => {
       setSelectedCategory(cat);
       if (activeArticleId) setActiveArticleId(null);
      }}
      className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
       selectedCategory === cat
        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-102 font-extrabold'
        : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 '
      }`}
     >
      {cat === 'todos' ? '📚 Todos os Tutoriais' : cat}
     </button>
    ))}
   </div>

   {/* SE UM ARTIGO ESTIVER ABERTO: EXIBIR DETALHE COMPLETO */}
   {activeArticle ? (
    <div className="space-y-6 animate-scaleUp">
     <div className="flex items-center justify-between">
      <button
       onClick={() => setActiveArticleId(null)}
       className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
      >
       ← Voltar para a lista de tutoriais
      </button>

      {activeArticle.targetRoute && (
       <Button
        onClick={() => navigate(activeArticle.targetRoute!)}
        className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs gap-1.5 shadow-md shadow-amber-500/20"
       >
        <span>Ir para a Tela Agora</span>
        <ArrowRight className="w-3.5 h-3.5" />
       </Button>
      )}
     </div>

     <Card className="border-slate-200 shadow-md overflow-hidden">
      <div className="p-6 sm:p-8 bg-slate-50 border-b border-slate-200 space-y-3">
       <div className="flex items-center gap-2">
        <span className={`p-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 ${activeArticle.categoryColor}`}>
         <activeArticle.categoryIcon className="w-4 h-4" />
         {activeArticle.category}
        </span>
       </div>
       <h2 className="text-2xl sm:text-3xl font-black text-slate-900 ">
        {activeArticle.title}
       </h2>
       <p className="text-sm text-slate-600 leading-relaxed">
        {activeArticle.shortDesc}
       </p>
      </div>

      <CardContent className="p-6 sm:p-8 space-y-6">
       <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        <span>Passo a Passo Detalhado</span>
       </h3>

       <div className="space-y-4">
        {activeArticle.steps.map((step, idx) => (
         <div 
          key={idx} 
          className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2"
         >
          <div className="flex items-center gap-2.5">
           <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-600 text-xs font-mono font-black flex items-center justify-center border border-amber-500/30">
            {idx + 1}
           </span>
           <h4 className="font-bold text-sm sm:text-base text-slate-900 ">
            {step.title}
           </h4>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 pl-8 leading-relaxed">
           {step.description}
          </p>
          {step.tip && (
           <div className="ml-8 mt-2 p-3 rounded-xl bg-amber-50 border border-amber-500/30 text-amber-900 text-xs flex items-start gap-2">
            <Lightbulb className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
            <span>{step.tip}</span>
           </div>
          )}
         </div>
        ))}
       </div>

       {/* Notas Importantes */}
       {activeArticle.importantNotes && (
        <div className="p-4 sm:p-5 rounded-2xl bg-blue-50 border border-blue-200 space-y-2">
         <h4 className="font-bold text-xs sm:text-sm text-blue-900 flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-blue-500" />
          <span>Observações Importantes</span>
         </h4>
         <ul className="space-y-1 text-xs sm:text-sm text-blue-800 list-disc pl-5">
          {activeArticle.importantNotes.map((note, nIdx) => (
           <li key={nIdx}>{note}</li>
          ))}
         </ul>
        </div>
       )}
      </CardContent>
     </Card>
    </div>
   ) : (
    /* GRADE DE CARDS DE TUTORIAIS */
    <div className="space-y-6">
     <div className="flex items-center justify-between">
      <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
       <BookOpen className="w-5 h-5 text-amber-500" />
       <span>Guias e Tutoriais Rápidos</span>
       <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 ">
        {filteredTutorials.length} disponíveis
       </span>
      </h2>
     </div>

     {filteredTutorials.length === 0 ? (
      <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
       <HelpCircle className="w-12 h-12 text-slate-400 mx-auto stroke-[1.5]" />
       <h3 className="font-bold text-slate-800 ">Nenhum tutorial encontrado</h3>
       <p className="text-xs text-slate-500 max-w-sm mx-auto">
        Não encontramos tutoriais com o termo "{searchTerm}". Tente buscar por palavras como "recibo", "óleo", "serviço" ou "diesel".
       </p>
       <Button variant="outline" size="sm" onClick={() => setSearchTerm('')}>
        Limpar Busca
       </Button>
      </div>
     ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
       {filteredTutorials.map((tut) => {
        const IconComponent = tut.categoryIcon;
        return (
         <Card 
          key={tut.id}
          onClick={() => setActiveArticleId(tut.id)}
          className="group hover:border-amber-500/50 hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between"
         >
          <CardContent className="p-5 space-y-3">
           <div className="flex items-center justify-between">
            <span className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${tut.categoryColor}`}>
             <IconComponent className="w-4 h-4" />
             <span>{tut.category}</span>
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
           </div>

           <h3 className="font-bold text-base text-slate-900 group-hover:text-amber-600 transition-colors">
            {tut.title}
           </h3>

           <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {tut.shortDesc}
           </p>

           <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>{tut.steps.length} passos explicados</span>
            <span className="text-amber-600 font-bold flex items-center gap-0.5">
             Ver Tutorial →
            </span>
           </div>
          </CardContent>
         </Card>
        );
       })}
      </div>
     )}
    </div>
   )}

   {/* SEÇÃO DE PERGUNTAS FREQUENTES (FAQ) */}
   <div className="space-y-4 pt-6 border-t border-slate-200 ">
    <div className="flex items-center justify-between">
     <div>
      <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
       <HelpCircle className="w-5 h-5 text-blue-500" />
       <span>Perguntas Frequentes & Respostas Rápidas (FAQ)</span>
      </h2>
      <p className="text-xs text-slate-500 mt-0.5">
       Dúvidas comuns do dia a dia respondidas de forma direta.
      </p>
     </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
     {filteredFaqs.map((faq, idx) => {
      const isOpen = openFaqIndex === idx;
      return (
       <div
        key={idx}
        className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all shadow-sm"
       >
        <button
         onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
         className="w-full p-4 text-left flex items-start justify-between gap-3 cursor-pointer hover:bg-slate-50 transition-colors"
        >
         <div>
          <span className="text-[10px] font-mono font-bold text-amber-600 uppercase tracking-wider block mb-0.5">
           {faq.category}
          </span>
          <h4 className="text-xs sm:text-sm font-bold text-slate-900 ">
           {faq.question}
          </h4>
         </div>
         <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-amber-500' : ''}`} />
        </button>

        {isOpen && (
         <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 animate-scaleUp">
          {faq.answer}
         </div>
        )}
       </div>
      );
     })}
    </div>
   </div>

   {/* DICA DE SUPORTE */}
   <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-slate-100 to-amber-500/5  border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
    <div className="flex items-center gap-3.5 text-center sm:text-left">
     <div className="p-3 rounded-2xl bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20 shrink-0">
      <Lightbulb className="w-6 h-6 stroke-[2.2]" />
     </div>
     <div>
      <h4 className="font-bold text-slate-900 text-sm">
       Não encontrou o que precisava?
      </h4>
      <p className="text-xs text-slate-500 ">
       O sistema é atualizado constantemente. Se tiver dúvidas sobre lançamentos ou configurações, consulte seu gestor operacional.
      </p>
     </div>
    </div>

    <Button
     onClick={() => navigate('/')}
     className="bg-slate-900 hover:bg-slate-800  text-white font-black text-xs px-5 py-2.5 rounded-xl shrink-0"
    >
     Voltar ao Dashboard
    </Button>
   </div>
  </div>
 );
};
