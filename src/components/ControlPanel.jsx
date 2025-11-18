import React from "react";
import Dial from "./Dial.jsx";
import FilterFader from "./FilterFader.jsx";
import PresetBar from "./PresetBar.jsx";
import "./ControlPanel.css";

export default function ControlPanel({
    volume, onVolumeChange,
    tempo, onTempoChange,
    filterAmt, onFilterChange,
    reverbOn, onReverbChange,
    presetName, presetOptions = [], onPresetChange,
    onSave, onLoad,
    presetItems = [],
    bassOn, onBassChange,
    arpOn, onArpChange,
    drumsOn, onDrumsChange,
    drums2On, onDrums2Change
}) {
    return (
        <section className="control-shell">
            <div className="control-card control-row">
                <div className="control-slot">
                    <div className="dial-wrap">
                        <div className="knob-col">
                            <Dial label="VOLUME" value={volume} onChange={onVolumeChange} />
                        </div>
                    </div>
                </div>

                <div className="control-slot">
                    <div className="dial-wrap">
                        <div className="knob-col">
                            <Dial label="TEMPO" value={tempo} onChange={onTempoChange} />
                        </div>
                    </div>
                </div>

                <div className="control-slot">
                    <div className="dial-wrap">
                        <div className="knob-col">
                            <FilterFader label="FILTER" value={filterAmt} onChange={onFilterChange} />
                        </div>
                    </div>
                </div>

                <div className="control-slot">
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
                            <div className="knob-value">
                                {reverbOn ? "Enabled" : "Disabled"}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="control-slot">
                    <div className="dial-wrap">
                        <div className="knob-col">
                            <div className="knob-title">INSTRUMENTS</div>
                            <div className="d-flex flex-column align-items-start gap-1 text-start">
                                <div className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="bassToggle"
                                        checked={bassOn}
                                        onChange={(e) => onBassChange && onBassChange(e.target.checked)}
                                    />
                                    <label className="form-check-label" htmlFor="bassToggle">
                                        Bassline
                                    </label>
                                </div>
                                <div className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="arpToggle"
                                        checked={arpOn}
                                        onChange={(e) => onArpChange && onArpChange(e.target.checked)}
                                    />
                                    <label className="form-check-label" htmlFor="arpToggle">
                                        Main Arp
                                    </label>
                                </div>
                                <div className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="drumsToggle"
                                        checked={drumsOn}
                                        onChange={(e) => onDrumsChange && onDrumsChange(e.target.checked)}
                                    />
                                    <label className="form-check-label" htmlFor="drumsToggle">
                                        Drums
                                    </label>
                                </div>
                                <div className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="drums2Toggle"
                                        checked={drums2On}
                                        onChange={(e) => onDrums2Change && onDrums2Change(e.target.checked)}
                                    />
                                    <label className="form-check-label" htmlFor="drums2Toggle">
                                        Drums 2
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="control-slot preset-slot">
                    <PresetBar
                        settings={{
                            volume,
                            tempo,
                            reverbOn,
                            filterAmt,
                            presetName,
                            bassOn,
                            arpOn,
                            drumsOn,
                            drums2On
                        }}
                        onApply={(data) => {
                            if (typeof data?.presetName === "string") onPresetChange?.(data.presetName);
                            if (typeof data?.volume === "number") onVolumeChange?.(data.volume);
                            if (typeof data?.tempo === "number") onTempoChange?.(data.tempo);
                            if (typeof data?.reverbOn === "boolean") onReverbChange?.(data.reverbOn);
                            if (typeof data?.filterAmt === "number") onFilterChange?.(data.filterAmt);
                            if (typeof data?.bassOn === "boolean") onBassChange?.(data.bassOn);
                            if (typeof data?.arpOn === "boolean") onArpChange?.(data.arpOn);
                            if (typeof data?.drumsOn === "boolean") onDrumsChange?.(data.drumsOn);
                            if (typeof data?.drums2On === "boolean") onDrums2Change?.(data.drums2On);
                        }}
                        presets={presetItems}
                    />
                </div>
            </div>
        </section>
    );
}
