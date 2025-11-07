import React, { useRef } from 'react';
import { downloadSettings, normalizeSettings, readFileAsText } from '../utils/presets.js';

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
        <div className="d-flex align-items-center gap-2 flex-wrap">
            <div className="btn-group" role="group" aria-label="Presets">
                <button type="button" className="btn btn-outline-primary" onClick={handleSave}>
                    Save
                </button>
                <button type="button" className="btn btn-primary" onClick={handleLoadClick}>
                    Load
                </button>
            </div>

            {presets.length > 0 && (
                <div className="dropdown">
                    <button className="btn btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">
                        Presets
                    </button>
                    <ul className="dropdown-menu">
                        {presets.map((p, i) => (
                            <li key={i}>
                                <button className="dropdown-item" onClick={() => applyPreset(p)}>{p.name}</button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

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
