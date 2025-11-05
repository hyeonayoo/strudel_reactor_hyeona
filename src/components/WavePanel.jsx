import React from "react";
import TransportBar from "./TransportBar";
import "./WavePanel.css";
import D3Graph from "./D3Graph.jsx";

export default function WavePanel({ onProc, onProcPlay, onPlay, onStop }) {
    return (
        <div className="wave-panel">
            <div className="wave-d3">
                <D3Graph />
            </div>
            <TransportBar
                onProc={onProc}
                onProcPlay={onProcPlay}
                onPlay={onPlay}
                onStop={onStop}
            />
        </div>
    );
}
