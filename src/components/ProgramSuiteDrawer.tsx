'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Zap, 
  Wrench, 
  Users, 
  Radio, 
  GraduationCap, 
  Building2, 
  Play, 
  Pause, 
  RotateCcw, 
  Copy, 
  Check, 
  ExternalLink, 
  Send, 
  ThumbsUp, 
  Sparkles, 
  Clock, 
  Download, 
  ShieldCheck, 
  UserCheck, 
  CheckCircle2, 
  FileText, 
  HelpCircle,
  BarChart2,
  Award,
  Layers,
  ArrowRight
} from 'lucide-react';
import { 
  ProgramCategory, 
  PROGRAM_CATEGORIES_META, 
  ConveneProgram,
  HackathonSquad,
  HackathonProject,
  WorkshopLabStep,
  MentorHelpRequest,
  MeetupSpeaker,
  BroadcastPoll,
  BootcampAttendance,
  BootcampModule,
  BootcampCertificate
} from '@/types/program';
import { 
  DEFAULT_HACKATHON_SQUADS, 
  DEFAULT_HACKATHON_PROJECTS,
  DEFAULT_WORKSHOP_STEPS,
  DEFAULT_MEETUP_SPEAKERS,
  DEFAULT_BROADCAST_POLLS,
  DEFAULT_BOOTCAMP_MODULES,
  DEFAULT_BOOTCAMP_ATTENDANCE
} from '@/lib/program-defaults';
import { Participant } from '@/types/meeting';

interface ProgramSuiteDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeCategory: ProgramCategory;
  onChangeCategory?: (cat: ProgramCategory) => void;
  program?: ConveneProgram | null;
  currentUser: Participant;
  isHost?: boolean;
  onPasteCodeToIDE?: (code: string, fileName?: string) => void;
  onSendReaction?: (emoji: string) => void;
  onLoadTopologyToWhiteboard?: (topologyName: string) => void;
}

