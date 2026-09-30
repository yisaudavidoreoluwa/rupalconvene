import { ParticipantRole } from './meeting';

export type AuthProvider = 'google' | 'github' | 'discord' | 'email' | 'guest';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  provider: AuthProvider;
  role: ParticipantRole;
  organization: string;
  jobTitle: string;
  username?: string;
  discordTag?: string;
  githubUsername?: string;
  tier: 'Developer Pro' | 'Enterprise Partner' | 'Founding Member';
  isVerified: boolean;
  createdAt: string;
}

export interface AuthSession {
  user: UserProfile;
  token: string;
  expiresAt: string;
}

export interface OAuthProviderConfig {
  id: AuthProvider;
  name: string;
  icon: string;
  bgColor: string;
  textColor: string;
  description: string;
}
