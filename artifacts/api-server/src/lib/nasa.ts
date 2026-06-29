const NASA_API_KEY = process.env.NASA_API_KEY ?? "DEMO_KEY";
const BASE_URL = "https://api.nasa.gov/neo/rest/v1";

export async function nasaFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set("api_key", NASA_API_KEY);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`NASA API error ${res.status}: ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function todayStr(): string {
  return formatDate(new Date());
}

export function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return formatDate(d);
}
