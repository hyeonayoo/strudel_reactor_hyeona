// src/App.js
import './App.css';
import { useEffect, useRef, useState } from "react";
import { StrudelMirror } from '@strudel/codemirror';
import { evalScope } from '@strudel/core';
import { drawPianoroll } from '@strudel/draw';
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

const handleD3Data = (event) => {
    console.log(event.detail);
};

export function ProcAndPlay() {
    if (globalEditor != null && globalEditor.repl.state.started === true) {
        Proc();
        globalEditor.evaluate();
    }
}

export function Proc() {
    let proc_text = document.getElementById('proc').value;

    // token replacements
    let proc_text_replaced = proc_text.replaceAll('<p1_Radio>', ProcessText);
    proc_text_replaced = proc_text_replaced.replaceAll('<volume>', currentVolume.toFixed(2));
    proc_text_replaced = proc_text_replaced.replaceAll('<tempo>', currentTempo.toFixed(2));
    proc_text_replaced = proc_text_replaced.replaceAll('<reverb_on>', currentReverbOn ? 'room 0.3' : '');
    proc_text_replaced = proc_text_replaced.replaceAll('<filter>', currentFilter.toFixed(2));

    ProcessText(proc_text);
    globalEditor.setCode(proc_text_replaced);
}

export function ProcessText(match, ..._args) {
    let replace = "";
    if (document.getElementById('flexRadioDefault2').checked) {
        replace = "_";
    }
    return replace;
}

export default function StrudelDemo() {
    const hasRun = useRef(false);

    // UI state
    const [volume, setVolume] = useState(0.8);
    const [tempo, setTempo] = useState(1.0);
    const [reverbOn, setReverbOn] = useState(false);
    const [filterAmt, setFilterAmt] = useState(0.2);

    // state ¡æ tokens
    const handleVolumeChange = (v) => { currentVolume = v; setVolume(v); };
    const handleTempoChange = (v) => { currentTempo = v; setTempo(v); };
    const handleReverbChange = (on) => { currentReverbOn = on; setReverbOn(on); };
    const handleFilterChange = (v) => { currentFilter = v; setFilterAmt(v); };

    useEffect(() => {
        if (!hasRun.current) {
            document.addEventListener("d3Data", handleD3Data);
            console_monkey_patch();
            hasRun.current = true;

            // init canvas for pianoroll
            const canvas = document.getElementById('roll');
            canvas.width = canvas.width * 2;
            canvas.height = canvas.height * 2;
            const drawContext = canvas.getContext('2d');
            const drawTime = [-2, 2];

            // init Strudel REPL
            globalEditor = new StrudelMirror({
                defaultOutput: webaudioOutput,
                getTime: () => getAudioContext().currentTime,
                transpiler,
                root: document.getElementById('editor'),
                drawTime,
                onDraw: (haps, time) => drawPianoroll({ haps, time, ctx: drawContext, drawTime, fold: 0 }),
                prebake: async () => {
                    initAudioOnFirstClick();
                    const loadModules = evalScope(
                        import('@strudel/core'),
                        import('@strudel/draw'),
                        import('@strudel/mini'),
                        import('@strudel/tonal'),
                        import('@strudel/webaudio'),
                    );
                    await Promise.all([loadModules, registerSynthSounds(), registerSoundfonts()]);
                },
            });

            // initial text
            document.getElementById('proc').value = stranger_tune;
            Proc();
        }
    }, []);

    // transport handlers
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
                                    onProc={handleProc}
                                    onProcPlay={handleProcPlay}
                                    onPlay={handlePlay}
                                    onStop={handleStop}
                                />
                                <ControlPanel
                                    volume={volume}
                                    onVolumeChange={handleVolumeChange}
                                    onProc={handleProc}
                                    tempo={tempo}
                                    onTempoChange={handleTempoChange}
                                    reverbOn={reverbOn}
                                    onReverbChange={handleReverbChange}
                                    filterAmt={filterAmt}
                                    onFilterChange={handleFilterChange}
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
                                <label className="form-check-label" htmlFor="flexRadioDefault1">
                                    p1: ON
                                </label>
                            </div>
                            <div className="form-check">
                                <input className="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault2" onChange={ProcAndPlay} />
                                <label className="form-check-label" htmlFor="flexRadioDefault2">
                                    p1: HUSH
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                <canvas id="roll"></canvas>
            </main>
        </div>
    );
}
