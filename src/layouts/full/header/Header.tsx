import { useState } from "react";
import { Icon } from "@iconify/react";
import { Sheet, SheetContent } from '../../../components/ui/sheet';
import MobileSidebar from "../sidebar/MobileSidebar";
import { useSystemState } from "../../../context/SystemContext";
import { Plus, Tractor } from "lucide-react";

const Header = () => {
 const [isOpen, setIsOpen] = useState(false);
 const { maquinas, selectedMaquinaId, openNewServiceModal } = useSystemState();

 const activeMaquina = maquinas.find(m => m.id === selectedMaquinaId);

 return (
  <>
   {/* Mobile Top Header - hidden on Desktop (xl:hidden) */}
   <header className="xl:hidden sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
    <nav className="py-2.5 px-3 sm:px-4 flex items-center justify-between w-full">
     {/* Hamburger Menu & Machine Title */}
     <div className="flex items-center gap-2.5 min-w-0">
      <button
       onClick={() => setIsOpen(true)}
       className="h-9 w-9 flex text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl justify-center items-center cursor-pointer transition-colors border border-slate-200 shrink-0"
       aria-label="Abrir Menu"
      >
       <Icon icon="solar:hamburger-menu-line-duotone" height={22} />
      </button>

      <div className="flex items-center gap-1.5 min-w-0">
       <span className="font-black text-xs sm:text-sm text-slate-900 tracking-tight truncate">
        🚜 {activeMaquina ? activeMaquina.nome : 'Todas as Máquinas'}
       </span>
       {activeMaquina?.placa && (
        <span className="text-[10px] bg-slate-100 text-slate-500 font-semibold px-1.5 py-0.5 rounded-md hidden sm:inline-block">
         {activeMaquina.placa}
        </span>
       )}
      </div>
     </div>

     {/* Quick Action: + Serviço CTA */}
     <div className="flex items-center gap-2 shrink-0">
      <button
       onClick={openNewServiceModal}
       className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs py-1.5 px-3 rounded-xl shadow-xs active:scale-95 transition-all cursor-pointer"
      >
       <Plus className="w-4 h-4 stroke-[3]" />
       <span className="hidden xs:inline">Serviço</span>
      </button>
     </div>
    </nav>
   </header>

   {/* Mobile Sidebar Drawer */}
   <Sheet open={isOpen} onOpenChange={setIsOpen}>
    <SheetContent side="left" className="p-0 w-[280px] border-r border-slate-200 bg-white ">
     <MobileSidebar onClose={() => setIsOpen(false)} />
    </SheetContent>
   </Sheet>
  </>
 );
};

export default Header;
