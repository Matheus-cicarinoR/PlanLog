/**
 * storage.ts
 * 
 * PROPÓSITO:
 * Atua como o Repositório de Dados do sistema (Data Layer Abstraction).
 * 
 * RESPONSABILIDADES:
 * - Realizar operações de leitura e gravação (CRUD) de forma transparente.
 * - Sincronizar com o Supabase quando há conexão e credenciais válidas.
 * - Prover fallback para LocalStorage (cache local) permitindo que o sistema funcione 
 *  parcialmente offline ou sem as credenciais do backend configuradas.
 */
import type { Servico, Manutencao, Operador, Abastecimento, ConfiguracoesSistema, Usuario, AuthUser, Maquina, Cliente } from '../types';
import { INITIAL_CONFIG, INITIAL_SERVICOS, INITIAL_MANUTENCOES, INITIAL_OPERADORES, INITIAL_ABASTECIMENTOS, INITIAL_USUARIOS } from '../data/initialData';
import { getSupabaseClient } from './supabase';

const KEYS = {
 CONFIG: 'terraforte_config_v1',
 SERVICOS: 'terraforte_servicos_v1',
 MANUTENCOES: 'terraforte_manutencoes_v1',
 OPERADORES: 'terraforte_operadores_v1',
 ABASTECIMENTOS: 'terraforte_abastecimentos_v1',
 USUARIOS: 'terraforte_usuarios_v1',
 MAQUINAS: 'terraforte_maquinas_v1',
 CLIENTES: 'terraforte_clientes_v1',
};

