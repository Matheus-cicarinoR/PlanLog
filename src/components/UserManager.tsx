/**
 * UserManager.tsx
 * 
 * PROPÓSITO:
 * Componente responsável pela listagem e manipulação de registros de UserManager.
 * 
 * RESPONSABILIDADES:
 * - Integrar com o SystemContext para consumir dados.
 * - Renderizar a interface gráfica para interação com a entidade correspondente.
 */
import React, { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  ShieldCheck, 
  UserPlus, 
  User, 
  Lock, 
  Mail, 
  Edit3, 
  Trash2, 
  Ban, 
  CheckCircle2, 
  AlertCircle, 
  KeyRound, 
  Clock, 
  X,
  Shield,
  Search,
  Key,
  Check,
  RefreshCw,
  UserCog
} from 'lucide-react';
import type { Usuario, UserRole, UserStatus, AuthUser } from '../types';
import { formatDate } from '../lib/formatters';
import { StorageService } from '../lib/storage';
import { toast } from 'sonner';

import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { EmptyState } from './EmptyState';

// Zod Schema
const userSchema = z.object({
  nome: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres.'),
  email: z.string().email('E-mail inválido.'),
  senha: z.string().optional(),
  cargo: z.enum(['Administrador', 'Financeiro', 'Operador']),
  status: z.enum(['ativo', 'bloqueado']),
}).refine((data) => {
  if (!data.senha && data.status) {
    // In creation mode, password is required if we can't infer it's edit mode
    // We'll handle this manually in the component based on editingUser
    return true; 
  }
  return true;
}, {
  message: "Senha é obrigatória.",
  path: ["senha"]
});

type UserForm = z.infer<typeof userSchema>;

interface UserManagerProps {
  usuarios: Usuario[];
  currentUser: AuthUser;
  onSaveUsuario: (usuario: Usuario) => void;
  onDeleteUsuario: (id: string) => void;
}

