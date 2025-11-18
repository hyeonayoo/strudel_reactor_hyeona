import React, { useRef } from 'react';
import { downloadSettings, normalizeSettings, readFileAsText } from '../utils/presets.js';
import './PresetBar.css';

export default function PresetBar({ settings, onApply, presets = [] }) {
    const fileRef = useRef(null);

    const handleSave = () => {
        const fname = `strudel-settings-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.json`;
        downloadSettings(fname, settings);
    };

    const handleLoadClick = () => fileRef.current?.click();

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const text = await readFileAsText(file);
            const parsed = normalizeSettings(text);
            onApply(parsed);
        } catch (_) {
            alert('Invalid settings file.');
        } finally {
            e.target.value = '';
        }
    };

    const applyPreset = (p) => onApply(normalizeSettings(p.data));

    return (
        <div className="preset-shell">
            {presets.length > 0 && (
                <div className="dropdown">
                    <button className="dropdown-toggle" data-bs-toggle="dropdown">
                        Presets
                    </button>
                    <ul className="dropdown-menu">
                        {presets.map((p, i) => (
                            <li key={i}>
                                <button className="dropdown-item" onClick={() => applyPreset(p)}>
                                    {p.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="btn-group" role="group" aria-label="Presets">
                <button type="button" className="preset-btn" onClick={handleSave}>
                    Save
                </button>
                <button type="button" className="preset-btn" onClick={handleLoadClick}>
                    Load
                </button>
            </div>

            <input
                ref={fileRef}
                type="file"
                accept="application/json"
                onChange={handleFileChange}
                style={{ display: 'none' }}
            />
        </div>
    );
}
