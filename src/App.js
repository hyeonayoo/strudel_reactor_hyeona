// src/App.js
import "./App.css";
import { useEffect, useState } from "react";
import WavePanel from "./components/WavePanel.jsx";
import ControlPanel from "./components/ControlPanel.jsx";
import useD3Series from "./hooks/useD3Series.js";
import useStrudelEngine from "./hooks/useStrudelEngine.js";
import { buildStrudelCode } from "./strudel/preprocess.js";
import { stranger_tune } from "./tunes";
import console_monkey_patch from "./console-monkey-patch";

const BANDS = 48;

export default function App() {
    const [volume, setVolume] = useState(0.8);
    const [tempo, setTempo] = useState(1.0);
    const [reverbOn, setReverbOn] = useState(false);
    const [filterAmt, setFilterAmt] = useState(0.2);

    const [bassOn, setBassOn] = useState(true);
    const [arpOn, setArpOn] = useState(true);
    const [drumsOn, setDrumsOn] = useState(true);
    const [drums2On, setDrums2On] = useState(true);

    const [procText, setProcText] = useState("");
    const [presetName, setPresetName] = useState("Pattern 1");

    const { series } = useD3Series(BANDS);
    const { setCode, evaluate, evaluateIfStarted, stop } = useStrudelEngine();

    useEffect(() => {
        console_monkey_patch();
        setProcText(stranger_tune);

        const initialCode = buildStrudelCode(stranger_tune, {
            volume: 0.8,
            tempo: 1.0,
            reverbOn: false,
            filterAmt: 0.2,
            bassOn: true,
            arpOn: true,
            drumsOn: true,
            drums2On: true,
        });
        setCode(initialCode);
    }, [setCode]);

    const runProc = (overrides = {}) => {
        const options = {
            volume,
            tempo,
            reverbOn,
            filterAmt,
            bassOn,
            arpOn,
            drumsOn,
            drums2On,
            ...overrides,
        };

        const code = buildStrudelCode(procText, options);
        setCode(code);
        evaluateIfStarted();
    };

    const handleVolumeChange = (v) => {
        setVolume(v);
        runProc({ volume: v });
    };

    const handleTempoChange = (v) => {
        setTempo(v);
        runProc({ tempo: v });
    };

    const handleReverbChange = (on) => {
        setReverbOn(on);
        runProc({ reverbOn: on });
    };

    const handleFilterChange = (v) => {
        setFilterAmt(v);
        runProc({ filterAmt: v });
    };

    const handleBassChange = (on) => {
        setBassOn(on);
        runProc({ bassOn: on });
    };

    const handleArpChange = (on) => {
        setArpOn(on);
        runProc({ arpOn: on });
    };

    const handleDrumsChange = (on) => {
        setDrumsOn(on);
        runProc({ drumsOn: on });
    };

    const handleDrums2Change = (on) => {
        setDrums2On(on);
        runProc({ drums2On: on });
    };

    const handlePlay = () => {
        runProc();
        evaluate();
    };

    const handleStop = () => {
        stop();
    };

    const handleProc = () => {
        runProc();
    };

    const handleProcPlay = () => {
        runProc();
        evaluate();
    };

    const handlePresetApply = (data) => {
        const overrides = {};

        if (typeof data.volume === "number") {
            setVolume(data.volume);
            overrides.volume = data.volume;
        }
        if (typeof data.tempo === "number") {
            setTempo(data.tempo);
            overrides.tempo = data.tempo;
        }
        if (typeof data.reverbOn === "boolean") {
            setReverbOn(data.reverbOn);
            overrides.reverbOn = data.reverbOn;
        }
        if (typeof data.filterAmt === "number") {
            setFilterAmt(data.filterAmt);
            overrides.filterAmt = data.filterAmt;
        }
        if (typeof data.presetName === "string") {
            setPresetName(data.presetName);
        }

        if (typeof data.bassOn === "boolean") {
            setBassOn(data.bassOn);
            overrides.bassOn = data.bassOn;
        }
        if (typeof data.arpOn === "boolean") {
            setArpOn(data.arpOn);
            overrides.arpOn = data.arpOn;
        }
        if (typeof data.drumsOn === "boolean") {
            setDrumsOn(data.drumsOn);
            overrides.drumsOn = data.drumsOn;
        }
        if (typeof data.drums2On === "boolean") {
            setDrums2On(data.drums2On);
            overrides.drums2On = data.drums2On;
        }

        runProc(overrides);
    };

    return (
        <div>
            <h2 style={{ color: "#a855f7" }}>Welcome to Strudel</h2>
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
                                    filterAmt={filterAmt}
                                    onFilterChange={handleFilterChange}
                                    reverbOn={reverbOn}
                                    onReverbChange={handleReverbChange}
                                    bassOn={bassOn}
                                    onBassChange={handleBassChange}
                                    arpOn={arpOn}
                                    onArpChange={handleArpChange}
                                    drumsOn={drumsOn}
                                    onDrumsChange={handleDrumsChange}
                                    drums2On={drums2On}
                                    onDrums2Change={handleDrums2Change}
                                    presetName={presetName}
                                    presetOptions={["Pattern 1", "Pattern 2", "Pattern 3"]}
                                    onPresetChange={setPresetName}
                                    presetItems={[
                                        {
                                            name: "Pattern 1",
                                            data: {
                                                volume: 1,
                                                tempo: 1.0,
                                                reverbOn: false,
                                                filterAmt: 0.3,
                                                presetName: "Pattern 1",
                                            },
                                        },
                                        {
                                            name: "Pattern 2",
                                            data: {
                                                volume: 0.6,
                                                tempo: 0.3,
                                                reverbOn: true,
                                                filterAmt: 0.5,
                                                presetName: "Pattern 2",
                                            },
                                        },
                                        {
                                            name: "Pattern 3",
                                            data: {
                                                volume: 0.7,
                                                tempo: 0.5,
                                                reverbOn: false,
                                                filterAmt: 0.2,
                                                presetName: "Pattern 3",
                                            },
                                        },
                                    ]}
                                    onPresetApply={handlePresetApply}
                                />
                            </section>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6" style={{ maxHeight: "50vh", overflowY: "auto" }}>
                            <label htmlFor="proc" className="form-label" style={{ color: "#a855f7" }}>
                                Text to preprocess:
                            </label>
                            <textarea
                                className="form-control"
                                rows="15"
                                id="proc"
                                value={procText}
                                onChange={(e) => setProcText(e.target.value)}
                            />
                        </div>
                        <div className="col-md-6" style={{ maxHeight: "50vh", overflowY: "auto" }}>
                            <div id="editor" />
                            <div id="output" />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
