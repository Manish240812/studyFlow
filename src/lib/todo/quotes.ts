export const QUOTES = [
  "Success is the sum of small efforts, repeated day in and day out.",
  "The secret of getting ahead is getting started.",
  "Don't watch the clock; do what it does. Keep going.",
  "The expert in anything was once a beginner.",
  "Study while others are sleeping; work while others are loafing.",
  "The beautiful thing about learning is that no one can take it away from you.",
  "Believe you can and you're halfway there.",
  "Small progress is still progress.",
  "You don't have to be great to start, but you have to start to be great.",
  "Discipline is the bridge between goals and accomplishment.",
  "Focus on being productive instead of busy.",
  "The future depends on what you do today.",
  "Push yourself, because no one else is going to do it for you.",
  "Great things never come from comfort zones.",
  "Dream big. Start small. Act now.",
];

export function quoteOfTheDay(): string {
  const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  return QUOTES[dayIndex % QUOTES.length];
}
