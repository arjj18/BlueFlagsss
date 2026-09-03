export function trackApiCall(estimatedCost: number): void {
  try {
    const today = new Date().toDateString();
    const key = 'api_usage_' + today;
    const current = JSON.parse(localStorage.getItem(key) || '{"calls":0,"cost":0}');
    current.calls++;
    current.cost += estimatedCost;
    localStorage.setItem(key, JSON.stringify(current));
  } catch {
    // localStorage unavailable — ignore
  }
}

export function getTodayUsage(): { calls: number; cost: number } {
  try {
    const today = new Date().toDateString();
    const key = 'api_usage_' + today;
    const data = JSON.parse(localStorage.getItem(key) || '{"calls":0,"cost":0}');
    return { calls: data.calls ?? 0, cost: data.cost ?? 0 };
  } catch {
    return { calls: 0, cost: 0 };
  }
}
