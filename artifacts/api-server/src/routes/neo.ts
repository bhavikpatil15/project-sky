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

const AU_KM = 149_597_870.7;
const AU_LUNAR = 389.17;
const KM_MILES = 0.621371;

interface SbdbPhysPar {
  name: string;
  value: string;
  units?: string | null;
}

interface SbdbObject {
  spkid: string;
  fullname: string;
  des: string;
  shortname?: string;
  neo: boolean;
  pha: boolean;
}

interface SbdbResponse {
  object?: SbdbObject;
  phys_par?: SbdbPhysPar[];
  message?: string;
}

interface CadResponse {
  fields?: string[];
  data?: string[][];
  count?: number;
}

function parseMonthName(mon: string): string {
  const m: Record<string, string> = {
    Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
    Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12",
  };
  return m[mon] ?? "01";
}

function parseCadDate(cd: string): { isoDate: string; full: string; epochMs: number } {
  // cd format: "2029-Apr-13 21:46" or "2020-Jan-05 04:06"
  const parts = cd.split(" ");
  const dateParts = (parts[0] ?? "").split("-");
  const year = dateParts[0] ?? "2000";
  const mon = dateParts[1] ?? "Jan";
  const day = dateParts[2] ?? "01";
  const time = parts[1] ?? "00:00";
  const monthNum = parseMonthName(mon);
  const isoDate = `${year}-${monthNum}-${day}`;
  const full = `${year}-${mon}-${day} ${time}`;
  const epochMs = new Date(`${isoDate}T${time}:00Z`).getTime();
  return { isoDate, full, epochMs };
}

function diameterFromH(h: number): { min: number; max: number } {
  const albedoLow = 0.05;
  const albedoHigh = 0.5;
  const maxKm = (1329 / Math.sqrt(albedoLow)) * Math.pow(10, -h / 5);
  const minKm = (1329 / Math.sqrt(albedoHigh)) * Math.pow(10, -h / 5);
  return { min: minKm, max: maxKm };
}

function buildNeoFromSbdb(obj: SbdbObject, physPar: SbdbPhysPar[], cadData: string[][], cadFields: string[]): NasaNeo {
  const hParam = physPar.find((p) => p.name === "H");
  const dParam = physPar.find((p) => p.name === "diameter");
  const hVal = hParam ? parseFloat(hParam.value) : 20;

  let diamKm: { min: number; max: number };
  if (dParam) {
    const d = parseFloat(dParam.value);
    diamKm = { min: d * 0.8, max: d * 1.2 };
  } else {
    diamKm = diameterFromH(hVal);
  }

  const fi = (name: string) => cadFields.indexOf(name);

  const closeApproaches = cadData.slice(0, 5).map((row) => {
    const cd = row[fi("cd")] ?? "";
    const dist = parseFloat(row[fi("dist")] ?? "0");
    const vRel = parseFloat(row[fi("v_rel")] ?? "0");
    const { isoDate, full, epochMs } = parseCadDate(cd);
    const distKm = dist * AU_KM;
    const distLunar = dist * AU_LUNAR;
    const distMiles = distKm * KM_MILES;
    const vKmh = vRel * 3600;
    const vMph = vKmh * KM_MILES;
    return {
      close_approach_date: isoDate,
      close_approach_date_full: full,
      epoch_date_close_approach: epochMs,
      relative_velocity: {
        kilometers_per_second: vRel.toFixed(10),
        kilometers_per_hour: vKmh.toFixed(10),
        miles_per_hour: vMph.toFixed(10),
      },
      miss_distance: {
        astronomical: dist.toFixed(10),
        lunar: distLunar.toFixed(10),
        kilometers: distKm.toFixed(10),
        miles: distMiles.toFixed(10),
      },
      orbiting_body: "Earth",
    };
  });

  const spkid = obj.spkid;
  const name = obj.shortname ?? obj.fullname;
  const designation = obj.des;

  return {
    id: spkid,
    neo_reference_id: spkid,
    name,
    name_limited: obj.shortname ?? name,
    designation,
    nasa_jpl_url: `https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=${spkid}`,
    absolute_magnitude_h: hVal,
    estimated_diameter: {
      kilometers: { estimated_diameter_min: diamKm.min, estimated_diameter_max: diamKm.max },
      meters: { estimated_diameter_min: diamKm.min * 1000, estimated_diameter_max: diamKm.max * 1000 },
      miles: { estimated_diameter_min: diamKm.min * KM_MILES, estimated_diameter_max: diamKm.max * KM_MILES },
      feet: { estimated_diameter_min: diamKm.min * 3280.84, estimated_diameter_max: diamKm.max * 3280.84 },
    },
    is_potentially_hazardous_asteroid: !!obj.pha,
    is_sentry_object: false,
    close_approach_data: closeApproaches,
  };
}

router.get("/neo/search", async (req, res): Promise<void> => {
  const { query, hazardous_only } = req.query as { query?: string; hazardous_only?: string };
  if (!query || query.trim() === "") {
    res.status(400).json({ error: "query is required" });
    return;
  }

  const q = query.trim();
  let result: NasaNeo | null = null;

  try {
    const [sbdbRes, today] = await Promise.all([
      fetch(`https://ssd-api.jpl.nasa.gov/sbdb.api?sstr=${encodeURIComponent(q)}&neo=1&phys-par=1`),
      Promise.resolve(todayStr()),
    ]);

    if (sbdbRes.ok) {
      const sbdbData = (await sbdbRes.json()) as SbdbResponse;
      if (sbdbData.object?.des) {
        const des = sbdbData.object.des;
        const dateMin = today;
        const dateMax = new Date(Date.now() + 10 * 365.25 * 86400 * 1000).toISOString().slice(0, 10);
        const cadRes = await fetch(
          `https://ssd-api.jpl.nasa.gov/cad.api?des=${encodeURIComponent(des)}&date-min=${dateMin}&date-max=${dateMax}&dist-max=0.5&sort=dist&limit=5`,
        );
        let cadData: string[][] = [];
        let cadFields: string[] = [];
        if (cadRes.ok) {
          const cad = (await cadRes.json()) as CadResponse;
          cadData = cad.data ?? [];
          cadFields = cad.fields ?? [];
        }
        result = buildNeoFromSbdb(sbdbData.object, sbdbData.phys_par ?? [], cadData, cadFields);
      }
    }
  } catch {
    // SBDB/CAD unavailable
  }

  if (!result) {
    res.json([]);
    return;
  }

  const results = [result];
  const filtered =
    hazardous_only === "true"
      ? results.filter((neo) => neo.is_potentially_hazardous_asteroid)
      : results;

  res.json(filtered);
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
