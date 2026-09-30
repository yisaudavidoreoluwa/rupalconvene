# TechConvene - Conference & Collaborative Meeting SaaS

> **Next-Generation Conference & Collaborative Workspace Platform for Tech Developers and Business Partners.**

---

## 🌟 Overview

TechConvene bridges the divide between **deep engineering teams** and **strategic business partners / investors**. Traditional meeting platforms like Zoom, Google Meet, and Microsoft Teams treat technical work as a passive screen share. TechConvene delivers an active, synchronized multi-track workspace.

### Key Flagship Capabilities

1. **In-Call Collaborative Code IDE & Runtime Sandbox**:
   - Multi-language tabs (TypeScript, Python, SQL, Go, Rust, JSON).
   - In-meeting sandbox execution with live terminal output, stdout/stderr streams, and performance metrics (p99 latency, execution duration, CPU & Heap footprint).
   - Instant snippet sharing directly into meeting chat.
2. **Interactive Architecture & Cloud Whiteboard**:
   - System design canvas with drag-and-drop cloud stencils: API Gateways, Edge Load Balancers, Kafka Streams, PostgreSQL Databases, and Redis caches.
   - Live visual connectors and automated AI Architecture Reviews.
3. **Institutional Partner Pitch Deck & Screen-Privacy Watermark**:
   - Synchronized slide presentations for partners, venture capitalists, and board members.
   - Dynamic per-viewer screen watermark overlay (`CONFIDENTIAL • [NAME] • [EMAIL] • [TIMESTAMP]`) preventing unauthorized screenshots or leaks of confidential financial models and patents.
   - In-meeting Deal Room & Term Sheet modal for reviewing syndicate allocations, governance rights, and enterprise compliance.
4. **Gemini AI Live Meeting Intelligence**:
   - Continuous multi-speaker speech-to-text transcription.
   - 1-click **Executive Minutes & Debrief Generator** producing Executive Summaries, Key Technical Decisions, Assigned Action Items with due dates, and Investor Highlights.
   - Live **Gemini AI Copilot**: ask in-meeting questions grounded directly on spoken dialogue, code files, and presentation slides.
5. **Multi-Track Agenda & Backstage Green Room**:
   - Conference timetable across Engineering, Executive, and Joint Keynote tracks.
   - Backstage Green Room for guest speakers and executives to test audio/video, verify slides, and coordinate with stage managers before being elevated to the Main Stage.
6. **Zero-Setup WebRTC Media Engine**:
   - Smooth local webcam and mic hardware integration with graceful fallback preview.
   - Dynamic stage layouts: Gallery Grid, Speaker Spotlight, and Compact Split Workspace.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18+ (tested on Node v24)
- npm 9+

### Installation & Run

```bash
# Navigate to the project on your Desktop
cd C:\Users\HP\Desktop\techconvene

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to enter the conference room.

### Production Build
```bash
npm run build
npm start
```

### Environment Variables (Optional for Gemini API)
Create a `.env.local` file:
```env
GEMINI_API_KEY=your_google_gemini_api_key_here
```
*Note: If no API key is provided, the platform automatically utilizes its built-in intelligent fallback model so all features function seamlessly out of the box.*

---

## 🏗️ Architecture

```
techconvene/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── gemini/
│   │   │       └── route.ts          # Gemini AI Intelligence & Copilot API
│   │   ├── globals.css               # Dark theme, glassmorphism, animations
│   │   ├── layout.tsx                # App root layout & SEO metadata
│   │   └── page.tsx                  # Unified Conference Room State & Workspace
│   ├── components/
│   │   ├── AgendaGreenRoom.tsx       # Conference Timetable & Backstage Green Room
│   │   ├── AIIntelligenceDrawer.tsx  # Gemini Minutes, Action Items, & Copilot
│   │   ├── ArchitectureWhiteboard.tsx# System Diagram Canvas & Nodes
│   │   ├── ChatAndQAPanel.tsx        # Chat, Investor Q&A, and Participants
│   │   ├── CodeWorkspace.tsx         # In-Call IDE, Sandbox Runner & Terminal
│   │   ├── ConferenceControls.tsx    # Bottom AV & Workspace Switcher Bar
│   │   ├── ConferenceHeader.tsx      # Top Header with Room Code & Status
│   │   ├── DealRoomModal.tsx         # Institutional Term Sheet & Documents
│   │   ├── InviteModal.tsx           # Partner & Engineer Invitation Modal
│   │   ├── LeaveModal.tsx            # End Meeting Confirmation Modal
│   │   ├── PitchDeckViewer.tsx       # Pitch Deck & Dynamic Privacy Watermark
│   │   ├── VideoStage.tsx            # Stage Layouts (Gallery, Spotlight, Split)
│   │   └── VideoTile.tsx             # Participant Video Tile & Speaking Ripple
│   ├── lib/
│   │   ├── code-runner.ts            # Safe Sandbox Execution Engine
│   │   ├── gemini-service.ts         # Client Intelligence & Fallback Generator
│   │   └── mock-data.ts              # Preloaded Conference Session Data
│   └── types/
│       └── meeting.ts                # TypeScript Interfaces & Data Contracts
└── package.json
```
