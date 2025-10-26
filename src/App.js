import './App.css';
import { useEffect, useRef } from "react";
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

let globalEditor = null;

const handleD3Data = (event) => {
    console.log(event.detail);
};

export function ProcAndPlay() {
    if (globalEditor != null && globalEditor.repl.state.started == true) {
        console.log(globalEditor);
        Proc();
        globalEditor.evaluate();
    }
}

export function Proc() {
    let proc_text = document.getElementById('proc').value;
    let proc_text_replaced = proc_text.replaceAll('<p1_Radio>', ProcessText);
    ProcessText(proc_text);
    globalEditor.setCode(proc_text_replaced);
}

export function ProcessText(match, ...args) {
    let replace = "";
    if (document.getElementById('flexRadioDefault2').checked) {
        replace = "_";
    }
    return replace;
}

export default function StrudelDemo() {
    const hasRun = useRef(false);

    useEffect(() => {
        if (!hasRun.current) {
            document.addEventListener("d3Data", handleD3Data);
            console_monkey_patch();
            hasRun.current = true;

            //Code copied from example: https://codeberg.org/uzu/strudel/src/branch/main/examples/codemirror-repl
            //init canvas
            const canvas = document.getElementById('roll');
            canvas.width = canvas.width * 2;
            canvas.height = canvas.height * 2;
            const drawContext = canvas.getContext('2d');
            const drawTime = [-2, 2]; // time window of drawn haps
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

            document.getElementById('proc').value = stranger_tune;
            Proc();
        }
    }, []);

    // 핸들러(버튼에 직접 연결)
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
                            </section>
                        </div>
                        <div className="col-md-8" style={{ maxHeight: '50vh', overflowY: 'auto' }}>
                            <label htmlFor="exampleFormControlTextarea1" className="form-label">Text to preprocess:</label>
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
