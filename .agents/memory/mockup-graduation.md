---
name: Mockup graduation gotchas
description: Pitfalls when graduating DESIGN-subagent canvas mockups into the real app.
---

# Mockup graduation gotchas

DESIGN-subagent mockups (in `artifacts/mockup-sandbox/`) can contain invalid React
that renders "fine enough" in the sandbox but silently drops styling.

**Known case:** a mockup used `<style dangerouslySetInlineStyle={{__html: ...}} />`.
The correct prop is `dangerouslySetInnerHTML`. Because the prop name was wrong, the
injected `@import` web font and helper CSS classes never applied — the font silently
fell back to the default sans-serif and border helper classes did nothing.

**Why:** The sandbox shows a browser console warning ("React does not recognize the
`dangerouslySetInlineStyle` prop") but still renders the component, so the bug is
invisible in a screenshot.

**How to apply:** When graduating a mockup, do not trust that its inline `<style>`
block worked. Move web-font `@import`s into the app's global stylesheet (`src/index.css`)
+ `index.html` font links, move keyframes/animations into the app's `@theme`/CSS, and
replace any ad-hoc helper classes with real Tailwind utilities. Check the sandbox
browser console for invalid-prop warnings before copying patterns over.
