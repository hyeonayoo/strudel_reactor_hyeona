// src/components/D3Graph.jsx
import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import "./D3Graph.css";

export default function D3Graph({ data = [], maxHeightRatio = 0.8 }) {
    const svgRef = useRef(null);

    useEffect(() => {
        if (!svgRef.current) return;

        const rect = svgRef.current.getBoundingClientRect();
        const width = rect.width;          
        const height = rect.height || 260; 

        const svg = d3.select(svgRef.current)
            .attr("width", width)
            .attr("height", height);

        const bottom = height - 4;
        const top = Math.max(4, bottom - height * maxHeightRatio);

        const barWidth = Math.max(2, width / Math.max(1, data.length));
        const xScale = d3.scaleLinear()
            .domain([0, data.length])
            .range([0, width]);

        const yScale = d3.scaleLinear()
            .domain([0, 1])
            .range([bottom, top]);

        const bars = svg.selectAll("rect").data(data);

        bars.enter()
            .append("rect")
            .attr("x", (_, i) => xScale(i))
            .attr("y", bottom)
            .attr("width", barWidth - 1)
            .attr("height", 0)
            .attr("fill", "#8b5cf6")
            .merge(bars)
            .transition()
            .duration(60)
            .attr("x", (_, i) => xScale(i))
            .attr("width", barWidth - 1)
            .attr("y", d => {
                const v = Math.max(0, Math.min(1, d));
                return yScale(v);
            })
            .attr("height", d => {
                const v = Math.max(0, Math.min(1, d));
                return bottom - yScale(v);
            });

        bars.exit().remove();
    }, [data, maxHeightRatio]);

    return <svg ref={svgRef} className="d3-wave" />;
}
