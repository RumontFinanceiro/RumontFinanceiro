
import { AppState } from '../types';
import { INITIAL_STATE } from '../constants';

const STORAGE_KEY = 'rumont_db';

export const saveState = (state: AppState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const loadState = (): AppState => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return INITIAL_STATE;
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_STATE;
  }
};
