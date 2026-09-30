# Rupal Convene 🚀
### Video Conferencing & Real-Time Collaboration for Business
**A flagship product by Rupal Tech Solutions.**

---

## 🌟 Overview

**Rupal Convene** is an enterprise-grade conference and collaborative workspace platform purpose-built for the synergy between **technical engineering teams** and **strategic business partners / investors**.

Designed to mirror the intuitive elegance of modern business communication while integrating high-power engineering tooling:
- **Interactive Marketing Portal** matching Rupal Tech Solutions product UI.
- **In-Call Collaborative Code IDE & Sandbox Runtime** (TypeScript, Python, SQL) with live terminal execution and p99 benchmark latency counters.
- **System Architecture Whiteboard** with drag-and-drop cloud stencils and AI architecture reviews.
- **Investor & Partner Pitch Deck** with dynamic per-viewer screen privacy watermarking (`CONFIDENTIAL • [USER] • [TIMESTAMP]`) and integrated Deal Room / Term Sheet access.
- **Multi-Track Agenda & Backstage Green Room** for seamless keynote transitions.
- **Gemini AI Meeting Intelligence**: Real-time multi-speaker transcription, automated executive minutes, and in-meeting AI copilot.

---

## 🚀 Running Rupal Convene

```bash
# Navigate to the project on your Desktop
cd C:\Users\HP\Desktop\rupal-convene

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Project Architecture

```
rupal-convene/
├── src/
│   ├── app/
│   │   ├── api/gemini/route.ts        # Gemini AI Intelligence & Copilot API
│   │   ├── globals.css                # Dual light marketing + dark conference styles
│   │   ├── layout.tsx                 # Root layout & Rupal Convene metadata
│   │   └── page.tsx                   # Unified Portal & Live Conference Suite
│   ├── components/
│   │   ├── RupalHeader.tsx            # Rupal Tech Solutions navigation bar
│   │   ├── RupalSubNav.tsx            # Sub-nav pill bar (AI, Flexible, Enhance, etc.)
│   │   ├── RupalHero.tsx              # Hero with meeting code joiner & device frame
│   │   ├── RupalAIFeatureSection.tsx  # AI notes, speech translation & copilot
│   │   ├── RupalDeviceSection.tsx     # Device support & mobile mockup preview
│   │   ├── RupalFooter.tsx            # Rupal Tech Solutions footer
│   │   ├── RupalChatWidget.tsx        # Floating live assistant widget
│   │   ├── ConferenceHeader.tsx       # In-call header with room code & watermark
│   │   ├── VideoStage.tsx             # Video layouts (Gallery, Spotlight, Split)
│   │   ├── VideoTile.tsx              # Participant tile with speech waveform
│   │   ├── CodeWorkspace.tsx          # In-call IDE & sandbox runner
│   │   ├── ArchitectureWhiteboard.tsx # System diagram canvas & cloud nodes
│   │   ├── PitchDeckViewer.tsx        # Slide presenter & dynamic privacy watermark
│   │   ├── AgendaGreenRoom.tsx        # Conference timetable & green room
│   │   ├── AIIntelligenceDrawer.tsx   # Gemini minutes, action items & copilot
│   │   ├── ChatAndQAPanel.tsx         # Meeting Chat, Investor Q&A, and Attendance
│   │   ├── ConferenceControls.tsx     # Floating bottom AV & workspace bar
│   │   ├── DealRoomModal.tsx          # Institutional term sheet & diligence
│   │   ├── InviteModal.tsx            # Role-based invitation modal
│   │   └── LeaveModal.tsx             # Leave conference confirmation modal
│   ├── lib/
│   │   ├── code-runner.ts             # Safe sandbox execution engine
│   │   ├── gemini-service.ts          # Client AI service & smart fallback generator
│   │   └── mock-data.ts               # Preloaded conference session dataset
│   └── types/
│       └── meeting.ts                 # TypeScript data contracts & interfaces
└── package.json
```
