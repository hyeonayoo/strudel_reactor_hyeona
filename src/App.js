// src/App.js
import './App.css';
import { useEffect, useRef, useState } from "react";
import { StrudelMirror } from '@strudel/codemirror';
import { evalScope } from '@strudel/core';
import { initAudioOnFirstClick } from '@strudel/webaudio';
import { transpiler } from '@strudel/transpiler';
import { getAudioContext, webaudioOutput, registerSynthSounds } from '@strudel/webaudio';
import { registerSoundfonts } from '@strudel/soundfonts';
import { stranger_tune } from './tunes';
import console_monkey_patch from './console-monkey-patch';
import WavePanel from "./components/WavePanel.jsx";
import ControlPanel from "./components/ControlPanel.jsx";

let globalEditor = null;
let currentVolume = 0.8;
let currentTempo = 1.0;
let currentReverbOn = false;
let currentFilter = 0.2;

const BANDS = 48;
let bandPrev = new Array(BANDS).fill(0);

// streaming (time-series)
const MAX_POINTS = 100;
let streamBuf = [];

// re-evaluate only if already started
function evalIfStarted() {
    if (globalEditor && globalEditor.repl?.state?.started === true) {
        globalEditor.evaluate();
    }
}

export function ProcAndPlay() {
    if (globalEditor && globalEditor.repl?.state?.started === true) {
        Proc();
        globalEditor.evaluate();
    }
}

export function Proc() {
    const proc_text = document.getElementById('proc').value;

    let s = proc_text.replaceAll('<p1_Radio>', ProcessText);
    s = s.replaceAll('<volume>', currentVolume.toFixed(2));
    s = s.replaceAll('<tempo>', currentTempo.toFixed(2));
    s = s.replaceAll('<reverb_on>', currentReverbOn ? 'room 0.3' : '');
    s = s.replaceAll('<filter>', currentFilter.toFixed(2));

    if (!/all\s*\(\s*x\s*=>\s*x\.log\s*\(\s*\)\s*\)/.test(s)) {
        s += '\nall(x => x.log())';
    }

    const baseCps = (140 / 60 / 4);
    s += `\nsetcps(${baseCps.toFixed(6)} * ${currentTempo.toFixed(3)})`;
    s += `\nall(x => x.gain(${currentVolume.toFixed(3)}))`;
    s += `\nall(x => x.room(${currentReverbOn ? '0.30' : '0'}))`;

    globalEditor.setCode(s);
}


export function ProcessText() {
    return document.getElementById('flexRadioDefault2').checked ? "_" : "";
}

