// src/components/WavePanel.jsx
import React from "react";
import D3Graph from "./D3Graph.jsx";
import TransportBar from "./TransportBar.jsx";
import "./WavePanel.css";

export default function WavePanel({ data, onProc, onProcPlay, onPlay, onStop }) {
    return (
        <section className="wave-shell">
            <div className="wave-card">
                <header className="wave-header">
                    <h2 className="wave-title">OUTPUT</h2>
                    <TransportBar
                        onProc={onProc}
                        onProcPlay={onProcPlay}
                        onPlay={onPlay}
                        onStop={onStop}
                    />
                </header>

                <div className="wave-graph-wrap">
                    <D3Graph data={data} />
                </div>
            </div>
        </section>
    );
}
