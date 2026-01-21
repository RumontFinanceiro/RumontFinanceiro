
import { UserRole, AppState } from './types';

export const INITIAL_STATE: AppState = {
  users: [
    {
      id: '00000000-0000-0000-0000-000000000001',
      username: 'admin',
      password: 'admin',
      storeName: 'Rumont Matriz',
      adminName: 'Master Admin',
      role: UserRole.MASTER,
      active: true
    }
  ],
  costCenters: [],
  paymentMethods: [],
  transactions: [],
  creditSales: []
};

export const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

/**
 * Retorna a data atual no formato YYYY-MM-DD respeitando o fuso horário local.
 * O locale 'en-CA' é usado por padronizar o formato ISO (YYYY-MM-DD).
 * Resolve o bug de "data de amanhã" comum em deploys Cloudflare/Edge.
 */
export const getLocalDate = () => {
  return new Date().toLocaleDateString('en-CA');
};
