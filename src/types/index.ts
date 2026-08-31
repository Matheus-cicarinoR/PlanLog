export type PaymentStatus = 'pago' | 'pendente' | 'parcial';

export type PaymentMethod = 'pix' | 'dinheiro' | 'cartao' | 'misto' | 'a_definir';

export interface Cliente {
  id: string;
  nome: string;
  telefone?: string;
  cpf_cnpj?: string;
  email?: string;
  endereco?: string;
  cidade?: string;
  observacoes?: string;
  created_at: string;
}

export type TipoRegistroServico = 'servico_cliente' | 'deslocamento_interno';

export interface Servico {
  id: string;
  maquina_id?: string; // ID da máquina associada
  cliente_id?: string; // ID do cliente associado
  tipo_registro?: TipoRegistroServico; // 'servico_cliente' ou 'deslocamento_interno'
  cliente: string;
  tempo_horas: number; // Horas cobradas do cliente (ou horas do deslocamento se for interno)
  tempo_deslocamento_horas?: number; // Horas extras de trânsito/deslocamento interno (não cobradas do cliente)
  valor_hora: number;
  valor_total: number;
  valor_pago: number;
  saldo_devedor: number;
  forma_pagamento: PaymentMethod;
  detalhe_pagamento?: string;
  data_servico: string;
  data_pagamento?: string;
  status: PaymentStatus;
  entregue_a?: string; // ex: 'Jurandir', 'Erica', 'Caixa Empresa'
  operador_responsavel?: string;
  descricao_servico?: string;
  localizacao?: string;
  observacoes?: string;
  created_at: string;
}

export type TipoManutencao = 
  | 'preventiva' 
  | 'corretiva' 
  | 'troca_oleo' 
  | 'filtros' 
  | 'hidraulico' 
  | 'pneus_esteiras' 
  | 'dentes_cacamba' 
  | 'mecanica_geral';

export interface Manutencao {
  id: string;
  maquina_id?: string; // ID da máquina associada
  titulo: string;
  tipo: TipoManutencao;
  horimetro_momento: number;
  proxima_revisao_horas?: number;
  valor_total: number;
  data_manutencao: string;
  mecanico_responsavel?: string;
  fornecedor?: string;
  status: 'concluido' | 'agendado' | 'em_andamento' | 'urgente';
  descricao_pecas?: string;
  observacoes?: string;
  created_at: string;
}

export interface Operador {
  id: string;
  nome: string;
  cargo: 'Operador Principal' | 'Operador Substituto' | 'Ajudante / Servente' | 'Gestor / Financeiro';
  telefone: string;
  chave_pix?: string;
  tipo_remuneracao: 'hora' | 'diaria' | 'comissao' | 'fixo_mensal';
  valor_base: number;
  percentual_comissao?: number;
  status: 'ativo' | 'inativo';
  total_recebido_em_maos: number; // Controle de dinheiro que passou pela mão do operador
  total_repassado_empresa: number;
  observacoes?: string;
  created_at: string;
}

export interface Abastecimento {
  id: string;
  maquina_id?: string; // ID da máquina associada
  data: string;
  horimetro: number;
  tipo_combustivel: 'Diesel S10' | 'Diesel S500' | 'Arla 32' | 'Óleo Hidráulico';
  litros: number;
  preco_litro: number;
  valor_total: number;
  posto_fornecedor: string;
  operador: string;
  nota_fiscal?: string;
  observacoes?: string;
  created_at: string;
}

export interface Maquina {
  id: string;
  nome: string;
  placa: string;
  ano: string;
  horimetro_inicial: number;
  horimetro_atual: number;
  valor_hora_padrao: number;
  intervalo_troca_oleo_horas: number;
  ultimo_oleo_horimetro: number;
  created_at: string;
}

export interface ConfiguracoesSistema {
  nome_empresa: string;
  cnpj_cpf: string;
  telefone_contato: string;
  chave_pix_empresa: string;
  nome_titular_pix: string;
  modelo_maquina: string;
  placa_identificacao: string;
  ano_fabricacao: string;
  horimetro_atual: number;
  valor_hora_padrao: number;
  intervalo_troca_oleo_horas: number;
  ultimo_oleo_horimetro: number;
  supabase_url: string;
  supabase_anon_key: string;
}

export type UserRole = 'Administrador' | 'Financeiro' | 'Operador';
export type UserStatus = 'ativo' | 'bloqueado';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  cargo: UserRole;
  status: UserStatus;
  user_id?: string;
  ultimo_acesso?: string;
  created_at: string;
}

export interface AuthUser {
  id: string;
  nome: string;
  email: string;
  cargo: UserRole;
}
