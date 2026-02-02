import { AppState, Person, Transaction, TransactionType } from '../types';
import { STORAGE_KEY_DATA } from '../constants';

// Mock Encryption/Decryption (In a real app, use crypto-js or Web Crypto API)
const encrypt = (data: string): string => {
  // Placeholder for AES encryption
  return btoa(unescape(encodeURIComponent(data)));
};

const decrypt = (data: string): string => {
  try {
    return decodeURIComponent(escape(atob(data)));
  } catch (e) {
    console.error("Decryption failed", e);
    return "{}";
  }
};

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export const loadData = (): AppState => {
  const raw = localStorage.getItem(STORAGE_KEY_DATA);
  if (!raw) {
    return { people: [], transactions: [] };
  }
  try {
    const json = decrypt(raw);
    return JSON.parse(json);
  } catch (e) {
    console.error("Failed to load data", e);
    return { people: [], transactions: [] };
  }
};

export const saveData = (state: AppState): void => {
  const json = JSON.stringify(state);
  const encrypted = encrypt(json);
  localStorage.setItem(STORAGE_KEY_DATA, encrypted);
};

export const exportData = (): void => {
  const raw = localStorage.getItem(STORAGE_KEY_DATA);
  if (!raw) return;
  
  // Decrypt first to export clean JSON, or keep encrypted for backup
  // Requirement says "Export/Import via encrypted local files"
  // We will export the encrypted string in a JSON wrapper
  const backup = {
    version: 1,
    timestamp: new Date().toISOString(),
    payload: raw 
  };
  
  const blob = new Blob([JSON.stringify(backup)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `relationship_ledger_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

// --- Database Logic helpers ---

export const addTransaction = (
  state: AppState, 
  transactionData: Omit<Transaction, 'id' | 'createdAt'>
): AppState => {
  const newTx: Transaction = {
    ...transactionData,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };

  const newTransactions = [newTx, ...state.transactions];

  // Update or Create Person
  let person = state.people.find(p => p.id === newTx.personId);
  let newPeople = [...state.people];

  if (!person) {
    // Should generally be handled by UI passing an existing ID, 
    // but if we support "Quick Add New Person":
    person = {
      id: newTx.personId, // Assuming UI generated this or we found by name
      name: newTx.personName,
      tags: [],
      totalGiven: 0,
      totalReceived: 0,
      balance: 0,
      lastInteraction: newTx.date
    };
    newPeople.push(person);
  } else {
    // Update existing person logic
    person = { ...person, lastInteraction: newTx.date > person.lastInteraction ? newTx.date : person.lastInteraction };
    newPeople = newPeople.map(p => p.id === person!.id ? person! : p);
  }

  // Recalculate balances
  if (newTx.type === TransactionType.GIVE) {
    person.totalGiven += newTx.amount;
    person.balance += newTx.amount; // Giving increases your "social credit" or purely financial spending
  } else {
    person.totalReceived += newTx.amount;
    person.balance -= newTx.amount; // Receiving decreases credit (you owe them)
  }

  return {
    transactions: newTransactions,
    people: newPeople
  };
};

export const updateTransaction = (
  state: AppState,
  updatedTx: Transaction
): AppState => {
  const oldTx = state.transactions.find(t => t.id === updatedTx.id);
  if (!oldTx) return state;

  let newPeople = [...state.people];
  
  // 1. Revert Old Transaction Effect on Old Person
  const oldPersonIndex = newPeople.findIndex(p => p.id === oldTx.personId);
  if (oldPersonIndex !== -1) {
    const p = { ...newPeople[oldPersonIndex] };
    if (oldTx.type === TransactionType.GIVE) {
      p.totalGiven -= oldTx.amount;
      p.balance -= oldTx.amount;
    } else {
      p.totalReceived -= oldTx.amount;
      p.balance += oldTx.amount;
    }
    newPeople[oldPersonIndex] = p;
  }

  // 2. Apply New Transaction Effect on New Person
  // Check if person exists (it might be a new person name entered during edit, or same person)
  let newPersonIndex = newPeople.findIndex(p => p.id === updatedTx.personId);
  
  if (newPersonIndex === -1) {
    // Create new person if not exists
    const newPerson: Person = {
      id: updatedTx.personId,
      name: updatedTx.personName,
      tags: [],
      totalGiven: 0,
      totalReceived: 0,
      balance: 0,
      lastInteraction: updatedTx.date
    };
    newPeople.push(newPerson);
    newPersonIndex = newPeople.length - 1;
  }

  const p = { ...newPeople[newPersonIndex] };
  if (updatedTx.type === TransactionType.GIVE) {
    p.totalGiven += updatedTx.amount;
    p.balance += updatedTx.amount;
  } else {
    p.totalReceived += updatedTx.amount;
    p.balance -= updatedTx.amount;
  }
  
  // Update last interaction
  if (updatedTx.date > p.lastInteraction) {
      p.lastInteraction = updatedTx.date;
  }
  
  newPeople[newPersonIndex] = p;

  // 3. Update Transaction List
  const newTransactions = state.transactions.map(t => 
    t.id === updatedTx.id ? updatedTx : t
  );

  return {
    people: newPeople,
    transactions: newTransactions
  };
};