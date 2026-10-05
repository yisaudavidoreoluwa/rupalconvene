import { Participant } from '@/types/meeting';

const PORTRAITS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1534751516642-a171ed292022?auto=format&fit=crop&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=crop&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1521119989659-a83eee488004?auto=format&fit=crop&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1586297135537-94bc9ba060aa?auto=format&fit=crop&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=256&h=256&q=80',
];

const RAW_DATA = [
  { name: 'Dr. Aisha Patel', role: 'tech-lead', jobTitle: 'Principal ML Engineer', organization: 'Anthropic Labs' },
  { name: 'Carlos Rodriguez', role: 'tech-lead', jobTitle: 'VP of Infrastructure', organization: 'CloudScale' },
  { name: 'Sophia Chen', role: 'developer', jobTitle: 'Lead Security Architect', organization: 'Cyberex' },
  { name: 'Liam O\'Connor', role: 'developer', jobTitle: 'DevOps Lead', organization: 'Vertex Systems' },
  { name: 'Maya Lindqvist', role: 'business-partner', jobTitle: 'Design Director', organization: 'Studio Kvadrat' },
  { name: 'Tariq Al-Mansoor', role: 'developer', jobTitle: 'Senior Backend Engineer', organization: 'FinTech One' },
  { name: 'Sarah Jenkins', role: 'tech-lead', jobTitle: 'Head of Product', organization: 'Rupal Convene' },
  { name: 'Kenji Sato', role: 'developer', jobTitle: 'Core Systems Engineer', organization: 'Tokyo Systems' },
  { name: 'Olivia Taylor', role: 'investor', jobTitle: 'Managing Director', organization: 'Acorn Capital' },
  { name: 'Vikram Malhotra', role: 'tech-lead', jobTitle: 'Platform Architect', organization: 'HyperMesh' },
  { name: 'Emily Watson', role: 'developer', jobTitle: 'QA & Release Lead', organization: 'Velocity CI' },
  { name: 'Ethan Brown', role: 'developer', jobTitle: 'Frontend Lead', organization: 'React Foundation' },
  { name: 'Chloe Dubois', role: 'business-partner', jobTitle: 'Product Strategist', organization: 'Paris Tech Lab' },
  { name: 'Daniel Evans', role: 'developer', jobTitle: 'Distributed DB Engineer', organization: 'Cockroach Labs' },
  { name: 'Grace Hopper Jr.', role: 'developer', jobTitle: 'Compiler Engineer', organization: 'Rust WG' },
  { name: 'Lucas Becker', role: 'developer', jobTitle: 'Principal SRE', organization: 'Datadog' },
  { name: 'Hannah Kim', role: 'business-partner', jobTitle: 'UX Researcher', organization: 'DesignForge' },
  { name: 'Gabriel Santos', role: 'developer', jobTitle: 'Cloud Architect', organization: 'AWS Solutions' },
  { name: 'Zara Noor', role: 'tech-lead', jobTitle: 'AI Research Scientist', organization: 'DeepMind Fellow' },
  { name: 'Benjamin Wright', role: 'developer', jobTitle: 'Zero-Trust Security Analyst', organization: 'CipherGroup' },
  { name: 'Mia Larsson', role: 'developer', jobTitle: 'Full Stack Engineer', organization: 'Nordic Cloud' },
  { name: 'Alexander Ross', role: 'tech-lead', jobTitle: 'Kubernetes Architect', organization: 'Cloud Native WG' },
  { name: 'Natalie Vega', role: 'investor', jobTitle: 'General Partner', organization: 'Stripe Capital' },
  { name: 'Leo Martinez', role: 'developer', jobTitle: 'Audio/Video DSP Engineer', organization: 'WebRTC Core' },
  { name: 'Jessica Miller', role: 'business-partner', jobTitle: 'Security & Compliance Officer', organization: 'SOC2 Audits' },
  { name: 'Samuel Adeyemi', role: 'developer', jobTitle: 'Mobile Lead', organization: 'Flutter Org' },
  { name: 'Rachel Goldberg', role: 'investor', jobTitle: 'VP Growth & Syndication', organization: 'ScaleFund' },
  { name: 'Oscar Lind', role: 'developer', jobTitle: 'Streaming Infra Lead', organization: 'Kafka OSS' },
  { name: 'Fatima Zahra', role: 'tech-lead', jobTitle: 'Principal Big Data Engineer', organization: 'BigLake Group' },
  { name: 'William Zhao', role: 'developer', jobTitle: 'P2P Protocol Engineer', organization: 'Matrix Protocol' },
];

export function createSimulatedAttendees(count: number = 30): Participant[] {
  return RAW_DATA.slice(0, count).map((item, index) => {
    const avatar = PORTRAITS[index % PORTRAITS.length];
    return {
      id: `sim-user-${index + 1}`,
      name: item.name,
      email: `${item.name.toLowerCase().replace(/[^a-z]/g, '')}@${item.organization.toLowerCase().replace(/[^a-z]/g, '')}.com`,
      role: item.role as Participant['role'],
      jobTitle: item.jobTitle,
      organization: item.organization,
      avatar,
      isMuted: index !== 0 && index !== 4, // 2 participants have open mics
      isVideoOff: index % 6 === 0, // occasional camera off
      isSpeaking: index === 0, // first simulated peer speaks
      handRaised: index === 3 || index === 8, // a couple have hands raised
      isScreenSharing: false,
      inGreenRoom: false,
    };
  });
}
