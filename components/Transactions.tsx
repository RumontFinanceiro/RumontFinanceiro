
import React, { useState, useMemo } from 'react';
import { AppState, Transaction, TransactionType, User, UserRole, PaymentMethod } from '../types';
import { getLocalDate } from '../constants';

interface TransactionsProps {
  state: AppState;
  currentUser: User;
  selectedMonth: string;
  onAddTransaction: (t: Transaction) => void;
  onUpdateTransaction: (t: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

const Transactions: React.FC<TransactionsProps> = ({ state, currentUser, selectedMonth, onAddTransaction, onUpdateTransaction, onDeleteTransaction }) => {
  const [showModal, setShowModal] = useState(false);
  const [showQuickBoleto, setShowQuickBoleto] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Filter states
  const [filterType, setFilterType] = useState<string>('');
  const [filterCC, setFilterCC] = useState<string>('');
  const [filterPM, setFilterPM] = useState<string>('');
  const [filterSearch, setFilterSearch] = useState<string>('');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');

  const [formData, setFormData] = useState({
    date: getLocalDate(),
    type: TransactionType.EXIT,
    amount: '',
    costCenterId: '',
    subgroupId: '',
    paymentMethodId: '',
    description: ''
  });

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '---';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = `Relatorio_Financeiro_${selectedMonth}_${currentUser.storeName.replace(/\s+/g, '_')}`;
    window.print();
    document.title = originalTitle;
  };

  const filtered = useMemo(() => {
    return state.transactions.filter(t => {
      const matchMonth = t.monthRef === selectedMonth;
      const matchType = filterType ? t.type === filterType : true;
      const matchCC = filterCC ? t.costCenterId === filterCC : true;
      const matchPM = filterPM ? t.paymentMethodId === filterPM : true;
      const matchSearch = filterSearch ? t.description.toLowerCase().includes(filterSearch.toLowerCase()) : true;
      const matchUser = t.createdBy === currentUser.id;
      const matchDate = (filterStartDate && filterEndDate) 
        ? (t.date >= filterStartDate && t.date <= filterEndDate) 
        : true;
      return matchMonth && matchType && matchCC && matchPM && matchSearch && matchUser && matchDate;
    });
  }, [state.transactions, selectedMonth, filterType, filterCC, filterPM, filterSearch, currentUser, filterStartDate, filterEndDate]);

  const filteredTotal = useMemo(() => {
    return filtered.reduce((acc, t) => acc + (t.type === TransactionType.ENTRY ? t.amount : -t.amount), 0);
  }, [filtered]);

  const handleEdit = (t: Transaction) => {
    setEditingTransaction(t);
    setFormData({
      date: t.date,
      type: t.type,
      amount: t.amount.toString(),
      costCenterId: t.costCenterId,
      subgroupId: t.subgroupId,
      paymentMethodId: t.paymentMethodId || '',
      description: t.description
    });
    setShowModal(true);
  };

  const handleOpenNew = () => {
    setEditingTransaction(null);
    setFormData({
      date: getLocalDate(),
      type: TransactionType.EXIT,
      amount: '',
      costCenterId: '',
      subgroupId: '',
      paymentMethodId: '',
      description: ''
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedCC = state.costCenters.find(c => c.id === formData.costCenterId);
    const hasSubgroups = selectedCC && selectedCC.subgroups && selectedCC.subgroups.length > 0;
    
    if (!formData.amount || !formData.costCenterId || (hasSubgroups && !formData.subgroupId) || !formData.paymentMethodId) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const data: Transaction = {
      id: editingTransaction ? editingTransaction.id : crypto.randomUUID(),
      date: formData.date,
      type: formData.type,
      amount: parseFloat(formData.amount),
      costCenterId: formData.costCenterId,
      subgroupId: formData.subgroupId,
      paymentMethodId: formData.paymentMethodId,
      description: formData.description,
      monthRef: selectedMonth,
      createdBy: editingTransaction ? editingTransaction.createdBy : currentUser.id
    };

    if (editingTransaction) onUpdateTransaction(data);
    else onAddTransaction(data);

    setShowModal(false);
    setEditingTransaction(null);
  };

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

  const costCenters = state.costCenters;
  const subgroups = costCenters.find(c => c.id === formData.costCenterId)?.subgroups || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start no-print">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Lançamentos Financeiros</h2>
          <p className="text-slate-500">Gestão de receitas e despesas</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={handlePrint} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center space-x-2 shadow-lg">
            <span>🖨️</span><span>Imprimir Relatório</span>
          </button>
          <button onClick={() => setShowQuickBoleto(true)} className="bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition flex items-center space-x-2 shadow-md">
            <span>🧾</span><span>Boletos do Dia</span>
          </button>
          <button onClick={handleOpenNew} className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition flex items-center space-x-2 shadow-lg">
            <span>+</span><span>Novo Lançamento</span>
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap gap-4 items-end no-print">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Buscar Descrição</label>
          <input type="text" placeholder="Ex: Aluguel..." value={filterSearch} onChange={e => setFilterSearch(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-sm" />
        </div>
        <div className="w-36">
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Início</label>
          <input type="date" value={filterStartDate} onChange={e => setFilterStartDate(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-sm" />
        </div>
        <div className="w-36">
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Fim</label>
          <input type="date" value={filterEndDate} onChange={e => setFilterEndDate(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Tipo</label>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="p-2 border border-slate-200 rounded-lg text-sm">
            <option value="">Todos</option>
            <option value={TransactionType.ENTRY}>Entrada</option>
            <option value={TransactionType.EXIT}>Saída</option>
          </select>
        </div>
        <button onClick={() => { setFilterType(''); setFilterCC(''); setFilterPM(''); setFilterSearch(''); setFilterStartDate(''); setFilterEndDate(''); }} className="p-2 text-sm text-slate-500 hover:text-slate-800 font-medium underline underline-offset-4">Limpar Filtros</button>
      </div>

      <div id="printable-area" className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-visible">
        <div className="p-6 border-b border-slate-100 hidden print:block">
            <h2 className="text-xl font-bold text-slate-800 uppercase tracking-tight">{currentUser.storeName}</h2>
            <h3 className="text-lg font-bold text-slate-600">Relatório Analítico de Lançamentos</h3>
            <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] text-slate-500 uppercase font-medium">
              <p>Mês de Referência: <span className="text-slate-900 font-bold">{selectedMonth}</span></p>
              <p className="text-right">Emitido em: {new Date().toLocaleString('pt-BR')}</p>
              {filterSearch && <p>Filtro Busca: <span className="text-slate-900 font-bold">{filterSearch}</span></p>}
              {(filterStartDate || filterEndDate) && (
                <p className="col-span-2">Período Selecionado: <span className="text-slate-900 font-bold">{formatDate(filterStartDate)} até {formatDate(filterEndDate)}</span></p>
              )}
            </div>
        </div>
        <div className="overflow-x-auto print:overflow-visible">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Data</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Tipo</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Descrição</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">C. Custo / Subgrupo</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Forma Pgto.</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase text-right">Valor</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase text-right no-print">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-400">Nenhum lançamento encontrado para os filtros aplicados.</td></tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 text-sm whitespace-nowrap">{formatDate(t.date)}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${t.type === TransactionType.ENTRY ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {t.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 font-medium">{t.description}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{getCCAndSubgroupDisplay(t)}</td>
                    <td className="px-6 py-4 text-xs text-slate-500 italic uppercase">{getPMName(t.paymentMethodId)}</td>
                    <td className={`px-6 py-4 text-sm text-right font-bold whitespace-nowrap ${t.type === TransactionType.ENTRY ? 'text-emerald-600' : 'text-red-600'}`}>
                      {t.type === TransactionType.EXIT ? '-' : ''} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-sm text-right space-x-2 no-print">
                      {!t.creditSaleId ? (
                        <>
                          <button onClick={() => handleEdit(t)} className="text-indigo-600 hover:text-indigo-800 font-medium">Alterar</button>
                          <button onClick={() => { if(confirm('Excluir este lançamento permanentemente?')) onDeleteTransaction(t.id); }} className="text-red-400 hover:text-red-600">Excluir</button>
                        </>
                      ) : (
                        <span className="text-[10px] text-slate-300 italic">Vínculo Ativo</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {filtered.length > 0 && (
              <tfoot className="bg-slate-50 border-t-2 border-slate-200">
                <tr className="font-bold">
                  <td colSpan={5} className="px-6 py-4 text-sm text-slate-500 text-right uppercase tracking-wider">Saldo Final do Filtro:</td>
                  <td className={`px-6 py-4 text-sm text-right whitespace-nowrap ${filteredTotal >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    R$ {filteredTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="no-print"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg p-8 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold mb-6 text-slate-800 flex items-center gap-2">
              <span className="p-2 bg-emerald-50 rounded-lg text-emerald-600">💰</span>
              {editingTransaction ? 'Alterar Lançamento' : 'Novo Lançamento Financeiro'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Data</label>
                  <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tipo de Operação</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as TransactionType})} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm">
                    <option value={TransactionType.EXIT}>Saída (Despesa)</option>
                    <option value={TransactionType.ENTRY}>Entrada (Receita)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Valor (R$)</label>
                <input type="number" step="0.01" required placeholder="0.00" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-bold text-emerald-600" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Centro de Custo</label>
                  <select required value={formData.costCenterId} onChange={e => setFormData({...formData, costCenterId: e.target.value, subgroupId: ''})} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm">
                    <option value="">Selecione...</option>
                    {state.costCenters.map(cc => <option key={cc.id} value={cc.id}>{cc.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Subgrupo</label>
                  <select required={subgroups.length > 0} value={formData.subgroupId} onChange={e => setFormData({...formData, subgroupId: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm">
                    <option value="">Selecione...</option>
                    {subgroups.map(sg => <option key={sg.id} value={sg.id}>{sg.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Forma de Pagamento</label>
                <select required value={formData.paymentMethodId} onChange={e => setFormData({...formData, paymentMethodId: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm">
                  <option value="">Selecione...</option>
                  {state.paymentMethods.map(pm => <option key={pm.id} value={pm.id}>{pm.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Descrição do Lançamento</label>
                <input type="text" required placeholder="Ex: Pagamento de Energia" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm" />
              </div>

              <div className="flex space-x-3 pt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition">Confirmar Lançamento</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showQuickBoleto && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl border border-slate-200">
            <h3 className="text-xl font-bold mb-4">Lançar Boletos do Dia</h3>
            <p className="text-sm text-slate-500 mb-6">Esta ferramenta facilita o lançamento rápido de boletos com a data de hoje.</p>
            <div className="space-y-4">
              <button 
                onClick={() => { 
                  setFormData({
                    date: getLocalDate(),
                    type: TransactionType.EXIT,
                    amount: '',
                    costCenterId: '',
                    subgroupId: '',
                    paymentMethodId: '',
                    description: 'Pagamento de Boleto Diário'
                  });
                  setEditingTransaction(null);
                  setShowQuickBoleto(false);
                  setShowModal(true);
                }} 
                className="w-full p-4 border border-emerald-100 bg-emerald-50 rounded-xl text-left hover:bg-emerald-100 transition"
              >
                <div className="font-bold text-emerald-800">Lançar Novo Boleto</div>
                <div className="text-xs text-emerald-600">Abre o formulário pré-preenchido com a data de hoje.</div>
              </button>
              <button onClick={() => setShowQuickBoleto(false)} className="w-full py-3 text-sm font-bold text-slate-400 hover:text-slate-600">Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
