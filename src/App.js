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
import useD3Series from './hooks/useD3Series.js';
import { buildStrudelCode } from './strudel/preprocess.js';
import { computeBandsAndSeries } from './strudel/stream-frame.js';

let globalEditor = null;
let currentVolume = 0.8;
let currentTempo = 1.0;
let currentReverbOn = false;
let currentFilter = 0.2;

const BANDS = 48;
let bandPrev = new Array(BANDS).fill(0);
const MAX_POINTS = 100;
let streamBuf = [];

function evalIfStarted() {
    if (globalEditor?.repl?.state?.started === true) {
        globalEditor.evaluate();
    }
}

export function ProcAndPlay() {
    if (globalEditor?.repl?.state?.started === true) {
        Proc();
        globalEditor.evaluate();
    }
}

export function Proc() {
    const procText = document.getElementById('proc').value;
    const code = buildStrudelCode(procText, {
        volume: currentVolume,
        tempo: currentTempo,
        reverbOn: currentReverbOn,
        filterAmt: currentFilter
    });
    globalEditor.setCode(code);
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

    const { series } = useD3Series(BANDS);
    const [presetName, setPresetName] = useState('Pattern 1');

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
                const { bands: nextBands, series: nextSeries } =
                    computeBandsAndSeries(haps, bandPrev, streamBuf, MAX_POINTS);
                bandPrev = nextBands;
                streamBuf = nextSeries;
                document.dispatchEvent(new CustomEvent("d3Data", { detail: nextBands }));
                document.dispatchEvent(new CustomEvent("d3Series", { detail: nextSeries }));
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
                                    presetItems={[
                                        { name: 'Pattern 1', data: { volume: 0.8, tempo: 1.0, reverbOn: false, filterAmt: 0.3, presetName: 'Pattern 1' } },
                                        { name: 'Pattern 2', data: { volume: 0.6, tempo: 1.2, reverbOn: true, filterAmt: 0.5, presetName: 'Pattern 2' } },
                                        { name: 'Pattern 3', data: { volume: 1.0, tempo: 0.9, reverbOn: false, filterAmt: 0.2, presetName: 'Pattern 3' } },
                                    ]}
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
