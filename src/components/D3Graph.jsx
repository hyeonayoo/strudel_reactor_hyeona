// src/components/D3Graph.jsx
import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

export default function D3Graph() {
    const svgRef = useRef(null);
    const dataRef = useRef([]);

    useEffect(() => {
        const svg = d3.select(svgRef.current);

        const render = () => {
            const node = svgRef.current;
            const W = (node?.getBoundingClientRect().width || 600);
            const H = (node?.getBoundingClientRect().height || 160);
            const margin = { left: 12, right: 12, top: 6, bottom: 6 };
            const width = Math.max(0, W - margin.left - margin.right);
            const height = Math.max(0, H - margin.top - margin.bottom);
            const midY = height / 2;

            svg.attr("width", W).attr("height", H);
            const g = svg.selectAll("g.root").data([0]).join("g").attr("class", "root")
                .attr("transform", `translate(${margin.left},${margin.top})`);

            const N = 80;
            const vals = dataRef.current.slice(-N);
            const n = Math.max(1, vals.length);
            const step = width / n;
            const barW = Math.max(1, step * 0.7);
            const maxAmp = midY * 0.95;

            const scaled = vals.map(v => Math.max(0, Math.min(1, v)) * maxAmp);

            const sel = g.selectAll("line.bar").data(scaled, (_, i) => i);
            sel.join(
                enter => enter.append("line")
                    .attr("class", "bar")
                    .attr("x1", (_, i) => i * step + step / 2)
                    .attr("x2", (_, i) => i * step + step / 2)
                    .attr("y1", midY).attr("y2", midY)
                    .attr("stroke", "currentColor")
                    .attr("stroke-width", barW)
                    .attr("stroke-linecap", "round")
                    .attr("y1", d => midY - d)
                    .attr("y2", d => midY + d),
                update => update
                    .attr("x1", (_, i) => i * step + step / 2)
                    .attr("x2", (_, i) => i * step + step / 2)
                    .attr("stroke-width", barW)
                    .attr("y1", d => midY - d)
                    .attr("y2", d => midY + d),
                exit => exit.remove()
            );

            g.selectAll("line.axis").data([0]).join("line")
                .attr("x1", 0).attr("x2", width)
                .attr("y1", midY).attr("y2", midY)
                .attr("stroke", "#e6e6e6").attr("stroke-width", 1);
        };

        const onD3Data = (e) => {
            const v = Number(e.detail);
            if (!Number.isFinite(v)) return;
            const clamped = Math.max(0, Math.min(1, v));
            dataRef.current.push(clamped);
            if (dataRef.current.length > 200) dataRef.current.shift();
            render();
        };

        window.addEventListener("resize", render);
        document.addEventListener("d3Data", onD3Data);
        return () => {
            window.removeEventListener("resize", render);
            document.removeEventListener("d3Data", onD3Data);
        };
    }, []);

    return <svg ref={svgRef} width="100%" height="160" style={{ color: "#5b7cff" }} />;
}
