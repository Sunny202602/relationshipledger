import React, { useState } from 'react';
import { Transaction, TransactionType } from '../types';
import { ArrowUpRight, ArrowDownLeft, Wallet, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { CURRENCY_SYMBOL } from '../constants';

interface DashboardProps {
  transactions: Transaction[];
  totalGiven: number;
  totalReceived: number;
  onEditTransaction: (tx: Transaction) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, totalGiven, totalReceived, onEditTransaction }) => {
  const [showAll, setShowAll] = useState(false);
  const displayTransactions = showAll ? transactions : transactions.slice(0, 5);
  const net = totalGiven - totalReceived; // Simplified logic: Given is "asset", Received is "liability" in terms of favors

  return (
    <div className="pb-32 pt-[calc(env(safe-area-inset-top)+3rem)] px-4 space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">概览 (Dashboard)</h1>
          <p className="text-slate-500 text-sm">Welcome back</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-2 rounded-full shadow-sm border border-slate-100 dark:border-slate-700">
           <Search size={20} className="text-slate-400" />
        </div>
      </div>

      {/* Main Stats Card */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 text-white shadow-xl shadow-slate-200 dark:shadow-none relative overflow-hidden">
        {/* Decorative circle */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
        
        <p className="text-slate-400 text-sm mb-1">净值 (Net Balance)</p>
        <div className="text-3xl font-bold mb-6 flex items-baseline">
          {CURRENCY_SYMBOL} {Math.abs(net).toLocaleString()}
          <span className={`ml-2 text-sm font-medium px-2 py-0.5 rounded-full ${net >= 0 ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
            {net >= 0 ? 'Surplus' : 'Deficit'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 rounded-2xl p-3 backdrop-blur-sm">
            <div className="flex items-center space-x-2 text-red-400 mb-1">
              <ArrowUpRight size={16} />
              <span className="text-xs font-medium">送出 (Given)</span>
            </div>
            <p className="text-lg font-bold">{CURRENCY_SYMBOL} {totalGiven.toLocaleString()}</p>
          </div>
          <div className="bg-white/10 rounded-2xl p-3 backdrop-blur-sm">
            <div className="flex items-center space-x-2 text-emerald-400 mb-1">
              <ArrowDownLeft size={16} />
              <span className="text-xs font-medium">收到 (Received)</span>
            </div>
            <p className="text-lg font-bold">{CURRENCY_SYMBOL} {totalReceived.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg text-slate-800 dark:text-white">
            {showAll ? '所有记录 (All)' : '最近动态 (Recent)'}
          </h3>
          <button 
            onClick={() => setShowAll(!showAll)}
            className="text-blue-500 text-sm font-medium flex items-center"
          >
            {showAll ? 'Show Less' : 'View All'}
          </button>
        </div>

        <div className="space-y-3">
          {displayTransactions.length === 0 ? (
            <div className="text-center py-10 text-slate-400 bg-white dark:bg-slate-800 rounded-2xl">
              <Wallet size={48} className="mx-auto mb-2 opacity-50" />
              <p>暂无记录 (No Data)</p>
            </div>
          ) : (
            displayTransactions.map(tx => (
              <div 
                key={tx.id} 
                onClick={() => onEditTransaction(tx)}
                className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex justify-between items-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    tx.type === TransactionType.GIVE ? 'bg-red-100 text-red-500' : 'bg-emerald-100 text-emerald-500'
                  }`}>
                    {tx.type === TransactionType.GIVE ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 dark:text-white">{tx.personName}</p>
                    <p className="text-xs text-slate-500">{tx.occasion} • {tx.date}</p>
                  </div>
                </div>
                <div className={`font-bold ${
                  tx.type === TransactionType.GIVE ? 'text-give' : 'text-receive'
                }`}>
                  {tx.type === TransactionType.GIVE ? '-' : '+'}{CURRENCY_SYMBOL}{tx.amount}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;