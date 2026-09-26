import React from 'react';
import { Radio, Flame, Sparkles, TrendingUp } from 'lucide-react';
import { PlayByPlayAction } from '../types';
import { SeasonService } from '../services/seasonService';

interface LivePlayTickerProps {
  playHistory: PlayByPlayAction[];
  activeMemberId?: string;
}

export const LivePlayTicker: React.FC<LivePlayTickerProps> = ({ playHistory, activeMemberId }) => {
  const [isSeasonActive, setIsSeasonActive] = React.useState<boolean>(() => SeasonService.isSeasonActive());

  React.useEffect(() => {
    return SeasonService.onSeasonChange((info) => {
      setIsSeasonActive(info.isSeasonActive);
    });
  }, []);

  // Suppress scoring play ticker during offseason until season starts
  if (!isSeasonActive) {
    return null;
  }

  const latestPlay = playHistory?.[0];

  if (!latestPlay) {
    return null;
  }

  const isUserAffected = latestPlay.affectedGroupMembers.some((m) => m.memberId === activeMemberId);

  return (
    <div
      className={`border-b py-2.5 px-4 text-xs flex flex-wrap items-center justify-between gap-3 transition-all ${
        isUserAffected
          ? 'bg-orange-950/40 border-orange-500/50 text-orange-200'
          : 'bg-black border-white/10 text-white'
      }`}
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="bg-orange-500 text-black px-2 py-0.5 font-black italic -skew-x-12 text-[10px] uppercase flex-shrink-0">
          RECENT PLAY
        </div>

        <div className="flex items-center gap-2 font-mono truncate text-xs">
          <span className="font-bold text-orange-500 flex-shrink-0">[{latestPlay.playerTeam}]</span>
          <span className="text-white uppercase font-bold truncate tracking-tight">{latestPlay.description}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0 ml-auto font-mono">
        <div className="bg-white text-black px-2.5 py-0.5 font-black text-xs uppercase tracking-wider">
          {latestPlay.fantasyPointsDelta > 0 ? `+${latestPlay.fantasyPointsDelta}` : latestPlay.fantasyPointsDelta} FP
        </div>

        {latestPlay.affectedGroupMembers.length > 0 && (
          <div className="hidden md:flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-white/60">
            <span>TEAM:</span>
            {latestPlay.affectedGroupMembers.map((m) => (
              <span
                key={m.memberId}
                className={`font-black px-2 py-0.5 ${
                  m.memberId === activeMemberId
                    ? 'bg-orange-500 text-black'
                    : 'bg-white/10 text-white'
                }`}
              >
                {m.teamName}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
