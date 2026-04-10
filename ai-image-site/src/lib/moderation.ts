const DISALLOWED_TERMS = [
  // Keep this list focused on explicit sexual content.
  "hentai",
  "porn",
  "explicit",
  "nsfw",
  "nude",
  "nudity",
  "sex",
  "sexual",
  "blowjob",
  "handjob",
  "penetration",
];

export function isPromptDisallowed(prompt: string) {
  const p = prompt.toLowerCase();
  return DISALLOWED_TERMS.some((t) => p.includes(t));
}

