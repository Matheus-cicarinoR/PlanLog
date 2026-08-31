
import SidebarContent from "./Sidebaritems";
import NavItems from "./NavItems";
import SimpleBar from "simplebar-react";
import React from "react";
import FullLogo from "../shared/logo/FullLogo";
import 'simplebar-react/dist/simplebar.min.css';
import Upgrade from "./Upgrade";
import { useSystemState } from "../../../context/SystemContext";
import { PlusCircle } from "lucide-react";

interface MobileSidebarProps {
  onClose?: () => void;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({ onClose }) => {
  const { 
    maquinas, 
    selectedMaquinaId, 
    handleSelectMaquina,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    openNewServiceModal
  } = useSystemState();

  const handleOpenService = () => {
    openNewServiceModal();
    if (onClose) onClose();
  };

  return (
    <>
      <div className="h-full bg-white dark:bg-slate-900 flex flex-col justify-between">
        <div className="px-5 py-4 flex items-center sidebarlogo shrink-0 border-b border-slate-100 dark:border-slate-800/60">
          <FullLogo />
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
          {/* Machine & Period Selection */}
          <div className="px-5 mt-4 mb-4 space-y-4">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Máquina / Veículo</span>
              <div className="relative">
                <select
                  value={selectedMaquinaId || 'todas'}
                  onChange={(e) => handleSelectMaquina(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-amber-500/50 appearance-none cursor-pointer"
                >
                  <option value="todas">🚜 Consolidado (Todas)</option>
                  {maquinas.map((maq) => (
                    <option key={maq.id} value={maq.id}>
                      🚜 {maq.nome} ({maq.placa})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Data Inicial</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-amber-500/50 cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Data Final</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-amber-500/50 cursor-pointer"
              />
            </div>

            {(startDate || endDate) && (
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
                className="w-full py-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 font-bold text-[10px] transition-all cursor-pointer"
              >
                Limpar Período
              </button>
            )}
          </div>

          {/* Action CTA: Cadastrar Serviço */}
          <div className="px-5 mb-4">
            <button
              type="button"
              onClick={handleOpenService}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs py-2.5 px-4 rounded-xl shadow-md shadow-amber-500/20 hover:shadow-amber-500/30 active:scale-[0.98] transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" />
              Cadastrar Serviço
            </button>
          </div>

          <div className="px-5 mt-2">
            <nav className="sidebar-nav hide-menu flex flex-col gap-1">
              {SidebarContent &&
                SidebarContent?.map((item, index) => (
                  <div className="caption mb-4" key={item.heading}>
                    <React.Fragment key={index}>
                      <h5 className="text-slate-500 dark:text-slate-400 font-semibold leading-6 text-xs uppercase tracking-wider pb-2">
                        {item.heading}
                      </h5>
                      <div className="flex flex-col gap-1">
                        {item.children?.map((child, index) => (
                          <React.Fragment key={child.id && index}>
                            <NavItems item={child} />
                          </React.Fragment>
                        ))}
                      </div>
                    </React.Fragment>
                  </div>
                ))}
            </nav>
          </div>
        </div>
        <div className="shrink-0">
          <Upgrade/>
        </div>
      </div>
    </>
  );
};

export default MobileSidebar;
