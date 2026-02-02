import React from 'react';
import { Person } from '../types';
import { User, ChevronRight } from 'lucide-react';
import { CURRENCY_SYMBOL } from '../constants';

interface PeopleDirectoryProps {
  people: Person[];
}

const PeopleDirectory: React.FC<PeopleDirectoryProps> = ({ people }) => {
  // Sort: Those with activity first
  const sortedPeople = [...people].sort((a, b) => {
    const totalA = a.totalGiven + a.totalReceived;
    const totalB = b.totalGiven + b.totalReceived;
    return totalB - totalA;
  });

  return (
    <div className="pb-32 pt-[calc(env(safe-area-inset-top)+3rem)] px-4">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">人脉 (Directory)</h1>
      
      <div className="space-y-3">
        {sortedPeople.length === 0 ? (
           <div className="text-center py-20 text-slate-400">
             <User size={48} className="mx-auto mb-2 opacity-50" />
             <p>添加第一笔交易以建立通讯录</p>
           </div>
        ) : (
          sortedPeople.map(person => (
            <div key={person.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm flex items-center justify-between group active:scale-[0.98] transition-transform">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 font-bold text-lg">
                  {person.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white">{person.name}</h3>
                  <p className="text-xs text-slate-500">
                    Interact: {person.lastInteraction.split('T')[0]}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                    <p className={`font-bold text-sm ${person.balance >= 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                        {person.balance >= 0 ? '送出多' : '收到多'}
                    </p>
                    <p className="text-xs text-slate-400">
                        Net: {CURRENCY_SYMBOL}{Math.abs(person.balance)}
                    </p>
                </div>
                <ChevronRight size={18} className="text-slate-300" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PeopleDirectory;