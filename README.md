# port.

A mobile-first learning platform for understanding AI, from intuition to scientific reasoning. This initial collection contains 12 original lessons, 3 classes, 6 interactive mathematical experiments and 24 assessments. Advanced material covers chain-rule computation with shared parameters, masked attention, statistical evaluation and neural tangent kernels. It is a starting curriculum, not a complete professional qualification.

## Run locally

Serve this directory over HTTP (ES modules do not work via file://):

```sh
npm start
# http://localhost:4173
```

Python 3 is required for this convenience command. Alternatively use any static HTTP server. Node 22+ runs checks/builds. There are no npm packages to install.

## GitHub Pages

Production address: **https://jayden-ff.github.io/Port./**

This learning platform replaces the former portfolio application in `jayden-ff/Port.`. The source lives on `main`; the static output lives on `gh-pages`. GitHub Pages is configured to deploy `gh-pages / (root)`. There is no market-data backend, portfolio dashboard, finance API or account setup in this site.

```sh
npm test
npm run build
npm run deploy:pages
```

The deployment script runs tests/build, checks out the existing `gh-pages` branch in a temporary worktree, replaces its published files, preserves a custom CNAME if one exists, and makes a normal commit/push. It never force-pushes or rewrites history. Git and GitHub authentication must already be configured; the script stores no credentials. Your source changes should also be committed and pushed to `main`.

For a different static host, upload the contents of `dist/`. All asset references are relative and navigation uses hashes, so repository subpaths work without a base-URL change. A fresh GitHub repository needs a `gh-pages` branch and Pages configured to publish it before using this script.

## Visual identity

The final direction follows the user's museum-dashboard sketch: charcoal surfaces, lavender accents, a sculptural layered marble head, prominent current lesson, exhibit spotlight and numbered classes. Syne provides distinctive display typography, Hanken Grotesk handles body text, and IBM Plex Mono labels the exhibits. Fonts are locally hosted, subset WOFF2 files with accompanying SIL Open Font License texts. The original generated sculpture is a conceptual illustration, not a historical museum artifact. Its optimized transparent WebP is local to the site.

Mobile navigation and a compact current-lesson card prioritize one-handed access. Decorative movement is subtle and stops for system reduced-motion preferences. The desktop sidebar also includes a saved motion setting.

## Included

- Dashboard, searchable/filterable class catalog, class syllabi, lesson player, notebook and progress view.
- Foundations: prediction, vectors, Bayesian inference and gradients.
- Machine learning: least squares, classification, regularization and evaluation.
- Deep learning: neural layers, backpropagation, attention and research reasoning.
- Each lesson has intuition/experiment, technical reading with original references, and two graded questions. Numerical questions include worked explanations. The final research audit is self-assessed, explicitly not automatically graded.
- All lessons are accessible; beginners can follow the sequence and experienced learners can jump ahead.
- Actual calculations for line fitting, ridge shrinkage, gradient descent, sigmoid neurons, Bayes’ rule and softmax attention. Dataset and simplification boundaries are visible in the experiments.
- Local progress and notes, one-time XP, day streak, bookmarking, JSON export/import, and reduced-motion support. System reduced-motion preferences always take precedence. Import merges completions and preserves existing notes.
- Local fonts with their SIL Open Font License files. No external runtime requests, analytics, accounts or API keys. Only reference links leave the site.

## Extend the curriculum

Edit `curriculum.js`:

1. Add a topic to `topics`: unique `id`, `title`, `description`.
2. Add a class to `classes` with its `topicId`, unique `id`, title/short title, number, level, time, description, prerequisite text, color (`mint`, `peach`, `lavender`) and art (`orbit`, `curve`, `network`).
3. Add lessons with the class's `classId` and permanent unique lesson IDs. IDs are storage and route keys; keep them stable after release.
4. A lesson defines its title, subtitle, minutes, intro, task, formula, reading, experiment, two questions and sources. `||` separates reading paragraphs: use Unicode norm bars `‖` for mathematics. Use `choice()` and `number()` for assessments. Numerical tolerances are absolute.
5. Choose an existing experiment or implement an additional case in `mountExperiment()` in `experiments.js`. Numerical helpers live in `core.js`. The generic player is in `app.js`.

Class counts, lesson counts, progress denominators, catalog filtering and topic labels are derived from data. Optional topic promotion copy can be customized on the home page. Levels may be expanded in the filter options when introducing a new level taxonomy.

## Sources and editorial scope

The original instructional text draws on Stanford CS229 notes, *Mathematics for Machine Learning*, *Deep Learning*, and the original attention, calibration and neural tangent kernel papers. Each lesson links to its relevant sources. All six distinct reference URLs returned HTTP 200 during verification. The website is not affiliated with these institutions or authors. This curriculum is not an independently peer-reviewed university course.

## Verification

```sh
npm test
python tests/browser.py
python tests/routes.py
python tests/edge_cases.py
```

Browser checks require Python Playwright and Chromium at `/usr/bin/chromium`, with `npm start` running. `PORT_BASE_URL` selects another served path for the main browser suite. Checks cover four viewport widths, all lessons, answer retries, experiments, notes, bookmarks, persistence, route failures and reduced motion. See `docs/QA.md` for results and limits. Device emulation is not a substitute for a physical iPhone/Android and Safari check.

Progress is browser-local, not authenticated, so XP is motivational and not a credential. Clear browser data and the local record is lost unless exported. There is no cloud sync or service-worker offline installation.
