// src/components/WavePanel.jsx
import React from "react";
import D3Graph from "./D3Graph.jsx";
import TransportBar from "./TransportBar.jsx";

export default function WavePanel({ data, onProc, onProcPlay, onPlay, onStop }) {
    return (
        <div>
            <D3Graph data={data} />  {/* streaming series */}
            <TransportBar onProc={onProc} onProcPlay={onProcPlay} onPlay={onPlay} onStop={onStop} />
        </div>
    );
}
