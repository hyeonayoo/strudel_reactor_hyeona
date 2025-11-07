// src/components/ControlPanel.jsx
import React from "react";
import Dial from "./Dial.jsx";
import FilterFader from "./FilterFader.jsx";
import PresetBar from "./PresetBar.jsx";
import "./ControlPanel.css";

export default function ControlPanel({
    // knobs
    volume, onVolumeChange,
    tempo, onTempoChange,
    filterAmt, onFilterChange,
    // reverb toggle
    reverbOn, onReverbChange,
    // presets
    presetName, presetOptions = [], onPresetChange,
    // (legacy) save/load triggers – kept for compatibility (unused here)
    onSave, onLoad,
    // optional preset items for dropdown [{name, data}]
    presetItems = []
}) {
    return (
        <section className="control-shell">
            <div className="control-card control-panel-grid">
                {/* knobs + toggle */}
                <div className="knob-grid">
                    <div className="container px-3">
                        <div className="row flex-nowrap gx-3 align-items-center text-center overflow-auto">
                            {/* volume */}
                            <div className="col col-fixed d-flex justify-content-center">
                                <div className="dial-wrap">
                                    <div className="knob-col">
                                        <Dial label="VOLUME" value={volume} onChange={onVolumeChange} />
                                    </div>
                                </div>
                            </div>

                            {/* tempo */}
                            <div className="col col-fixed d-flex justify-content-center">
                                <div className="dial-wrap">
                                    <div className="knob-col">
                                        <Dial label="TEMPO" value={tempo} onChange={onTempoChange} />
                                    </div>
                                </div>
                            </div>

                            {/* filter */}
                            <div className="col col-fixed d-flex justify-content-center">
                                <div className="dial-wrap">
                                    <div className="knob-col">
                                        <FilterFader label="FILTER" value={filterAmt} onChange={onFilterChange} />
                                    </div>
                                </div>
                            </div>

                            {/* reverb switch */}
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

                {/* presets + save/load */}
                <div className="preset-col">
                    <label htmlFor="presetSelect" className="form-label fw-bold">PRESET NAME</label>
                    <select
                        id="presetSelect"
                        className="form-select w-auto mb-2"
                        value={presetName}
                        onChange={(e) => onPresetChange?.(e.target.value)}
                    >
                        {presetOptions.length === 0
                            ? <option value="">(No Presets)</option>
                            : presetOptions.map((name) => <option key={name} value={name}>{name}</option>)
                        }
                    </select>

                    <PresetBar
                        settings={{ volume, tempo, reverbOn, filterAmt, presetName }}
                        onApply={(data) => {
                            if (typeof data?.presetName === "string") onPresetChange?.(data.presetName);
                            if (typeof data?.volume === "number") onVolumeChange?.(data.volume);
                            if (typeof data?.tempo === "number") onTempoChange?.(data.tempo);
                            if (typeof data?.reverbOn === "boolean") onReverbChange?.(data.reverbOn);
                            if (typeof data?.filterAmt === "number") onFilterChange?.(data.filterAmt);
                        }}
                        presets={presetItems}
                    />
                </div>

            </div>
        </section>
    );
}
