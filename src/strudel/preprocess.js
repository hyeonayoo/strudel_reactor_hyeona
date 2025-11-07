export function buildStrudelCode(procText, { volume, tempo, reverbOn, filterAmt }) {
    let s = String(procText || "")
        .replaceAll('<p1_Radio>', () =>
            document.getElementById('flexRadioDefault2')?.checked ? '_' : ''
        )
        .replaceAll('<volume>', Number(volume).toFixed(2))
        .replaceAll('<tempo>', Number(tempo).toFixed(2))
        .replaceAll('<reverb_on>', reverbOn ? 'room 0.3' : '')
        .replaceAll('<filter>', Number(filterAmt).toFixed(2));

    if (!/all\s*\(\s*x\s*=>\s*x\.log\s*\(\s*\)\s*\)/.test(s)) {
        s += '\nall(x => x.log())';
    }

    const baseCps = (140 / 60 / 4);
    s += `\nsetcps(${baseCps.toFixed(6)} * ${Number(tempo).toFixed(3)})`;
    s += `\nall(x => x.gain(${Number(volume).toFixed(3)}))`;
    s += `\nall(x => x.room(${reverbOn ? '0.30' : '0'}))`;

    return s;
}
