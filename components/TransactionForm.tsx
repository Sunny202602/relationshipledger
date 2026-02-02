import React, { useState, useEffect } from 'react';
import { TransactionType, Person, Occasion, Transaction } from '../types';
import { OCCASION_OPTIONS, TAG_OPTIONS } from '../constants';
import { Plus, X, Calendar, User, AlignLeft, DollarSign, Tag } from 'lucide-react';

interface TransactionFormProps {
  people: Person[];
  initialData?: Transaction | null;
  onSave: (data: any) => void;
  onClose: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ people, initialData, onSave, onClose }) => {
  const [type, setType] = useState<TransactionType>(TransactionType.GIVE);
  const [personName, setPersonName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [occasion, setOccasion] = useState(OCCASION_OPTIONS[0]);
  const [notes, setNotes] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  const [filteredPeople, setFilteredPeople] = useState<Person[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setPersonName(initialData.personName);
      setAmount(initialData.amount.toString());
      setDate(initialData.date);
      // Ensure occasion is valid, else set to Other or keep custom if we allowed custom
      setOccasion(initialData.occasion);
      setNotes(initialData.notes);
      setSelectedTags(initialData.tags || []);
    }
  }, [initialData]);

  useEffect(() => {
    if (personName) {
      const match = people.filter(p => p.name.toLowerCase().includes(personName.toLowerCase()));
      setFilteredPeople(match);
      // Only show suggestions if user is typing, not when setting initial data
      if (!initialData || personName !== initialData.personName) {
         setShowSuggestions(true);
      }
    } else {
      setShowSuggestions(false);
    }
  }, [personName, people, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!personName || !amount) return;

    // Find existing person ID or generate new one
    // If editing, and name hasn't changed, keep ID. 
    // If name changed, try to find new person or create new ID.
    const existingPerson = people.find(p => p.name === personName);
    
    let personId = Date.now().toString();
    
    if (existingPerson) {
        personId = existingPerson.id;
    } else if (initialData && initialData.personName === personName) {
        personId = initialData.personId;
    }

    onSave({
      id: initialData?.id,
      type,
      personId,
      personName,
      amount: parseFloat(amount),
      date,
      occasion,
      notes,
      tags: selectedTags,
      createdAt: initialData?.createdAt // Preserve creation date
    });
    onClose();
  };

  const selectPerson = (name: string) => {
    setPersonName(name);
    setShowSuggestions(false);
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] pb-safe-bottom sm:pb-0">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">
            {initialData ? '修改记录 (Edit Entry)' : '记一笔 (New Entry)'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-5 overflow-y-auto no-scrollbar">
          
          {/* Type Toggle */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setType(TransactionType.GIVE)}
              className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all duration-200 ${
                type === TransactionType.GIVE 
                  ? 'bg-white dark:bg-slate-700 text-give shadow-sm' 
                  : 'text-slate-400'
              }`}
            >
              送出去 (Give)
            </button>
            <button
              type="button"
              onClick={() => setType(TransactionType.RECEIVE)}
              className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all duration-200 ${
                type === TransactionType.RECEIVE 
                  ? 'bg-white dark:bg-slate-700 text-receive shadow-sm' 
                  : 'text-slate-400'
              }`}
            >
              收进来 (Receive)
            </button>
          </div>

          {/* Amount */}
          <div className="relative">
            <label className="text-xs text-slate-500 mb-1 block">金额 (Value)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 text-slate-400" size={20} />
              <input
                type="number"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 bg-transparent text-xl font-bold outline-none focus:ring-0 ${
                  type === TransactionType.GIVE 
                    ? 'border-red-100 focus:border-red-500 text-red-600' 
                    : 'border-emerald-100 focus:border-emerald-500 text-emerald-600'
                }`}
                required
              />
            </div>
          </div>

          {/* Person Auto-complete */}
          <div className="relative z-10">
            <label className="text-xs text-slate-500 mb-1 block">往来对象 (Person)</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-slate-400" size={20} />
              <input
                type="text"
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                placeholder="姓名 (Name)"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:border-blue-500 outline-none"
                required
              />
            </div>
            {showSuggestions && filteredPeople.length > 0 && (
              <ul className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl shadow-lg max-h-40 overflow-y-auto">
                {filteredPeople.map(p => (
                  <li 
                    key={p.id} 
                    onClick={() => selectPerson(p.name)}
                    className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer flex justify-between items-center"
                  >
                    <span>{p.name}</span>
                    {p.tags.length > 0 && <span className="text-xs text-slate-400">{p.tags[0]}</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Occasion & Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">事由 (Occasion)</label>
              <select
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                className="w-full px-3 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent outline-none appearance-none"
              >
                {OCCASION_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">日期 (Date)</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 text-slate-400" size={18} />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-10 pr-2 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent outline-none"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs text-slate-500 mb-1 block">标签 (Tags)</label>
            <div className="flex space-x-3 overflow-x-auto pb-1">
              {TAG_OPTIONS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-transparent text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
             <label className="text-xs text-slate-500 mb-1 block">备注 (Notes)</label>
             <div className="relative">
                <AlignLeft className="absolute left-3 top-3 text-slate-400" size={20} />
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="详情描述..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent outline-none resize-none"
                />
             </div>
          </div>

          <button
            type="submit"
            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transform active:scale-95 transition-all ${
              type === TransactionType.GIVE ? 'bg-give shadow-red-200' : 'bg-receive shadow-emerald-200'
            }`}
          >
            {initialData ? '保存修改 (Update)' : '保存 (Save)'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;