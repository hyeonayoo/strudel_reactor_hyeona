const BANDS = 48;

export function computeBandsAndSeries(haps, prevBands, prevSeries, maxPoints = 100) {
    const accum = new Array(BANDS).fill(0);
    let any = false, ampSum = 0, evtCount = 0;

    for (const h of (haps || [])) {
        const p = h?.params || {};
        let a = p.postgain ?? p.gain ?? p.amp ?? (p.velocity != null ? p.velocity / 127 : 1);
        if (!Number.isFinite(a)) a = 0;
        a = Math.max(0, Math.min(1.5, a));

        let midi = p.midinote ?? p.note ?? null;
        if (!Number.isFinite(midi)) {
            const s = String(p.sample ?? p.s ?? "");
            let hash = 0; for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
            midi = 36 + (hash % 48);
        }
        const idx = Math.max(0, Math.min(BANDS - 1, Math.floor((midi - 24) / 2)));
        accum[idx] += a * a;

        any = true; ampSum += a; evtCount++;
    }

    let nextBands;
    if (!any) {
        nextBands = prevBands.map(v => Math.max(0, v * 0.86));
    } else {
        const maxE = Math.max(0.001, Math.max(...accum));
        const target = accum.map(v => Math.min(1, Math.pow(v / maxE, 0.5)));
        nextBands = target.map((t, i) => {
            const b = prevBands[i]; const diff = t - b;
            const rise = 0.34, fall = 0.09;
            return b + (diff > 0 ? diff * rise : diff * fall);
        });
    }

    let series = prevSeries.slice();
    const amp = any ? Math.min(1, (evtCount ? ampSum / evtCount : 0)) : Math.max(0, (series.at(-1) ?? 0) * 0.9);
    series.push(amp); if (series.length > maxPoints) series = series.slice(-maxPoints);

    return { bands: nextBands, series };
}
