# Design System Specification: The Atmospheric Intelligence Era

## 1. Overview & Creative North Star: "The Sentinel Archive"

This design system is built to transform complex open-source intelligence into a high-fidelity, immersive experience. Our Creative North Star is **"The Sentinel Archive"**—a vision that blends the precision of a command-line interface with the sophisticated depth of high-end editorial design.

We move away from the "flat web" by embracing atmospheric density. The interface should feel like a multi-layered terminal projected onto frosted obsidian. By utilizing intentional asymmetry, we break the rigid corporate grid; cards may overlap slightly, and data densities vary to create a rhythm that guides the eye toward critical intelligence. We do not just display data; we curate an environment of high-stakes authority.

---

## 2. Colors & Surface Architecture

### The Palette
The color logic is rooted in deep space navies and luminous accents. We avoid pure blacks (#000) to maintain a sense of "air" within the dark theme.

*   **Foundation:** `background` (#0b1326) provides a non-void, deep navy base.
*   **Actionable:** `primary` (#adc6ff) and `primary_container` (#4d8eff) drive focus.
*   **Intelligence Indicators:** `tertiary` (#4edea3) for success/health and `error` (#ffb4ab) for critical vulnerabilities.

### The "No-Line" Rule
Traditional 1px solid borders are strictly prohibited for sectioning layouts. Boundaries must be defined through **background shifts**. A sidebar should not be "lined" off; it should simply sit on `surface_container_low` while the main feed rests on `surface`. This creates a seamless, modern flow that feels engineered rather than "boxed in."

### Surface Hierarchy & Nesting
Depth is achieved through the **Tonal Layering Principle**. Treat the UI as a series of nested glass sheets:
1.  **Base Layer:** `surface_dim` (#0b1326)
2.  **Sectional Wrappers:** `surface_container_low` (#131b2e)
3.  **Content Cards:** `surface_container` (#171f33)
4.  **Interactive Elements:** `surface_container_high` (#222a3d)

### The Glass & Gradient Rule
For high-level floating elements (Modals, Popovers, Active Navigation), apply **Glassmorphism**:
*   **Background:** `rgba(15, 23, 42, 0.82)`
*   **Effect:** `backdrop-blur(20px)`
*   **Border:** `1px solid rgba(255, 255, 255, 0.06)`

To provide "soul," use `primary` to `primary_container` radial gradients behind key metrics to simulate a soft terminal glow.

---

## 3. Typography: Editorial Precision

The typography system pairs the aggressive technicality of **Space Grotesk** with the utilitarian clarity of **Inter**.

*   **Display & Headlines (Space Grotesk):** Set with tight tracking (-0.02em to -0.04em) and heavy weights. These should feel like "headers in a dossier"—authoritative and monumental.
*   **Titles & Body (Inter):** The `body-md` (0.875rem) is our workhorse. We use a relaxed line-height (1.6) for the `on_surface_variant` text to ensure high-density data remains readable.
*   **Labels (Space Grotesk):** Use `label-sm` (0.6875rem), forced uppercase, with 0.08em letter spacing. This mimics a terminal’s "status line," providing a technical edge to metadata and tags.

---

## 4. Elevation & Depth

### The Layering Principle
Forget structural lines. If a repository list needs to be separated from a detail view, use a change from `surface_container_lowest` to `surface_container`. The contrast is felt, not seen.

### Ambient Shadows
When an element must float (e.g., a "Kill-Switch" amber button), use a shadow tinted with the `primary` or `on_surface` color:
*   **Shadow:** `0 20px 40px rgba(0, 0, 0, 0.4)`
*   **Opacity:** Keep shadow opacities between 4-8% to maintain a "soft air" feel rather than a heavy drop.

### The "Ghost Border" Fallback
If accessibility requires a container boundary, use the `outline_variant` token at **15% opacity**. Never use a 100% opaque border; it breaks the atmospheric illusion.

---

## 5. Components

### Buttons
*   **Primary:** Solid `primary_container` (#4d8eff). No hard shadow. Soft glow on hover using `surface_tint`.
*   **Ghost:** Transparent background, `outline_variant` (20% opacity) border. Text in `primary`.
*   **Danger (App Killers):** `error_container` (#93000a) background with `on_error_container` text. Use for critical repository deletions.

### Pill Badges (Metadata)
*   **Style:** Rounded-full, `15-20%` background opacity of the status color (e.g., Emerald for success), with a `40%` opacity border of the same hue.
*   **Text:** `label-sm` uppercase.

### Glass Cards
*   **Corner Radius:** `xl` (3rem) for large containers; `DEFAULT` (1rem) for internal data cards.
*   **Treatment:** Apply the `backdrop-blur(20px)` and `surface_variant` color.

### Navigation
*   **Active State:** Pill-shaped `primary` background with `on_primary` text. Use a soft `primary_container` glow behind the pill.

### Input Fields
*   **Base:** `surface_container_highest` background.
*   **Focus:** Transition border to `primary` at 40% opacity. No "halo" rings—only a clean, tonal shift.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use asymmetrical margins to create "Editorial White Space."
*   **Do** place large, low-opacity (20%) radial orbs of Indigo (`#4f46e5`) and Violet (`#7c3aed`) in the background to create atmospheric depth.
*   **Do** use monospace-style labels for all numerical data and timestamps.

### Don’t:
*   **Don't** use dividers or horizontal rules. Use vertical space or surface shifts.
*   **Don't** use pure white (#ffffff) for body text; use `on_surface_variant` (#c2c6d6) to reduce eye strain in dark mode.
*   **Don't** use sharp corners. Everything follows the Roundedness Scale, prioritizing `xl` for top-level glass containers.
*   **Don't** use standard "Material Design" blue. Only use the specified blue-to-indigo gradient for the logo tile to maintain the signature identity.