# Stability and navigation pass

User goal: finish the current learning system before adding classes or unrelated features. Every screen must provide clear routes to home, classes, another lesson and the learner profile. Preserve the museum design, existing curriculum, browser-local storage and GitHub Pages delivery.

Observed causes: focused player omits global navigation; lesson stages are not reflected in browser history; dashboard picks the first unfinished lesson rather than the last activity; bookmarking rebuilds the experiment/quiz DOM; quiz responses are not persisted; stored IDs/note types are not fully validated; no explicit completed-collection state; progress is presented as a profile without a clear profile destination.

Implementation:
1. Validate stored/imported state, including lesson sessions and known lesson IDs; persist last activity.
2. Provide a local learning-profile destination (retain old progress URLs), consistent labeled navigation, a lesson selector, position breadcrumbs and browser-history-aware stages.
3. Restore quiz answers and stage on return/reload, keep bookmark actions local to the control, and expose a negative-number control for mobile keyboards.
4. Add explicit collection-complete, empty/search recovery and missing-route guidance. Keep all learning data local and explain persistence.
5. Exercise navigation from each stage, question restoration, bookmarks, keyboard focus, browser back/forward, profile persistence, malformed imports, reduced motion and small/landscape viewports. Run full suite and publish the verified build to existing Port. Pages.

Implemented fixes include all navigation paths above, quiz session validation, duplicate/unknown-record filtering, numeric sign and decimal handling, explicit recovery links, filter reset, and completion guards for direct links to later quiz questions. Correct-answer feedback gets scroll clearance above sticky mobile controls. Import files are type-checked and can be retried after errors.

Validation includes the existing full 12-lesson suite, 9 numerical/state tests, navigation and recovery suites, keyboard/import regressions, and responsive checks at phone/tablet/desktop widths including short landscape viewports. Physical Safari/iOS hardware testing remains outside this environment; no claim of universal bug-free behavior is made.
