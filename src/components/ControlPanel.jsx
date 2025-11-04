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
                    <div className="knob-col">
                        <Dial
                            label="VOLUME"
                            value={volume}
                            onChange={onVolumeChange}
                            min={0} max={1} step={0.01}
                            size={112}
                            startAngleDeg={120}
                            sweepDeg={300}
                            hint={volume.toFixed(1)}
                        />
                    </div>

                    <div className="knob-col">
                        <Dial
                            label="TEMPO"
                            value={tempo}
                            onChange={onTempoChange}
                            min={0.75} max={2.0} step={0.25}
                            size={112}
                            startAngleDeg={120}
                            sweepDeg={300}
                            hint={`${Math.round(tempo * 120)} BPM`}
                        />
                    </div>

                    <div className="knob-col">
                        <FilterFader
                            value={filterAmt}
                            onChange={onFilterChange}
                        />
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
