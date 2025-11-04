import React, { useEffect, useRef, useState } from "react";

// limit value to range
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
// normalize to 0–360 deg
const norm360 = (deg) => ((deg % 360) + 360) % 360;

export default function Dial({
    value, onChange,
    min = 0, max = 1, step = 0.01,
    size = 120, startAngleDeg = 120, sweepDeg = 300,
    label, hint
}) {
    const ref = useRef(null);
    const [dragging, setDragging] = useState(false);

    const radius = size / 2;
    const ring = 6;
    const r = radius - ring;

    // value → angle
    const toDegAbs = (v) => norm360(startAngleDeg + ((v - min) / (max - min)) * sweepDeg);
    // angle → value
    const fromDegAbs = (degAbs) => {
        const start = norm360(startAngleDeg);
        const d = norm360(degAbs);
        let delta = d - start;
        if (delta < 0) delta += 360;
        delta = clamp(delta, 0, sweepDeg);
        const t = delta / sweepDeg;
        return min + t * (max - min);
    };

    // pointer position → absolute angle
    const pointerDegAbs = (x, y) => {
        const rect = ref.current.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        return norm360((Math.atan2(y - cy, x - cx) * 180) / Math.PI);
    };

    // update value from pointer
    const setFromPointer = (x, y, round = false) => {
        let v = fromDegAbs(pointerDegAbs(x, y));
        if (round && step) v = Math.round(v / step) * step;
        onChange(clamp(v, min, max));
    };

    // global drag events
    useEffect(() => {
        const move = (e) => {
            if (!dragging) return;
            const p = e.touches ? e.touches[0] : e;
            if (e.cancelable) e.preventDefault();
            setFromPointer(p.clientX, p.clientY, false);
        };
        const up = (e) => {
            if (!dragging) return;
            const p = e.changedTouches ? e.changedTouches[0] : e;
            setFromPointer(p.clientX, p.clientY, true);
            setDragging(false);
        };
        window.addEventListener("mousemove", move, { passive: false });
        window.addEventListener("mouseup", up);
        window.addEventListener("touchmove", move, { passive: false });
        window.addEventListener("touchend", up);
        return () => {
            window.removeEventListener("mousemove", move);
            window.removeEventListener("mouseup", up);
            window.removeEventListener("touchmove", move);
            window.removeEventListener("touchend", up);
        };
    }, [dragging]);

    const currentDegAbs = toDegAbs(value);

    // make SVG arc path
    const arcPath = (a0Abs, a1Abs) => {
        const a0 = (Math.PI / 180) * a0Abs;
        const a1 = (Math.PI / 180) * a1Abs;
        const sx = radius + r * Math.cos(a0);
        const sy = radius + r * Math.sin(a0);
        const ex = radius + r * Math.cos(a1);
        const ey = radius + r * Math.sin(a1);
        let delta = norm360(a1Abs) - norm360(a0Abs);
        if (delta < 0) delta += 360;
        const large = delta > 180 ? 1 : 0;
        return `M ${sx} ${sy} A ${r} ${r} 0 ${large} 1 ${ex} ${ey}`;
    };

    // marker position
    const aRad = (Math.PI / 180) * currentDegAbs;
    const markerR = r + ring / 2;
    const mx = radius + markerR * Math.cos(aRad);
    const my = radius + markerR * Math.sin(aRad);
    const tangentDeg = currentDegAbs - 90;

    return (
        <div className="knob-wrap" style={{ userSelect: "none", touchAction: "none" }}>
            {label && <div className="knob-title">{label}</div>}
            <svg
                ref={ref}
                width={size}
                height={size}
                onMouseDown={(e) => { setFromPointer(e.clientX, e.clientY, false); setDragging(true); }}
                onTouchStart={(e) => { const p = e.touches[0]; setFromPointer(p.clientX, p.clientY, false); setDragging(true); }}
                style={{ display: "block", cursor: "pointer" }}
            >
                {/* base and guide arcs */}
                <circle cx={radius} cy={radius} r={r - 12} fill="#0f0b17" />
                <circle cx={radius} cy={radius} r={r} stroke="rgba(255,255,255,.06)" strokeWidth={ring} fill="none" />
                <path d={arcPath(startAngleDeg, norm360(startAngleDeg + sweepDeg))} stroke="rgba(255,255,255,.08)" strokeWidth={ring} fill="none" />
                {/* active arc */}
                <path d={arcPath(startAngleDeg, currentDegAbs)} stroke="#a46cff" strokeWidth={ring} fill="none" />
                {/* indicator line */}
                <circle cx={radius} cy={radius} r={r - 14} fill="#151126" />
                <g transform={`rotate(${currentDegAbs} ${radius} ${radius})`}>
                    <line x1={radius + (r * 0.4)} y1={radius} x2={radius + (r - 10)} y2={radius} stroke="#d2c7ff" strokeWidth="3" />
                </g>
                {/* small marker */}
                <g transform={`translate(${mx} ${my}) rotate(${tangentDeg})`}>
                    <rect x={-8} y={-1.5} width="16" height="3" rx="1.5" fill="#d2c7ff" opacity="0.9" />
                </g>
            </svg>
            {hint !== undefined && <div className="knob-value">{hint}</div>}
        </div>
    );
}
