export type PlanId = "free" | "solo" | "studio";

export interface PlanLimits {
  id: PlanId;
  name: string;
  repoCap: number;
  monthlyAdditions: number;
  apiKeys: number;
  preloadedLibrary: boolean;
}

export const PLANS: Record<PlanId, PlanLimits> = {
  free: {
    id: "free",
    name: "Explorer",
    repoCap: 100,
    monthlyAdditions: 999999,
    apiKeys: 0,
    preloadedLibrary: false,
  },
  solo: {
    id: "solo",
    name: "Solo",
    repoCap: 500,
    monthlyAdditions: 100,
    apiKeys: 1,
    preloadedLibrary: true,
  },
  studio: {
    id: "studio",
    name: "Studio",
    repoCap: 5000,
    monthlyAdditions: 500,
    apiKeys: 25,
    preloadedLibrary: true,
  },
};

export const DEFAULT_PLAN: PlanId = "free";

export function isPlanId(value: unknown): value is PlanId {
  return value === "free" || value === "solo" || value === "studio";
}

export function planFor(plan?: string | null): PlanLimits {
  return isPlanId(plan) ? PLANS[plan] : PLANS[DEFAULT_PLAN];
}
