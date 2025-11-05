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
                    <div className="container px-3">
                        <div className="row flex-nowrap gx-3 align-items-center text-center overflow-auto">
                            <div className="col col-fixed d-flex justify-content-center">
                                <div className="dial-wrap">
                                    <div className="knob-col">
                                        <Dial label="VOLUME" value={volume} onChange={onVolumeChange} />
                                    </div>
                                </div>
                            </div>

                            <div className="col col-fixed d-flex justify-content-center">
                                <div className="dial-wrap">
                                    <div className="knob-col">
                                        <Dial label="TEMPO" value={tempo} onChange={onTempoChange} />
                                    </div>
                                </div>
                            </div>

                            <div className="col col-fixed d-flex justify-content-center">
                                <div className="dial-wrap">
                                    <div className="knob-col">
                                        <FilterFader label="FILTER" value={filterAmt} onChange={onFilterChange} />
                                    </div>
                                </div>
                            </div>

                            <div className="col col-fixed d-flex justify-content-center">
                                <div className="dial-wrap">
                                    <div className="knob-col">
                                        <label htmlFor="reverbSwitch" className="knob-title">REVERB</label>
                                        <div className="form-check form-switch d-flex justify-content-center">
                                            <input
                                                className="form-check-input reverb-switch"
                                                type="checkbox"
                                                role="switch"
                                                id="reverbSwitch"
                                                checked={reverbOn}
                                                onChange={(e) => onReverbChange(e.target.checked)}
                                            />
                                        </div>
                                        <div className="knob-value">{reverbOn ? "Enabled" : "Disabled"}</div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                <div className="v-divider" />

                <div className="preset-col">
                    <label htmlFor="presetSelect" className="form-label fw-bold">PRESET NAME</label>
                    <select id="presetSelect" className="form-select w-auto mb-2" defaultValue="Pattern 1">
                        <option>Pattern 1</option>
                        <option>Pattern 2</option>
                        <option>Pattern 3</option>
                    </select>

                    <div className="d-flex gap-3">
                        <button type="button" className="btn btn-save" onClick={onProc}>SAVE</button>
                        <button type="button" className="btn btn-load" onClick={onProc}>LOAD</button>
                    </div>
                </div>

            </div>
        </section>
    );
}
