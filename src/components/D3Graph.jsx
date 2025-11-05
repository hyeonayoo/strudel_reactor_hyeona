import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

export default function D3Graph() {
    const svgRef = useRef(null);
    const dataRef = useRef([]);

    useEffect(() => {
        const width = 420;
        const height = 120;
        const svg = d3.select(svgRef.current)
            .attr("width", width)
            .attr("height", height);

        const render = () => {
            const n = dataRef.current.length || 1;
            const stepX = width / Math.max(99, n - 1);
            const pts = dataRef.current
                .map((v, i) => `${(i * stepX).toFixed(2)},${(height - v * height).toFixed(2)}`)
                .join(" ");

            svg.selectAll("*").remove();
            svg.append("polyline")
                .attr("fill", "none")
                .attr("stroke", "currentColor")
                .attr("stroke-width", 2)
                .attr("points", pts);
        };

        const onD3Data = (e) => {
            const v = Number(e.detail);
            if (Number.isFinite(v)) {
                const clamped = Math.max(0, Math.min(1, v));
                dataRef.current.push(clamped);
                if (dataRef.current.length > 100) dataRef.current.shift();
                render();
            }
        };

        document.addEventListener("d3Data", onD3Data);
        return () => document.removeEventListener("d3Data", onD3Data);
    }, []);

    return (
        <div className="mt-3">
            <svg ref={svgRef} />
        </div>
    );
}