export const ProgramSuiteDrawer: React.FC<ProgramSuiteDrawerProps> = ({
  isOpen,
  onClose,
  activeCategory,
  onChangeCategory,
  program,
  currentUser,
  isHost = false,
  onPasteCodeToIDE,
  onSendReaction,
  onLoadTopologyToWhiteboard,
}) => {
  const meta = PROGRAM_CATEGORIES_META[activeCategory] || PROGRAM_CATEGORIES_META['hackathon'];

  // Current active sub-tab inside the program suite
  const [activeSubTab, setActiveSubTab] = useState<string>('overview');

  // Reset tab on category change
  useEffect(() => {
    setActiveSubTab('overview');
  }, [activeCategory]);

  // -------------------------------------------------------------
  // 1. HACKATHON STATE
  // -------------------------------------------------------------
  const [squads, setSquads] = useState<HackathonSquad[]>(DEFAULT_HACKATHON_SQUADS);
  const [projects, setProjects] = useState<HackathonProject[]>(DEFAULT_HACKATHON_PROJECTS);
  const [hackathonSeconds, setHackathonSeconds] = useState(24 * 3600 - 320);
  const [isHackathonTimerRunning, setIsHackathonTimerRunning] = useState(true);
  
  // Submit project form state
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectSquad, setNewProjectSquad] = useState('Squad Alpha (AI Agents)');
  const [newProjectTagline, setNewProjectTagline] = useState('');
  const [newProjectGithub, setNewProjectGithub] = useState('');
  const [newProjectDemo, setNewProjectDemo] = useState('');
  const [newProjectTags, setNewProjectTags] = useState('Next.js, WebRTC, Gemini');
  const [isSubmittingProject, setIsSubmittingProject] = useState(false);
  const [projectSubmitSuccess, setProjectSubmitSuccess] = useState(false);

  // -------------------------------------------------------------
  // 2. WORKSHOP STATE
  // -------------------------------------------------------------
  const [workshopSteps, setWorkshopSteps] = useState<WorkshopLabStep[]>(DEFAULT_WORKSHOP_STEPS);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [copiedStepId, setCopiedStepId] = useState<string | null>(null);
  const [helpRequests, setHelpRequests] = useState<MentorHelpRequest[]>([
    {
      id: 'req-1',
      studentName: 'Alex Rivera',
      studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&h=128&q=80',
      stepNumber: 2,
      question: 'Audio analyser is clipping on 128-byte frequency buffers. Can you check my fftSize config?',
      requestedAt: '3m ago',
      status: 'waiting',
    }
  ]);
  const [newHelpQuestion, setNewHelpQuestion] = useState('');
  const [checkpointPushed, setCheckpointPushed] = useState(false);

  // -------------------------------------------------------------
  // 3. MEETUP STATE
  // -------------------------------------------------------------
  const [meetupSpeakers, setMeetupSpeakers] = useState<MeetupSpeaker[]>(DEFAULT_MEETUP_SPEAKERS);
  const [lightningSeconds, setLightningSeconds] = useState(300); // 5 min
  const [isLightningRunning, setIsLightningRunning] = useState(false);
  const [questions, setQuestions] = useState<{ id: string; user: string; text: string; upvotes: number; isAnswered: boolean }[]>([
    { id: 'q-1', user: 'Liam O\'Connor', text: 'How do you handle ICE reconnection latency on mobile network handover?', upvotes: 14, isAnswered: true },
    { id: 'q-2', user: 'Maya Lindqvist', text: 'Can active speaker auto-framing run client-side with WebAssembly?', upvotes: 21, isAnswered: false },
    { id: 'q-3', user: 'Kenji Sato', text: 'What is the memory footprint of 30 peer connections on low-end laptops?', upvotes: 18, isAnswered: false },
  ]);
  const [newQuestionText, setNewQuestionText] = useState('');

  // -------------------------------------------------------------
  // 4. BROADCAST STATE
  // -------------------------------------------------------------
  const [polls, setPolls] = useState<BroadcastPoll[]>(DEFAULT_BROADCAST_POLLS);
  const [newPollQuestion, setNewPollQuestion] = useState('');
  const [newPollOption1, setNewPollOption1] = useState('');
  const [newPollOption2, setNewPollOption2] = useState('');
  const [newPollOption3, setNewPollOption3] = useState('');
  const [viewerCount] = useState(342);

  // -------------------------------------------------------------
  // 5. BOOTCAMP STATE
  // -------------------------------------------------------------
  const [attendance, setAttendance] = useState<BootcampAttendance[]>(DEFAULT_BOOTCAMP_ATTENDANCE);
  const [modules, setModules] = useState<BootcampModule[]>(DEFAULT_BOOTCAMP_MODULES);
  const [certificateStudentName, setCertificateStudentName] = useState(currentUser.name);
  const [generatedCertificate, setGeneratedCertificate] = useState<BootcampCertificate | null>(null);

  // -------------------------------------------------------------
  // 6. ARCHITECTURE DEMO STATE
  // -------------------------------------------------------------
  const [selectedTopology, setSelectedTopology] = useState('microservices');
  const [loadedTopologyMsg, setLoadedTopologyMsg] = useState<string | null>(null);

  // Lightning timer tick
  useEffect(() => {
    if (!isLightningRunning) return;
    const interval = setInterval(() => {
      setLightningSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isLightningRunning]);

  if (!isOpen) return null;

  // Format MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  // Format HH:MM:SS
  const formatHours = (secs: number) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const rem = secs % 60;
    return `${hrs}h ${mins.toString().padStart(2, '0')}m ${rem.toString().padStart(2, '0')}s`;
  };

  // -------------------------------------------------------------
  // ACTION HANDLERS
  // -------------------------------------------------------------
  const handleCopyCodeToIDE = (step: WorkshopLabStep) => {
    navigator.clipboard.writeText(step.codeSnippet);
    setCopiedStepId(step.id);
    if (onPasteCodeToIDE) {
      onPasteCodeToIDE(step.codeSnippet, step.targetFile);
    }
    setTimeout(() => setCopiedStepId(null), 2500);
  };

  const handleToggleStepCompleted = (stepId: string) => {
    setWorkshopSteps((prev) =>
      prev.map((s) => (s.id === stepId ? { ...s, isCompleted: !s.isCompleted } : s))
    );
  };

  const handlePushCheckpoint = () => {
    setCheckpointPushed(true);
    setTimeout(() => setCheckpointPushed(false), 3000);
  };

  const handleRequestHelp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHelpQuestion.trim()) return;
    const req: MentorHelpRequest = {
      id: `req-${Date.now()}`,
      studentName: currentUser.name,
      studentAvatar: currentUser.avatar,
      stepNumber: activeStepIndex + 1,
      question: newHelpQuestion.trim(),
      requestedAt: 'Just now',
      status: 'waiting',
    };
    setHelpRequests((prev) => [req, ...prev]);
    setNewHelpQuestion('');
  };

  const handleSubmitHackathonProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectTitle.trim()) return;
    setIsSubmittingProject(true);
    setTimeout(() => {
      const proj: HackathonProject = {
        id: `proj-${Date.now()}`,
        squadName: newProjectSquad,
        projectTitle: newProjectTitle.trim(),
        tagline: newProjectTagline.trim() || 'Built with Rupal Convene Suite',
        githubUrl: newProjectGithub.trim() || 'https://github.com/developer/project',
        demoUrl: newProjectDemo.trim() || 'https://my-demo.vercel.app',
        techStack: newProjectTags.split(',').map((t) => t.trim()),
        submittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        scores: {
          innovation: 9.0,
          technical: 9.2,
          uiux: 8.8,
          impact: 9.0,
        },
        totalScore: 9.0,
      };
      setProjects((prev) => [proj, ...prev]);
      setIsSubmittingProject(false);
      setProjectSubmitSuccess(true);
      setTimeout(() => setProjectSubmitSuccess(false), 3500);
      setNewProjectTitle('');
      setNewProjectTagline('');
    }, 600);
  };

  const handleVotePoll = (pollId: string, optionId: string) => {
    setPolls((prev) =>
      prev.map((poll) => {
        if (poll.id !== pollId) return poll;
        if (poll.userVotedOptionId) return poll; // Already voted
        return {
          ...poll,
          totalVotes: poll.totalVotes + 1,
          userVotedOptionId: optionId,
          options: poll.options.map((opt) =>
            opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
          ),
        };
      })
    );
  };

  const handleCreatePoll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPollQuestion.trim() || !newPollOption1.trim() || !newPollOption2.trim()) return;
    const newPoll: BroadcastPoll = {
      id: `poll-${Date.now()}`,
      question: newPollQuestion.trim(),
      options: [
        { id: `opt-1-${Date.now()}`, text: newPollOption1.trim(), votes: 0 },
        { id: `opt-2-${Date.now()}`, text: newPollOption2.trim(), votes: 0 },
        ...(newPollOption3.trim() ? [{ id: `opt-3-${Date.now()}`, text: newPollOption3.trim(), votes: 0 }] : []),
      ],
      totalVotes: 0,
      isActive: true,
    };
    setPolls((prev) => [newPoll, ...prev]);
    setNewPollQuestion('');
    setNewPollOption1('');
    setNewPollOption2('');
    setNewPollOption3('');
  };

  const handleToggleAttendance = (studentId: string) => {
    setAttendance((prev) =>
      prev.map((s) =>
        s.studentId === studentId
          ? {
              ...s,
              isCheckedIn: !s.isCheckedIn,
              checkInTime: !s.isCheckedIn
                ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : undefined,
            }
          : s
      )
    );
  };

  const handleExportAttendanceCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Student Name,Email,Checked In,Check In Time']
        .concat(
          attendance.map(
            (s) => `"${s.studentName}","${s.email}","${s.isCheckedIn ? 'YES' : 'NO'}","${s.checkInTime || '-'}"`
          )
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bootcamp-attendance-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGenerateCertificate = () => {
    const cert: BootcampCertificate = {
      certificateId: `RUPAL-CERT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      studentName: certificateStudentName.trim() || currentUser.name,
      courseName: 'Advanced Distributed Systems & High-Concurrency Cloud Engineering',
      issueDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      instructorName: 'Dr. Aisha Patel & Rupal Engineering Council',
      verificationHash: `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`,
    };
    setGeneratedCertificate(cert);
  };

  const handleLoadTopology = (topoKey: string) => {
    setSelectedTopology(topoKey);
    if (onLoadTopologyToWhiteboard) {
      onLoadTopologyToWhiteboard(topoKey);
    }
    setLoadedTopologyMsg(`Topology '${topoKey}' successfully loaded onto Architecture Whiteboard.`);
    setTimeout(() => setLoadedTopologyMsg(null), 3500);
  };

  const checkedInCount = attendance.filter((a) => a.isCheckedIn).length;
  const attendanceRate = Math.round((checkedInCount / attendance.length) * 100);

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] md:w-[500px] bg-white shadow-2xl border-l border-slate-200 flex flex-col font-sans select-none animate-in slide-in-from-right duration-200">
      {/* 1. DRAWER HEADER */}
      <div className="h-16 px-5 border-b border-slate-100 flex items-center justify-between bg-white flex-shrink-0">
        <div className="flex items-center space-x-2.5">
          <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
            {meta.id === 'hackathon' && <Zap className="w-5 h-5 fill-amber-500 text-amber-500" />}
            {meta.id === 'workshop' && <Wrench className="w-5 h-5 text-purple-600" />}
            {meta.id === 'meetup' && <Users className="w-5 h-5 text-emerald-600" />}
            {meta.id === 'broadcast' && <Radio className="w-5 h-5 text-sky-600" />}
            {meta.id === 'bootcamp' && <GraduationCap className="w-5 h-5 text-pink-600" />}
            {meta.id === 'architecture-demo' && <Building2 className="w-5 h-5 text-blue-600" />}
          </span>
          <div>
            <h2 className="text-base font-extrabold text-[#0f172a] leading-tight">
              {meta.title} Suite
            </h2>
            <p className="text-[11px] text-slate-500 font-medium truncate max-w-[260px]">
              {meta.subtitle}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-xl text-slate-400 hover:text-[#0f172a] hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 2. PROGRAM SUB-NAV TABS */}
      <div className="px-5 pt-3 bg-slate-50/60 border-b border-slate-100 flex items-center space-x-2 overflow-x-auto scrollbar-none flex-shrink-0 text-xs font-semibold">
        {activeCategory === 'hackathon' && (
          <>
            <button
              onClick={() => setActiveSubTab('overview')}
              className={`pb-2.5 px-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeSubTab === 'overview' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Sprint Clock
            </button>
            <button
              onClick={() => setActiveSubTab('squads')}
              className={`pb-2.5 px-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeSubTab === 'squads' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Squads ({squads.length})
            </button>
            <button
              onClick={() => setActiveSubTab('submit')}
              className={`pb-2.5 px-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeSubTab === 'submit' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Submit Project
            </button>
            <button
              onClick={() => setActiveSubTab('leaderboard')}
              className={`pb-2.5 px-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeSubTab === 'leaderboard' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Leaderboard ({projects.length})
            </button>
          </>
        )}

        {activeCategory === 'workshop' && (
          <>
            <button
              onClick={() => setActiveSubTab('overview')}
              className={`pb-2.5 px-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeSubTab === 'overview' ? 'border-purple-600 text-purple-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Code Lab Steps ({workshopSteps.length})
            </button>
            <button
              onClick={() => setActiveSubTab('mentor')}
              className={`pb-2.5 px-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeSubTab === 'mentor' ? 'border-purple-600 text-purple-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              TA Help Queue ({helpRequests.length})
            </button>
            <button
              onClick={() => setActiveSubTab('instructor')}
              className={`pb-2.5 px-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeSubTab === 'instructor' ? 'border-purple-600 text-purple-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Instructor Push
            </button>
          </>
        )}

        {activeCategory === 'meetup' && (
          <>
            <button
              onClick={() => setActiveSubTab('overview')}
              className={`pb-2.5 px-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeSubTab === 'overview' ? 'border-emerald-600 text-emerald-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Lightning Timer
            </button>
            <button
              onClick={() => setActiveSubTab('speakers')}
              className={`pb-2.5 px-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeSubTab === 'speakers' ? 'border-emerald-600 text-emerald-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Speaker Lineup
            </button>
            <button
              onClick={() => setActiveSubTab('qa')}
              className={`pb-2.5 px-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeSubTab === 'qa' ? 'border-emerald-600 text-emerald-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Upvoted Q&A
            </button>
            <button
              onClick={() => setActiveSubTab('soundboard')}
              className={`pb-2.5 px-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeSubTab === 'soundboard' ? 'border-emerald-600 text-emerald-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Soundboard 👏
            </button>
          </>
        )}

        {activeCategory === 'broadcast' && (
          <>
            <button
              onClick={() => setActiveSubTab('overview')}
              className={`pb-2.5 px-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeSubTab === 'overview' ? 'border-amber-600 text-amber-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Live Polls ({polls.length})
            </button>
            <button
              onClick={() => setActiveSubTab('stage-mgmt')}
              className={`pb-2.5 px-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeSubTab === 'stage-mgmt' ? 'border-amber-600 text-amber-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Stage vs Audience
            </button>
            <button
              onClick={() => setActiveSubTab('stream-hud')}
              className={`pb-2.5 px-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeSubTab === 'stream-hud' ? 'border-amber-600 text-amber-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Stream Metrics HUD
            </button>
          </>
        )}

        {activeCategory === 'bootcamp' && (
          <>
            <button
              onClick={() => setActiveSubTab('overview')}
              className={`pb-2.5 px-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeSubTab === 'overview' ? 'border-pink-600 text-pink-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Attendance Roll Call
            </button>
            <button
              onClick={() => setActiveSubTab('curriculum')}
              className={`pb-2.5 px-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeSubTab === 'curriculum' ? 'border-pink-600 text-pink-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Curriculum Modules
            </button>
            <button
              onClick={() => setActiveSubTab('certificate')}
              className={`pb-2.5 px-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeSubTab === 'certificate' ? 'border-pink-600 text-pink-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Certificate Generator
            </button>
          </>
        )}

        {activeCategory === 'architecture-demo' && (
          <>
            <button
              onClick={() => setActiveSubTab('overview')}
              className={`pb-2.5 px-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeSubTab === 'overview' ? 'border-sky-600 text-sky-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Topologies
            </button>
            <button
              onClick={() => setActiveSubTab('deal-room')}
              className={`pb-2.5 px-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeSubTab === 'deal-room' ? 'border-sky-600 text-sky-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Executive Vault
            </button>
            <button
              onClick={() => setActiveSubTab('spec-export')}
              className={`pb-2.5 px-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeSubTab === 'spec-export' ? 'border-sky-600 text-sky-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Architecture Spec
            </button>
          </>
        )}
      </div>

      {/* 3. DRAWER BODY CONTENT */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* ========================================================= */}
        {/* 1. HACKATHON SUITE VIEWS                                  */}
        {/* ========================================================= */}
        {activeCategory === 'hackathon' && (
          <>
            {activeSubTab === 'overview' && (
              <div className="space-y-4">
                {/* Countdown Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white shadow-lg relative overflow-hidden">
                  <div className="flex items-center justify-between text-xs text-blue-300 font-bold mb-2">
                    <span className="flex items-center space-x-1.5">
                      <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span>Sprint Countdown Clock</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px]">
                      48h Hackathon
                    </span>
                  </div>

                  <div className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono text-center my-3 text-white">
                    {formatHours(hackathonSeconds)}
                  </div>

                  <div className="flex items-center justify-center space-x-2 pt-1">
                    <button
                      onClick={() => setIsHackathonTimerRunning(!isHackathonTimerRunning)}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors flex items-center space-x-1 cursor-pointer"
                    >
                      {isHackathonTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      <span>{isHackathonTimerRunning ? 'Pause Clock' : 'Start Clock'}</span>
                    </button>
                    <button
                      onClick={() => setHackathonSeconds(24 * 3600)}
                      className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 transition-colors cursor-pointer"
                      title="Reset to 24h"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Hackathon Tracks & Rules */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="text-xs font-extrabold text-[#0f172a] uppercase tracking-wider">
                    Official Hackathon Tracks ($50,000 Prize Pool)
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                      <span className="font-bold text-blue-600">🤖 AI Agents</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">Multi-agent developer workflows</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                      <span className="font-bold text-emerald-600">🌐 Distributed Mesh</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">WebRTC & P2P infrastructure</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                      <span className="font-bold text-purple-600">⚡ Developer Tools</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">Zero-latency coding suites</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                      <span className="font-bold text-amber-600">🔐 FinTech & Security</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">Zero-trust & DTLS paywalls</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSubTab === 'squads' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
                  <span>Registered Breakout Squads</span>
                  <span className="text-blue-600 font-bold">{squads.length} Teams</span>
                </div>
                {squads.map((squad) => (
                  <div key={squad.id} className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-slate-300 transition-all flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-9 h-9 rounded-xl ${squad.avatarColor} text-white font-extrabold flex items-center justify-center text-xs shadow-xs`}>
                        {squad.name.slice(6, 7) || 'S'}
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-[#0f172a]">{squad.name}</div>
                        <div className="text-[11px] text-slate-500">
                          Lead: <span className="font-semibold text-slate-700">{squad.leadName}</span> • {squad.membersCount} members
                        </div>
                        <div className="text-[10px] text-blue-600 font-bold mt-0.5">{squad.track}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => alert(`Joined ${squad.name} breakout table.`)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#0f172a] font-bold text-xs transition-colors cursor-pointer"
                    >
                      Join Table
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeSubTab === 'submit' && (
              <form onSubmit={handleSubmitHackathonProject} className="space-y-3">
                {projectSubmitSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Project successfully submitted to the judging portal!</span>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Project Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Antigravity Autonomous Code Reviewer"
                    value={newProjectTitle}
                    onChange={(e) => setNewProjectTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Select Your Squad</label>
                  <select
                    value={newProjectSquad}
                    onChange={(e) => setNewProjectSquad(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
                  >
                    {squads.map((s) => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Elevator Pitch (60-sec Tagline)</label>
                  <input
                    type="text"
                    placeholder="e.g. Multi-agent pair programmer analyzing PRs with sub-second feedback"
                    value={newProjectTagline}
                    onChange={(e) => setNewProjectTagline(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">GitHub Repo</label>
                    <input
                      type="url"
                      placeholder="https://github.com/..."
                      value={newProjectGithub}
                      onChange={(e) => setNewProjectGithub(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Live Demo URL</label>
                    <input
                      type="url"
                      placeholder="https://demo.vercel.app"
                      value={newProjectDemo}
                      onChange={(e) => setNewProjectDemo(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tech Stack Tags</label>
                  <input
                    type="text"
                    placeholder="Next.js 16, WebRTC, Gemini Flash, TypeScript"
                    value={newProjectTags}
                    onChange={(e) => setNewProjectTags(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmittingProject}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
                >
                  {isSubmittingProject ? 'Submitting to Judges...' : 'Submit Hackathon Project'}
                </button>
              </form>
            )}

            {activeSubTab === 'leaderboard' && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Official Judging Leaderboard
                </div>
                {projects.map((proj, idx) => (
                  <div key={proj.id} className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center">
                          #{idx + 1}
                        </span>
                        <div>
                          <div className="text-xs font-extrabold text-[#0f172a]">{proj.projectTitle}</div>
                          <div className="text-[10px] text-slate-500">{proj.squadName}</div>
                        </div>
                      </div>
                      <div className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-extrabold">
                        {proj.totalScore.toFixed(2)} / 10
                      </div>
                    </div>
                    <p className="text-xs text-slate-600">{proj.tagline}</p>
                    <div className="flex items-center space-x-1.5 flex-wrap gap-1 text-[10px]">
                      {proj.techStack.map((tech) => (
                        <span key={tech} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold">
                          {tech}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-blue-600">
                      <a href={proj.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1 hover:underline">
                        <span>Repository</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <a href={proj.demoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1 hover:underline">
                        <span>Live Preview</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ========================================================= */}
        {/* 2. HANDS-ON WORKSHOP SUITE VIEWS                          */}
        {/* ========================================================= */}
        {activeCategory === 'workshop' && (
          <>
            {activeSubTab === 'overview' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#0f172a]">Interactive Code Lab Exercises</span>
                  <span className="text-purple-600 font-bold">
                    {workshopSteps.filter((s) => s.isCompleted).length} / {workshopSteps.length} Completed
                  </span>
                </div>

                {workshopSteps.map((step, idx) => (
                  <div
                    key={step.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      idx === activeStepIndex
                        ? 'bg-purple-50/40 border-purple-300 shadow-xs'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleToggleStepCompleted(step.id)}
                          className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                            step.isCompleted
                              ? 'bg-emerald-500 text-white'
                              : 'border border-slate-300 hover:border-purple-500'
                          }`}
                        >
                          {step.isCompleted && <Check className="w-3 h-3 stroke-[3]" />}
                        </button>
                        <h4 className="text-xs font-bold text-[#0f172a]">
                          Step {step.stepNumber}: {step.title}
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono text-purple-700 bg-purple-100/70 px-2 py-0.5 rounded">
                        {step.targetFile}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed mb-3">
                      {step.description}
                    </p>

                    {/* Code Snippet Block */}
                    <div className="rounded-xl bg-[#0f172a] text-slate-200 p-3 font-mono text-xs relative group overflow-hidden">
                      <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-700/60 text-[10px] text-slate-400">
                        <span>{step.language}</span>
                        <button
                          onClick={() => handleCopyCodeToIDE(step)}
                          className="flex items-center space-x-1 text-slate-300 hover:text-white transition-colors cursor-pointer bg-white/10 px-2 py-0.5 rounded"
                        >
                          {copiedStepId === step.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400 font-bold">Pasted to IDE!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy to Code Workspace</span>
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="overflow-x-auto text-[11px] leading-relaxed max-h-36">
                        <code>{step.codeSnippet}</code>
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeSubTab === 'mentor' && (
              <div className="space-y-4">
                {/* Request Help Form */}
                <form onSubmit={handleRequestHelp} className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 space-y-2.5">
                  <div className="text-xs font-bold text-purple-900 flex items-center space-x-1.5">
                    <HelpCircle className="w-4 h-4 text-purple-600" />
                    <span>Request TA / Mentor Lab Assistance</span>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Describe what error or blocker you're facing..."
                    value={newHelpQuestion}
                    onChange={(e) => setNewHelpQuestion(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-purple-200 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    Raise Hand for TA Help
                  </button>
                </form>

                {/* Queue */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Waiting TA Queue ({helpRequests.length})
                  </div>
                  {helpRequests.map((req) => (
                    <div key={req.id} className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-start justify-between">
                      <div className="flex items-start space-x-2.5 min-w-0">
                        <img src={req.studentAvatar} alt={req.studentName} className="w-7 h-7 rounded-full object-cover mt-0.5" />
                        <div>
                          <div className="text-xs font-bold text-[#0f172a]">{req.studentName} (Step {req.stepNumber})</div>
                          <p className="text-xs text-slate-600 mt-0.5 leading-snug">{req.question}</p>
                          <span className="text-[10px] text-slate-400">{req.requestedAt}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setHelpRequests((prev) => prev.filter((r) => r.id !== req.id))}
                        className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Resolve
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSubTab === 'instructor' && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-[#0f172a]">Instructor Code Checkpoint Broadcast</div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  As the workshop instructor, you can broadcast the clean working solution for the active step directly into all attendees' Code Workspaces with a single click.
                </p>
                {checkpointPushed && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Checkpoint successfully pushed to all 38 participants!</span>
                  </div>
                )}
                <button
                  onClick={handlePushCheckpoint}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Push Current Code Checkpoint to All Students</span>
                </button>
              </div>
            )}
          </>
        )}

        {/* ========================================================= */}
        {/* 3. DEVELOPER MEETUP SUITE VIEWS                           */}
        {/* ========================================================= */}
        {activeCategory === 'meetup' && (
          <>
            {activeSubTab === 'overview' && (
              <div className="space-y-4">
                {/* Radial Lightning Timer */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950 to-slate-900 text-white text-center shadow-lg">
                  <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2">
                    Lightning Talk Speech Timer
                  </div>
                  <div className={`text-5xl font-extrabold font-mono my-2 ${lightningSeconds <= 60 ? 'text-amber-400 animate-pulse' : 'text-white'}`}>
                    {formatTime(lightningSeconds)}
                  </div>
                  <div className="text-xs text-slate-300 font-medium mb-3">
                    Speaking: <span className="font-bold text-white">Sarah Chen (Sub-second Serverless P2P)</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => setIsLightningRunning(!isLightningRunning)}
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center space-x-1 cursor-pointer"
                    >
                      {isLightningRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      <span>{isLightningRunning ? 'Pause' : 'Start Timer'}</span>
                    </button>
                    <button
                      onClick={() => setLightningSeconds(300)}
                      className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 transition-colors cursor-pointer"
                      title="Reset to 5:00"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeSubTab === 'speakers' && (
              <div className="space-y-2.5">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Scheduled Lightning Talks Lineup
                </div>
                {meetupSpeakers.map((spk) => (
                  <div key={spk.id} className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <img src={spk.avatar} alt={spk.name} className="w-9 h-9 rounded-full object-cover" />
                      <div>
                        <div className="text-xs font-extrabold text-[#0f172a]">{spk.name}</div>
                        <div className="text-[11px] text-slate-600 font-medium truncate max-w-[200px]">{spk.talkTitle}</div>
                        <div className="text-[10px] text-emerald-600 font-bold">{spk.topicBadge} • {spk.durationMinutes} min</div>
                      </div>
                    </div>
                    {spk.status === 'speaking' ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold animate-pulse">
                        Speaking
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold">
                        Up Next
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeSubTab === 'qa' && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Community-Upvoted Q&A
                </div>
                {questions.map((q) => (
                  <div key={q.id} className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-start justify-between">
                    <div className="space-y-1 pr-2">
                      <div className="text-[11px] font-bold text-slate-500">{q.user}</div>
                      <p className="text-xs text-[#0f172a] leading-relaxed">{q.text}</p>
                    </div>
                    <button
                      onClick={() => setQuestions((prev) => prev.map((item) => item.id === q.id ? { ...item, upvotes: item.upvotes + 1 } : item))}
                      className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors cursor-pointer flex-shrink-0"
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>{q.upvotes}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeSubTab === 'soundboard' && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-[#0f172a]">Live Audience Reaction Soundboard</div>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { emoji: '👏', label: 'Applause' },
                    { emoji: '🎉', label: 'Cheer' },
                    { emoji: '🔥', label: 'Fire Talk' },
                    { emoji: '🚀', label: 'Shipped' },
                    { emoji: '💡', label: 'Great Idea' },
                    { emoji: '❤️', label: 'Love It' },
                  ].map((s) => (
                    <button
                      key={s.emoji}
                      onClick={() => onSendReaction?.(s.emoji)}
                      className="p-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 flex items-center space-x-2 text-xs font-bold text-[#0f172a] transition-all active:scale-95 shadow-2xs cursor-pointer"
                    >
                      <span className="text-xl">{s.emoji}</span>
                      <span>{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ========================================================= */}
        {/* 4. VIRTUAL BROADCAST SUITE VIEWS                          */}
        {/* ========================================================= */}
        {activeCategory === 'broadcast' && (
          <>
            {activeSubTab === 'overview' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#0f172a]">Active Audience Polls</span>
                  <span className="text-amber-600 font-bold">{viewerCount} Viewers Participating</span>
                </div>

                {polls.map((poll) => (
                  <div key={poll.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
                    <h4 className="text-xs font-extrabold text-[#0f172a] leading-snug">
                      {poll.question}
                    </h4>
                    <div className="space-y-1.5">
                      {poll.options.map((opt) => {
                        const pct = poll.totalVotes > 0 ? Math.round((opt.votes / poll.totalVotes) * 100) : 0;
                        const isVoted = poll.userVotedOptionId === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleVotePoll(poll.id, opt.id)}
                            className={`w-full p-2.5 rounded-xl border text-left text-xs font-semibold relative overflow-hidden transition-all cursor-pointer ${
                              isVoted ? 'border-amber-500 bg-amber-50/50' : 'border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div
                              className="absolute inset-y-0 left-0 bg-amber-200/40 transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                            <div className="relative z-10 flex items-center justify-between">
                              <span className="text-slate-800">{opt.text}</span>
                              <span className="font-mono font-bold text-slate-700">{pct}% ({opt.votes})</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeSubTab === 'stage-mgmt' && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-[#0f172a]">Stage Presenters vs Audience Viewers</div>
                <p className="text-xs text-slate-600">
                  Broadcast webinar mode isolates stage speakers from the general audience to conserve bandwidth for 300+ attendees.
                </p>
                <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-2 text-xs">
                  <div className="font-bold text-slate-700">Active Keynote Speakers:</div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>David Kim (VP Technology Strategy)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Elena Rostova (Keynote Guest)</span>
                  </div>
                </div>
              </div>
            )}

            {activeSubTab === 'stream-hud' && (
              <div className="p-4 rounded-2xl bg-[#0f172a] text-white space-y-3 shadow-lg">
                <div className="text-xs font-bold text-amber-400">Live Broadcast Telemetry HUD</div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 rounded-lg bg-white/5">
                    <div className="text-[10px] text-slate-400">Total Viewers</div>
                    <div className="text-lg font-bold text-white">342 Live</div>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5">
                    <div className="text-[10px] text-slate-400">Stream Health</div>
                    <div className="text-lg font-bold text-emerald-400">1080p @ 60fps</div>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5">
                    <div className="text-[10px] text-slate-400">Network Latency</div>
                    <div className="text-lg font-bold text-white">8ms DTLS</div>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5">
                    <div className="text-[10px] text-slate-400">Bitrate</div>
                    <div className="text-lg font-bold text-white">4500 kbps</div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ========================================================= */}
        {/* 5. UNIVERSITY BOOTCAMP SUITE VIEWS                        */}
        {/* ========================================================= */}
        {activeCategory === 'bootcamp' && (
          <>
            {activeSubTab === 'overview' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white flex items-center justify-between shadow-md">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider opacity-90">Cohort Attendance</div>
                    <div className="text-2xl font-extrabold mt-0.5">{attendanceRate}% Present</div>
                    <div className="text-[11px] opacity-90">{checkedInCount} of {attendance.length} students checked in</div>
                  </div>
                  <button
                    onClick={handleExportAttendanceCSV}
                    className="px-3 py-1.5 rounded-xl bg-white text-pink-700 font-bold text-xs transition-colors hover:bg-slate-100 flex items-center space-x-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Student Roll Call Register
                  </div>
                  {attendance.map((stu) => (
                    <div key={stu.studentId} className="p-2.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <img src={stu.studentAvatar} alt={stu.studentName} className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <div className="text-xs font-bold text-[#0f172a]">{stu.studentName}</div>
                          <div className="text-[10px] text-slate-500">{stu.email}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggleAttendance(stu.studentId)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                          stu.isCheckedIn
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {stu.isCheckedIn ? `✓ Present (${stu.checkInTime})` : 'Mark Present'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSubTab === 'curriculum' && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Curriculum Module Progression
                </div>
                {modules.map((mod) => (
                  <div key={mod.id} className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#0f172a]">
                        Module {mod.moduleNumber}: {mod.title}
                      </span>
                      {mod.isCompleted ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">Completed</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">In Progress</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 flex-wrap gap-1 text-[11px] text-slate-500">
                      {mod.topics.map((t) => (
                        <span key={t} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeSubTab === 'certificate' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="text-xs font-bold text-[#0f172a]">Generate Verified Completion Certificate</div>
                  <input
                    type="text"
                    placeholder="Student Full Name"
                    value={certificateStudentName}
                    onChange={(e) => setCertificateStudentName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-pink-500"
                  />
                  <button
                    onClick={handleGenerateCertificate}
                    className="w-full py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    Generate Verified Certificate
                  </button>
                </div>

                {generatedCertificate && (
                  <div className="p-4 rounded-2xl border-2 border-pink-400 bg-white shadow-xl text-center space-y-2 relative">
                    <div className="w-10 h-10 mx-auto rounded-full bg-pink-100 text-pink-600 flex items-center justify-center">
                      <Award className="w-6 h-6" />
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-pink-600">Rupal Convene Academy</div>
                    <h3 className="text-base font-extrabold text-[#0f172a]">Certificate of Completion</h3>
                    <p className="text-xs text-slate-500">This certifies that</p>
                    <div className="text-sm font-bold text-blue-600">{generatedCertificate.studentName}</div>
                    <p className="text-[11px] text-slate-600 leading-snug">has successfully completed {generatedCertificate.courseName}</p>
                    <div className="pt-2 border-t border-slate-100 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                      <span>Hash: {generatedCertificate.verificationHash}</span>
                      <span>{generatedCertificate.issueDate}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* ========================================================= */}
        {/* 6. ARCHITECTURE DEMO SUITE VIEWS                          */}
        {/* ========================================================= */}
        {activeCategory === 'architecture-demo' && (
          <>
            {activeSubTab === 'overview' && (
              <div className="space-y-4">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Enterprise Architecture Blueprints
                </div>

                {loadedTopologyMsg && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{loadedTopologyMsg}</span>
                  </div>
                )}

                {[
                  {
                    id: 'microservices',
                    title: 'Distributed Microservices & Service Mesh',
                    desc: 'Edge Envoy Gateway, Auth Service, Redis Cluster, Event Broker, CockroachDB ledger nodes.',
                    nodes: 8,
                  },
                  {
                    id: 'kafka-cqrs',
                    title: 'Event-Driven CQRS Architecture',
                    desc: 'Command query segregation, Kafka multi-partition topic streams, Elasticsearch read replicas.',
                    nodes: 6,
                  },
                  {
                    id: 'zero-trust',
                    title: 'Zero-Trust DTLS-SRTP Signaling Mesh',
                    desc: 'Mutual TLS certificate exchange, WebAssembly media cipher, edge rate limiting bucket.',
                    nodes: 7,
                  },
                ].map((topo) => (
                  <div key={topo.id} className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#0f172a]">{topo.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 font-bold">
                        {topo.nodes} Nodes
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">{topo.desc}</p>
                    <button
                      onClick={() => handleLoadTopology(topo.id)}
                      className="w-full py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center space-x-1"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Load into Architecture Whiteboard</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeSubTab === 'deal-room' && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Executive Deal Room Document Vault
                </div>
                {[
                  { title: 'Enterprise SLA Guarantee Agreement (99.999%)', size: '2.4 MB', type: 'PDF' },
                  { title: 'SOC2 Type II Security Compliance Audit Report', size: '5.1 MB', type: 'PDF' },
                  { title: 'Zero-Trust WebRTC DTLS-SRTP Cryptographic Whitepaper', size: '3.8 MB', type: 'PDF' },
                ].map((doc) => (
                  <div key={doc.title} className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="text-xs font-bold text-[#0f172a]">{doc.title}</div>
                        <div className="text-[10px] text-slate-400">{doc.size} • {doc.type}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => alert(`Downloading watermarked ${doc.title}...`)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeSubTab === 'spec-export' && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-[#0f172a]">Architecture Specification Exporter</div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Export complete system specifications, node schemas, and latency benchmarks formulated during this Architecture Demo.
                </p>
                <button
                  onClick={() => {
                    const md = `# Enterprise System Architecture Specification\n\nGenerated by Rupal Convene on ${new Date().toISOString()}\n\n## System Topology: Distributed Edge Mesh\n- Latency: <10ms DTLS-SRTP\n- Encryption: 256-bit AES-GCM\n- Cluster: Active-Active Multi-Region\n`;
                    const blob = new Blob([md], { type: 'text/markdown' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `architecture-spec-${new Date().toISOString().split('T')[0]}.md`;
                    a.click();
                  }}
                  className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Download System Specification (.md)</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
