import React from "react";
import TransportBar from "./TransportBar";
import "./WavePanel.css";

export default function WavePanel({ onProc, onProcPlay, onPlay, onStop }) {
    return (
        <div className="wave-panel">
            <div className="wave-header">00:00 - 01:00</div>
            <canvas className="wave-canvas" height="140" />
            <TransportBar
                onProc={onProc}
                onProcPlay={onProcPlay}
                onPlay={onPlay}
                onStop={onStop}
            />
        </div>
    );
}
