// src/strudel/stream-frame.js
const BANDS = 48;

export function computeBandsAndSeries(haps, prevBands, prevSeries, maxPoints = 100) {
    const accum = new Array(BANDS).fill(0);
    let totalEvents = 0;

    for (const h of (haps || [])) {
        const p = h?.params || {};
        let midi = p.midinote ?? p.note ?? null;
        if (!Number.isFinite(midi)) {
            const s = String(p.sample ?? p.s ?? "");
            let hash = 0;
            for (let i = 0; i < s.length; i++) {
                hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
            }
            midi = 36 + (hash % 48);
        }
        const idx = Math.max(0, Math.min(BANDS - 1, Math.floor((midi - 24) / 2)));
        accum[idx] += 1;
        totalEvents += 1;
    }

    const alpha = 0.25;

    let bands;
    if (!Array.isArray(prevBands) || prevBands.length !== BANDS) {
        bands = new Array(BANDS).fill(0);
    } else {
        bands = prevBands.slice();
    }

    if (totalEvents > 0) {
        const sum = accum.reduce((a, b) => a + b, 0) || 1;
        const target = accum.map(v => v / sum);
        bands = target.map((t, i) => {
            const b = bands[i];
            const next = b + alpha * (t - b);
            return Math.max(0, Math.min(1, next));
        });
    } else {
        bands = bands.map(b => b * (1 - alpha));
    }

    let series = Array.isArray(prevSeries) ? prevSeries.slice() : [];
    const prevAmp = series.length ? series[series.length - 1] : 0;
    const ampRaw = totalEvents > 0 ? Math.min(1, totalEvents / 12) : 0;
    let amp;

    if (totalEvents > 0) {
        amp = prevAmp + alpha * (ampRaw - prevAmp);
    } else {
        amp = prevAmp * (1 - alpha);
    }

    amp = Math.max(0, Math.min(1, amp));
    series.push(amp);
    if (series.length > maxPoints) {
        series = series.slice(-maxPoints);
    }

    return { bands, series };
}
