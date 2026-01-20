
import React, { useMemo } from 'react';
import { AppState, TransactionType } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

interface DashboardProps {
  state: AppState;
  selectedMonth: string;
  userId: string;
  hideHeader?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ state, selectedMonth, userId, hideHeader = false }) => {
  // Filtra TODAS as transações do usuário para os cálculos históricos e mensais
  const userTransactions = useMemo(() => 
    state.transactions.filter(t => t.createdBy === userId),
  [state.transactions, userId]);

  const currentMonthTransactions = useMemo(() => 
    userTransactions.filter(t => t.monthRef === selectedMonth),
  [userTransactions, selectedMonth]);

  const stats = useMemo(() => {
    const entries = currentMonthTransactions
      .filter(t => t.type === TransactionType.ENTRY)
      .reduce((sum, t) => sum + t.amount, 0);
    const exits = currentMonthTransactions
      .filter(t => t.type === TransactionType.EXIT)
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      entries,
      exits,
      total: entries - exits
    };
  }, [currentMonthTransactions]);

  const monthlyData = useMemo(() => {
    const months = [...new Set(userTransactions.map(t => t.monthRef))].sort();
    return months.map(m => {
      const monthTs = userTransactions.filter(t => t.monthRef === m);
      const entries = monthTs.filter(t => t.type === TransactionType.ENTRY).reduce((s, t) => s + t.amount, 0);
      const exits = monthTs.filter(t => t.type === TransactionType.EXIT).reduce((s, t) => s + t.amount, 0);
      return { name: m, Entradas: entries, Saídas: exits, Resultado: entries - exits };
    });
  }, [userTransactions]);

  const centerData = useMemo(() => {
    const data: { [key: string]: number } = {};
    currentMonthTransactions.forEach(t => {
      const cc = state.costCenters.find(c => c.id === t.costCenterId)?.name || 'Outros';
      data[cc] = (data[cc] || 0) + t.amount;
    });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [currentMonthTransactions, state.costCenters]);

  const COLORS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6'];

  return (
    <div className="space-y-8">
      {!hideHeader && (
        <header>
          <h2 className="text-3xl font-bold text-slate-800">Visão Geral</h2>
          <p className="text-slate-500">Acompanhamento de {selectedMonth}</p>
        </header>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500 uppercase">Minhas Entradas</p>
          <p className="text-3xl font-bold text-emerald-600 mt-2">R$ {stats.entries.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500 uppercase">Minhas Saídas</p>
          <p className="text-3xl font-bold text-red-600 mt-2">R$ {stats.exits.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500 uppercase">Meu Resultado</p>
          <p className={`text-3xl font-bold mt-2 ${stats.total >= 0 ? 'text-blue-600' : 'text-red-700'}`}>
            R$ {stats.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Bar Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold mb-6">Meu Desempenho Mensal</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`} />
                <Bar dataKey="Entradas" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Saídas" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost Center Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold mb-6">Meus Gastos por Centro de Custo</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={centerData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name }) => name}
                >
                  {centerData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
