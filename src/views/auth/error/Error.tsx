import React from 'react';
import { useNavigate } from 'react-router';
import { Tractor, ArrowLeft, Home, Calendar, AlertTriangle, Compass } from 'lucide-react';
import { Button } from '../../../components/ui/button';

const Error: React.FC = () => {
 const navigate = useNavigate();

 return (
  <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[#e9eef5] text-slate-900 transition-colors duration-200">
   {/* Background glow circle */}
   <div className="absolute w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -translate-y-12 animate-pulse" />

   <div className="relative w-full max-w-lg bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-2xl text-center space-y-6 animate-scaleUp">
    
    {/* Animated Icon Badge */}
    <div className="relative mx-auto w-24 h-24 flex items-center justify-center rounded-3xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 shadow-xl shadow-amber-500/30">
     <Tractor className="w-12 h-12 stroke-[2.2]" />
     <div className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-red-500 text-white shadow-md">
      <AlertTriangle className="w-4 h-4" />
     </div>
    </div>

    {/* 404 Tag and Title */}
    <div className="space-y-2">
     <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/30 text-xs font-black uppercase tracking-wider font-mono">
      <Compass className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
      Erro 404 • Rota Não Encontrada
     </div>

     <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 ">
      Estrada não encontrada!
     </h1>

     <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
      O endereço que você tentou acessar não existe, foi alterado ou a nossa retroescavadeira ainda não abriu essa estrada.
     </p>
    </div>

    {/* Quick Action Navigation Buttons */}
    <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
     <Button
      onClick={() => navigate('/')}
      className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-500/20 rounded-xl px-5 py-2.5 text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-transform"
     >
      <Home className="w-4 h-4" />
      <span>Painel Principal</span>
     </Button>

     <Button
      variant="outline"
      onClick={() => navigate('/agenda')}
      className="w-full sm:w-auto font-bold border-slate-200 hover:bg-slate-100 rounded-xl px-4 py-2.5 text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
     >
      <Calendar className="w-4 h-4 text-amber-500" />
      <span>Ver Agenda</span>
     </Button>

     <button
      onClick={() => navigate(-1)}
      className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center justify-center gap-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
     >
      <ArrowLeft className="w-3.5 h-3.5" />
      <span>Voltar</span>
     </button>
    </div>

    {/* Footer Note */}
    <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 ">
     Sistema de Gestão de Retroescavadeiras & Frotas
    </div>
   </div>
  </div>
 );
};

export default Error;