export const UserManager: React.FC<UserManagerProps> = ({
  usuarios,
  currentUser,
  onSaveUsuario,
  onDeleteUsuario,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('todos');
  const [filterStatus, setFilterStatus] = useState<string>('todos');

  // Travar o scroll da página no fundo enquanto o modal de usuário estiver aberto
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    setError
  } = useForm<UserForm>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      nome: '',
      email: '',
      senha: '',
      cargo: 'Operador',
      status: 'ativo'
    }
  });

  useEffect(() => {
    if (editingUser) {
      reset({
        nome: editingUser.nome,
        email: editingUser.email,
        senha: '',
        cargo: editingUser.cargo,
        status: editingUser.status
      });
    } else {
      reset({
        nome: '',
        email: '',
        senha: '',
        cargo: 'Operador',
        status: 'ativo'
      });
    }
  }, [editingUser, reset, isModalOpen]);

  const handleOpenNewUser = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEditUser = (u: Usuario) => {
    setEditingUser(u);
    setIsModalOpen(true);
  };

  const handleToggleBlock = (u: Usuario) => {
    if (u.id === currentUser.id) {
      toast.error('Você não pode bloquear seu próprio usuário administrador conectado!');
      return;
    }
    const newStatus: UserStatus = u.status === 'ativo' ? 'bloqueado' : 'ativo';
    const updated: Usuario = {
      ...u,
      status: newStatus,
    };
    onSaveUsuario(updated);
  };

  const handleDelete = (u: Usuario) => {
    if (u.id === currentUser.id) {
      toast.error('Você não pode excluir seu próprio usuário administrador!');
      return;
    }
    if (window.confirm(`Tem certeza que deseja excluir o usuário "${u.nome}" (${u.email})? Esta ação revogará todo o acesso.`)) {
      onDeleteUsuario(u.id);
    }
  };

  const handleGenerateRandomPassword = () => {
    const chars = 'abcdefghjkmnpqrstuvwxyz23456789!@#$';
    let newPass = '';
    for (let i = 0; i < 8; i++) {
      newPass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setValue('senha', newPass, { shouldValidate: true });
    toast.success('Senha segura gerada!');
  };

  const onSubmit = async (data: UserForm) => {
    if (!editingUser && !data.senha?.trim()) {
      setError('senha', { message: 'Por favor, defina uma senha de acesso para o novo usuário.' });
      return;
    }

    if (editingUser) {
      const updatedUser: Usuario = {
        ...editingUser,
        nome: data.nome.trim(),
        email: data.email.trim().toLowerCase(),
        cargo: data.cargo,
        status: data.status,
      };
      
      if (data.senha && data.senha.trim().length > 0) {
        await StorageService.updateUsuarioPassword(updatedUser.email, data.senha.trim());
        toast.success('Senha atualizada com sucesso!');
      }

      onSaveUsuario(updatedUser);
      setIsModalOpen(false);
    } else {
      const result = await StorageService.createUsuario(data.nome, data.email, data.senha!, data.cargo);
      if (result.success && result.user) {
        onSaveUsuario(result.user);
        setIsModalOpen(false);
      } else {
        toast.error(result.message || 'Erro ao cadastrar usuário.');
      }
    }
  };

  // Filtragem
  const filteredUsers = useMemo(() => {
    return usuarios.filter((u) => {
      const matchSearch =
        u.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchRole = filterRole === 'todos' || u.cargo === filterRole;
      const matchStatus = filterStatus === 'todos' || u.status === filterStatus;

      return matchSearch && matchRole && matchStatus;
    });
  }, [usuarios, searchTerm, filterRole, filterStatus]);

  // Métricas
  const totalUsuarios = usuarios.length;
  const totalAtivos = usuarios.filter((u) => u.status === 'ativo').length;
  const totalAdmins = usuarios.filter((u) => u.cargo === 'Administrador').length;
  const totalFinanceiros = usuarios.filter((u) => u.cargo === 'Financeiro').length;
  const totalOperadores = usuarios.filter((u) => u.cargo === 'Operador').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header do Módulo Administrativo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Painel Administrativo de Usuários
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1 flex items-center gap-2">
            <span>Gestão de Contas & Permissões</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono border border-slate-200 dark:border-slate-700">
              {usuarios.length} cadastrados
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Crie novos usuários, redefina senhas, gerencie permissões e controle quem pode acessar o sistema.
          </p>
        </div>

        <Button onClick={handleOpenNewUser} size="lg">
          <UserPlus className="w-4 h-4 stroke-[2.5]" />
          <span>Cadastrar Novo Usuário</span>
        </Button>
      </div>

      {/* KPI Cards de Usuários */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total de Contas</span>
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                <User className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-slate-100 font-mono">{totalUsuarios}</div>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 block font-semibold">{totalAtivos} ativos &bull; {totalUsuarios - totalAtivos} bloqueados</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Administradores</span>
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Shield className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-amber-600 dark:text-amber-400 font-mono">{totalAdmins}</div>
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">Acesso total ao sistema</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Financeiro & Caixa</span>
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Key className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-blue-600 dark:text-blue-400 font-mono">{totalFinanceiros}</div>
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">Controle de receitas e DRE</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Operadores de Campo</span>
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <UserCog className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">{totalOperadores}</div>
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">Lançamentos e telemetria</span>
          </CardContent>
        </Card>

      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar usuário por nome ou e-mail..."
          />
        </div>

        {/* Filtros por Cargo */}
        <div className="flex flex-wrap items-center gap-1.5">
          {['todos', 'Administrador', 'Financeiro', 'Operador'].map((role) => (
            <button
              key={role}
              onClick={() => setFilterRole(role)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterRole === role
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {role === 'todos' ? 'Todos os Cargos' : role}
            </button>
          ))}
        </div>
      </div>

      {/* TABELA DE USUÁRIOS */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase text-xs font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Nome & Perfil</th>
                <th className="py-3.5 px-3">E-mail de Login</th>
                <th className="py-3.5 px-3">Nível de Permissão</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-3">Último Acesso</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10">
                    <EmptyState
                      title="Nenhum usuário encontrado"
                      description="Não há usuários que correspondam aos filtros ou buscas aplicados."
                      icon={<UserCog className="w-8 h-8" />}
                    />
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isBlocked = u.status === 'bloqueado';
                  const isMe = u.id === currentUser.id;

                  let badgeVariant: any = 'success';
                  let icon = '🚜';
                  if (u.cargo === 'Administrador') {
                    badgeVariant = 'warning';
                    icon = '👑';
                  } else if (u.cargo === 'Financeiro') {
                    badgeVariant = 'info';
                    icon = '💼';
                  }

                  return (
                    <tr key={u.id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors ${isBlocked ? 'opacity-50 bg-red-50 dark:bg-red-900/10' : ''}`}>
                      
                      {/* Nome e Avatar */}
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-amber-600 dark:text-amber-400 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-sm shadow-sm">
                            {icon}
                          </div>
                          <div>
                            <span className="text-slate-900 dark:text-slate-100 block font-bold">{u.nome}</span>
                            {isMe && (
                              <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Sua Conta Atual
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-3 text-slate-600 dark:text-slate-400 font-mono whitespace-nowrap">
                        {u.email}
                      </td>

                      {/* Cargo */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <Badge variant={badgeVariant}>{u.cargo}</Badge>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {u.status === 'ativo' ? (
                          <Badge variant="success" className="gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Ativo
                          </Badge>
                        ) : (
                          <Badge variant="danger" className="gap-1">
                            <Ban className="w-3 h-3" /> Bloqueado
                          </Badge>
                        )}
                      </td>

                      {/* Último Acesso */}
                      <td className="py-3.5 px-3 text-slate-500 dark:text-slate-400 font-mono text-xs whitespace-nowrap">
                        {u.ultimo_acesso ? formatDate(u.ultimo_acesso) : 'Nunca acessou'}
                      </td>

                      {/* Ações */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* Bloquear / Desbloquear */}
                          <button
                            onClick={() => handleToggleBlock(u)}
                            disabled={isMe}
                            className={`p-2 rounded-xl border transition-colors ${
                              isBlocked
                                ? 'bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30'
                                : 'bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-slate-200 dark:border-slate-700'
                            } ${isMe ? 'opacity-30 cursor-not-allowed' : ''}`}
                            title={isBlocked ? 'Desbloquear Usuário' : 'Bloquear Usuário'}
                          >
                            <Ban className="w-4 h-4" />
                          </button>

                          {/* Editar */}
                          <button
                            onClick={() => handleOpenEditUser(u)}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700 transition-colors"
                            title="Editar Dados e Senha"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Excluir */}
                          <button
                            onClick={() => handleDelete(u)}
                            disabled={isMe}
                            className={`p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 border border-slate-200 dark:border-slate-700 transition-colors ${
                              isMe ? 'opacity-30 cursor-not-allowed' : ''
                            }`}
                            title="Excluir Usuário"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CRIAR / EDITAR USUÁRIO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-scaleUp">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 sm:px-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                    {editingUser ? 'Editar Usuário & Senha' : 'Cadastrar Novo Usuário'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Defina as credenciais e permissões de acesso ao sistema.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-5 sm:p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1 text-xs sm:text-sm">
              <div className="space-y-1">
                <Label htmlFor="nome">Nome Completo *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="nome"
                    className="pl-9"
                    placeholder="Ex: Carlos Mecânico, Amanda Financeiro..."
                    {...register('nome')}
                  />
                </div>
                {errors.nome?.message && <p className="text-xs text-red-500">{errors.nome.message}</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="email">E-mail de Login *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    className="pl-9"
                    placeholder="usuario@empresa.com.br"
                    {...register('email')}
                  />
                </div>
                {errors.email?.message && <p className="text-xs text-red-500">{errors.email.message}</p>}
              </div>

              {/* Senha com botão de gerar senha */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-600 font-semibold">
                    {editingUser ? 'Nova Senha (deixe em branco para manter)' : 'Senha de Acesso Inicial *'}
                  </label>
                    <button
                      type="button"
                      onClick={handleGenerateRandomPassword}
                      className="text-xs text-amber-400 hover:underline flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" /> Gerar Senha
                    </button>
                  </div>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      placeholder="Mínimo 6 caracteres"
                      {...register('senha')}
                    />
                  </div>
                  {errors.senha?.message && <p className="text-xs text-red-500">{errors.senha.message}</p>}
                  <span className="text-xs text-slate-500 mt-1 block">
                    Criptografada e protegida com segurança no Supabase Auth.
                  </span>
                </div>

              {/* Cargo e Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Nível de Permissão (Cargo)
                  </label>
                  <select
                    {...register('cargo')}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  >
                    <option value="Administrador">👑 Administrador Master</option>
                    <option value="Financeiro">💼 Financeiro & Caixa</option>
                    <option value="Operador">🚜 Operador de Campo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Status da Conta
                  </label>
                  <select
                    {...register('status')}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  >
                    <option value="ativo">🟢 Ativo (Permitir Login)</option>
                    <option value="bloqueado">🔴 Bloqueado (Negar Acesso)</option>
                  </select>
                </div>
              </div>
              </div>

              {/* Footer (Fixed) */}
              <div className="flex items-center justify-end gap-3 px-5 py-3.5 sm:px-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsModalOpen(false)}
                  className="cursor-pointer"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-black cursor-pointer shadow-md shadow-slate-900/20 dark:shadow-white/20"
                >
                  <Check className="w-4 h-4 stroke-[2.5] mr-2" />
                  <span>{editingUser ? 'Atualizar Dados' : 'Salvar Novo Usuário'}</span>
                </Button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
