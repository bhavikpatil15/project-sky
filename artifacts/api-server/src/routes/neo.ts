import { Router, type IRouter } from "express";
import { nasaFetch, todayStr, daysAgo, formatDate } from "../lib/nasa";

const router: IRouter = Router();

interface NasaNeo {
  id: string;
  neo_reference_id: string;
  name: string;
  name_limited?: string;
  designation?: string;
  nasa_jpl_url: string;
  absolute_magnitude_h: number;
  estimated_diameter: {
    kilometers: { estimated_diameter_min: number; estimated_diameter_max: number };
    meters: { estimated_diameter_min: number; estimated_diameter_max: number };
    miles: { estimated_diameter_min: number; estimated_diameter_max: number };
    feet: { estimated_diameter_min: number; estimated_diameter_max: number };
  };
  is_potentially_hazardous_asteroid: boolean;
  is_sentry_object: boolean;
  close_approach_data: Array<{
    close_approach_date: string;
    close_approach_date_full: string;
    epoch_date_close_approach: number;
    relative_velocity: { kilometers_per_second: string; kilometers_per_hour: string; miles_per_hour: string };
    miss_distance: { astronomical: string; lunar: string; kilometers: string; miles: string };
    orbiting_body: string;
  }>;
}

interface NasaFeedResponse {
  element_count: number;
  near_earth_objects: Record<string, NasaNeo[]>;
}

interface NasaStatsResponse {
  neo_count: number;
  close_approach_count: number;
  last_updated: string;
}

interface NasaBrowseResponse {
  near_earth_objects: NasaNeo[];
  page: { total_elements: number };
}

function normalizeFeed(data: NasaFeedResponse, startDate: string, endDate: string) {
  const days = Object.entries(data.near_earth_objects)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, asteroids]) => ({ date, asteroids }));
  return {
    element_count: data.element_count,
    start_date: startDate,
    end_date: endDate,
    near_earth_objects: days,
  };
}

router.get("/neo/today", async (req, res): Promise<void> => {
  const today = todayStr();
  const data = await nasaFetch<NasaFeedResponse>("/feed", {
    start_date: today,
    end_date: today,
  });
  res.json(normalizeFeed(data, today, today));
});

router.get("/neo/feed", async (req, res): Promise<void> => {
  const { start_date, end_date } = req.query as { start_date?: string; end_date?: string };
  if (!start_date || !end_date) {
    res.status(400).json({ error: "start_date and end_date are required" });
    return;
  }
  const data = await nasaFetch<NasaFeedResponse>("/feed", { start_date, end_date });
  res.json(normalizeFeed(data, start_date, end_date));
});

router.get("/neo/stats", async (_req, res): Promise<void> => {
  const data = await nasaFetch<NasaStatsResponse>("/stats");
  res.json({
    neo_count: data.neo_count,
    close_approach_count: data.close_approach_count,
    last_updated: data.last_updated,
  });
});

router.get("/neo/today-stats", async (_req, res): Promise<void> => {
  const today = todayStr();
  const data = await nasaFetch<NasaFeedResponse>("/feed", {
    start_date: today,
    end_date: today,
  });
  const asteroids: NasaNeo[] = data.near_earth_objects[today] ?? [];

  const hazardousCount = asteroids.filter((a) => a.is_potentially_hazardous_asteroid).length;

  let closestKm: number | null = null;
  let fastestKms: number | null = null;
  let largestKm: number | null = null;
  let featured: NasaNeo | null = null;

  for (const a of asteroids) {
    const approach = a.close_approach_data[0];
    if (approach) {
      const km = parseFloat(approach.miss_distance.kilometers);
      const kms = parseFloat(approach.relative_velocity.kilometers_per_second);
      if (closestKm === null || km < closestKm) closestKm = km;
      if (fastestKms === null || kms > fastestKms) fastestKms = kms;
    }
    const maxDiam = a.estimated_diameter.kilometers.estimated_diameter_max;
    if (largestKm === null || maxDiam > largestKm) largestKm = maxDiam;
  }

  if (asteroids.length > 0) {
    const sorted = [...asteroids].sort((a, b) => {
      const aKm = parseFloat(a.close_approach_data[0]?.miss_distance.kilometers ?? "Infinity");
      const bKm = parseFloat(b.close_approach_data[0]?.miss_distance.kilometers ?? "Infinity");
      return aKm - bKm;
    });
    featured = sorted[0] ?? null;
  }

  res.json({
    asteroid_count: asteroids.length,
    hazardous_count: hazardousCount,
    closest_approach_km: closestKm,
    fastest_velocity_kms: fastestKms,
    largest_diameter_km: largestKm,
    featured_asteroid: featured,
  });
});

router.get("/neo/history", async (_req, res): Promise<void> => {
  const results: Array<{
    date: string;
    total_count: number;
    hazardous_count: number;
    avg_velocity_kms: number;
    min_miss_distance_km: number;
    max_diameter_km: number;
  }> = [];

  const chunks: Array<{ start: string; end: string }> = [];
  for (let i = 29; i >= 0; i -= 7) {
    const end = i === 0 ? 0 : i;
    const start = Math.min(i + 6, 29);
    chunks.push({ start: daysAgo(start), end: daysAgo(end) });
  }

  await Promise.all(
    chunks.map(async ({ start, end }) => {
      try {
        const data = await nasaFetch<NasaFeedResponse>("/feed", {
          start_date: start,
          end_date: end,
        });
        for (const [date, asteroids] of Object.entries(data.near_earth_objects)) {
          const hazardous = asteroids.filter((a) => a.is_potentially_hazardous_asteroid).length;
          let totalVelocity = 0;
          let minDist = Infinity;
          let maxDiam = 0;
          for (const a of asteroids) {
            const approach = a.close_approach_data[0];
            if (approach) {
              totalVelocity += parseFloat(approach.relative_velocity.kilometers_per_second);
              const km = parseFloat(approach.miss_distance.kilometers);
              if (km < minDist) minDist = km;
            }
            const diam = a.estimated_diameter.kilometers.estimated_diameter_max;
            if (diam > maxDiam) maxDiam = diam;
          }
          results.push({
            date,
            total_count: asteroids.length,
            hazardous_count: hazardous,
            avg_velocity_kms: asteroids.length > 0 ? totalVelocity / asteroids.length : 0,
            min_miss_distance_km: minDist === Infinity ? 0 : minDist,
            max_diameter_km: maxDiam,
          });
        }
      } catch {
        // skip failed chunks
      }
    }),
  );

  results.sort((a, b) => a.date.localeCompare(b.date));
  res.json(results);
});

router.get("/neo/search", async (req, res): Promise<void> => {
  const { query, hazardous_only } = req.query as { query?: string; hazardous_only?: string };
  if (!query) {
    res.status(400).json({ error: "query is required" });
    return;
  }

  const lowerQuery = query.toLowerCase();
  const data = await nasaFetch<NasaBrowseResponse>("/neo/browse", { page: "0", size: "20" });
  let results = data.near_earth_objects.filter(
    (neo) =>
      neo.name.toLowerCase().includes(lowerQuery) ||
      neo.neo_reference_id.includes(query) ||
      (neo.designation ?? "").toLowerCase().includes(lowerQuery),
  );

  if (hazardous_only === "true") {
    results = results.filter((neo) => neo.is_potentially_hazardous_asteroid);
  }

  res.json(results);
});

router.get("/neo/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = raw ?? "";
  if (!id) {
    res.status(400).json({ error: "id is required" });
    return;
  }

  const data = await nasaFetch<NasaNeo>(`/neo/${id}`);
  res.json(data);
});

export default router;
