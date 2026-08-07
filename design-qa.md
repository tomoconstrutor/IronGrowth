# Design QA

## Visual target

- REDLINE scrapbook treatment and the user's accepted IronGrowth visual direction.
- Remove the excluded reference image entirely.
- Distribute the remaining archive across `HOJE`, `PLANO`, and `REGISTO`.
- Viewports: `390x844` and `1440x900`.

## Checks completed

- Captured all three views at both target viewports with Playwright.
- Captured the second archive frame after 12 seconds on mobile and desktop.
- Verified all nine images across the three-frame cycle, stable crops, crossfade, hover pause, focus pause, and reduced-motion behavior.
- Fixed the mobile manifesto overlap and the clipped `BULLETPROOFING` workout title found during comparison.
- Bundled Anton, Inconsolata, and Cormorant Garamond locally after the browser check exposed the external-font failure.
- Final browser pass: zero console errors and zero failed image requests.
- The original REDLINE files are no longer present in `Downloads`; the latest user feedback image and the previously accepted feel were used as the comparison target for this revision.

final result: passed