export default function StrudelDemo() {
    const hasRun = useRef(false);
    const [volume, setVolume] = useState(0.8);
    const [tempo, setTempo] = useState(1.0);
    const [reverbOn, setReverbOn] = useState(false);
    const [filterAmt, setFilterAmt] = useState(0.2);

    // spectrum (fixed 48 bands)
    const [bands, setBands] = useState(Array.from({ length: BANDS }, () => 0));

    // streaming (time series)
    const [series, setSeries] = useState([]);

    const [presetName, setPresetName] = useState('Pattern 1');
    const fileRef = useRef(null);

    // handlers: update global values -> preprocess -> eval if playing
    const handleVolumeChange = (v) => {
        currentVolume = v;
        setVolume(v);
        Proc();
        evalIfStarted();
    };

    const handleTempoChange = (v) => {
        currentTempo = v;
        setTempo(v);
        Proc();
        evalIfStarted();
    };

    const handleReverbChange = (on) => {
        currentReverbOn = on;
        setReverbOn(on);
        Proc();
        evalIfStarted();
    };

    const handleFilterChange = (v) => {
        currentFilter = v;
        setFilterAmt(v);
        Proc();
        evalIfStarted();
    };

    const handleSaveSettings = () => {
        const settings = { volume, tempo, reverbOn, filterAmt, presetName };
        const blob = new Blob([JSON.stringify(settings, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `strudel-settings-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleLoadClick = () => {
        fileRef.current?.click();
    };

    const applySettings = (data) => {
        if (typeof data.volume === 'number') { setVolume(data.volume); currentVolume = data.volume; }
        if (typeof data.tempo === 'number') { setTempo(data.tempo); currentTempo = data.tempo; }
        if (typeof data.reverbOn === 'boolean') { setReverbOn(data.reverbOn); currentReverbOn = data.reverbOn; }
        if (typeof data.filterAmt === 'number') { setFilterAmt(data.filterAmt); currentFilter = data.filterAmt; }
        if (typeof data.presetName === 'string') setPresetName(data.presetName);
        Proc();
        evalIfStarted();
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const parsed = JSON.parse(event.target.result);
                applySettings(parsed);
            } catch {
                alert("Invalid settings file.");
            } finally {
                e.target.value = '';
            }
        };
        reader.readAsText(file);
    };

    useEffect(() => {
        if (hasRun.current) return;
        console_monkey_patch();
        hasRun.current = true;

        globalEditor = new StrudelMirror({
            defaultOutput: webaudioOutput,
            getTime: () => getAudioContext().currentTime,
            transpiler,
            root: document.getElementById('editor'),
            drawTime: [-6, 6],
            onDraw: (haps) => {
                const accum = new Array(BANDS).fill(0);
                let any = false;

                let ampSum = 0;
                let evtCount = 0;

                for (const h of (haps || [])) {
                    const p = h?.params || {};
                    let a = p.postgain ?? p.gain ?? p.amp ?? (p.velocity != null ? p.velocity / 127 : 1);
                    if (!Number.isFinite(a)) a = 0;
                    a = Math.max(0, Math.min(1.5, a));

                    let midi = p.midinote ?? p.note ?? null;
                    if (!Number.isFinite(midi)) {
                        const s = String(p.sample ?? p.s ?? "");
                        let hash = 0;
                        for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
                        midi = 36 + (hash % 48);
                    }
                    const idx = Math.max(0, Math.min(BANDS - 1, Math.floor((midi - 24) / 2)));
                    accum[idx] += a * a;

                    any = true;
                    ampSum += a;
                    evtCount++;
                }

                if (!any) {
                    bandPrev = bandPrev.map(v => Math.max(0, v * 0.86));
                    document.dispatchEvent(new CustomEvent("d3Data", { detail: bandPrev.slice() }));

                    const last = streamBuf[streamBuf.length - 1] ?? 0;
                    const decayed = Math.max(0, last * 0.9);
                    streamBuf.push(decayed);
                    if (streamBuf.length > MAX_POINTS) streamBuf = streamBuf.slice(-MAX_POINTS);
                    document.dispatchEvent(new CustomEvent("d3Series", { detail: streamBuf.slice() }));
                    return;
                }

                const maxE = Math.max(0.001, Math.max(...accum));
                const target = accum.map(v => Math.min(1, Math.pow(v / maxE, 0.5)));
                const next = target.map((t, i) => {
                    const b = bandPrev[i];
                    const diff = t - b;
                    const rise = 0.34;
                    const fall = 0.09;
                    return b + (diff > 0 ? diff * rise : diff * fall);
                });
                bandPrev = next;
                document.dispatchEvent(new CustomEvent("d3Data", { detail: next }));

                const amp = Math.min(1, (evtCount ? ampSum / evtCount : 0));
                streamBuf.push(amp);
                if (streamBuf.length > MAX_POINTS) streamBuf = streamBuf.slice(-MAX_POINTS);
                document.dispatchEvent(new CustomEvent("d3Series", { detail: streamBuf.slice() }));
            },
            prebake: async () => {
                initAudioOnFirstClick();
                const loadModules = evalScope(
                    import('@strudel/core'),
                    import('@strudel/mini'),
                    import('@strudel/tonal'),
                    import('@strudel/webaudio'),
                );
                await Promise.all([loadModules, registerSynthSounds(), registerSoundfonts()]);
            },
        });

        document.getElementById('proc').value = stranger_tune;
        Proc();
    }, []);

    useEffect(() => {
        const listener = (e) => {
            const d = e.detail;
            if (Array.isArray(d)) setBands(d.slice(0, BANDS));
        };
        const seriesListener = (e) => {
            const d = e.detail;
            if (Array.isArray(d)) setSeries(d);
        };
        document.addEventListener("d3Data", listener);
        document.addEventListener("d3Series", seriesListener);
        return () => {
            document.removeEventListener("d3Data", listener);
            document.removeEventListener("d3Series", seriesListener);
        };
    }, []);

    const handlePlay = () => globalEditor?.evaluate();
    const handleStop = () => globalEditor?.stop();
    const handleProc = () => Proc();
    const handleProcPlay = () => { Proc(); globalEditor?.evaluate(); };

    return (
        <div>
            <h2>Strudel Demo</h2>
            <main>
                <div className="container-fluid">
                    <div className="row">
                        <div className="wrap">
                            <section className="card wave">
                                <WavePanel
                                    data={series}
                                    onProc={handleProc}
                                    onProcPlay={handleProcPlay}
                                    onPlay={handlePlay}
                                    onStop={handleStop}
                                />
                                <ControlPanel
                                    volume={volume}
                                    onVolumeChange={handleVolumeChange}
                                    tempo={tempo}
                                    onTempoChange={handleTempoChange}
                                    reverbOn={reverbOn}
                                    onReverbChange={handleReverbChange}
                                    filterAmt={filterAmt}
                                    onFilterChange={handleFilterChange}
                                    presetName={presetName}
                                    presetOptions={['Pattern 1', 'Pattern 2', 'Pattern 3']}
                                    onPresetChange={setPresetName}
                                    onSave={handleSaveSettings}
                                    onLoad={handleLoadClick}
                                    presetItems={[
                                        { name: 'Pattern 1', data: { volume: 0.8, tempo: 1.0, reverbOn: false, filterAmt: 0.3, presetName: 'Pattern 1' } },
                                        { name: 'Pattern 2', data: { volume: 0.6, tempo: 1.2, reverbOn: true, filterAmt: 0.5, presetName: 'Pattern 2' } },
                                        { name: 'Pattern 3', data: { volume: 1.0, tempo: 0.9, reverbOn: false, filterAmt: 0.2, presetName: 'Pattern 3' } },
                                    ]}
                                />
                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept="application/json"
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                />
                            </section>
                        </div>
                        <div className="col-md-8" style={{ maxHeight: '50vh', overflowY: 'auto' }}>
                            <label htmlFor="proc" className="form-label">Text to preprocess:</label>
                            <textarea className="form-control" rows="15" id="proc"></textarea>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-8" style={{ maxHeight: '50vh', overflowY: 'auto' }}>
                            <div id="editor" />
                            <div id="output" />
                        </div>
                        <div className="col-md-4">
                            <div className="form-check">
                                <input className="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault1" onChange={ProcAndPlay} defaultChecked />
                                <label className="form-check-label" htmlFor="flexRadioDefault1">p1: ON</label>
                            </div>
                            <div className="form-check">
                                <input className="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault2" onChange={ProcAndPlay} />
                                <label className="form-check-label" htmlFor="flexRadioDefault2">p1: HUSH</label>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
