# Contributing to Ibrahim Tools

Thanks for helping make everyday browser tools more useful. Keep contributions focused on a clear task, explain how the result helps visitors, and preserve the local-processing model.

## Start locally

```sh
git clone https://github.com/Mibrahimwali/tools_ibrahimwali.git
cd tools_ibrahimwali
npm ci
npm run dev
```

Use Node.js 22.x. Open http://127.0.0.1:4175. No API keys are needed.

## Propose a change

For a new tool or a large change, open an issue describing the problem, the input/output, and any important limitations. For a small bug, a focused pull request with reproduction steps is enough.

Use a descriptive branch name and describe the before/after behavior in your pull request. Add screenshots for a visual change and explain how you tested it. Avoid unrelated formatting or dependency changes.

## Add a tool

1. Define the tool in `src/data/extra-tools.ts` with a unique slug, category, useful description, instructions, FAQs, example, limitations, and related tools.
2. Implement the workspace and register it in `src/components/ToolRuntime.tsx`.
3. Add original guidance in `src/data/guides.ts`: when to use it, an example, checks, and limitations. Avoid repeating keyword-heavy filler across pages.
4. Add tests for the behavior and invalid input cases that matter.
5. Update the browser checks, visible catalog counts, social image, and README directory when the tool count changes.
6. Update `CONTENT_DATE` only for actual editorial changes. Review the generated metadata and links.

Keep files and tool inputs local. Do not introduce uploads, tracking, external model calls, or third-party scripts without discussing the change first. Never include real passwords, API keys, private documents, or customer data in fixtures.

## Check your work

```sh
npm run check
npm run lint
npm test
npm run build
npm run test:browser
```

The browser suite requires installed Google Chrome. Check the UI with a keyboard, on a narrow screen, and in both themes. Give every input an accessible label and every failure a useful recovery path. Respect reduced-motion preferences.

Use the project's Prettier formatting. Commit source and `package-lock.json`; exclude dependencies, build output, local environment files, reports, and personal editor state.

## Reporting issues

Include the tool URL, browser, reproduction steps, expected result, and actual result. Use a small, synthetic input. Share sensitive vulnerability details privately using [SECURITY.md](SECURITY.md).

A project license has not yet been selected. Before submitting substantial reusable code, confirm the repository's current licensing terms with the maintainer.
