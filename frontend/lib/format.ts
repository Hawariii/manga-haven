export function formatViews(value: number) {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }

  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }

  return `${value}`;
}

export function formatStatus(status: string) {
  const normalized = status.toLowerCase();

  if (normalized.includes("ongoing") || normalized.includes("tayang")) {
    return "Sedang Tayang";
  }

  return status;
}
