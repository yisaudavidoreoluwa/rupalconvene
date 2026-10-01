export function generateInitialsAvatar(name: string, seed?: string): string {
  const cleanName = (name || 'Guest User').trim();
  const parts = cleanName.split(' ');
  const initials = parts.length > 1
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : cleanName.slice(0, 2).toUpperCase();

  // Pick deterministic sleek colors based on name
  const palettes = [
    { bg: '#0f172a', text: '#ffffff' }, // Navy Slate
    { bg: '#1e293b', text: '#38bdf8' }, // Dark Slate Sky
    { bg: '#1e1b4b', text: '#818cf8' }, // Deep Indigo
    { bg: '#064e3b', text: '#34d399' }, // Deep Emerald
    { bg: '#312e81', text: '#a5b4fc' }, // Violet Blue
    { bg: '#18181b', text: '#f43f5e' }, // Zinc Rose
  ];

  const hash = (cleanName + (seed || '')).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const color = palettes[hash % palettes.length];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <rect width="100" height="100" rx="30" fill="${color.bg}" />
    <text x="50" y="58" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="38" font-weight="700" fill="${color.text}" text-anchor="middle" dominant-baseline="middle">${initials}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function getUserAvatar(avatarUrl?: string | null, name?: string): string {
  if (avatarUrl && avatarUrl.startsWith('http') && !avatarUrl.includes('unsplash.com')) {
    return avatarUrl;
  }
  if (avatarUrl && avatarUrl.startsWith('data:image/svg+xml')) {
    return avatarUrl;
  }
  return generateInitialsAvatar(name || 'Guest');
}
