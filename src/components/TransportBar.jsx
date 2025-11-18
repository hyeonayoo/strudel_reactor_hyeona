// src/components/TransportBar.jsx
import React from "react";
import "./TransportBar.css";

export default function TransportBar({ onProc, onProcPlay, onPlay, onStop }) {
    return (
        <div className="transport-bar">
            <button type="button" className="btn btn-transport" onClick={onProc}>
                Preprocess
            </button>
            <button type="button" className="btn btn-transport" onClick={onProcPlay}>
                Proc &amp; Play
            </button>
            <button type="button" className="btn btn-transport" onClick={onPlay}>
                ▶ Play
            </button>
            <button type="button" className="btn btn-transport" onClick={onStop}>
                ■ Stop
            </button>
        </div>
    );
}
