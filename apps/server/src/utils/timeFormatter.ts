export function formatElapsedTime(elapsedTimeMs: number): string {
  if (elapsedTimeMs >= 1000) {
    return `${(elapsedTimeMs / 1000).toFixed(2)}s`;
  }
  return `${elapsedTimeMs}ms`;
}
