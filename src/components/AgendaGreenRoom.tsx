'use client';

import React from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  UserCheck, 
  CheckCircle2, 
  Radio 
} from 'lucide-react';
import { AgendaItem, Participant } from '@/types/meeting';

interface AgendaGreenRoomProps {
  agenda: AgendaItem[];
  participants: Participant[];
  onAdmitToStage: (participantId: string) => void;
  onMoveToGreenRoom: (participantId: string) => void;
  currentUserId?: string;
}

export const AgendaGreenRoom: React.FC<AgendaGreenRoomProps> = ({
  agenda,
  participants,
  onAdmitToStage,
  onMoveToGreenRoom,
  currentUserId,
}) => {
  const stageParticipants = participants.filter((p) => !p.inGreenRoom);
  const greenRoomParticipants = participants.filter((p) => p.inGreenRoom);

  const getTrackBadge = (track: AgendaItem['track']) => {
    switch (track) {
      case 'Engineering':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Executive':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Joint':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="w-full h-full flex flex-col md:flex-row bg-white rounded-3xl overflow-hidden shadow-[0_4px_25px_-5px_rgba(0,0,0,0.05)] select-none">
      {/* Left Column: Conference Agenda Tracks (White & Navy) */}
      <div className="flex-1 flex flex-col shadow-[inset_-1px_0_0_rgba(0,0,0,0.03)]">
        <div className="h-14 bg-white px-5 flex items-center justify-between shadow-[0_2px_10px_-3px_rgba(0,0,0,0.03)]">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-blue-700" />
            <h3 className="text-sm font-extrabold text-[#0f172a] tracking-wide">
              Conference Agenda & Timetable
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono font-semibold">
            Track 1: Main Plenum
          </span>
        </div>

        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/50">
          {agenda.map((item) => {
            const isCurrent = item.status === 'current';
            const isCompleted = item.status === 'completed';

            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-white border-[#0f172a] ring-2 ring-[#0f172a]/10 shadow-md'
                    : isCompleted
                    ? 'bg-slate-50 border-slate-200 opacity-60'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="flex items-center space-x-1 text-xs font-mono text-slate-600 font-bold">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      <span>{item.time}</span>
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getTrackBadge(item.track)}`}>
                      {item.track}
                    </span>
                  </div>

                  {isCurrent && (
                    <span className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300 text-[10px] font-bold uppercase animate-pulse">
                      <Radio className="w-3 h-3" />
                      <span>Live Stage</span>
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-[#0f172a] mb-1">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-600 mb-3 leading-relaxed font-normal">
                  {item.description}
                </p>

                {/* Assigned Speakers */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="flex items-center space-x-2">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[11px] text-slate-600 font-semibold">
                      Speakers: {item.speakerIds.map((id) => participants.find((p) => p.id === id)?.name || id).join(', ')}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 font-bold">
                    {item.durationMinutes} min
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Backstage Green Room & Sound Check */}
      <div className="w-full md:w-80 lg:w-96 flex flex-col bg-white">
        <div className="h-14 bg-white border-b border-slate-200 px-5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
            <h3 className="text-sm font-bold text-amber-800 tracking-wide">
              Backstage Green Room
            </h3>
          </div>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300">
            {greenRoomParticipants.length} Waiting
          </span>
        </div>

        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/50">
          <div className="p-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-600 leading-relaxed shadow-sm font-normal">
            The Green Room allows keynote speakers and investors to test microphone clarity, verify presentation slides, and coordinate with stage managers before being elevated to the main conference stream.
          </div>

          {/* Speakers currently in Green Room */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-[#0f172a] uppercase tracking-wider">
              Staged Speakers
            </div>

            {greenRoomParticipants.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-xl bg-white">
                No speakers currently in green room. All active participants are on the Main Stage.
              </div>
            ) : (
              greenRoomParticipants.map((p) => (
                <div
                  key={p.id}
                  className="p-3.5 rounded-xl bg-white border border-amber-300 shadow-sm flex flex-col space-y-3"
                >
                  <div className="flex items-center space-x-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.avatar}
                      alt={p.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-300"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-[#0f172a] truncate">
                        {p.name}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate font-medium">
                        {p.jobTitle} • {p.organization}
                      </div>
                    </div>
                  </div>

                  {/* Pre-flight Checks */}
                  <div className="grid grid-cols-2 gap-1.5 py-1 text-[10px] text-slate-700 font-semibold">
                    <div className="flex items-center space-x-1.5 text-emerald-600">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Mic Calibrated</span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-emerald-600">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>1080p HD Video</span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-emerald-600">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Slides Ready</span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-emerald-600">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>NDA Signed</span>
                    </div>
                  </div>

                  {/* Admit to Stage Button (Navy Blue) */}
                  <button
                    onClick={() => onAdmitToStage(p.id)}
                    className="w-full flex items-center justify-center space-x-1.5 py-2 rounded-lg bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-xs transition-all shadow-sm active:scale-98"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Admit to Main Stage</span>
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Speakers on Stage */}
          <div className="pt-2">
            <div className="text-xs font-bold text-[#0f172a] uppercase tracking-wider mb-2">
              On Stage ({stageParticipants.length})
            </div>
            <div className="space-y-2">
              {stageParticipants.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 text-xs shadow-sm"
                >
                  <div className="flex items-center space-x-2 truncate">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-slate-800 font-bold truncate">{p.name}</span>
                  </div>
                  {p.id !== 'user-self' && p.id !== currentUserId && (
                    <button
                      onClick={() => onMoveToGreenRoom(p.id)}
                      className="px-2 py-0.5 rounded text-[10px] font-bold text-slate-500 hover:text-amber-700 hover:bg-slate-100 transition-colors"
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
