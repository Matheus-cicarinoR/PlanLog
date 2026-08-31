/**
 * SystemContext.tsx
 * 
 * PROPÓSITO:
 * É o "coração" da aplicação (Single Source of Truth). Gerencia de forma centralizada 
 * o estado global das entidades principais (serviços, manutenções, clientes, máquinas, etc.).
 * 
 * RESPONSABILIDADES:
 * - Prover dados reativos para o Dashboard e listagens.
 * - Sincronizar leitura inicial chamando o `StorageService` (que consulta LocalStorage ou Supabase).
 * - Expor métodos de CRUD (addService, deleteMachine, etc.) para os demais componentes.
 * 
 * USO:
 * Qualquer componente que precise ler listas (ex: `const { servicos } = useSystem()`) 
 * ou manipular dados (ex: `addServico(...)`) deve consumir este contexto através do hook `useSystem`.
 */
import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import type { Maquina, Servico, Manutencao, Operador, Abastecimento, Usuario, Cliente } from '../types';
import { getSupabaseClient } from '../lib/supabase';

interface SystemStateContextType {
    maquinas: Maquina[];
    selectedMaquinaId: string;
    filteredServicos: Servico[];
    filteredManutencoes: Manutencao[];
    filteredAbastecimentos: Abastecimento[];
    operadores: Operador[];
    usuarios: Usuario[];
    clientes: Cliente[];
    dynamicConfig: any;
    startDate: string;
    endDate: string;
    isLoading: boolean;
    isNewServiceModalOpen: boolean;

    setIsNewServiceModalOpen: (open: boolean) => void;
    openNewServiceModal: () => void;
    setStartDate: (date: string) => void;
    setEndDate: (date: string) => void;
    handleSelectMaquina: (id: string) => void;
    handleSaveMaquina: (maquina: Maquina) => Promise<void>;
    handleDeleteMaquina: (id: string) => Promise<void>;
    
    handleSaveService: (servico: Servico) => Promise<void>;
    handleDeleteService: (id: string) => Promise<void>;
    handleQuickSettleService: (servico: Servico) => Promise<void>;

    handleSaveMaintenance: (manutencao: Manutencao) => Promise<void>;
    handleDeleteMaintenance: (id: string) => Promise<void>;

    handleUpdateOperador: (operador: Operador) => Promise<void>;

    handleSaveFuel: (abastecimento: Abastecimento) => Promise<void>;
    handleDeleteFuel: (id: string) => Promise<void>;

    handleSaveUsuario: (usuario: Usuario) => Promise<void>;
    handleDeleteUsuario: (id: string) => Promise<void>;

    handleSaveCliente: (cliente: Cliente) => Promise<void>;
    handleDeleteCliente: (id: string) => Promise<void>;
}

const SystemStateContext = createContext<SystemStateContextType | undefined>(undefined);

