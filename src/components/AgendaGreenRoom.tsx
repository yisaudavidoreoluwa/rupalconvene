'use client';

import React from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  UserCheck, 
  ArrowRight, 
  Mic, 
  Video, 
  CheckCircle2, 
  Radio, 
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { AgendaItem, Participant } from '@/types/meeting';

interface AgendaGreenRoomProps {
  agenda: AgendaItem[];
  participants: Participant[];
  onAdmitToStage: (participantId: string) => void;
  onMoveToGreenRoom: (participantId: string) => void;
}

export const AgendaGreenRoom: React.FC<AgendaGreenRoomProps> = ({
  agenda,
  participants,
  onAdmitToStage,
  onMoveToGreenRoom,
}) => {
  const stageParticipants = participants.filter((p) => !p.inGreenRoom);
  const greenRoomParticipants = participants.filter((p) => p.inGreenRoom);

  const getTrackBadge = (track: AgendaItem['track']) => {
    switch (track) {
      case 'Engineering':
        return 'bg-violet-500/10 text-violet-400 border-violet-500/30';
      case 'Executive':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Joint':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="w-full h-full flex flex-col md:flex-row bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl select-none">
      {/* Left Column: Conference Agenda Tracks */}
      <div className="flex-1 flex flex-col border-b md:border-b-0 md:border-r border-slate-800">
        <div className="h-14 bg-slate-900 border-b border-slate-800 px-5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-violet-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              Conference Agenda & Timetable
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Track 1: Main Plenum
          </span>
        </div>

        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {agenda.map((item) => {
            const isCurrent = item.status === 'current';
            const isCompleted = item.status === 'completed';

            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-slate-900/90 border-violet-500/60 ring-1 ring-violet-500/30 shadow-lg shadow-violet-500/10'
                    : isCompleted
                    ? 'bg-slate-900/40 border-slate-800/80 opacity-70'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="flex items-center space-x-1 text-xs font-mono text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{item.time}</span>
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${getTrackBadge(item.track)}`}>
                      {item.track}
                    </span>
                  </div>

                  {isCurrent && (
                    <span className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase animate-pulse">
                      <Radio className="w-3 h-3" />
                      <span>Live Stage</span>
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-semibold text-white mb-1">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                  {item.description}
                </p>

                {/* Assigned Speakers */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                  <div className="flex items-center space-x-2">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-[11px] text-slate-400">
                      Speakers: {item.speakerIds.map((id) => participants.find((p) => p.id === id)?.name || id).join(', ')}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    {item.durationMinutes} min
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Backstage Green Room & Sound Check */}
      <div className="w-full md:w-80 lg:w-96 flex flex-col bg-slate-950">
        <div className="h-14 bg-slate-900 border-b border-slate-800 px-5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
            <h3 className="text-sm font-bold text-amber-300 tracking-wide">
              Backstage Green Room
            </h3>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            {greenRoomParticipants.length} Waiting
          </span>
        </div>

        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-400 leading-relaxed">
            The Green Room allows keynote speakers and investors to test microphone clarity, verify presentation slides, and coordinate with stage managers before being elevated to the main conference stream.
          </div>

          {/* Speakers currently in Green Room */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Staged Speakers
            </div>

            {greenRoomParticipants.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                No speakers currently in green room. All active participants are on the Main Stage.
              </div>
            ) : (
              greenRoomParticipants.map((p) => (
                <div
                  key={p.id}
                  className="p-3.5 rounded-xl bg-slate-900 border border-amber-500/30 shadow-md flex flex-col space-y-3"
                >
                  <div className="flex items-center space-x-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.avatar}
                      alt={p.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-400/40"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-white truncate">
                        {p.name}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {p.jobTitle} • {p.organization}
                      </div>
                    </div>
                  </div>

                  {/* Pre-flight Checks */}
                  <div className="grid grid-cols-2 gap-1.5 py-1 text-[10px] text-slate-300">
                    <div className="flex items-center space-x-1.5 text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Mic Calibrated</span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>1080p HD Video</span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Slides Ready</span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>NDA Signed</span>
                    </div>
                  </div>

                  {/* Admit to Stage Button */}
                  <button
                    onClick={() => onAdmitToStage(p.id)}
                    className="w-full flex items-center justify-center space-x-1.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs transition-all shadow-sm active:scale-98"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Admit to Main Stage</span>
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Speakers on Stage (Can be moved to Green Room) */}
          <div className="pt-2">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              On Stage ({stageParticipants.length})
            </div>
            <div className="space-y-2">
              {stageParticipants.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-xs"
                >
                  <div className="flex items-center space-x-2 truncate">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-slate-200 truncate">{p.name}</span>
                  </div>
                  {p.id !== 'user-self' && (
                    <button
                      onClick={() => onMoveToGreenRoom(p.id)}
                      className="px-2 py-0.5 rounded text-[10px] text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                    >
                      Move to Green Room
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
