import React, { useState } from 'react';
import { LogOut, Shield, Settings, CheckCircle } from 'lucide-react';
import user1 from "/src/assets/images/profile/user-1.jpg";

const Upgrade: React.FC = () => {
 const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

 const handleLogout = () => {
  localStorage.removeItem('sb_user');
  sessionStorage.removeItem('terraforte_session_user');
  window.location.href = '/auth/login';
 };

 return (
  <div className="p-3 border-t border-slate-200 bg-slate-50/80 ">
   <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white border border-slate-200/80 shadow-xs">
    <div className="flex items-center gap-2.5 min-w-0">
     <div className="relative shrink-0">
      <img
       src={user1}
       alt="Admin Profile"
       className="w-9 h-9 rounded-full object-cover border-2 border-amber-400"
      />
      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full animate-pulse"></span>
     </div>
     <div className="min-w-0 flex flex-col">
      <div className="flex items-center gap-1">
       <span className="text-xs font-bold text-slate-800 truncate">
        Administrador
       </span>
       <Shield className="w-3 h-3 text-amber-500 shrink-0" />
      </div>
      <span className="text-[10px] text-emerald-600 font-semibold truncate flex items-center gap-1">
       <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Conectado
      </span>
     </div>
    </div>

    <div className="flex items-center gap-1 shrink-0">
     <button
      type="button"
      onClick={() => setShowLogoutConfirm(true)}
      title="Sair da Conta"
      className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
     >
      <LogOut className="w-4 h-4" />
     </button>
    </div>
   </div>

   {showLogoutConfirm && (
    <div className="mt-2 p-2.5 rounded-xl bg-red-50 border border-red-200 text-center animate-fadeIn">
     <p className="text-[11px] font-bold text-red-700 mb-2">
      Deseja realmente sair?
     </p>
     <div className="flex gap-2">
      <button
       onClick={() => setShowLogoutConfirm(false)}
       className="flex-1 py-1 rounded-lg bg-white text-[11px] font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 cursor-pointer"
      >
       Cancelar
      </button>
      <button
       onClick={handleLogout}
       className="flex-1 py-1 rounded-lg bg-red-600 text-[11px] font-bold text-white hover:bg-red-700 shadow-xs cursor-pointer"
      >
       Sim, Sair
      </button>
     </div>
    </div>
   )}
  </div>
 );
};

export default Upgrade;
