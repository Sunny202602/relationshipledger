import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType } from '../types';
import { ArrowUpRight, ArrowDownLeft, Wallet, Search, X } from 'lucide-react';
import { CURRENCY_SYMBOL } from '../constants';

interface DashboardProps {
  transactions: Transaction[];
  totalGiven: number;
  totalReceived: number;
  onEditTransaction: (tx: Transaction) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, totalGiven, totalReceived, onEditTransaction }) => {
  const [showAll, setShowAll] = useState(false);
  
  // --- 1. 新增：搜索状态定义 ---
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const net = totalGiven - totalReceived; // Simplified logic

  // --- 2. 修改：筛选逻辑，支持搜索过滤 ---
  const displayTransactions = useMemo(() => {
    // 如果有搜索词，优先进行搜索过滤（搜索全量数据）
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      return transactions.filter(tx => 
        tx.personName.toLowerCase().includes(lowerQuery) || 
        tx.occasion.toLowerCase().includes(lowerQuery) ||
        (tx.notes && tx.notes.toLowerCase().includes(lowerQuery))
      );
    }
    // 否则按原有逻辑：显示全部或前5条
    return showAll ? transactions : transactions.slice(0, 5);
  }, [transactions, showAll, searchQuery]);

  const handleClearSearch = () => {
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  return (
    <div className="pb-32 pt-[calc(env(safe-area-inset-top)+3rem)] px-4 space-y-6">
      
      {/* Header */}
      {/* --- 3. 修改：Header 区域支持搜索框切换 --- */}
      <div className="flex justify-between items-center h-14">
        {isSearchOpen ? (
          <div className="flex-1 flex items-center bg-white dark:bg-slate-800 rounded-full px-4 py-2 shadow-sm border border-slate-100 dark:border-slate-700 animate-in fade-in slide-in-from-right-10 duration-200">
            <Search size={18} className="text-slate-400 mr-2" />
            <input 
              autoFocus
              type="text" 
              placeholder="搜索姓名、事由..." 
              className="flex-1 bg-transparent outline-none text-slate-800 dark:text-white placeholder-slate-400 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button onClick={handleClearSearch} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
              <X size={18} className="text-slate-400" />
            </button>
          </div>
        ) : (
          <>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">概览 (Dashboard)</h1>
              <p className="text-slate-500 text-sm">Welcome back</p>
            </div>
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="bg-white dark:bg-slate-800 p-2 rounded-full shadow-sm border border-slate-100 dark:border-slate-700 active:scale-95 transition-transform"
            >
               <Search size={20} className="text-slate-400" />
            </button>
          </>
        )}
      </div>

      {/* Main Stats Card - Hide when searching to focus on results */}
      {!isSearchOpen && (
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
      )}

      {/* Recent Activity / Search Results */}
      <div>
        <div className="flex justify-between items-center mb-4">
          {/* --- 4. 修改：标题根据搜索状态变化 --- */}
          <h3 className="font-bold text-lg text-slate-800 dark:text-white">
            {searchQuery ? `搜索结果 (${displayTransactions.length})` : (showAll ? '所有记录 (All)' : '最近动态 (Recent)')}
          </h3>
          {/* Only show "Show All" toggle if NOT searching */}
          {!searchQuery && (
            <button 
              onClick={() => setShowAll(!showAll)}
              className="text-blue-500 text-sm font-medium flex items-center"
            >
              {showAll ? 'Show Less' : 'View All'}
            </button>
          )}
        </div>

        <div className="space-y-3">
          {displayTransactions.length === 0 ? (
            <div className="text-center py-10 text-slate-400 bg-white dark:bg-slate-800 rounded-2xl">
              <Wallet size={48} className="mx-auto mb-2 opacity-50" />
              <p>{searchQuery ? '没有找到相关记录' : '暂无记录 (No Data)'}</p>
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
                    <p className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                       {tx.personName}
                       {tx.tags && tx.tags.length > 0 && <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-500">{tx.tags[0]}</span>}
                    </p>
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