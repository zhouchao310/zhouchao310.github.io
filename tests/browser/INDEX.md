# Publication statistics tests

- Unit/counting tests: `node tests/publication-stats.test.cjs` from the repository root.
- Browser regression: serve the repository over local HTTP, open the homepage with `myflicker-browser`, then run `myflicker-browser evaluate --tab-id <tabId> --expression-file <absolute-path>/tests/browser/check-publication-stats.js --timeout-ms 90000`.

| Case | Page | Script |
| --- | --- | --- |
| Counts match publication cards; zero-count years; desktop right-aligned summary; mobile stacking; chart scrolling; no page overflow at 1920, 1440, 768, 390, 320 and 278px | `/` | `check-publication-stats.js` |
| Year folding: latest year open by default, per-year counts, expand/collapse all, independent toggling, unchanged paper content and chart | `/` | `check-publication-stats.js` |

The chart counts listed publication cards (not external scholar totals) and extracts the year from each card's venue line. Add publications using the existing card structure and a single four-digit year; the chart updates on the next page load. Unknown or ambiguous years appear as N/A, rather than being silently omitted from the total.
