export function buildStrudelCode(procText, opts = {}) {
    const {
        volume = 0.8,
        tempo = 1.0,
        reverbOn = false,
        filterAmt = 0.2,
        bassOn = true,
        arpOn = true,
        drumsOn = true,
        drums2On = true
    } = opts;

    let s = String(procText || "")
        .replaceAll('<volume>', Number(volume).toFixed(2))
        .replaceAll('<tempo>', Number(tempo).toFixed(2))
        .replaceAll('<reverb_on>', reverbOn ? 'room 0.3' : '')
        .replaceAll('<filter>', Number(filterAmt).toFixed(2));

    if (!/all\s*\(\s*x\s*=>\s*x\.log\s*\(\s*\)\s*\)/.test(s)) {
        s += '\nall(x => x.log())';
    }

    const baseCps = 140 / 60 / 4;
    s += `\nsetcps(${baseCps.toFixed(6)} * ${Number(tempo).toFixed(3)})`;
    s += `\nall(x => x.gain(${Number(volume).toFixed(3)}))`;
    s += `\nall(x => x.room(${reverbOn ? '0.30' : '0'}))`;

    const minCutoff = 400;
    const maxCutoff = 8000;
    const cutoff = Math.round(minCutoff + (1 - filterAmt) * (maxCutoff - minCutoff));
    s += `\nall(x => x.lpf(${cutoff}))`;

    if (!bassOn) {
        s = s.replace("bassline:", "bassline: all(x => x.gain(0))");
    }
    if (!arpOn) {
        s = s.replace("main_arp:", "main_arp: all(x => x.gain(0))");
    }
    if (!drumsOn) {
        s = s.replace("drums:", "drums: all(x => x.gain(0))");
    }
    if (!drums2On) {
        s = s.replace("drums2:", "drums2: all(x => x.gain(0))");
    }

    return s;
}
