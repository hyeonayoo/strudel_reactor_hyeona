import React from "react";
import Dial from "./Dial.jsx";
import "./ControlPanel.css";

export default function ControlPanel({
    volume, onVolumeChange, onProc,
    tempo, onTempoChange,
    reverbOn, onReverbChange,
    filterAmt, onFilterChange
}) {
    return (
        <section className="control-shell">
            {/* Mixer Section */}
            <div className="control-card">
                <div className="card-head">Mixer</div>
                <div className="control-row">
                    <div className="dial-block">
                        <Dial
                            label="VOLUME"
                            value={volume}
                            onChange={onVolumeChange}
                            min={0} max={1} step={0.01}
                            size={110}
                            hint={volume.toFixed(2)}
                        />
                    </div>

                    <div className="field-col">
                        <label className="label">Reverb</label>
                        <div
                            className="switch"
                            role="switch"
                            aria-checked={reverbOn}
                            tabIndex={0}
                            onClick={() => onReverbChange(!reverbOn)}
                        >
                            <div className={`thumb ${reverbOn ? "on" : ""}`} />
                            <span className="switch-text">{reverbOn ? "ON" : "OFF"}</span>
                        </div>

                        <label className="label" style={{ marginTop: 14 }}>
                            Filter
                        </label>
                        <input
                            className="range"
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={filterAmt}
                            onChange={(e) => onFilterChange(parseFloat(e.target.value))}
                        />
                        <div className="hint">{filterAmt.toFixed(2)}</div>
                    </div>
                </div>
            </div>

            {/* Timing Section */}
            <div className="control-card">
                <div className="card-head">Timing</div>
                <div className="control-row">
                    <div className="field-col">
                        <label className="label">Tempo</label>
                        <select
                            className="select"
                            value={tempo}
                            onChange={(e) => onTempoChange(parseFloat(e.target.value))}
                        >
                            <option value={0.75}>0.75x (Chill)</option>
                            <option value={1.0}>1.00x (Normal)</option>
                            <option value={1.25}>1.25x (Push)</option>
                            <option value={1.5}>1.50x (Fast)</option>
                            <option value={2.0}>2.00x (Hype)</option>
                        </select>
                        <div className="hint">{tempo.toFixed(2)}x</div>
                    </div>

                    <div className="field-col">
                        <label className="label">Actions</label>
                        <button className="btn" onClick={onProc}>
                            Preprocess
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
