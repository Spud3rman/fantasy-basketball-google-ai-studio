import React, { useState } from 'react';
import { Camera, Link, Check, Sparkles } from 'lucide-react';

export const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
];

interface AvatarPickerProps {
  currentAvatar: string;
  onSelectAvatar: (url: string) => void;
}

export const AvatarPicker: React.FC<AvatarPickerProps> = ({ currentAvatar, onSelectAvatar }) => {
  const [customUrl, setCustomUrl] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUrl.trim()) {
      onSelectAvatar(customUrl.trim());
      setCustomUrl('');
    }
  };

  return (
    <div className="space-y-3 bg-black/80 border border-orange-500/40 p-3 rounded text-left">
      <div className="flex items-center justify-between">
        <label className="text-[10px] uppercase font-bold text-orange-500 tracking-wider flex items-center gap-1.5">
          <Camera className="w-3.5 h-3.5" /> Select Avatar Photo
        </label>
        <button
          type="button"
          onClick={() => setShowCustomInput(!showCustomInput)}
          className="text-[10px] text-white/60 hover:text-white uppercase font-mono underline flex items-center gap-1"
        >
          <Link className="w-3 h-3" /> {showCustomInput ? 'Preset Photos' : 'Custom Image URL'}
        </button>
      </div>

      {showCustomInput ? (
        <form onSubmit={handleApplyCustomUrl} className="flex gap-2">
          <input
            type="url"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            placeholder="Paste image URL (https://...)"
            className="bg-white/10 border border-white/20 text-white px-2 py-1 text-xs font-mono rounded flex-1 focus:outline-none focus:border-orange-500"
          />
          <button
            type="submit"
            className="bg-orange-500 hover:bg-orange-400 text-black px-3 py-1 text-xs font-bold uppercase rounded"
          >
            Apply
          </button>
        </form>
      ) : (
        <div className="grid grid-cols-6 gap-2">
          {DEFAULT_AVATARS.map((url, i) => {
            const isSelected = currentAvatar === url;
            return (
              <button
                key={i}
                type="button"
                onClick={() => onSelectAvatar(url)}
                className={`relative rounded overflow-hidden border-2 transition-all aspect-square ${
                  isSelected ? 'border-orange-500 scale-105 shadow-lg shadow-orange-500/20' : 'border-white/20 hover:border-white/50 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={url} alt={`Avatar ${i + 1}`} className="w-full h-full object-cover" />
                {isSelected && (
                  <div className="absolute inset-0 bg-orange-500/30 flex items-center justify-center">
                    <Check className="w-4 h-4 text-white drop-shadow-md" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
