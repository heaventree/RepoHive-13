// Central plan/tier definitions. This is the single source of truth for what
// each subscription plan allows. Billing (Stripe) is deferred — these limits are
// enforced purely from the `plan` stored on a tenant's subscription row, which
// for now is set via the dev plan-switch endpoint and later by a Stripe webhook.
//
// Limits mirror the public pricing page (PricingPage.tsx):
//   - repoCap          max user-added repos kept in the library at once
//   - monthlyAdditions max repos a tenant may add per calendar month (cost guard
//                      on AI analysis + embeddings; curbs churn/re-add abuse)
//   - apiKeys          max simultaneous API keys for IDE integration
//   - preloadedLibrary whether the App Killers library is copied in on activation
//
// Preloaded (source='library') repos never count against repoCap or
// monthlyAdditions — only repos a tenant adds themselves (source='user') do.

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
    repoCap: 25,
    monthlyAdditions: 25,
    apiKeys: 0,
    preloadedLibrary: false,
  },
  solo: {
    id: "solo",
    name: "Solo",
    repoCap: 1000,
    monthlyAdditions: 1000,
    apiKeys: 1,
    preloadedLibrary: true,
  },
  studio: {
    id: "studio",
    name: "Studio",
    repoCap: 10000,
    monthlyAdditions: 10000,
    apiKeys: 25,
    preloadedLibrary: true,
  },
};

export const DEFAULT_PLAN: PlanId = "free";

export function isPlanId(value: unknown): value is PlanId {
  return value === "free" || value === "solo" || value === "studio";
}

// Resolve a stored plan string to its limits, falling back to the free plan for
// unknown/missing values so enforcement always has a concrete set of limits.
export function planFor(plan?: string | null): PlanLimits {
  return isPlanId(plan) ? PLANS[plan] : PLANS[DEFAULT_PLAN];
}
