// Count listed entries, using each paper's venue/year rather than year-group headings.
function summarizePublicationYears(cards) {
    const counts = new Map();
    let unknown = 0;
    for (const card of cards) {
        const venue = card.querySelector('strong');
        const matches = (venue ? venue.textContent : '').match(/\b(?:19|20)\d{2}\b/g) || [];
        if (matches.length !== 1) {
            unknown++;
            continue;
        }
        const year = Number(matches[0]);
        counts.set(year, (counts.get(year) || 0) + 1);
    }

    const years = [...counts.keys()].sort((a, b) => a - b);
    const annual = [];
    if (years.length) {
        for (let year = years[0]; year <= years[years.length - 1]; year++) {
            annual.push({ year, count: counts.get(year) || 0 });
        }
    }
    return { total: cards.length, annual, unknown };
}

(function renderPublicationStats() {
    const stats = document.getElementById('publicationStats');
    if (!stats) return;

    const cards = [...document.querySelectorAll('#publications .publication-item')];
    const { total, annual, unknown } = summarizePublicationYears(cards);
    const bars = document.getElementById('publicationBars');
    const range = document.getElementById('publicationYearRange');
    document.getElementById('publicationTotal').textContent = total;
    range.textContent = annual.length ? `${annual[0].year}–${annual[annual.length - 1].year}` : 'No dated entries';
    bars.replaceChildren();
    bars.style.setProperty('--year-count', annual.length + (unknown ? 1 : 0) || 1);

    const maximum = Math.max(1, unknown, ...annual.map(item => item.count));
    const entries = annual.map(item => ({ ...item, label: String(item.year) }));
    if (unknown) entries.push({ label: 'N/A', count: unknown });
    for (const entry of entries) {
        const item = document.createElement('li');
        const latest = annual.length && entry.year === annual[annual.length - 1].year;
        item.className = latest ? 'publication-bar publication-bar-latest' : 'publication-bar';
        const yearLabel = entry.label === 'N/A' ? 'Year not specified' : entry.label;
        item.title = `${yearLabel}: ${entry.count} ${entry.count === 1 ? 'paper' : 'papers'}`;
        item.setAttribute('aria-label', item.title);
        item.style.setProperty('--bar-height', `${entry.count / maximum * 72}px`);
        item.innerHTML = `
            <div class="publication-bar-track" aria-hidden="true">
                <span class="publication-bar-count">${entry.count}</span>
                <span class="publication-bar-fill"></span>
            </div>
            <span class="publication-bar-year" aria-hidden="true">${entry.label}</span>
        `;
        bars.appendChild(item);
    }
    stats.hidden = false;
}());
