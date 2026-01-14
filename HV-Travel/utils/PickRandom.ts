const pickRandom = <T,>(arr: T[], limit: number) => {
  const a = [...(arr || [])];
  // Fisher–Yates shuffle
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, Math.min(limit, a.length));
};

export default pickRandom;