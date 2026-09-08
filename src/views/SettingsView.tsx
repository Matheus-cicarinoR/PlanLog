import React, { useState, useEffect } from 'react';
import { useSystemState } from '../context/SystemContext';
import { ConfiguracoesSistema } from '../types';
import { toast } from 'sonner';
import { Building2, Save } from 'lucide-react';

const SettingsView = () => {
  const { dynamicConfig, handleUpdateConfig } = useSystemState();
  const [formData, setFormData] = useState<ConfiguracoesSistema>({
    nome_empresa: '',
    cnpj_cpf: '',
    telefone_contato: '',
    chave_pix_empresa: '',
    nome_titular_pix: '',
    modelo_maquina: '',
    placa_identificacao: '',
    ano_fabricacao: '',
    horimetro_atual: 0,
    valor_hora_padrao: 250,
    intervalo_troca_oleo_horas: 250,
    ultimo_oleo_horimetro: 0,
    supabase_url: '',
    supabase_anon_key: ''
  });

  useEffect(() => {
    if (dynamicConfig) {
      setFormData(dynamicConfig as ConfiguracoesSistema);
    }
  }, [dynamicConfig]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    try {
      handleUpdateConfig(formData);
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar as configurações.');
    }
  };

  return (
    <div className="flex-1 w-full p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500 text-slate-950 shadow-sm">
              <Building2 className="w-6 h-6" />
            </div>
            Configurações da Empresa
          </h1>
          <p className="mt-2 text-sm text-slate-500 font-medium">
            Gerencie os dados da sua empresa, que serão exibidos nos recibos e relatórios.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6">
          <div className="space-y-6">
            
            {/* Informações da Empresa */}
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">
                Dados da Empresa
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Nome da Empresa
                  </label>
                  <input
                    type="text"
                    name="nome_empresa"
                    value={formData.nome_empresa}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                    placeholder="Ex: TERRAFORTE Terraplanagem"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    CNPJ ou CPF
                  </label>
                  <input
                    type="text"
                    name="cnpj_cpf"
                    value={formData.cnpj_cpf}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                    placeholder="00.000.000/0001-00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Telefone de Contato
                  </label>
                  <input
                    type="text"
                    name="telefone_contato"
                    value={formData.telefone_contato}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>
            </div>

            {/* Informações Bancárias / PIX */}
            <div className="pt-4">
              <h2 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">
                Dados Bancários e PIX (Para Recibos)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Chave PIX
                  </label>
                  <input
                    type="text"
                    name="chave_pix_empresa"
                    value={formData.chave_pix_empresa}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                    placeholder="exemplo@email.com ou CNPJ"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Nome do Titular (PIX)
                  </label>
                  <input
                    type="text"
                    name="nome_titular_pix"
                    value={formData.nome_titular_pix}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                    placeholder="Ex: José da Silva"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 flex justify-end">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-sm transition-transform active:scale-95"
              >
                <Save className="w-5 h-5 stroke-[2.5]" />
                Salvar Configurações
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