export const SystemProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [maquinas, setMaquinas] = useState<Maquina[]>([]);
    const [selectedMaquinaId, setSelectedMaquinaId] = useState<string>('');
    const [servicos, setServicos] = useState<Servico[]>([]);
    const [manutencoes, setManutencoes] = useState<Manutencao[]>([]);
    const [abastecimentos, setAbastecimentos] = useState<Abastecimento[]>([]);
    const [operadores, setOperadores] = useState<Operador[]>([]);
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isNewServiceModalOpen, setIsNewServiceModalOpen] = useState<boolean>(false);

    const activeMaquina = maquinas.find(m => m.id === selectedMaquinaId);
    const defaultMaquina = maquinas[0];
    const totalHorimetro = maquinas.reduce((acc, m) => acc + (Number(m.horimetro_atual) || 0), 0);

    const horimetroAtual = activeMaquina 
        ? Number(activeMaquina.horimetro_atual || 0) 
        : (maquinas.length > 0 ? Number(defaultMaquina?.horimetro_atual || totalHorimetro) : 0);
    const ultimoOleo = activeMaquina 
        ? Number(activeMaquina.ultimo_oleo_horimetro || 0) 
        : Number(defaultMaquina?.ultimo_oleo_horimetro || 0);
    const intervaloOleo = activeMaquina 
        ? Number(activeMaquina.intervalo_troca_oleo_horas || 250) 
        : Number(defaultMaquina?.intervalo_troca_oleo_horas || 250);

    const dynamicConfig = {
        nome_empresa: 'PlanLog',
        cnpj_cpf: '',
        telefone_contato: '',
        chave_pix_empresa: '',
        nome_titular_pix: '',
        modelo_maquina: activeMaquina ? activeMaquina.nome : 'Frota Consolidada (Todas as Máquinas)',
        placa_identificacao: activeMaquina ? activeMaquina.placa : 'Múltiplas',
        ano_fabricacao: activeMaquina ? activeMaquina.ano : '-',
        horimetro_atual: horimetroAtual,
        valor_hora_padrao: activeMaquina ? Number(activeMaquina.valor_hora_padrao || 250) : Number(defaultMaquina?.valor_hora_padrao || 250),
        intervalo_troca_oleo_horas: intervaloOleo > 0 ? intervaloOleo : 250,
        ultimo_oleo_horimetro: ultimoOleo,
        supabase_url: '',
        supabase_anon_key: ''
    };

    const openNewServiceModal = () => setIsNewServiceModalOpen(true);
    const supabase = getSupabaseClient();

    const fetchInitialData = async () => {
        if (!supabase) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const [
                { data: maqData },
                { data: servData },
                { data: manData },
                { data: abastData },
                { data: opData },
                { data: usData },
                { data: cliData }
            ] = await Promise.all([
                supabase.from('maquinas').select('*'),
                supabase.from('servicos').select('*'),
                supabase.from('manutencoes').select('*'),
                supabase.from('abastecimentos').select('*'),
                supabase.from('operadores').select('*'),
                supabase.from('usuarios').select('*'),
                supabase.from('clientes').select('*')
            ]);

            if (maqData) setMaquinas(maqData as Maquina[]);
            if (servData) {
                const loadedServices = servData as Servico[];
                setServicos(loadedServices);
                
                // Se não houver clientes cadastrados na tabela, extrair clientes dos serviços
                if (!cliData || (cliData as any[]).length === 0) {
                    const uniqueNames = Array.from(new Set(loadedServices.map(s => s.cliente).filter(Boolean)));
                    const initialClients: Cliente[] = uniqueNames.map((name, idx) => ({
                        id: `cli-${idx + 1}`,
                        nome: name,
                        telefone: '',
                        endereco: '',
                        cidade: '',
                        observacoes: 'Cliente cadastrado a partir do histórico de serviços',
                        created_at: new Date().toISOString()
                    }));
                    setClientes(initialClients);
                }
            }
            if (cliData && (cliData as any[]).length > 0) setClientes(cliData as Cliente[]);
            if (manData) setManutencoes(manData as Manutencao[]);
            if (abastData) setAbastecimentos(abastData as Abastecimento[]);
            if (opData) setOperadores(opData as Operador[]);
            if (usData) setUsuarios(usData as Usuario[]);
        } catch (error) {
            console.error('Error fetching initial data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    const filteredServicos = servicos.filter(s => {
        const matchesMaquina = !selectedMaquinaId || selectedMaquinaId === 'todas' || s.maquina_id === selectedMaquinaId;
        const matchesStartDate = !startDate || new Date(s.data_servico) >= new Date(startDate);
        const matchesEndDate = !endDate || new Date(s.data_servico) <= new Date(endDate);
        return matchesMaquina && matchesStartDate && matchesEndDate;
    });
    
    const filteredManutencoes = manutencoes.filter(m => {
        const matchesMaquina = !selectedMaquinaId || selectedMaquinaId === 'todas' || m.maquina_id === selectedMaquinaId;
        const matchesStartDate = !startDate || new Date(m.data_manutencao || m.created_at) >= new Date(startDate);
        const matchesEndDate = !endDate || new Date(m.data_manutencao || m.created_at) <= new Date(endDate);
        return matchesMaquina && matchesStartDate && matchesEndDate;
    });
    
    const filteredAbastecimentos = abastecimentos.filter(a => {
        const matchesMaquina = !selectedMaquinaId || selectedMaquinaId === 'todas' || a.maquina_id === selectedMaquinaId;
        const matchesStartDate = !startDate || new Date(a.data) >= new Date(startDate);
        const matchesEndDate = !endDate || new Date(a.data) <= new Date(endDate);
        return matchesMaquina && matchesStartDate && matchesEndDate;
    });

    const handleSaveMaquina = async (maquina: Maquina) => {
        if (!supabase) return;
        const { error } = await supabase.from('maquinas').upsert(maquina);
        if (!error) {
            setMaquinas(prev => {
                const exists = prev.find(m => m.id === maquina.id);
                if (exists) return prev.map(m => m.id === maquina.id ? maquina : m);
                return [...prev, maquina];
            });
        }
    };

    const handleDeleteMaquina = async (id: string) => {
        if (!supabase) return;
        const { error } = await supabase.from('maquinas').delete().eq('id', id);
        if (!error) {
            setMaquinas(prev => prev.filter(m => m.id !== id));
        }
    };
    
    const handleSaveService = async (servico: Servico) => {
        if (!supabase) return;
        const { error } = await supabase.from('servicos').upsert(servico);
        if (!error) {
            setServicos(prev => {
                const exists = prev.find(s => s.id === servico.id);
                if (exists) return prev.map(s => s.id === servico.id ? servico : s);
                return [...prev, servico];
            });
        }
    };

    const handleDeleteService = async (id: string) => {
        if (!supabase) return;
        const { error } = await supabase.from('servicos').delete().eq('id', id);
        if (!error) {
            setServicos(prev => prev.filter(s => s.id !== id));
        }
    };

    const handleQuickSettleService = async (servico: Servico) => {
        if (!supabase) return;
        const updated = { ...servico, status: 'pago' as any, valor_pago: servico.valor_total, saldo_devedor: 0 };
        const { error } = await supabase.from('servicos').update({ 
            status: updated.status, 
            valor_pago: updated.valor_pago, 
            saldo_devedor: updated.saldo_devedor 
        }).eq('id', servico.id);
        
        if (!error) {
            setServicos(prev => prev.map(s => s.id === servico.id ? updated : s));
        }
    };

    const handleSaveMaintenance = async (manutencao: Manutencao) => {
        if (!supabase) return;
        const { error } = await supabase.from('manutencoes').upsert(manutencao);
        if (!error) {
            setManutencoes(prev => {
                const exists = prev.find(m => m.id === manutencao.id);
                if (exists) return prev.map(m => m.id === manutencao.id ? manutencao : m);
                return [...prev, manutencao];
            });
        }
    };

    const handleDeleteMaintenance = async (id: string) => {
        if (!supabase) return;
        const { error } = await supabase.from('manutencoes').delete().eq('id', id);
        if (!error) {
            setManutencoes(prev => prev.filter(m => m.id !== id));
        }
    };

    const handleUpdateOperador = async (operador: Operador) => {
        if (!supabase) return;
        const { error } = await supabase.from('operadores').upsert(operador);
        if (!error) {
            setOperadores(prev => {
                const exists = prev.find(o => o.id === operador.id);
                if (exists) return prev.map(o => o.id === operador.id ? operador : o);
                return [...prev, operador];
            });
        }
    };

    const handleSaveFuel = async (abastecimento: Abastecimento) => {
        if (!supabase) return;
        const { error } = await supabase.from('abastecimentos').upsert(abastecimento);
        if (!error) {
            setAbastecimentos(prev => {
                const exists = prev.find(a => a.id === abastecimento.id);
                if (exists) return prev.map(a => a.id === abastecimento.id ? abastecimento : a);
                return [...prev, abastecimento];
            });
        }
    };

    const handleDeleteFuel = async (id: string) => {
        if (!supabase) return;
        const { error } = await supabase.from('abastecimentos').delete().eq('id', id);
        if (!error) {
            setAbastecimentos(prev => prev.filter(a => a.id !== id));
        }
    };

    const handleSaveUsuario = async (usuario: Usuario) => {
        if (!supabase) return;
        const { error } = await supabase.from('usuarios').upsert(usuario);
        if (!error) {
            setUsuarios(prev => {
                const exists = prev.find(u => u.id === usuario.id);
                if (exists) return prev.map(u => u.id === usuario.id ? usuario : u);
                return [...prev, usuario];
            });
        }
    };

    const handleDeleteUsuario = async (id: string) => {
        if (!supabase) return;
        const { error } = await supabase.from('usuarios').delete().eq('id', id);
        if (!error) {
            setUsuarios(prev => prev.filter(u => u.id !== id));
        }
    };

    const handleSaveCliente = async (cliente: Cliente) => {
        if (supabase) {
            try {
                await supabase.from('clientes').upsert(cliente);
            } catch (err) {
                console.error('Erro ao salvar cliente no Supabase:', err);
            }
        }
        setClientes(prev => {
            const exists = prev.find(c => c.id === cliente.id);
            if (exists) return prev.map(c => c.id === cliente.id ? cliente : c);
            return [...prev, cliente];
        });
    };

    const handleDeleteCliente = async (id: string) => {
        if (supabase) {
            try {
                await supabase.from('clientes').delete().eq('id', id);
            } catch (err) {
                console.error('Erro ao excluir cliente no Supabase:', err);
            }
        }
        setClientes(prev => prev.filter(c => c.id !== id));
    };

    const value: SystemStateContextType = {
        maquinas,
        selectedMaquinaId,
        filteredServicos,
        filteredManutencoes,
        filteredAbastecimentos,
        operadores,
        usuarios,
        clientes,
        dynamicConfig,
        startDate,
        endDate,
        isLoading,
        isNewServiceModalOpen,

        setIsNewServiceModalOpen,
        openNewServiceModal,
        setStartDate,
        setEndDate,
        handleSelectMaquina: (id) => setSelectedMaquinaId(id),
        
        handleSaveMaquina,
        handleDeleteMaquina,
        
        handleSaveService,
        handleDeleteService,
        handleQuickSettleService,

        handleSaveMaintenance,
        handleDeleteMaintenance,

        handleUpdateOperador,

        handleSaveFuel,
        handleDeleteFuel,

        handleSaveUsuario,
        handleDeleteUsuario,

        handleSaveCliente,
        handleDeleteCliente,
    };

    return (
        <SystemStateContext.Provider value={value}>
            {children}
        </SystemStateContext.Provider>
    );
};

export const useSystemState = () => {
    const context = useContext(SystemStateContext);
    if (context === undefined) {
        throw new Error('useSystemState must be used within a SystemProvider');
    }
    return context;
};
