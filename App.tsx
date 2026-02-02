import React, { useState, useEffect } from 'react';
import { AppState, Person, Transaction } from './types';
import { loadData, saveData, addTransaction, updateTransaction, exportData } from './services/storageService';
import { Home, Plus, Users, PieChart, Settings, Download } from 'lucide-react';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import Analytics from './components/Analytics';
import PeopleDirectory from './components/PeopleDirectory';

enum Tab {
  DASHBOARD = 'DASHBOARD',
  PEOPLE = 'PEOPLE',
  ANALYTICS = 'ANALYTICS',
  SETTINGS = 'SETTINGS'
}

function App() {
  const [state, setState] = useState<AppState>({ people: [], transactions: [] });
  const [activeTab, setActiveTab] = useState<Tab>(Tab.DASHBOARD);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    const data = loadData();
    setState(data);
  }, []);

  const handleSaveTransaction = (data: any) => {
    let newState;
    if (data.id) {
       // It's an update
       newState = updateTransaction(state, data);
    } else {
       // It's a new transaction
       newState = addTransaction(state, data);
    }
    setState(newState);
    saveData(newState);
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setShowAddForm(true);
  };

  const closeForm = () => {
    setShowAddForm(false);
    setEditingTransaction(null);
  }

  const calculateTotals = () => {
    const given = state.transactions
      .filter(t => t.type === 'GIVE')
      .reduce((sum, t) => sum + t.amount, 0);
    const received = state.transactions
      .filter(t => t.type === 'RECEIVE')
      .reduce((sum, t) => sum + t.amount, 0);
    return { given, received };
  };

  const { given, received } = calculateTotals();

  // Settings Component Inline for simplicity
  const SettingsTab = () => (
    <div className="pb-32 pt-[calc(env(safe-area-inset-top)+3rem)] px-4 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">设置 (Settings)</h1>
      
      <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <button 
          onClick={exportData}
          className="w-full flex items-center space-x-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-700 text-left border-b dark:border-slate-700"
        >
          <div className="bg-blue-100 text-blue-500 p-2 rounded-lg">
            <Download size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white">导出备份 (Export Backup)</h3>
            <p className="text-xs text-slate-500">Save encrypted data to file</p>
          </div>
        </button>
        <div className="p-4 text-xs text-slate-400 bg-slate-50 dark:bg-slate-900">
          <p className="mb-2">隐私声明 (Privacy):</p>
          <p>All data is stored locally on this device. No data is sent to any server. Use the Export function to back up your data.</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">
      
      {/* Content Area */}
      <main className="w-full min-h-full bg-background relative sm:max-w-md sm:mx-auto sm:shadow-2xl">
        {activeTab === Tab.DASHBOARD && (
          <Dashboard 
            transactions={state.transactions} 
            totalGiven={given}
            totalReceived={received}
            onEditTransaction={handleEditTransaction}
          />
        )}
        {activeTab === Tab.PEOPLE && <PeopleDirectory people={state.people} />}
        {activeTab === Tab.ANALYTICS && <Analytics state={state} />}
        {activeTab === Tab.SETTINGS && <SettingsTab />}

        {/* Floating Action Button - Fixed Positioning */}
        <div className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-6 z-30 sm:absolute">
          <button
            onClick={() => {
              setEditingTransaction(null);
              setShowAddForm(true);
            }}
            className="bg-slate-900 dark:bg-blue-600 text-white p-4 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all"
          >
            <Plus size={28} />
          </button>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 w-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border-t dark:border-slate-700 pb-safe-bottom pt-2 px-6 flex justify-between items-center z-40 sm:absolute sm:max-w-md">
          <button 
            onClick={() => setActiveTab(Tab.DASHBOARD)}
            className={`flex flex-col items-center p-2 space-y-1 ${activeTab === Tab.DASHBOARD ? 'text-primary' : 'text-slate-400'}`}
          >
            <Home size={24} strokeWidth={activeTab === Tab.DASHBOARD ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Home</span>
          </button>
          
          <button 
            onClick={() => setActiveTab(Tab.PEOPLE)}
            className={`flex flex-col items-center p-2 space-y-1 ${activeTab === Tab.PEOPLE ? 'text-primary' : 'text-slate-400'}`}
          >
            <Users size={24} strokeWidth={activeTab === Tab.PEOPLE ? 2.5 : 2} />
            <span className="text-[10px] font-medium">People</span>
          </button>

          <button 
            onClick={() => setActiveTab(Tab.ANALYTICS)}
            className={`flex flex-col items-center p-2 space-y-1 ${activeTab === Tab.ANALYTICS ? 'text-primary' : 'text-slate-400'}`}
          >
            <PieChart size={24} strokeWidth={activeTab === Tab.ANALYTICS ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Stats</span>
          </button>

          <button 
            onClick={() => setActiveTab(Tab.SETTINGS)}
            className={`flex flex-col items-center p-2 space-y-1 ${activeTab === Tab.SETTINGS ? 'text-primary' : 'text-slate-400'}`}
          >
            <Settings size={24} strokeWidth={activeTab === Tab.SETTINGS ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Settings</span>
          </button>
        </div>
      </main>

      {/* Modals */}
      {showAddForm && (
        <TransactionForm 
          people={state.people}
          initialData={editingTransaction}
          onSave={handleSaveTransaction} 
          onClose={closeForm} 
        />
      )}

    </div>
  );
}

export default App;