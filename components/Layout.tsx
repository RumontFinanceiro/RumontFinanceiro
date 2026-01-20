
import React from 'react';
import { User, UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
  activeView: string;
  setActiveView: (view: string) => void;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, user, onLogout, activeView, setActiveView, selectedMonth, setSelectedMonth 
}) => {
  // Constrói a lista de itens do menu condicionalmente
  const menuItems = [];

  const isMaster = user.role === UserRole.MASTER;

  if (isMaster) {
    // Menu reduzido para Master
    menuItems.push({ id: 'master', label: 'Painel Master', icon: '🛡️' });
    menuItems.push({ id: 'users', label: 'Gestão de Usuários', icon: '🔐' });
  } else {
    // Menu completo para outros níveis
    menuItems.push({ id: 'dashboard', label: 'Dashboard', icon: '📊' });
    menuItems.push({ id: 'transactions', label: 'Lançamentos', icon: '💰' });
    menuItems.push({ id: 'credit', label: 'Crediário', icon: '💳' });
    menuItems.push({ id: 'settings', label: 'Configurações', icon: '⚙️' });
  }

  // Perfil é comum a todos
  menuItems.push({ id: 'profile', label: 'Meu Perfil', icon: '👤' });

  const currentYear = new Date().getFullYear();
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const m = (i + 1).toString().padStart(2, '0');
    return `${currentYear}-${m}`;
  });

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden print:block print:h-auto print:overflow-visible">
      {/* Sidebar - Oculta na Impressão */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col no-print">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold text-yellow-400 tracking-tight">RUMONT</h1>
          <p className="text-xs text-slate-400 uppercase mt-1">Gestão Financeira</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeView === item.id 
                  ? 'bg-emerald-600 text-white' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-4">
          <div className="flex flex-col">
            <label className="text-xs text-slate-500 mb-1">Mês de Referência</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-slate-800 text-white text-sm rounded border-none p-2 focus:ring-2 focus:ring-emerald-500"
            >
              {monthOptions.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center space-x-3 p-2 bg-slate-800 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold uppercase">
              {user.adminName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.adminName}</p>
              <p className="text-xs text-slate-500 capitalize">{user.role}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full text-xs text-slate-400 hover:text-red-400 transition-colors py-2"
          >
            Sair do sistema
          </button>
        </div>
      </aside>

      {/* Main Content - Expandível na Impressão para múltiplas páginas */}
      <main className="flex-1 overflow-y-auto p-8 print:p-0 print:overflow-visible print:block print:h-auto">
        <div className="max-w-6xl mx-auto print:max-w-none">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
