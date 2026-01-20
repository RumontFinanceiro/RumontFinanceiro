
import React, { useState, useMemo } from 'react';
import { AppState, StoreCreditSale, Transaction, TransactionType, User, PaymentMethod } from '../types';
import { getLocalDate } from '../constants';

interface CreditSalesProps {
  state: AppState;
  currentUser: User;
  selectedMonth: string;
  onSaveCreditSale: (s: StoreCreditSale, t?: Transaction | null) => Promise<void>;
  onDeleteCreditSale: (id: string) => Promise<void>;
}

const CreditSales: React.FC<CreditSalesProps> = ({ 
  state, 
  currentUser, 
  selectedMonth, 
  onSaveCreditSale,
  onDeleteCreditSale
}) => {
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [filterSearch, setFilterSearch] = useState('');
  const [editingSale, setEditingSale] = useState<StoreCreditSale | null>(null);
  
  const [formData, setFormData] = useState({
    clientCode: '',
    client: '',
    totalAmount: '',
    downPayment: '0',
    downPaymentPaymentMethodId: '',
    saleDate: getLocalDate()
  });

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '---';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const handleOpenNew = () => {
    setEditingSale(null);
    setFormData({
      clientCode: '',
      client: '',
      totalAmount: '',
      downPayment: '0',
      downPaymentPaymentMethodId: '',
      saleDate: getLocalDate()
    });
    setShowModal(true);
  };

  const handleEdit = (s: StoreCreditSale) => {
    setEditingSale(s);
    setFormData({
      clientCode: s.clientCode || '',
      client: s.client,
      totalAmount: s.totalAmount.toString(),
      downPayment: s.downPayment.toString(),
      downPaymentPaymentMethodId: s.downPaymentPaymentMethodId || '',
      saleDate: s.saleDate
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    const total = parseFloat(formData.totalAmount);
    const down = parseFloat(formData.downPayment);

    if (!formData.client || isNaN(total)) {
      alert('Preencha os dados do cliente e o valor total.');
      return;
    }

    if (down > 0 && !formData.downPaymentPaymentMethodId) {
      alert('Selecione a forma de pagamento da entrada.');
      return;
    }

    // Validação de segurança: garantir que existe pelo menos um centro de custo para o vínculo financeiro
    if (down > 0 && state.costCenters.length === 0) {
      alert('Configure pelo menos um Centro de Custo em Configurações para realizar vendas com entrada.');
      return;
    }

    setIsSaving(true);
    try {
      const saleId = editingSale ? editingSale.id : crypto.randomUUID();
      
      const saleData: StoreCreditSale = {
        id: saleId,
        clientCode: formData.clientCode,
        client: formData.client,
        totalAmount: total,
        downPayment: down,
        downPaymentPaymentMethodId: formData.downPaymentPaymentMethodId || undefined,
        saleDate: formData.saleDate,
        monthRef: selectedMonth,
        createdBy: editingSale ? editingSale.createdBy : currentUser.id
      };

      let transactionData: Transaction | null = null;

      if (down > 0) {
        const existingT = state.transactions.find(t => t.creditSaleId === saleId);
        const defaultCC = state.costCenters[0];
        const defaultSub = defaultCC?.subgroups[0];

        transactionData = {
          id: existingT ? existingT.id : crypto.randomUUID(),
          date: formData.saleDate,
          type: TransactionType.ENTRY,
          amount: down,
          costCenterId: defaultCC?.id || '',
          subgroupId: defaultSub?.id || '',
          description: `Entrada Crediário: ${formData.client}`,
          monthRef: selectedMonth,
          createdBy: currentUser.id,
          paymentMethodId: formData.downPaymentPaymentMethodId,
          creditSaleId: saleId
        };
      }

      await onSaveCreditSale(saleData, transactionData);
      setShowModal(false);
    } catch (error) {
      // O App.tsx já trata o feedback visual
    } finally {
      setIsSaving(false);
    }
  };

  const filteredSales = useMemo(() => {
    return state.creditSales.filter(s => {
      const matchMonth = s.monthRef === selectedMonth;
      const matchUser = s.createdBy === currentUser.id;
      const matchSearch = filterSearch 
        ? s.client.toLowerCase().includes(filterSearch.toLowerCase()) || (s.clientCode && s.clientCode.includes(filterSearch))
        : true;
      return matchMonth && matchUser && matchSearch;
    });
  }, [state.creditSales, selectedMonth, currentUser, filterSearch]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center no-print">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Crediário Próprio</h2>
          <p className="text-slate-500">Controle de vendas e parcelas</p>
        </div>
        <button onClick={handleOpenNew} className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition font-bold shadow-lg flex items-center gap-2">
          <span>💳</span> Nova Venda
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm no-print">
        <input 
          type="text" 
          placeholder="Pesquisar cliente por nome ou código..." 
          value={filterSearch} 
          onChange={e => setFilterSearch(e.target.value)} 
          className="w-full p-3 border border-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50" 
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Data</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Cliente</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase text-right">Entrada</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase text-right">Total</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase text-right no-print">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredSales.map(s => (
              <tr key={s.id} className="hover:bg-slate-50 transition">
                <td className="px-6 py-4 text-sm">{formatDate(s.saleDate)}</td>
                <td className="px-6 py-4">
                  <div className="text-sm font-bold text-slate-800">{s.client}</div>
                  <div className="text-[10px] text-slate-400 font-mono">#{s.clientCode || 'S/C'}</div>
                </td>
                <td className="px-6 py-4 text-sm text-right font-medium text-emerald-600">R$ {s.downPayment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td className="px-6 py-4 text-sm text-right font-black text-slate-900">R$ {s.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td className="px-6 py-4 text-right no-print">
                  <div className="flex justify-end gap-3">
                    <button onClick={() => handleEdit(s)} className="text-indigo-600 hover:underline font-bold text-sm">Editar</button>
                    <button onClick={() => { if(confirm('Excluir esta venda e seu financeiro?')) onDeleteCreditSale(s.id); }} className="text-red-400 hover:text-red-600 text-sm">Excluir</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black mb-6 text-slate-800 flex items-center gap-3">
              <span className="bg-emerald-100 p-2 rounded-xl text-emerald-600">💳</span>
              {editingSale ? 'Editar Venda' : 'Lançar Crediário'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Cód. Cliente</label>
                  <input type="text" value={formData.clientCode} onChange={e => setFormData({...formData, clientCode: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Data</label>
                  <input type="date" required value={formData.saleDate} onChange={e => setFormData({...formData, saleDate: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Nome do Cliente</label>
                <input type="text" required value={formData.client} onChange={e => setFormData({...formData, client: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl text-sm font-bold" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Valor Total da Venda (R$)</label>
                <input type="number" step="0.01" required value={formData.totalAmount} onChange={e => setFormData({...formData, totalAmount: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl text-lg font-black text-slate-800 bg-slate-50" />
              </div>

              <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-3">
                <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Entrada no Ato</p>
                <div className="grid grid-cols-2 gap-4">
                  <input type="number" step="0.01" value={formData.downPayment} onChange={e => setFormData({...formData, downPayment: e.target.value})} className="w-full p-2 border border-emerald-200 rounded-lg text-sm font-bold" />
                  <select value={formData.downPaymentPaymentMethodId} onChange={e => setFormData({...formData, downPaymentPaymentMethodId: e.target.value})} className="w-full p-2 border border-emerald-200 rounded-lg text-xs">
                    <option value="">Forma...</option>
                    {state.paymentMethods.map(pm => <option key={pm.id} value={pm.id}>{pm.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 text-sm font-bold text-slate-400 hover:bg-slate-50 rounded-xl" disabled={isSaving}>Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-slate-800 transition disabled:opacity-50" disabled={isSaving}>
                  {isSaving ? 'Salvando...' : 'Confirmar Venda'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditSales;
