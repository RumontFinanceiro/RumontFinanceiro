
import React, { useState } from 'react';
import { AppState, User, UserRole } from '../types';

interface UsersProps {
  state: AppState;
  onAddUser: (user: User) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (id: string) => void;
}

const Users: React.FC<UsersProps> = ({ state, onAddUser, onUpdateUser, onDeleteUser }) => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    storeName: '',
    adminName: '',
    role: UserRole.MANAGER
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.password || !formData.storeName || !formData.adminName) return;

    const newUser: User = {
      id: crypto.randomUUID(),
      username: formData.username,
      password: formData.password,
      storeName: formData.storeName,
      adminName: formData.adminName,
      role: formData.role,
      active: true
    };

    onAddUser(newUser);
    setShowModal(false);
    setFormData({ username: '', password: '', storeName: '', adminName: '', role: UserRole.MANAGER });
  };

  const toggleStatus = (user: User) => {
    onUpdateUser({ ...user, active: !user.active });
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja excluir permanentemente este usuário do banco de dados? Esta ação é irreversível.')) {
      onDeleteUser(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center no-print">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestão de Usuários</h2>
          <p className="text-slate-500">Administração de acessos e lojas</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition flex items-center space-x-2 shadow-lg"
        >
          <span>👤</span>
          <span>Novo Usuário</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Administrador / Login</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Loja / Unidade</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Função</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase text-center">Status</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase text-right no-print">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {state.users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50 transition">
                <td className="px-6 py-4">
                  <div className="text-sm font-bold text-slate-900">{u.adminName}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{u.username}</div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 font-medium uppercase">{u.storeName}</td>
                <td className="px-6 py-4">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase font-black tracking-tighter border border-slate-200">{u.role}</span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    u.active ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-red-100 text-red-700 border border-red-200'
                  }`}>
                    {u.active ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-4 no-print">
                  <button onClick={() => toggleStatus(u)} className="text-xs text-indigo-600 hover:text-indigo-800 font-bold">
                    {u.active ? 'Desativar' : 'Ativar'}
                  </button>
                  {u.role !== UserRole.MASTER && (
                    <button onClick={() => handleDelete(u.id)} className="text-xs text-red-500 hover:text-red-700 font-black uppercase">Excluir</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl border border-slate-200">
            <h3 className="text-xl font-bold mb-6 text-slate-800 flex items-center gap-2">
              <span className="bg-emerald-100 p-2 rounded-lg text-emerald-600">👤</span>
              Cadastro de Novo Usuário
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nome da Loja</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Filial Centro"
                  value={formData.storeName}
                  onChange={e => setFormData({...formData, storeName: e.target.value})}
                  className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nome Completo do Admin</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Carlos Oliveira"
                  value={formData.adminName}
                  onChange={e => setFormData({...formData, adminName: e.target.value})}
                  className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Login</label>
                  <input 
                    type="text" 
                    required
                    value={formData.username}
                    onChange={e => setFormData({...formData, username: e.target.value})}
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Senha</label>
                  <input 
                    type="password" 
                    required
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nível de Acesso</label>
                <select 
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
                  className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition"
                >
                  <option value={UserRole.MANAGER}>Gerente de Loja</option>
                  <option value={UserRole.FINANCE}>Financeiro</option>
                  <option value={UserRole.OPERATOR}>Operador / PDV</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition">Salvar Usuário</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
