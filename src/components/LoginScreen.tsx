import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Tractor, 
  Lock, 
  Mail, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Database,
  KeyRound,
  AlertCircle,
  Shield,
  HelpCircle,
  X
} from 'lucide-react';
import type { AuthUser } from '../types';
import { StorageService } from '../lib/storage';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Formato de e-mail inválido.').min(1, 'O e-mail é obrigatório.'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres.'),
  rememberMe: z.boolean().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

interface LoginScreenProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: localStorage.getItem('terraforte_remembered_email') || '',
      password: '',
      rememberMe: !!localStorage.getItem('terraforte_remembered_email'),
    },
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const result = await StorageService.authenticate(data.email, data.password);
      
      if (result.success && result.user) {
        if (data.rememberMe) {
          localStorage.setItem('terraforte_remembered_email', data.email);
        } else {
          localStorage.removeItem('terraforte_remembered_email');
        }

        sessionStorage.setItem('terraforte_session_user', JSON.stringify(result.user));
        toast.success(`Bem-vindo, ${result.user.nome}!`);
        onLoginSuccess(result.user);
      } else {
        setError('root', { message: result.message || 'Credenciais inválidas.' });
      }
    } catch (err) {
      setError('root', { message: 'Falha ao conectar com o servidor.' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col lg:flex-row relative overflow-hidden selection:bg-amber-400 selection:text-slate-950 font-sans">
      
      {/* Left Panel: Cover Image (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50 mix-blend-overlay"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1580901368919-7738efb0f87e?q=80&w=2070&auto=format&fit=crop")' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-950/90" />
        
        <div className="relative z-10 flex flex-col justify-end p-12 w-full">
          <div className="w-16 h-16 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/20 mb-6">
            <Tractor className="w-9 h-9 stroke-[2.2]" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-wider mb-2">
            PlanLog
          </h1>
          <p className="text-lg text-slate-300 font-medium max-w-md">
            Sistema completo para a gestão operacional e financeira de maquinário pesado e retroescavadeiras.
          </p>
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative bg-white dark:bg-slate-950">
        {/* Background Decorative Mesh & Radial Lighting (Mobile only or subtle on right side) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-[500px] bg-radial from-amber-500/10 via-amber-600/5 to-transparent blur-3xl pointer-events-none lg:hidden" />
        
        {/* Grid Pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#F59E0B 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />

        {/* Main Login Container */}
        <div className="relative z-10 w-full max-w-[420px] mx-auto">
        
        {/* Brand Header (Mobile Only) */}
        <div className="text-center mb-8 lg:hidden">
          <div className="relative inline-block">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30 mx-auto mb-3">
              <Tractor className="w-7 h-7 stroke-[2.2]" />
            </div>
          </div>

          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-wider flex items-center justify-center gap-1.5">
            PlanLog
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Gestão de Retroescavadeiras
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl lg:bg-transparent lg:dark:bg-transparent lg:backdrop-blur-none rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 lg:border-none shadow-2xl shadow-black/10 lg:shadow-none space-y-6">
          
          <div className="border-b border-slate-200/80 pb-3.5 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span>Acesso Seguro</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Digite suas credenciais para entrar.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowHelpModal(true)}
              className="text-slate-500 hover:text-amber-400 transition-colors p-1"
              title="Ajuda de Acesso"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>

          {errors.root && (
            <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errors.root.message}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            <div className="space-y-1">
              <Label htmlFor="email" className="text-slate-600 font-semibold text-xs">E-mail de Acesso</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  className="pl-9"
                  placeholder="seu.email@empresa.com.br"
                  autoFocus
                  {...register('email')}
                />
              </div>
              {errors.email?.message && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-slate-600 font-semibold text-xs">
                  Senha
                </label>
                <button
                  type="button"
                  onClick={() => setShowHelpModal(true)}
                  className="text-[11px] text-amber-400/80 hover:text-amber-300 transition-colors"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <div className="relative group">
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...register('password')}
                  />
                </div>
                {errors.password?.message && <p className="text-xs text-red-500">{errors.password.message}</p>}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Lembrar-me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-500 hover:text-slate-600">
                <input
                  type="checkbox"
                  {...register('rememberMe')}
                  className="w-4 h-4 rounded border-slate-200 bg-slate-100 text-amber-500 focus:ring-amber-400/20 accent-amber-500"
                />
                <span>Lembrar meu e-mail</span>
              </label>
            </div>

            {/* Botão Entrar */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2"
              size="lg"
            >
              <span>Entrar no Sistema</span>
              {!isSubmitting && <ArrowRight className="w-4 h-4 stroke-[2.8]" />}
            </Button>
          </form>

        </div>

        {/* Footer Security Badges Removidos conforme solicitação */}
      </div>
      </div>

      {/* Modal Ajuda / Esqueceu a Senha */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" />
                <span>Recuperação de Acesso</span>
              </h3>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-slate-500 hover:text-slate-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Por motivos de segurança, a criação de novas contas ou a redefinição de senhas é realizada diretamente pelo <strong>Administrador do Sistema</strong> através do <strong>Painel Administrativo de Usuários</strong>.
            </p>

            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-xs text-slate-500 dark:text-slate-400 space-y-1">
              <span className="font-bold text-amber-400 block">Conta de Administrador Master:</span>
              <p>O administrador cadastrado pode criar e alterar senhas de operadores e do financeiro a qualquer momento.</p>
            </div>

            <Button
              variant="secondary"
              onClick={() => setShowHelpModal(false)}
              className="w-full"
            >
              Entendido
            </Button>
          </div>
        </div>
      )}

    </div>
  );
};
