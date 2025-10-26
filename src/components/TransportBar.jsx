import React from "react";
import "./TransportBar.css";

export default function TransportBar({ onProc, onProcPlay, onPlay, onStop }) {
    return (
        <div className="transport">
            <button className="btn" onClick={onProc}>Preprocess</button>
            <button className="btn" onClick={onProcPlay}>Proc & Play</button>
            <button className="btn primary" onClick={onPlay}>▶ Play</button>
            <button className="btn" onClick={onStop}>■ Stop</button>
        </div>
    );
}