export const StorageService = {
 // CONFIGURAÇÃO
 getConfig(): ConfiguracoesSistema {
  const data = localStorage.getItem(KEYS.CONFIG);
  if (!data) {
   localStorage.setItem(KEYS.CONFIG, JSON.stringify(INITIAL_CONFIG));
   return INITIAL_CONFIG;
  }
  try {
   return { ...INITIAL_CONFIG, ...JSON.parse(data) };
  } catch {
   return INITIAL_CONFIG;
  }
 },

 saveConfig(config: ConfiguracoesSistema): void {
  localStorage.setItem(KEYS.CONFIG, JSON.stringify(config));
  if (config.supabase_url) {
   localStorage.setItem('terraforte_supabase_url', config.supabase_url);
  }
  if (config.supabase_anon_key) {
   localStorage.setItem('terraforte_supabase_anon_key', config.supabase_anon_key);
  }
 },

 // MÁQUINAS
 async getMaquinas(): Promise<Maquina[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
   try {
    const { data, error } = await supabase
     .from('maquinas')
     .select('*')
     .order('created_at', { ascending: true });
    if (!error && data && data.length > 0) {
     localStorage.setItem(KEYS.MAQUINAS, JSON.stringify(data));
     return data as Maquina[];
    }
   } catch (err) {
    console.warn('Falha na busca Supabase maquinas:', err);
   }
  }

  const data = localStorage.getItem(KEYS.MAQUINAS);
  if (!data) {
   // Migração inicial: criar a máquina default usando dados de CONFIG
   const config = this.getConfig();
   const defaultMaquina: Maquina = {
    id: 'maq-default',
    nome: config.modelo_maquina || 'Retroescavadeira CAT 416F2',
    placa: config.placa_identificacao || 'TR-2026-X',
    ano: config.ano_fabricacao || '2022',
    horimetro_inicial: 0,
    horimetro_atual: config.horimetro_atual || 1582.4,
    valor_hora_padrao: config.valor_hora_padrao || 250.0,
    intervalo_troca_oleo_horas: config.intervalo_troca_oleo_horas || 250,
    ultimo_oleo_horimetro: config.ultimo_oleo_horimetro || 1500.0,
    created_at: new Date().toISOString(),
   };
   const initialList = [defaultMaquina];
   localStorage.setItem(KEYS.MAQUINAS, JSON.stringify(initialList));
   return initialList;
  }
  try {
   return JSON.parse(data);
  } catch {
   return [];
  }
 },

 async saveMaquina(maquina: Maquina): Promise<Maquina[]> {
  const maquinas = await this.getMaquinas();
  const index = maquinas.findIndex((m) => m.id === maquina.id);
  let updated: Maquina[];
  if (index >= 0) {
   updated = [...maquinas];
   updated[index] = maquina;
  } else {
   updated = [...maquinas, maquina];
  }
  localStorage.setItem(KEYS.MAQUINAS, JSON.stringify(updated));

  const supabase = getSupabaseClient();
  if (supabase) {
   try {
    await supabase.from('maquinas').upsert(maquina);
   } catch (err) {
    console.warn('Erro ao salvar maquina no Supabase:', err);
   }
  }

  // Se salvamos a máquina selecionada como default (ou se só tem ela), sincronizar alguns dados de CONFIG para manter compatibilidade
  if (maquina.id === 'maq-default') {
   const config = this.getConfig();
   this.saveConfig({
    ...config,
    modelo_maquina: maquina.nome,
    placa_identificacao: maquina.placa,
    ano_fabricacao: maquina.ano,
    horimetro_atual: maquina.horimetro_atual,
    valor_hora_padrao: maquina.valor_hora_padrao,
    intervalo_troca_oleo_horas: maquina.intervalo_troca_oleo_horas,
    ultimo_oleo_horimetro: maquina.ultimo_oleo_horimetro,
   });
  }

  return updated;
 },

 async deleteMaquina(id: string): Promise<Maquina[]> {
  const maquinas = await this.getMaquinas();
  const updated = maquinas.filter((m) => m.id !== id);
  localStorage.setItem(KEYS.MAQUINAS, JSON.stringify(updated));

  const supabase = getSupabaseClient();
  if (supabase) {
   try {
    await supabase.from('maquinas').delete().eq('id', id);
   } catch (err) {
    console.warn('Erro ao deletar maquina no Supabase:', err);
   }
  }

  return updated;
 },

 // USUÁRIOS E AUTENTICAÇÃO VIA SUPABASE AUTH
 async getUsuarios(): Promise<Usuario[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
   try {
    const { data, error } = await supabase
     .from('usuarios')
     .select('id, user_id, nome, email, cargo, status, ultimo_acesso, created_at')
     .order('created_at', { ascending: true });
    if (!error && data && data.length > 0) {
     localStorage.setItem(KEYS.USUARIOS, JSON.stringify(data));
     return data as Usuario[];
    }
   } catch (err) {
    console.warn('Falha na busca Supabase usuarios:', err);
   }
  }

  const data = localStorage.getItem(KEYS.USUARIOS);
  if (!data) {
   localStorage.setItem(KEYS.USUARIOS, JSON.stringify(INITIAL_USUARIOS));
   return INITIAL_USUARIOS;
  }
  try {
   return JSON.parse(data);
  } catch {
   return INITIAL_USUARIOS;
  }
 },

 async createUsuario(nome: string, email: string, password: string, cargo: Usuario['cargo']): Promise<{ success: boolean; message: string; user?: Usuario }> {
  const cleanEmail = email.trim().toLowerCase();
  const supabase = getSupabaseClient();

  if (supabase) {
   try {
    // Criar usuário no Supabase Auth com senha criptografada internamente via bcrypt
    const { data, error } = await supabase.auth.signUp({
     email: cleanEmail,
     password: password.trim(),
     options: {
      data: {
       nome: nome.trim(),
       cargo,
      },
     },
    });

    if (error) {
     return { success: false, message: `Erro ao criar usuário no Supabase: ${error.message}` };
    }

    const newUser: Usuario = {
     id: data.user?.id || `usr-${Date.now()}`,
     user_id: data.user?.id,
     nome: nome.trim(),
     email: cleanEmail,
     cargo,
     status: 'ativo',
     created_at: new Date().toISOString(),
    };

    // Salvar na tabela de perfis
    await supabase.from('usuarios').upsert(newUser);
    await this.saveUsuarioLocal(newUser);

    return { success: true, message: 'Usuário cadastrado com sucesso!', user: newUser };
   } catch (err: any) {
    return { success: false, message: `Erro na criação: ${err?.message || 'Falha de conexão'}` };
   }
  }

  // Fallback local
  const newUser: Usuario = {
   id: `usr-${Date.now()}`,
   nome: nome.trim(),
   email: cleanEmail,
   cargo,
   status: 'ativo',
   created_at: new Date().toISOString(),
  };
  await this.saveUsuarioLocal(newUser);
  return { success: true, message: 'Usuário cadastrado localmente!', user: newUser };
 },

 async updateUsuarioPassword(email: string, newPassword: string): Promise<{ success: boolean; message: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const supabase = getSupabaseClient();
  if (supabase) {
   try {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
     console.warn('Supabase password update failed. This requires user to be logged in as themselves or Admin API.', error);
     return { success: false, message: error.message };
    }
    return { success: true, message: 'Senha atualizada no Supabase com sucesso!' };
   } catch (err: any) {
    return { success: false, message: 'Falha ao atualizar senha na nuvem.' };
   }
  }
  return { success: true, message: 'Senha atualizada localmente (mock).' };
 },

 async saveUsuarioLocal(usuario: Usuario): Promise<Usuario[]> {
  const usuarios = await this.getUsuarios();
  const index = usuarios.findIndex((u) => u.id === usuario.id || u.email.toLowerCase() === usuario.email.toLowerCase());
  let updated: Usuario[];
  if (index >= 0) {
   updated = [...usuarios];
   updated[index] = usuario;
  } else {
   updated = [...usuarios, usuario];
  }
  localStorage.setItem(KEYS.USUARIOS, JSON.stringify(updated));
  return updated;
 },

 async saveUsuario(usuario: Usuario): Promise<Usuario[]> {
  const usuarios = await this.getUsuarios();
  const index = usuarios.findIndex((u) => u.id === usuario.id || u.email.toLowerCase() === usuario.email.toLowerCase());
  let updated: Usuario[];
  if (index >= 0) {
   updated = [...usuarios];
   updated[index] = usuario;
  } else {
   updated = [...usuarios, usuario];
  }
  localStorage.setItem(KEYS.USUARIOS, JSON.stringify(updated));

  const supabase = getSupabaseClient();
  if (supabase) {
   try {
    await supabase.from('usuarios').upsert({
     id: usuario.id,
     user_id: usuario.user_id || usuario.id,
     nome: usuario.nome,
     email: usuario.email,
     cargo: usuario.cargo,
     status: usuario.status,
     ultimo_acesso: usuario.ultimo_acesso,
    });
   } catch (err) {
    console.warn('Erro ao salvar usuario no Supabase:', err);
   }
  }

  return updated;
 },

 async deleteUsuario(id: string): Promise<Usuario[]> {
  const usuarios = await this.getUsuarios();
  const updated = usuarios.filter((u) => u.id !== id);
  localStorage.setItem(KEYS.USUARIOS, JSON.stringify(updated));

  const supabase = getSupabaseClient();
  if (supabase) {
   try {
    await supabase.from('usuarios').delete().eq('id', id);
   } catch (err) {
    console.warn('Erro ao deletar usuario no Supabase:', err);
   }
  }

  return updated;
 },

 // AUTENTICAÇÃO REAL VIA SUPABASE AUTH (Bcrypt Seguro)
 async authenticate(email: string, password: string): Promise<{ success: boolean; user?: AuthUser; message?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();
  const supabase = getSupabaseClient();

  if (supabase) {
   try {
    const { data, error } = await supabase.auth.signInWithPassword({
     email: cleanEmail,
     password: cleanPassword,
    });

    if (!error && data.user) {
     // Buscar perfil do usuário
     const { data: profile } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', cleanEmail)
      .maybeSingle();

     if (profile && profile.status === 'bloqueado') {
      await supabase.auth.signOut();
      return { success: false, message: 'Esta conta foi bloqueada pelo Administrador. Contate o suporte.' };
     }

     const role = profile?.cargo || data.user.user_metadata?.cargo || (cleanEmail.includes('admin') ? 'Administrador' : cleanEmail.includes('erica') ? 'Financeiro' : 'Operador');
     const nome = profile?.nome || data.user.user_metadata?.nome || cleanEmail.split('@')[0];

     // Atualizar último acesso
     await supabase.from('usuarios').upsert({
      id: data.user.id,
      user_id: data.user.id,
      email: cleanEmail,
      nome,
      cargo: role,
      status: 'ativo',
      ultimo_acesso: new Date().toISOString(),
     });

     return {
      success: true,
      user: {
       id: data.user.id,
       nome,
       email: cleanEmail,
       cargo: role,
      },
     };
    } else if (error) {
     console.warn('Erro Supabase Auth:', error.message);
     
     // Se for erro de credenciais inválidas
     if (error.message === 'Invalid login credentials' || error.message.includes('invalid_credentials')) {
      return { success: false, message: 'E-mail ou senha incorretos.' };
     }
     
     // Se for erro temporário de banco/schema no Supabase GoTrue
     if (error.message.includes('Database error') || error.message.includes('schema') || error.message.includes('500')) {
       return { success: false, message: 'Erro interno do servidor Supabase (500).' };
     }

     return { success: false, message: error.message };
    }
   } catch (err: any) {
    console.warn('Erro ao tentar Supabase Auth:', err);
   }
  }

  // Fallback local se o Supabase não estiver configurado
  const usuarios = await this.getUsuarios();
  const userLocal = usuarios.find(u => u.email.toLowerCase() === cleanEmail);
  if (userLocal && password) {
   // Aviso: O ideal é um backend para hash. Isso é apenas um mock offline
   return { success: true, user: { id: userLocal.id, nome: userLocal.nome, email: userLocal.email, cargo: userLocal.cargo } };
  }

  return { success: false, message: 'Credenciais inválidas. Verifique os dados digitados.' };
 },

 // SERVIÇOS
 async getServicos(): Promise<Servico[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
   try {
    const { data, error } = await supabase
     .from('servicos')
     .select('*')
     .order('data_servico', { ascending: false });
    if (!error && data && data.length > 0) {
     const mapped = data.map((s: any) => ({ ...s, maquina_id: s.maquina_id || 'maq-default' }));
     localStorage.setItem(KEYS.SERVICOS, JSON.stringify(mapped));
     return mapped as Servico[];
    }
   } catch (err) {
    console.warn('Falha na busca Supabase, usando dados locais:', err);
   }
  }

  const data = localStorage.getItem(KEYS.SERVICOS);
  if (!data) {
   const mapped = INITIAL_SERVICOS.map(s => ({ ...s, maquina_id: s.maquina_id || 'maq-default' }));
   localStorage.setItem(KEYS.SERVICOS, JSON.stringify(mapped));
   return mapped;
  }
  try {
   const parsed = JSON.parse(data) as Servico[];
   return parsed.map((s) => ({ ...s, maquina_id: s.maquina_id || 'maq-default' }));
  } catch {
   const mapped = INITIAL_SERVICOS.map(s => ({ ...s, maquina_id: s.maquina_id || 'maq-default' }));
   return mapped;
  }
 },

 async saveServico(servico: Servico): Promise<Servico[]> {
  const servicos = await this.getServicos();
  const index = servicos.findIndex((s) => s.id === servico.id);
  let updated: Servico[];
  if (index >= 0) {
   updated = [...servicos];
   updated[index] = servico;
  } else {
   updated = [servico, ...servicos];
  }
  localStorage.setItem(KEYS.SERVICOS, JSON.stringify(updated));

  const supabase = getSupabaseClient();
  if (supabase) {
   try {
    await supabase.from('servicos').upsert(servico);
   } catch (err) {
    console.warn('Erro ao salvar no Supabase:', err);
   }
  }

  return updated;
 },

 async deleteServico(id: string): Promise<Servico[]> {
  const servicos = await this.getServicos();
  const updated = servicos.filter((s) => s.id !== id);
  localStorage.setItem(KEYS.SERVICOS, JSON.stringify(updated));

  const supabase = getSupabaseClient();
  if (supabase) {
   try {
    await supabase.from('servicos').delete().eq('id', id);
   } catch (err) {
    console.warn('Erro ao deletar no Supabase:', err);
   }
  }

  return updated;
 },

 // MANUTENÇÕES
 async getManutencoes(): Promise<Manutencao[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
   try {
    const { data, error } = await supabase
     .from('manutencoes')
     .select('*')
     .order('data_manutencao', { ascending: false });
    if (!error && data && data.length > 0) {
     const mapped = data.map((m: any) => ({ ...m, maquina_id: m.maquina_id || 'maq-default' }));
     localStorage.setItem(KEYS.MANUTENCOES, JSON.stringify(mapped));
     return mapped as Manutencao[];
    }
   } catch (err) {
    console.warn('Falha Supabase manutenções:', err);
   }
  }

  const data = localStorage.getItem(KEYS.MANUTENCOES);
  if (!data) {
   const mapped = INITIAL_MANUTENCOES.map(m => ({ ...m, maquina_id: m.maquina_id || 'maq-default' }));
   localStorage.setItem(KEYS.MANUTENCOES, JSON.stringify(mapped));
   return mapped;
  }
  try {
   const parsed = JSON.parse(data) as Manutencao[];
   return parsed.map((m) => ({ ...m, maquina_id: m.maquina_id || 'maq-default' }));
  } catch {
   const mapped = INITIAL_MANUTENCOES.map(m => ({ ...m, maquina_id: m.maquina_id || 'maq-default' }));
   return mapped;
  }
 },

 async saveManutencao(manutencao: Manutencao): Promise<Manutencao[]> {
  const list = await this.getManutencoes();
  const index = list.findIndex((m) => m.id === manutencao.id);
  let updated: Manutencao[];
  if (index >= 0) {
   updated = [...list];
   updated[index] = manutencao;
  } else {
   updated = [manutencao, ...list];
  }
  localStorage.setItem(KEYS.MANUTENCOES, JSON.stringify(updated));

  const supabase = getSupabaseClient();
  if (supabase) {
   try {
    await supabase.from('manutencoes').upsert(manutencao);
   } catch (err) {
    console.warn('Erro ao salvar manutenção no Supabase:', err);
   }
  }

  return updated;
 },

 async deleteManutencao(id: string): Promise<Manutencao[]> {
  const list = await this.getManutencoes();
  const updated = list.filter((m) => m.id !== id);
  localStorage.setItem(KEYS.MANUTENCOES, JSON.stringify(updated));

  const supabase = getSupabaseClient();
  if (supabase) {
   try {
    await supabase.from('manutencoes').delete().eq('id', id);
   } catch (err) {
    console.warn('Erro ao deletar manutenção no Supabase:', err);
   }
  }

  return updated;
 },

 // OPERADORES
 async getOperadores(): Promise<Operador[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
   try {
    const { data, error } = await supabase.from('operadores').select('*');
    if (!error && data && data.length > 0) {
     localStorage.setItem(KEYS.OPERADORES, JSON.stringify(data));
     return data as Operador[];
    }
   } catch (err) {
    console.warn('Falha Supabase operadores:', err);
   }
  }

  const data = localStorage.getItem(KEYS.OPERADORES);
  if (!data) {
   localStorage.setItem(KEYS.OPERADORES, JSON.stringify(INITIAL_OPERADORES));
   return INITIAL_OPERADORES;
  }
  try {
   return JSON.parse(data);
  } catch {
   return INITIAL_OPERADORES;
  }
 },

 async saveOperador(operador: Operador): Promise<Operador[]> {
  const list = await this.getOperadores();
  const index = list.findIndex((o) => o.id === operador.id);
  let updated: Operador[];
  if (index >= 0) {
   updated = [...list];
   updated[index] = operador;
  } else {
   updated = [operador, ...list];
  }
  localStorage.setItem(KEYS.OPERADORES, JSON.stringify(updated));

  const supabase = getSupabaseClient();
  if (supabase) {
   try {
    await supabase.from('operadores').upsert(operador);
   } catch (err) {
    console.warn('Erro ao salvar operador no Supabase:', err);
   }
  }

  return updated;
 },

 // ABASTECIMENTOS
 async getAbastecimentos(): Promise<Abastecimento[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
   try {
    const { data, error } = await supabase
     .from('abastecimentos')
     .select('*')
     .order('data', { ascending: false });
    if (!error && data && data.length > 0) {
     const mapped = data.map((a: any) => ({ ...a, maquina_id: a.maquina_id || 'maq-default' }));
     localStorage.setItem(KEYS.ABASTECIMENTOS, JSON.stringify(mapped));
     return mapped as Abastecimento[];
    }
   } catch (err) {
    console.warn('Falha Supabase abastecimentos:', err);
   }
  }

  const data = localStorage.getItem(KEYS.ABASTECIMENTOS);
  if (!data) {
   const mapped = INITIAL_ABASTECIMENTOS.map(a => ({ ...a, maquina_id: a.maquina_id || 'maq-default' }));
   localStorage.setItem(KEYS.ABASTECIMENTOS, JSON.stringify(mapped));
   return mapped;
  }
  try {
   const parsed = JSON.parse(data) as Abastecimento[];
   return parsed.map((a) => ({ ...a, maquina_id: a.maquina_id || 'maq-default' }));
  } catch {
   const mapped = INITIAL_ABASTECIMENTOS.map(a => ({ ...a, maquina_id: a.maquina_id || 'maq-default' }));
   return mapped;
  }
 },

 async saveAbastecimento(abastecimento: Abastecimento): Promise<Abastecimento[]> {
  const list = await this.getAbastecimentos();
  const index = list.findIndex((a) => a.id === abastecimento.id);
  let updated: Abastecimento[];
  if (index >= 0) {
   updated = [...list];
   updated[index] = abastecimento;
  } else {
   updated = [abastecimento, ...list];
  }
  localStorage.setItem(KEYS.ABASTECIMENTOS, JSON.stringify(updated));

  const supabase = getSupabaseClient();
  if (supabase) {
   try {
    await supabase.from('abastecimentos').upsert(abastecimento);
   } catch (err) {
    console.warn('Erro ao salvar abastecimento no Supabase:', err);
   }
  }

  return updated;
 },

 async deleteAbastecimento(id: string): Promise<Abastecimento[]> {
  const list = await this.getAbastecimentos();
  const updated = list.filter((a) => a.id !== id);
  localStorage.setItem(KEYS.ABASTECIMENTOS, JSON.stringify(updated));

  const supabase = getSupabaseClient();
  if (supabase) {
   try {
    await supabase.from('abastecimentos').delete().eq('id', id);
   } catch (err) {
    console.warn('Erro ao deletar abastecimento no Supabase:', err);
   }
  }

  return updated;
 },

 // CLIENTES
 async getClientes(): Promise<Cliente[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
   try {
    const { data, error } = await supabase
     .from('clientes')
     .select('*')
     .order('nome', { ascending: true });
    if (!error && data && data.length > 0) {
     localStorage.setItem(KEYS.CLIENTES, JSON.stringify(data));
     return data as Cliente[];
    }
   } catch (err) {
    console.warn('Falha Supabase clientes:', err);
   }
  }

  const data = localStorage.getItem(KEYS.CLIENTES);
  if (!data) {
   return [];
  }
  try {
   return JSON.parse(data);
  } catch {
   return [];
  }
 },

 async saveCliente(cliente: Cliente): Promise<Cliente[]> {
  const list = await this.getClientes();
  const index = list.findIndex((c) => c.id === cliente.id);
  let updated: Cliente[];
  if (index >= 0) {
   updated = [...list];
   updated[index] = cliente;
  } else {
   updated = [...list, cliente];
  }
  localStorage.setItem(KEYS.CLIENTES, JSON.stringify(updated));

  const supabase = getSupabaseClient();
  if (supabase) {
   try {
    await supabase.from('clientes').upsert(cliente);
   } catch (err) {
    console.warn('Erro ao salvar cliente no Supabase:', err);
   }
  }

  return updated;
 },

 async deleteCliente(id: string): Promise<Cliente[]> {
  const list = await this.getClientes();
  const updated = list.filter((c) => c.id !== id);
  localStorage.setItem(KEYS.CLIENTES, JSON.stringify(updated));

  const supabase = getSupabaseClient();
  if (supabase) {
   try {
    await supabase.from('clientes').delete().eq('id', id);
   } catch (err) {
    console.warn('Erro ao deletar cliente no Supabase:', err);
   }
  }

  return updated;
 },

 // SINCRONIZAÇÃO COMPLETA
 async syncAllToSupabase(): Promise<{ success: boolean; message: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
   return { success: false, message: 'Supabase não configurado.' };
  }

  try {
   const [servicos, manutencoes, operadores, abastecimentos, usuarios, maquinas, clientes] = await Promise.all([
    this.getServicos(),
    this.getManutencoes(),
    this.getOperadores(),
    this.getAbastecimentos(),
    this.getUsuarios(),
    this.getMaquinas(),
    this.getClientes(),
   ]);

   if (servicos.length > 0) await supabase.from('servicos').upsert(servicos);
   if (manutencoes.length > 0) await supabase.from('manutencoes').upsert(manutencoes);
   if (operadores.length > 0) await supabase.from('operadores').upsert(operadores);
   if (abastecimentos.length > 0) await supabase.from('abastecimentos').upsert(abastecimentos);
   if (usuarios.length > 0) await supabase.from('usuarios').upsert(usuarios);
   if (maquinas.length > 0) await supabase.from('maquinas').upsert(maquinas);
   if (clientes.length > 0) await supabase.from('clientes').upsert(clientes);

   return { success: true, message: 'Dados sincronizados com sucesso no Supabase TerraLog!' };
  } catch (err: any) {
   return { success: false, message: `Erro ao sincronizar: ${err?.message || 'Falha de conexão'}` };
  }
 },

 // RESTAURAR PADRÃO DA PLANILHA
 resetToDefault(): void {
  localStorage.setItem(KEYS.CONFIG, JSON.stringify(INITIAL_CONFIG));
  localStorage.setItem(KEYS.SERVICOS, JSON.stringify(INITIAL_SERVICOS));
  localStorage.setItem(KEYS.MANUTENCOES, JSON.stringify(INITIAL_MANUTENCOES));
  localStorage.setItem(KEYS.OPERADORES, JSON.stringify(INITIAL_OPERADORES));
  localStorage.setItem(KEYS.ABASTECIMENTOS, JSON.stringify(INITIAL_ABASTECIMENTOS));
  localStorage.setItem(KEYS.USUARIOS, JSON.stringify(INITIAL_USUARIOS));
  localStorage.removeItem(KEYS.MAQUINAS);
  localStorage.removeItem(KEYS.CLIENTES);
 },
};
