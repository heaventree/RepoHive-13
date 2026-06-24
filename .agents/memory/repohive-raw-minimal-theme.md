---
name: RepoHive Raw Minimal theme
description: Tokens and structure for the light marketing reskin.
---

# Raw Minimal theme

The marketing/front-end site uses a light "Raw Minimal" design (graduated from a mockup):
- bg `#FAFAFA` / white sections; text black + gray-500/600; single accent warm orange `#FF5C00` (darker hover `#CC4A00`); hairline borders `#E5E5E5`; strong borders `border-black`; brutalist shadow `shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]`.
- Font: Space Grotesk (loaded globally in `src/index.css`); `font-mono` only for small labels/code/tickers.

**Structure gotchas:**
- Shared shell = `src/components/marketing/{MarketingNav,MarketingFooter,MarketingPage}.tsx` (light). Most static pages compose `MarketingPage` + `FeatureCard`.
- `LandingPage.tsx`, `PricingPage.tsx`, `SignInPage.tsx`, blog/integration-tool/public-project pages have their **own** nav/footer/shell (not MarketingPage) — reskin them inline.
- Shared blog/markdown styling lives in `.prose-blog` in `src/index.css` (used by blog, integration tool, legal pages).
- LandingPage footer is a self-contained black CTA band; the shared MarketingFooter is light.
