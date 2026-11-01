# Verification record

Verified 2026-11-01 in managed Linux with headless Chromium. The initial release is intentionally a static app with no runtime network dependency.

## Automated checks

- Seven Node tests: stable sigmoid/softmax, convergence/divergence, Bayesian base rates, idempotent completion, corrupt storage recovery, curriculum/assessment integrity, validated imported lesson steps.
- Full browser lesson suite: all 12 lessons, both assessment questions, wrong-answer feedback/retry, experiment slider updates, saved notes/bookmarks, completion and reload persistence.
- Layouts checked at 360, 390, 768 and 1440 CSS pixels; no horizontal overflow in dashboard, catalog, syllabus, notebook, progress or attention experiment.
- Browser suite also ran on the production `dist/` subpath, exercising the relative asset paths required by project GitHub Pages sites.
- Direct root navigation, unknown routes and inherited-object-name routes checked.
- Keyboard skip link and import button, JSON import/export, resume after reload, duplicate-XP prevention, corrupt fractional steps, escaped numeric input, empty-answer rejection after bookmarking, and disabled browser storage checked.
- Native reduced-motion and saved motion setting verified. JavaScript console errors collected by the browser suites.

## Motion and visual inspection

Inspected desktop dashboard, mobile dashboard, mobile attention lesson and completion screenshots. Motion uses CSS transforms/opacity for decoration, and short transitions for computed experiment displays. No JavaScript animation loop is required by the application. The SVG loss plot updates only on input.

A 120-frame desktop requestAnimationFrame sample measured a median interval of 16.7 ms, maximum 16.8 ms and zero intervals above 34 ms. A separate 180-frame sample at 390 px with Chromium's simulated 4× CPU slowdown measured the same median and maximum, with zero intervals above 34 ms. These are headless scheduling measurements, not a guarantee of rendering throughput or battery performance on physical phones. Safari, physical iPhone/Android, screen readers and high-refresh displays have not been independently tested.

## References

All six distinct source URLs returned HTTP 200: Stanford CS229 notes, Mathematics for Machine Learning, Deep Learning, and arXiv pages for Attention Is All You Need, calibration and neural tangent kernels. Links were checked with normal TLS verification. Lesson prose and calculations are original educational summaries, not institutional endorsements or peer-reviewed course material.

## Review fixes

An independent code review identified and prompted repairs for empty-hash navigation, inherited route keys, the skip link, keyboard import, fractional imported steps, mathematical norm delimiters, close-link labeling, escaped numeric input and blank numeric answers after rerender. Curriculum counts and topic labels now derive from data rather than fixed denominators.

## Delivery boundary

The user subsequently authorized replacing the former portfolio at jayden-ff/Port. with this learning platform. The source and gh-pages output were replaced through normal commits, preserving Git history. See README.md for the production address and deployment procedure.

## Museum redesign checks

The final dark/lavender design follows the user-supplied sketch. New local fonts, sculpture WebP and SVG artwork were visually checked on desktop and mobile. Full lesson flow, Node suite, route regressions, imports and keyboard checks passed after the redesign. Mobile hero text bounds were explicitly measured to prevent clipped titles; the current lesson CTA is above the bottom navigation at 390 × 844. New animations are tested against reduced-motion preferences.

Responsive review repairs also passed: full title at 601 px, scrollable sidebar in 844 × 390 landscape, and an accessible mobile motion toggle.

## Publication verified

GitHub Pages successfully built gh-pages commit 4ac23e41b75cdfb696d48ab2e4dacc08c2888731 at https://jayden-ff.github.io/Port./. The endpoint returned HTTP 200. Eleven public HTML/code/font/image resources were SHA-256 matched to the tested build. The published tree contains only the learning app assets; the portfolio source and published assets have been removed.

Public-resource rendering passed the mobile dashboard, font and sculpture loading, lesson experiment, and correct-answer feedback with no JavaScript errors. Chromium did not trust the managed proxy certificate directly, so this browser check used unchanged public responses fetched through Python urllib with normal system TLS verification. Physical-device and Safari limits remain as described above.
