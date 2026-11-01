# port. implementation plan

Goal: a mobile-first, static AI learning platform with an expandable topic → class → lesson structure.
Architecture: dependency-free ES modules, local progress, hash routes, semantic HTML and CSS/SVG animation. Separate curriculum, mathematical models, storage, experiments and UI modules. Relative URLs work on any GitHub Pages repository path. Initial isolation was superseded by the user’s explicit instruction to fully replace the portfolio in /workspace/Port. with this learning platform.

Design: ivory background, forest-green typography, lime highlights, oversized editorial headings, geometric interactive illustrations. Dashboard, searchable class catalog, class syllabus, focused lesson player, notebook and progress views. Mobile bottom navigation; sticky lesson actions; reduced-motion support.

1. Test and implement numerical models, idempotent completion, schema-safe storage and curriculum integrity.
2. Write 12 original lessons across mathematical foundations, machine learning, and deep learning; include source links, progressive technical reading, experiments, and two assessments each. All lessons accessible for experienced learners.
3. Implement dashboard, searchable catalog, class/lesson routes, local notebook, review mode and accessible controls. Persist lesson steps and completion without awarding duplicate XP.
4. Validate at 360, 390, 768 and 1440 pixels; complete lessons, change experiments, reload state, test keyboard/reduced motion, inspect screenshots and measure browser animation frames. Record hardware-testing limitations.
5. Package static site, source and GitHub Pages workflow with deployment/content-extension documentation. Deploy into the existing Port. repository and Pages site, as subsequently requested by the user.

Review focus: invalid hashes; unavailable/corrupt storage; duplicate completion; math stability; small-screen overflow and touch targets.

Implementation record: all five stages implemented. Added topic data and catalog filtering, local-font assets and a GitHub Actions Pages workflow. Review findings were repaired with targeted regression checks. Final validation results are recorded in QA.md. Source and static distribution are packaged separately for handoff.
