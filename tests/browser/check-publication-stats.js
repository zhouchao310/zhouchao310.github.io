(async () => {
    const results = [];
    const assert = (value, message) => { if (!value) throw new Error(message); };
    for (const width of [1920, 1440, 768, 390, 320, 278]) {
        const frame = document.createElement('iframe');
        frame.style.cssText = `position:absolute;left:-10000px;top:0;width:${width}px;height:900px;border:0;`;
        frame.setAttribute('aria-hidden', 'true');
        try {
            const loaded = new Promise((resolve, reject) => {
                const timer = setTimeout(() => reject(new Error('Frame load timeout')), 15000);
                frame.onload = () => { clearTimeout(timer); resolve(); };
                frame.onerror = () => { clearTimeout(timer); reject(new Error('Frame failed')); };
            });
            frame.src = `${location.origin}/?stats-test=${width}`;
            document.body.appendChild(frame);
            await loaded;
            const d = frame.contentDocument;
            await Promise.all([...d.querySelectorAll('link[rel="stylesheet"]')]
                .filter(link => new URL(link.href).origin === location.origin)
                .map(link => new Promise((resolve, reject) => {
                    link.onload = resolve;
                    link.onerror = () => reject(new Error('Stylesheet failed'));
                    link.href = `${new URL(link.href).pathname}?test=${Date.now()}`;
                })));
            const cards = [...d.querySelectorAll('#publications .publication-item')];
            const stats = d.getElementById('publicationStats');
            const bars = [...d.querySelectorAll('.publication-bar')];
            assert(!stats.hidden, `Stats hidden at ${width}`);
            assert(Number(d.getElementById('publicationTotal').textContent) === cards.length, 'Total mismatch');
            const counts = {};
            cards.forEach(card => {
                const year = card.querySelector('strong').textContent.match(/\b(?:19|20)\d{2}\b/)[0];
                counts[year] = (counts[year] || 0) + 1;
            });
            for (const bar of bars) {
                const year = bar.querySelector('.publication-bar-year').textContent;
                assert(Number(bar.querySelector('.publication-bar-count').textContent) === (counts[year] || 0), `Wrong count for ${year}`);
            }
            assert(d.documentElement.scrollWidth <= width + 1, `Page overflow at ${width}`);
            assert(width > 768 || frame.contentWindow.getComputedStyle(d.querySelector('.container')).flexDirection === 'column', 'Mobile sidebar and content are still side by side');
            const h = d.querySelector('.publications-header h2').getBoundingClientRect();
            const s = stats.getBoundingClientRect();
            const header = d.querySelector('.publications-header').getBoundingClientRect();
            assert(s.left >= header.left - 1 && s.right <= header.right + 1, `Stats overflow at ${width}`);
            assert(width < 1600 || s.left >= h.right, 'Desktop stats not right of heading');
            assert(width > 768 || s.top >= h.bottom, 'Mobile stats not below heading');
            const scroll = d.querySelector('.publication-chart-scroll');
            scroll.scrollLeft = scroll.scrollWidth;
            assert(scroll.scrollWidth <= scroll.clientWidth || scroll.scrollLeft > 0, 'Chart cannot scroll');
            results.push({ width, total: cards.length, years: bars.length, statsWidth: s.width,
                documentOverflow: d.documentElement.scrollWidth > width + 1, horizontalChartScroll: scroll.scrollWidth > scroll.clientWidth });
        } finally {
            frame.remove();
        }
    }
    return { passed: true, results };
})();
