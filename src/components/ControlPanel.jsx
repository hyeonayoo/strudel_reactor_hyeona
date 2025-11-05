// src/components/ControlPanel.jsx
import React from "react";
import Dial from "./Dial.jsx";
import FilterFader from "./FilterFader.jsx";
import "./ControlPanel.css";

export default function ControlPanel({
    volume, onVolumeChange, onProc,
    tempo, onTempoChange,
    reverbOn, onReverbChange,
    filterAmt, onFilterChange
}) {
    return (
        <section className="control-shell">
            <div className="control-card control-panel-grid">
                <div className="knob-grid">
                    {/* Dials row (Bootstrap grid) */}
                    <div className="container px-3">
                        <div className="row g-4 align-items-center text-center">
                            <div className="col-12 col-md-3">
                                <div className="knob-col">
                                    <Dial label="VOLUME" value={volume} onChange={onVolumeChange} />
                                </div>
                            </div>

                            <div className="col-12 col-md-3">
                                <div className="knob-col">
                                    <Dial label="TEMPO" value={tempo} onChange={onTempoChange} />
                                </div>
                            </div>

                            <div className="col-12 col-md-3">
                                <div className="knob-col">
                                    <FilterFader label="FILTER" value={filterAmt} onChange={onFilterChange} />
                                </div>
                            </div>

                        </div>
                    </div>


                    <div className="knob-col">
                        <div className="knob-title">REVERB</div>
                        <button
                            className="btn"
                            aria-pressed={reverbOn}
                            onClick={() => onReverbChange(!reverbOn)}
                        >
                            {reverbOn ? "ON" : "OFF"}
                        </button>
                        <div className="knob-value">{reverbOn ? "Enabled" : "Disabled"}</div>
                    </div>
                </div>

                <div className="v-divider" />

                <div className="preset-col">
                    <label className="label">PRESET NAME</label>
                    <select className="select" defaultValue="Pattern 1">
                        <option>Pattern 1</option>
                        <option>Pattern 2</option>
                        <option>Pattern 3</option>
                    </select>

                    <div className="preset-actions">
                        <button className="btn ghost" onClick={onProc}>SAVE</button>
                        <button className="btn" onClick={onProc}>LOAD</button>
                    </div>
                </div>
            </div>
        </section>
    );
}
