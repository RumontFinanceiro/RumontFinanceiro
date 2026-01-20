
import React, { useState } from 'react';
import { AppState, CostCenter, User, UserRole, PaymentMethod } from '../types';

interface SettingsProps {
  state: AppState;
  currentUser: User;
  onUpdateCostCenters: (ccs: CostCenter[]) => void;
  onAddPaymentMethod: (pm: PaymentMethod) => void;
  onUpdatePaymentMethod: (pm: PaymentMethod) => void;
  onDeletePaymentMethod: (id: string) => void;
}

const Settings: React.FC<SettingsProps> = ({ 
  state, 
  currentUser, 
  onUpdateCostCenters, 
  onAddPaymentMethod, 
  onUpdatePaymentMethod, 
  onDeletePaymentMethod 
}) => {
  // Center of Cost States
  const [newCenterName, setNewCenterName] = useState('');
  const [editingCenterId, setEditingCenterId] = useState<string | null>(null);
  const [editNameValue, setEditNameValue] = useState('');
  const [editingSubCenterId, setEditingSubCenterId] = useState<string | null>(null);
  const [newSubName, setNewSubName] = useState('');

  // Payment Method States
  const [newPMName, setNewPMName] = useState('');
  const [editingPMId, setEditingPMId] = useState<string | null>(null);
  const [editPMValue, setEditPMValue] = useState('');

  if (currentUser.role === UserRole.MASTER) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <span className="text-4xl mb-4">🚫</span>
        <p className="text-lg font-medium">Acesso restrito apenas aos gerentes de loja.</p>
      </div>
    );
  }

  // Cost Center Handlers
  const addCenter = () => {
    if (!newCenterName) return;
    const newCC: CostCenter = {
      id: crypto.randomUUID(),
      name: newCenterName,
      subgroups: []
    };
    onUpdateCostCenters([...state.costCenters, newCC]);
    setNewCenterName('');
  };

  const removeCenter = (id: string) => {
    if (confirm('Deseja excluir este centro de custo e todos os seus subgrupos?')) {
      onUpdateCostCenters(state.costCenters.filter(c => c.id !== id));
    }
  };

  const saveCenterEdit = (id: string) => {
    if (!editNameValue) return;
    const updated = state.costCenters.map(cc => 
      cc.id === id ? { ...cc, name: editNameValue } : cc
    );
    onUpdateCostCenters(updated);
    setEditingCenterId(null);
  };

  const addSubgroup = (centerId: string) => {
    if (!newSubName) return;
    const updated = state.costCenters.map(cc => {
      if (cc.id === centerId) {
        return { ...cc, subgroups: [...cc.subgroups, { id: crypto.randomUUID(), name: newSubName }] };
      }
      return cc;
    });
    onUpdateCostCenters(updated);
    setNewSubName('');
    setEditingSubCenterId(null);
  };

  const removeSubgroup = (centerId: string, subId: string) => {
    const updated = state.costCenters.map(cc => {
      if (cc.id === centerId) {
        return { ...cc, subgroups: cc.subgroups.filter(s => s.id !== subId) };
      }
      return cc;
    });
    onUpdateCostCenters(updated);
  };

  // Payment Method Handlers
  const addPM = () => {
    if (!newPMName) return;
    const newPM: PaymentMethod = {
      id: crypto.randomUUID(),
      name: newPMName
    };
    onAddPaymentMethod(newPM);
    setNewPMName('');
  };

  const removePM = (id: string) => {
    if (confirm('Deseja excluir esta forma de pagamento?')) {
      onDeletePaymentMethod(id);
    }
  };

  const savePMEdit = (id: string) => {
    if (!editPMValue) return;
    onUpdatePaymentMethod({ id, name: editPMValue });
    setEditingPMId(null);
  };

  return (
    <div className="space-y-12">
      <header>
        <h2 className="text-2xl font-bold text-slate-800">Configurações Gerais</h2>
        <p className="text-slate-500">Gestão de Centros de Custo e Formas de Pagamento</p>
      </header>

      {/* Payment Methods Management */}
      <section className="space-y-6">
        <h3 className="text-xl font-bold text-slate-700 flex items-center space-x-2">
          <span>💳</span>
          <span>Formas de Pagamento</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h4 className="text-sm font-semibold mb-4 uppercase text-slate-400 tracking-wider">Nova Forma de Pgto.</h4>
            <div className="flex space-x-2">
              <input 
                type="text" 
                placeholder="Ex: Pix, Dinheiro, Cartão..."
                value={newPMName}
                onChange={e => setNewPMName(e.target.value)}
                className="flex-1 p-2 border border-slate-200 rounded-lg text-sm"
              />
              <button 
                onClick={addPM}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
              >
                Adicionar
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h4 className="text-sm font-semibold mb-4 uppercase text-slate-400 tracking-wider">Formas Cadastradas</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {state.paymentMethods.length === 0 ? (
                <p className="text-slate-400 text-sm italic">Nenhuma forma cadastrada.</p>
              ) : (
                state.paymentMethods.map(pm => (
                  <div key={pm.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100 group">
                    {editingPMId === pm.id ? (
                      <div className="flex space-x-2 flex-1">
                        <input 
                          autoFocus
                          type="text" 
                          value={editPMValue}
                          onChange={e => setEditPMValue(e.target.value)}
                          className="flex-1 p-1 text-sm border border-slate-200 rounded"
                        />
                        <button onClick={() => savePMEdit(pm.id)} className="text-xs bg-emerald-600 text-white px-2 py-1 rounded">Ok</button>
                        <button onClick={() => setEditingPMId(null)} className="text-xs text-slate-400">X</button>
                      </div>
                    ) : (
                      <>
                        <span className="text-sm font-medium text-slate-700">{pm.name}</span>
                        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition">
                          <button onClick={() => { setEditingPMId(pm.id); setEditPMValue(pm.name); }} className="text-xs text-indigo-500 hover:underline">Editar</button>
                          <button onClick={() => removePM(pm.id)} className="text-xs text-red-400 hover:underline">Excluir</button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Cost Centers Management */}
      <section className="space-y-6">
        <h3 className="text-xl font-bold text-slate-700 flex items-center space-x-2">
          <span>📁</span>
          <span>Centros de Custo</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h4 className="text-sm font-semibold mb-4 uppercase text-slate-400 tracking-wider">Novo Centro de Custo</h4>
            <div className="flex space-x-2">
              <input 
                type="text" 
                placeholder="Ex: Pessoal, Marketing..."
                value={newCenterName}
                onChange={e => setNewCenterName(e.target.value)}
                className="flex-1 p-2 border border-slate-200 rounded-lg text-sm"
              />
              <button 
                onClick={addCenter}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700"
              >
                Adicionar
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h4 className="text-sm font-semibold mb-4 uppercase text-slate-400 tracking-wider">Centros Cadastrados</h4>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {state.costCenters.map(cc => (
                <div key={cc.id} className="border border-slate-100 rounded-lg p-4 bg-slate-50 transition hover:border-slate-200">
                  <div className="flex justify-between items-center mb-3">
                    {editingCenterId === cc.id ? (
                      <div className="flex space-x-2 flex-1 mr-2">
                        <input 
                          autoFocus
                          type="text" 
                          value={editNameValue}
                          onChange={e => setEditNameValue(e.target.value)}
                          className="flex-1 p-1 text-sm border border-slate-200 rounded"
                        />
                        <button onClick={() => saveCenterEdit(cc.id)} className="text-xs bg-emerald-600 text-white px-2 py-1 rounded">Salvar</button>
                        <button onClick={() => setEditingCenterId(null)} className="text-xs text-slate-400">X</button>
                      </div>
                    ) : (
                      <h4 className="font-bold text-slate-800">{cc.name}</h4>
                    )}
                    
                    <div className="flex space-x-3">
                      {editingCenterId !== cc.id && (
                        <button 
                          onClick={() => { setEditingCenterId(cc.id); setEditNameValue(cc.name); }} 
                          className="text-xs text-indigo-500 hover:text-indigo-700 font-medium"
                        >
                          Editar
                        </button>
                      )}
                      <button onClick={() => removeCenter(cc.id)} className="text-xs text-red-400 hover:text-red-600">Excluir</button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {cc.subgroups.map(sg => (
                      <div key={sg.id} className="flex justify-between items-center text-sm text-slate-600 bg-white px-3 py-1 rounded border border-slate-100">
                        <span>{sg.name}</span>
                        <button onClick={() => removeSubgroup(cc.id, sg.id)} className="text-slate-300 hover:text-red-400">×</button>
                      </div>
                    ))}
                    
                    {editingSubCenterId === cc.id ? (
                      <div className="flex space-x-2 pt-2">
                        <input 
                          autoFocus
                          type="text" 
                          placeholder="Novo subgrupo"
                          value={newSubName}
                          onChange={e => setNewSubName(e.target.value)}
                          className="flex-1 p-1 text-xs border border-slate-200 rounded"
                        />
                        <button onClick={() => addSubgroup(cc.id)} className="text-xs bg-slate-800 text-white px-2 py-1 rounded">Ok</button>
                        <button onClick={() => setEditingSubCenterId(null)} className="text-xs text-slate-400">Cancelar</button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setEditingSubCenterId(cc.id)}
                        className="text-xs text-emerald-600 font-medium hover:underline mt-2"
                      >
                        + Adicionar Subgrupo
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Settings;
