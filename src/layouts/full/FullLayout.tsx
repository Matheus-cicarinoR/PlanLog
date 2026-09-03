import { FC } from 'react';
import { Outlet } from "react-router";
import ScrollToTop from '../../components/shared/ScrollToTop';
import Sidebar from './sidebar/Sidebar';
import Header from './header/Header';
import { useSystemState } from '../../context/SystemContext';
import { ServiceModal } from '../../components/ServiceModal';

const FullLayout: FC = () => {
 const { 
  isLoading,
  isNewServiceModalOpen,
  setIsNewServiceModalOpen,
  handleSaveService,
  dynamicConfig,
  maquinas,
  selectedMaquinaId
 } = useSystemState();

 if (isLoading) {
  return (
   <div className="flex h-screen w-full items-center justify-center bg-slate-50 ">
    <div className="flex flex-col items-center gap-4">
     <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-amber-500 "></div>
     <p className="text-sm font-semibold text-slate-500 ">Sincronizando dados...</p>
    </div>
   </div>
  );
 }

 return (
  <>
   <div className="flex w-full min-h-screen bg-[#e9eef5] overflow-x-hidden">
    <div className="page-wrapper flex w-full min-w-0 overflow-x-hidden">
     {/* Header/sidebar */}
     <Sidebar />
     <div className="page-wrapper-sub flex flex-col w-full min-w-0 xl:pl-[270px] overflow-x-hidden">
      {/* Top Header */}
      <Header />
      <div className="h-full w-full min-w-0">
       {/* Body Content */}
       <div className="w-full min-w-0">
        <ScrollToTop>
         <div className="w-full px-2.5 py-4 sm:px-6 sm:py-6 lg:px-8 min-w-0">
          <Outlet />
         </div>
        </ScrollToTop>
       </div>
      </div>
     </div>
    </div>
   </div>

   {/* Global New Service Modal from Sidebar */}
   <ServiceModal
    isOpen={isNewServiceModalOpen}
    onClose={() => setIsNewServiceModalOpen(false)}
    onSave={handleSaveService}
    config={dynamicConfig}
    maquinas={maquinas}
    selectedMaquinaId={selectedMaquinaId}
   />
  </>
 );
};

export default FullLayout;
