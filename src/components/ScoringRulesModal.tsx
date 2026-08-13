import React from 'react';
import { X, Settings, Check } from 'lucide-react';
import { ScoringRules } from '../types';

interface ScoringRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  rules: ScoringRules;
  onSave: (newRules: ScoringRules) => void;
}

export const ScoringRulesModal: React.FC<ScoringRulesModalProps> = ({
  isOpen,
  onClose,
  rules,
  onSave,
}) => {
  const [form, setForm] = React.useState<ScoringRules>({ ...rules });

  React.useEffect(() => {
    setForm({ ...rules });
  }, [rules, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-black border border-white/10 max-w-lg w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <h3 className="font-display font-black text-xl uppercase tracking-tight text-white">
            Custom Scoring Rules
          </h3>
          <button onClick={onClose} className="text-white/50 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/50 mb-1 uppercase font-bold">Points (PTS)</label>
              <input
                type="number"
                step="0.1"
                value={form.pts}
                onChange={(e) => setForm({ ...form, pts: parseFloat(e.target.value) || 0 })}
                className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-orange-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-white/50 mb-1 uppercase font-bold">Rebounds (REB)</label>
              <input
                type="number"
                step="0.1"
                value={form.reb}
                onChange={(e) => setForm({ ...form, reb: parseFloat(e.target.value) || 0 })}
                className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-orange-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-white/50 mb-1 uppercase font-bold">Assists (AST)</label>
              <input
                type="number"
                step="0.1"
                value={form.ast}
                onChange={(e) => setForm({ ...form, ast: parseFloat(e.target.value) || 0 })}
                className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-orange-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-white/50 mb-1 uppercase font-bold">Steals (STL)</label>
              <input
                type="number"
                step="0.1"
                value={form.stl}
                onChange={(e) => setForm({ ...form, stl: parseFloat(e.target.value) || 0 })}
                className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-orange-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-white/50 mb-1 uppercase font-bold">Blocks (BLK)</label>
              <input
                type="number"
                step="0.1"
                value={form.blk}
                onChange={(e) => setForm({ ...form, blk: parseFloat(e.target.value) || 0 })}
                className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-orange-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-white/50 mb-1 uppercase font-bold">3-Pointers Made (3PM)</label>
              <input
                type="number"
                step="0.1"
                value={form.fg3m}
                onChange={(e) => setForm({ ...form, fg3m: parseFloat(e.target.value) || 0 })}
                className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-orange-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-white/50 mb-1 uppercase font-bold">Turnovers (TO)</label>
              <input
                type="number"
                step="0.1"
                value={form.to}
                onChange={(e) => setForm({ ...form, to: parseFloat(e.target.value) || 0 })}
                className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-orange-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-white/50 mb-1 uppercase font-bold">Double-Double Bonus</label>
              <input
                type="number"
                step="0.1"
                value={form.doubleDoubleBonus}
                onChange={(e) => setForm({ ...form, doubleDoubleBonus: parseFloat(e.target.value) || 0 })}
                className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-orange-500 font-bold"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 font-sans">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-display font-black text-xs uppercase tracking-wider transition-all -skew-x-6"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-orange-500 hover:bg-orange-400 text-black font-display font-black text-xs uppercase tracking-wider transition-all -skew-x-6"
            >
              Save System
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
