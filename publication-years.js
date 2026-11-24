// Keep the source list readable without JavaScript; enhance it after page load.
function groupPublicationsByYear(cards) {
    const groups = new Map();
    for (const card of cards) {
        const venue = card.querySelector('strong');
        const years = (venue ? venue.textContent : '').match(/\b(?:19|20)\d{2}\b/g) || [];
        const year = years.length === 1 ? Number(years[0]) : null;
        if (!groups.has(year)) groups.set(year, []);
        groups.get(year).push(card);
    }
    return [...groups].sort(([a], [b]) => (b || 0) - (a || 0));
}

(function createPublicationYearGroups() {
    const section = document.getElementById('publications');
    if (!section || section.querySelector('.publication-years')) return;
    const cards = [...section.querySelectorAll('.publication-item')];
    if (!cards.length) return;
    const groups = groupPublicationsByYear(cards);
    const years = document.createElement('div');
    years.className = 'publication-years';
    years.id = 'publicationYears';

    for (const [year, papers] of groups) {
        const details = document.createElement('details');
        details.className = 'publication-year';
        details.dataset.year = year === null ? 'unknown' : String(year);
        details.open = year === groups[0][0];
        const summary = document.createElement('summary');
        summary.innerHTML = `
            <i class="fas fa-calendar-days" aria-hidden="true"></i>
            <span class="publication-year-label">${year === null ? 'Other' : year}</span>
            <span class="publication-year-count">${papers.length} ${papers.length === 1 ? 'paper' : 'papers'}</span>
            <span class="publication-year-chevron" aria-hidden="true"></span>
        `;
        const content = document.createElement('div');
        content.className = 'publication-year-papers';
        content.append(...papers);
        details.append(summary, content);
        years.appendChild(details);
    }

    // Replace only the legacy dividers, preserving all paper nodes and links.
    for (const icon of section.querySelectorAll(':scope > i.fa-calendar-days')) {
        const label = icon.nextElementSibling;
        if (label && label.tagName === 'STRONG') label.remove();
        icon.remove();
    }
    const controls = document.createElement('div');
    controls.className = 'publication-year-controls';
    controls.setAttribute('role', 'group');
    controls.setAttribute('aria-label', 'Publication year controls');
    for (const [label, open] of [['Expand all', true], ['Collapse all', false]]) {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = label;
        button.dataset.action = open ? 'expand' : 'collapse';
        button.setAttribute('aria-controls', years.id);
        button.addEventListener('click', () => {
            for (const details of years.children) details.open = open;
        });
        controls.appendChild(button);
    }
    section.append(controls, years);
}());
