// src/components/D3Graph.jsx
import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

export default function D3Graph({ data = [], width = 850, height = 300, maxHeightRatio = 0.8 }) {


    const svgRef = useRef();

    useEffect(() => {
        const svg = d3.select(svgRef.current)
            .attr("width", width)
            .attr("height", height)
            .style("background", "#0b0b0c")
            .style("borderRadius", "12px");

        const barWidth = Math.max(2, width / Math.max(1, data.length));
        const xScale = d3.scaleLinear().domain([0, data.length]).range([0, width]);

        const bottom = height - 4;
        const top = Math.max(4, bottom - height * maxHeightRatio);
        const yScale = d3.scaleLinear().domain([0, 1]).range([bottom, top]);

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
            .attr("y", d => yScale(Math.max(0, Math.min(1, d))))     // ← 값 클램프
            .attr("height", d => bottom - yScale(Math.max(0, Math.min(1, d))));

        bars.exit().remove();
    }, [data, width, height, maxHeightRatio]);

    return <svg ref={svgRef} />;
}