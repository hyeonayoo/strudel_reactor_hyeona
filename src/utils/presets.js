// src/utils/presets.js

// Download settings as JSON file
export function downloadSettings(filename, settings) {
    const safe = sanitizeSettings(settings);
    const blob = new Blob([JSON.stringify(safe, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || "strudel-settings.json";
    a.click();
    URL.revokeObjectURL(url);
}

// Read a File object as text
export function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = () => resolve(String(fr.result || ""));
        fr.onerror = reject;
        fr.readAsText(file);
    });
}

// String | object -> normalized settings object
export function normalizeSettings(input) {
    let obj = input;
    if (typeof input === "string") {
        obj = JSON.parse(input);
    }
    const out = sanitizeSettings(obj);
    return out;
}

// clamp helpers
const clamp01 = (v) => Math.max(0, Math.min(1, Number(v)));
const asBool = (v) => (typeof v === "boolean" ? v : String(v).toLowerCase() === "true");

// ensure shape & ranges
function sanitizeSettings(obj = {}) {
    const volume = Number.isFinite(obj.volume) ? clamp01(obj.volume) : 0.8;
    const tempo = Number.isFinite(obj.tempo) ? obj.tempo : 1.0;        // allow >1
    const reverbOn = asBool(obj.reverbOn ?? false);
    const filterAmt = Number.isFinite(obj.filterAmt) ? clamp01(obj.filterAmt) : 0.2;
    const presetName = typeof obj.presetName === "string" ? obj.presetName : "";

    return { volume, tempo, reverbOn, filterAmt, presetName };
}
