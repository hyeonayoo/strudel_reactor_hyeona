import React from "react";
import "./FilterFader.css";

export default function FilterFader({ value, onChange, label = "FILTER" }) {
    return (
        <div className="vf-wrap text-center">
            <label htmlFor="filterRange" className="form-label vf-label">
                {label}
            </label>
            <div className="d-flex justify-content-center align-items-center" style={{ height: "100px" }}>
                <input
                    id="filterRange"
                    type="range"
                    className="form-range vf-range"
                    min="0"
                    max="100"
                    step="1"
                    value={Math.round(value * 100)}
                    onChange={(e) => onChange(Number(e.target.value) / 100)}
                />
            </div>
            <div className="vf-value">{Math.round(value * 100)}</div>
        </div>
    );
}
