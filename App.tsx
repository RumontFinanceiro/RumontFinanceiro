
import React, { useState, useEffect } from 'react';
import { User, AppState, Transaction, StoreCreditSale, CostCenter, UserRole, PaymentMethod } from './types';
import { INITIAL_STATE, getLocalDate } from './constants';
import { supabase } from './services/supabase';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import CreditSales from './components/CreditSales';
import Settings from './components/Settings';
import Users from './components/Users';
import Profile from './components/Profile';
import MasterAdmin from './components/MasterAdmin';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('dashboard');
  
  // Inicialização do mês usando partes locais para evitar UTC shift
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [users, cc, pm, trans, sales] = await Promise.all([
          supabase.from('users').select('*'),
          supabase.from('cost_centers').select('*'),
          supabase.from('payment_methods').select('*'),
          supabase.from('transactions').select('*').order('date', { ascending: false }),
          supabase.from('credit_sales').select('*').order('saleDate', { ascending: false })
        ]);

        setState({
          users: users.data || INITIAL_STATE.users,
          costCenters: cc.data || [],
          paymentMethods: pm.data || [],
          transactions: trans.data || [],
          creditSales: sales.data || []
        });
      } catch (error) {
        console.error('Falha na sincronização:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogin = (e: React.FormEvent, loginForm: any) => {
    e.preventDefault();
    const user = state.users.find(u => u.username === loginForm.username && u.password === loginForm.password);
    if (user) {
      if (!user.active) alert('Sua conta está desativada.');
      else {
        setCurrentUser(user);
        setActiveView(user.role === UserRole.MASTER ? 'master' : 'dashboard');
      }
    } else alert('Usuário ou senha inválidos.');
  };

  const handleSaveCreditSale = async (s: StoreCreditSale, t?: Transaction | null) => {
    try {
      // 1. Persistência Atômica no Supabase
      const { error: sErr } = await supabase.from('credit_sales').upsert(s);
      if (sErr) throw sErr;

      if (t) {
        const { error: tErr } = await supabase.from('transactions').upsert(t);
        if (tErr) throw tErr;
      } else {
        await supabase.from('transactions').delete().eq('creditSaleId', s.id);
      }

      // 2. Sincronização de Estado Local apenas após sucesso no Banco
      setState(prev => ({
        ...prev,
        creditSales: [s, ...prev.creditSales.filter(item => item.id !== s.id)],
        transactions: t 
          ? [t, ...prev.transactions.filter(item => item.id !== t.id && item.creditSaleId !== s.id)]
          : prev.transactions.filter(item => item.creditSaleId !== s.id)
      }));
    } catch (err: any) {
      console.error('Erro crítico no salvamento:', err);
      alert('Erro ao salvar no banco de dados. Verifique sua conexão.');
      throw err;
    }
  };

  const handleDeleteCreditSale = async (id: string) => {
    try {
      const { error } = await supabase.from('credit_sales').delete().eq('id', id);
      if (error) throw error;
      
      setState(prev => ({
        ...prev,
        creditSales: prev.creditSales.filter(s => s.id !== id),
        transactions: prev.transactions.filter(t => t.creditSaleId !== id)
      }));
    } catch (err: any) {
      alert('Erro ao excluir: ' + err.message);
    }
  };

  const handleUpdateCostCenters = async (costCenters: CostCenter[]) => {
    try {
      const { error: upsertError } = await supabase.from('cost_centers').upsert(costCenters);
      if (upsertError) throw upsertError;

      const ids = costCenters.map(c => c.id);
      if (ids.length > 0) {
        await supabase.from('cost_centers').delete().not('id', 'in', ids);
      } else {
        await supabase.from('cost_centers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      }
      setState(prev => ({ ...prev, costCenters }));
    } catch (err: any) {
      alert('Erro ao atualizar: ' + err.message);
    }
  };

  const handleAddTransaction = async (t: Transaction) => {
    const { error } = await supabase.from('transactions').insert(t);
    if (!error) setState(prev => ({ ...prev, transactions: [t, ...prev.transactions] }));
  };

  const handleUpdateTransaction = async (t: Transaction) => {
    const { error } = await supabase.from('transactions').update(t).eq('id', t.id);
    if (!error) setState(prev => ({ ...prev, transactions: prev.transactions.map(item => item.id === t.id ? t : item) }));
  };

  const handleDeleteTransaction = async (id: string) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (!error) setState(prev => ({ ...prev, transactions: prev.transactions.filter(t => t.id !== id) }));
  };

  const handleAddUser = async (u: User) => {
    const { error } = await supabase.from('users').insert(u);
    if (!error) setState(prev => ({ ...prev, users: [...prev.users, u] }));
  };

  const handleUpdateUser = async (u: User) => {
    const { error } = await supabase.from('users').update(u).eq('id', u.id);
    if (!error) setState(prev => ({ ...prev, users: prev.users.map(item => item.id === u.id ? u : item) }));
  };

  const handleDeleteUser = async (id: string) => {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (!error) setState(prev => ({ ...prev, users: prev.users.filter(u => u.id !== id) }));
  };

  const handleAddPaymentMethod = async (pm: PaymentMethod) => {
    const { error } = await supabase.from('payment_methods').insert(pm);
    if (!error) setState(prev => ({ ...prev, paymentMethods: [...prev.paymentMethods, pm] }));
  };

  const handleUpdatePaymentMethod = async (pm: PaymentMethod) => {
    const { error } = await supabase.from('payment_methods').update(pm).eq('id', pm.id);
    if (!error) setState(prev => ({ ...prev, paymentMethods: prev.paymentMethods.map(item => item.id === pm.id ? pm : item) }));
  };

  const handleDeletePaymentMethod = async (id: string) => {
    const { error } = await supabase.from('payment_methods').delete().eq('id', id);
    if (!error) setState(prev => ({ ...prev, paymentMethods: prev.paymentMethods.filter(pm => pm.id !== id) }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-white mt-4 font-bold tracking-widest uppercase text-xs">Rumont Sincronizando...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10 border border-slate-200">
          <div className="text-center mb-10">
            <h1 className="text-5xl font-black text-yellow-400 tracking-tighter italic">RUMONT</h1>
            <p className="text-slate-400 font-medium uppercase text-[10px] tracking-[0.2em] mt-2">Financial Control Systems</p>
          </div>
          <form onSubmit={(e) => {
            const fd = new FormData(e.currentTarget);
            handleLogin(e, Object.fromEntries(fd));
          }} className="space-y-6">
            <input name="username" type="text" placeholder="Usuário" required className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-yellow-400 transition-all font-medium" />
            <input name="password" type="password" placeholder="Senha" required className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-yellow-400 transition-all font-medium" />
            <button type="submit" className="w-full bg-slate-900 text-white font-bold py-5 rounded-2xl shadow-xl hover:bg-slate-800 transition active:scale-[0.98]">Entrar no Painel</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <Layout user={currentUser} onLogout={() => setCurrentUser(null)} activeView={activeView} setActiveView={setActiveView} selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth}>
      {activeView === 'dashboard' && <Dashboard state={state} selectedMonth={selectedMonth} userId={currentUser.id} />}
      {activeView === 'transactions' && <Transactions state={state} currentUser={currentUser} selectedMonth={selectedMonth} onAddTransaction={handleAddTransaction} onUpdateTransaction={handleUpdateTransaction} onDeleteTransaction={handleDeleteTransaction} />}
      {activeView === 'credit' && <CreditSales state={state} currentUser={currentUser} selectedMonth={selectedMonth} onSaveCreditSale={handleSaveCreditSale} onDeleteCreditSale={handleDeleteCreditSale} />}
      {activeView === 'settings' && <Settings state={state} currentUser={currentUser} onUpdateCostCenters={handleUpdateCostCenters} onAddPaymentMethod={handleAddPaymentMethod} onUpdatePaymentMethod={handleUpdatePaymentMethod} onDeletePaymentMethod={handleDeletePaymentMethod} />}
      {activeView === 'profile' && <Profile user={currentUser} onUpdateUser={handleUpdateUser} />}
      {activeView === 'master' && <MasterAdmin state={state} selectedMonth={selectedMonth} />}
      {activeView === 'users' && <Users state={state} onAddUser={handleAddUser} onUpdateUser={handleUpdateUser} onDeleteUser={handleDeleteUser} />}
    </Layout>
  );
};

export default App;
