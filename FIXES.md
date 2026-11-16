# Fruit Slash 3D — repair notes

## Source fixes
- Removed duplicated and syntactically invalid code in the 3D canvas component.
- Fixed unclosed JSX and nested layout tags in the header and main game page.
- Retained all seven fruit types, bombs, combos, themes, pacing and smoothie recipes.
- Re-enabled strawberry spawning, and improved pointer/touch capture and 3D hit testing.
- Reset combo history cleanly on restart, and synchronize fullscreen state with the browser.
- Made the game layout vertically scrollable on small screens.

## Visual updates
- Organic procedural shapes for apples, oranges, lemons and strawberries.
- More natural fruit surface finishes and brighter, balanced studio lighting.
- Gentler throwing physics, better slicing alignment, and slow-moving background portal.

## Validation
- All TypeScript/TSX source files passed a syntax parse using TypeScript.
- `npm ci --offline` could not run because required npm packages are not cached.
- Run `npm ci && npm run build` in an environment with registry access to validate the full app.
