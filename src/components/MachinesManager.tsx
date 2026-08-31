/**
 * MachinesManager.tsx
 * 
 * PROPÓSITO:
 * Componente responsável pela listagem e manipulação de registros de MachinesManager.
 * 
 * RESPONSABILIDADES:
 * - Integrar com o SystemContext para consumir dados.
 * - Renderizar a interface gráfica para interação com a entidade correspondente.
 */
import React, { useState } from 'react';
import { 
  Tractor, 
  Plus, 
  Edit3, 
  Trash2, 
  Gauge, 
  DollarSign, 
  Clock, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Wrench
} from 'lucide-react';
import { Maquina } from '../types';
import { formatHours, formatCurrency } from '../lib/formatters';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';

interface MachinesManagerProps {
  maquinas: Maquina[];
  activeMaquinaId: string;
  onSaveMaquina: (maquina: Maquina) => void;
  onDeleteMaquina: (id: string) => void;
  onSelectMaquina: (id: string) => void;
}

export const MachinesManager: React.FC<MachinesManagerProps> = ({
  maquinas,
  activeMaquinaId,
  onSaveMaquina,
  onDeleteMaquina,
  onSelectMaquina
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentMaquina, setCurrentMaquina] = useState<Partial<Maquina> | null>(null);

  const handleOpenNew = () => {
    setCurrentMaquina({
      id: `maq-${Date.now()}`,
      nome: '',
      placa: '',
      ano: '',
      horimetro_inicial: 0,
      horimetro_atual: 0,
      valor_hora_padrao: 250,
      intervalo_troca_oleo_horas: 250,
      ultimo_oleo_horimetro: 0,
      created_at: new Date().toISOString()
    });
    setIsEditing(true);
  };

  const handleOpenEdit = (maquina: Maquina) => {
    setCurrentMaquina({ ...maquina });
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMaquina || !currentMaquina.nome || !currentMaquina.placa) {
      return;
    }
    onSaveMaquina(currentMaquina as Maquina);
    setIsEditing(false);
    setCurrentMaquina(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Tractor className="w-6 h-6 text-amber-500" />
            <span>Frota & Cadastro de Máquinas</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Cadastre novas máquinas e retroescavadeiras para gerenciar serviços, abastecimentos e manutenções segmentados.
          </p>
        </div>
        {!isEditing && (
          <Button onClick={handleOpenNew} className="w-full sm:w-auto font-black cursor-pointer">
            <Plus className="w-5 h-5 mr-1 stroke-[3]" />
            Nova Máquina
          </Button>
        )}
      </div>

      {isEditing && currentMaquina ? (
        <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 max-w-2xl">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-3">
            {currentMaquina.id === 'maq-default' || maquinas.some(m => m.id === currentMaquina.id) ? 'Editar Máquina' : 'Cadastrar Nova Máquina'}
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Modelo / Nome da Máquina</label>
              <Input
                required
                placeholder="Ex: Retroescavadeira CAT 416F2"
                value={currentMaquina.nome || ''}
                onChange={e => setCurrentMaquina({ ...currentMaquina, nome: e.target.value })}
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Placa / Identificação</label>
              <Input
                required
                placeholder="Ex: TR-2026-X ou N/A"
                value={currentMaquina.placa || ''}
                onChange={e => setCurrentMaquina({ ...currentMaquina, placa: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Ano de Fabricação</label>
              <Input
                placeholder="Ex: 2022"
                value={currentMaquina.ano || ''}
                onChange={e => setCurrentMaquina({ ...currentMaquina, ano: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Valor da Hora Padrão (R$)</label>
              <Input
                type="number"
                step="0.01"
                required
                placeholder="Ex: 250"
                value={currentMaquina.valor_hora_padrao || ''}
                onChange={e => setCurrentMaquina({ ...currentMaquina, valor_hora_padrao: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Horímetro Atual (Horas)</label>
              <Input
                type="number"
                step="0.1"
                required
                placeholder="Ex: 1582.4"
                value={currentMaquina.horimetro_atual || ''}
                onChange={e => setCurrentMaquina({ ...currentMaquina, horimetro_atual: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Último Óleo Horímetro (Horas)</label>
              <Input
                type="number"
                step="0.1"
                placeholder="Ex: 1500"
                value={currentMaquina.ultimo_oleo_horimetro || ''}
                onChange={e => setCurrentMaquina({ ...currentMaquina, ultimo_oleo_horimetro: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Intervalo de Troca de Óleo (Horas)</label>
              <Input
                type="number"
                placeholder="Ex: 250"
                value={currentMaquina.intervalo_troca_oleo_horas || ''}
                onChange={e => setCurrentMaquina({ ...currentMaquina, intervalo_troca_oleo_horas: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditing(false);
                setCurrentMaquina(null);
              }}
            >
              Cancelar
            </Button>
            <Button type="submit">
              Salvar Máquina
            </Button>
          </div>
        </form>
      ) : maquinas.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center">
          <Tractor className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">Nenhuma máquina cadastrada</h3>
          <p className="text-slate-500 mb-4">Adicione uma nova máquina para começar a registrar serviços e manutenções.</p>
          <Button onClick={handleOpenNew}>
            Cadastrar Primeira Máquina
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {maquinas.map((maq) => {
            const isActive = activeMaquinaId === maq.id;
            const proximaTroca = (maq.ultimo_oleo_horimetro || 0) + (maq.intervalo_troca_oleo_horas || 250);
            const horasFaltantes = proximaTroca - maq.horimetro_atual;
            const necessitaTroca = horasFaltantes <= 20;

            return (
              <Card 
                key={maq.id} 
                className={`relative overflow-hidden transition-all duration-300 border ${
                  isActive 
                    ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-500/5 shadow-sm ring-1 ring-amber-400/20' 
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 shadow-sm'
                }`}
              >
                <CardContent className="p-5 space-y-4">
                  {/* Title & Status */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${
                        isActive 
                          ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400' 
                          : 'bg-slate-50 dark:bg-slate-800/50 text-slate-500'
                      }`}>
                        <Tractor className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-slate-100 truncate max-w-[150px]">{maq.nome}</h3>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                          {maq.placa}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {isActive ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Ativa
                        </span>
                      ) : (
                        <button
                          onClick={() => onSelectMaquina(maq.id)}
                          className="text-[10px] px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-amber-400 hover:text-white dark:hover:text-slate-900 text-slate-600 dark:text-slate-300 font-bold transition-all"
                        >
                          Ativar
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Telemetry info */}
                  <div className="grid grid-cols-2 gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 font-mono text-xs">
                    <div>
                      <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase block font-sans font-bold">Horímetro</span>
                      <span className="text-slate-900 dark:text-slate-100 font-bold flex items-center gap-1">
                        <Gauge className="w-3.5 h-3.5 text-amber-500" />
                        {formatHours(maq.horimetro_atual)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase block font-sans font-bold">Valor/Hora</span>
                      <span className="text-slate-900 dark:text-slate-100 font-bold flex items-center gap-0.5">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                        {formatCurrency(maq.valor_hora_padrao)}
                      </span>
                    </div>
                  </div>

                  {/* Maintenance Alert */}
                  <div className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
                    necessitaTroca 
                      ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-300' 
                      : 'bg-emerald-50 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                  }`}>
                    <Wrench className="w-4 h-4 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold block text-slate-900 dark:text-slate-100">Troca de Óleo</span>
                      {necessitaTroca ? (
                        <span className="text-[10px] text-red-600 dark:text-red-400 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 animate-pulse" />
                          Urgente: Faltam {formatHours(horasFaltantes)} (Próx: {formatHours(proximaTroca)})
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-600 dark:text-slate-400">
                          Ok: Faltam {formatHours(horasFaltantes)} para revisão
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Footer details & actions */}
                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 pt-3 text-[10px] text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Ano: {maq.ano || 'N/A'}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(maq)}
                        className="p-1.5 rounded bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        title="Editar máquina"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Excluir a máquina ${maq.nome}? Todos os dados relacionados ainda existirão no banco.`)) {
                            onDeleteMaquina(maq.id);
                          }
                        }}
                        className="p-1.5 rounded bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors"
                        title="Excluir máquina"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
