
import React, { useState, useMemo } from 'react';
import { AppState, User, TransactionType, Transaction, UserRole } from '../types';
import Dashboard from './Dashboard';

interface MasterAdminProps {
  state: AppState;
  selectedMonth: string;
}

const MasterAdmin: React.FC<MasterAdminProps> = ({ state, selectedMonth }) => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Estados dos filtros para o relatório analítico
  const [filterType, setFilterType] = useState<string>('');
  const [filterCC, setFilterCC] = useState<string>('');
  const [filterPM, setFilterPM] = useState<string>('');
  const [filterSearch, setFilterSearch] = useState<string>('');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '---';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const handlePrint = () => {
    if (!selectedUser) return;
    const originalTitle = document.title;
    document.title = `MASTER_Relatorio_${selectedUser.storeName.replace(/\s+/g, '_')}_${selectedMonth}`;
    window.print();
    document.title = originalTitle;
  };

  const userSummaries = useMemo(() => {
    return state.users
      .filter(user => user.role !== UserRole.MASTER)
      .map(user => {
        const userTransactions = state.transactions.filter(t => t.createdBy === user.id && t.monthRef === selectedMonth);
        const entries = userTransactions.filter(t => t.type === TransactionType.ENTRY).reduce((sum, t) => sum + t.amount, 0);
        const exits = userTransactions.filter(t => t.type === TransactionType.EXIT).reduce((sum, t) => sum + t.amount, 0);
        return {
          ...user,
          entries,
          exits,
          balance: entries - exits,
          transactionCount: userTransactions.length
        };
      });
  }, [state.users, state.transactions, selectedMonth]);

  const filteredUserTransactions = useMemo(() => {
    if (!selectedUserId) return [];
    return state.transactions.filter(t => {
      const matchUser = t.createdBy === selectedUserId;
      const matchMonth = t.monthRef === selectedMonth;
      const matchType = filterType ? t.type === filterType : true;
      const matchCC = filterCC ? t.costCenterId === filterCC : true;
      const matchPM = filterPM ? t.paymentMethodId === filterPM : true;
      const matchSearch = filterSearch ? t.description.toLowerCase().includes(filterSearch.toLowerCase()) : true;
      const matchDate = (filterStartDate && filterEndDate) 
        ? (t.date >= filterStartDate && t.date <= filterEndDate) 
        : true;
      return matchUser && matchMonth && matchType && matchCC && matchPM && matchSearch && matchDate;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [selectedUserId, state.transactions, selectedMonth, filterType, filterCC, filterPM, filterSearch, filterStartDate, filterEndDate]);

  const selectedUser = state.users.find(u => u.id === selectedUserId);

  const getCCAndSubgroupDisplay = (t: Transaction) => {
    if (t.creditSaleId) {
      return (
        <span className="text-emerald-600 font-bold uppercase text-[9px] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
          Vínculo Crediário
        </span>
      );
    }
    const cc = state.costCenters.find(c => c.id === t.costCenterId);
    const sub = cc?.subgroups.find(s => s.id === t.subgroupId);
    if (!cc) return '---';
    return `${cc.name}${sub ? ' > ' + sub.name : ''}`;
  };

  const getPMName = (pmId: string) => {
    return state.paymentMethods.find(p => p.id === pmId)?.name || '---';
  };

  return (
    <div className="space-y-8 pb-20">
      <header className="no-print">
        <h2 className="text-2xl font-bold text-slate-800">Painel Master Administrativo</h2>
        <p className="text-slate-500">Gestão global de lojas - Referência: {selectedMonth}</p>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden no-print">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-700">Resumo por Usuário / Filial</h3>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100 text-xs text-slate-500 uppercase">
              <th className="px-6 py-3">Loja / Gestor</th>
              <th className="px-6 py-3 text-right">Entradas</th>
              <th className="px-6 py-3 text-right">Saídas</th>
              <th className="px-6 py-3 text-right">Saldo</th>
              <th className="px-6 py-3 text-center">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {userSummaries.map(u => (
              <tr key={u.id} className={`hover:bg-slate-50 transition ${selectedUserId === u.id ? 'bg-emerald-50/50' : ''}`}>
                <td className="px-6 py-4">
                  <div className="text-sm font-bold text-slate-800">{u.adminName}</div>
                  <div className="text-[10px] text-slate-400 uppercase font-medium">{u.storeName}</div>
                </td>
                <td className="px-6 py-4 text-sm text-right text-emerald-600 font-medium">R$ {u.entries.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td className="px-6 py-4 text-sm text-right text-red-600 font-medium">R$ {u.exits.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td className="px-6 py-4 text-sm text-right font-bold text-slate-700">R$ {u.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td className="px-6 py-4 text-center">
                  <button onClick={() => setSelectedUserId(u.id)} className="text-xs bg-white border border-slate-200 px-3 py-1 rounded-full shadow-sm hover:border-indigo-500 hover:text-indigo-600 transition font-bold">Ver Analítico</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedUserId && selectedUser && (
        <div id="printable-area" className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-slate-800 text-white p-6 rounded-xl flex items-center justify-between no-print shadow-xl">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Visualização Analítica de:</p>
              <h3 className="text-xl font-black uppercase tracking-tighter">{selectedUser.adminName} ({selectedUser.storeName})</h3>
            </div>
            <button onClick={() => setSelectedUserId(null)} className="bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white px-4 py-2 rounded-lg text-sm font-bold transition">Fechar Detalhes</button>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-visible">
            <div className="px-6 py-6 border-b border-slate-100 flex justify-between items-center no-print bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">Extrato Analítico Detalhado</h3>
              <button onClick={handlePrint} className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-bold flex items-center space-x-2 shadow-lg hover:bg-indigo-700 transition">
                <span>🖨️</span><span>Imprimir Relatório Master</span>
              </button>
            </div>

            <div className="p-4 bg-white border-b border-slate-100 flex flex-wrap gap-4 items-end no-print">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Descrição</label>
                  <input type="text" value={filterSearch} onChange={e => setFilterSearch(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-sm" placeholder="Buscar..." />
                </div>
                <div className="w-36">
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Data Início</label>
                  <input type="date" value={filterStartDate} onChange={e => setFilterStartDate(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-sm" />
                </div>
                <div className="w-36">
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Data Fim</label>
                  <input type="date" value={filterEndDate} onChange={e => setFilterEndDate(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-sm" />
                </div>
                <button onClick={() => { setFilterSearch(''); setFilterStartDate(''); setFilterEndDate(''); }} className="text-xs text-slate-400 font-bold hover:text-indigo-600 pb-2">Limpar</button>
            </div>

            <div className="hidden print:block p-6 bg-slate-900 text-white border-b border-slate-200">
               <h1 className="text-xl font-black uppercase tracking-tighter">Relatório Master Administrativo</h1>
               <div className="grid grid-cols-2 mt-4 gap-4">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Unidade / Loja</p>
                    <p className="text-sm font-black">{selectedUser.storeName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Gestor Responsável</p>
                    <p className="text-sm font-black">{selectedUser.adminName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Mês de Referência</p>
                    <p className="text-sm font-black">{selectedMonth}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Emitido em</p>
                    <p className="text-sm font-black">{new Date().toLocaleString('pt-BR')}</p>
                  </div>
               </div>
               {(filterStartDate || filterEndDate || filterSearch) && (
                 <div className="mt-4 pt-4 border-t border-slate-700 text-[10px] uppercase">
                   <p><span className="text-slate-400">Filtros aplicados:</span> {filterSearch && `Busca: "${filterSearch}"`} {filterStartDate && `| Período: ${formatDate(filterStartDate)} a ${formatDate(filterEndDate)}`}</p>
                 </div>
               )}
            </div>
            
            <div className="overflow-x-auto print:overflow-visible">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase font-black tracking-widest border-b border-slate-200">
                    <th className="px-6 py-4">Data</th>
                    <th className="px-6 py-4">Descrição</th>
                    <th className="px-6 py-4">Centro de Custo / Subgrupo</th>
                    <th className="px-6 py-4">Forma Pagamento</th>
                    <th className="px-6 py-4 text-right">Valor Líquido</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUserTransactions.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">Nenhum dado filtrado nesta visualização.</td></tr>
                  ) : (
                    filteredUserTransactions.map(t => (
                      <tr key={t.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-6 py-4 text-sm whitespace-nowrap">{formatDate(t.date)}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-800">{t.description}</td>
                        <td className="px-6 py-4 text-[11px] text-slate-500 font-medium">{getCCAndSubgroupDisplay(t)}</td>
                        <td className="px-6 py-4 text-[10px] text-slate-400 uppercase font-bold">{getPMName(t.paymentMethodId)}</td>
                        <td className={`px-6 py-4 text-sm text-right font-black whitespace-nowrap ${t.type === TransactionType.ENTRY ? 'text-emerald-600' : 'text-red-600'}`}>
                          {t.type === TransactionType.EXIT ? '-' : ''} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {filteredUserTransactions.length > 0 && (
                  <tfoot className="bg-slate-900 font-bold">
                    <tr>
                      <td colSpan={4} className="px-6 py-5 text-sm text-right uppercase tracking-widest !text-white" style={{ color: 'white' }}>Resultado Líquido do Usuário no Período</td>
                      <td className="px-6 py-5 text-right text-lg whitespace-nowrap !text-white" style={{ color: 'white' }}>
                        R$ {filteredUserTransactions.reduce((sum, t) => sum + (t.type === TransactionType.ENTRY ? t.amount : -t.amount), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterAdmin;
