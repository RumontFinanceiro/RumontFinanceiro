
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
 * Utiliza o locale 'en-CA' (Canadá) que por padrão retorna o formato ISO-like YYYY-MM-DD.
 * Isso elimina o bug da "data de amanhã" que o .toISOString() causa no Brasil após as 21h.
 */
export const getLocalDate = () => {
  return new Date().toLocaleDateString('en-CA');
};
