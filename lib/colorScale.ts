export function getRateColor(value: number | null): string {
  if (value === null || Number.isNaN(value)) return '#efefef';

  if (value >= 0.3) return '#8b0000';
  if (value >= 0.2) return '#c62828';
  if (value >= 0.1) return '#ef5350';
  if (value >= 0.03) return '#ffcdd2';
  if (value > -0.03 && value < 0.03) return '#f5f5f5';
  if (value <= -0.2) return '#0d47a1';
  if (value <= -0.1) return '#1976d2';
  if (value <= -0.03) return '#90caf9';

  return '#f5f5f5';
}
