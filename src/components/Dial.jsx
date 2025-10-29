import React, { useEffect, useRef, useState } from "react";

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export default function Dial({
    value,
    onChange,
    min = 0,
    max = 100,
    step = 1,
    size = 120,
    sweep = 300,    // active degrees
    baseDeg = -90,  // 0-axis direction
    label,
    hint
}) {
    const ref = useRef(null);
    const [dragging, setDragging] = useState(false);

    const radius = size / 2;
    const stroke = 8;
    const startDeg = -sweep / 2;
    const endDeg = sweep / 2;

    const toDeg = (v) => startDeg + ((v - min) / (max - min)) * sweep;
    const fromDeg = (deg) => {
        const t = (deg - startDeg) / sweep;
        return min + clamp(t, 0, 1) * (max - min);
    };

    const angleFromPointer = (clientX, clientY) => {
        const rect = ref.current.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const x = clientX - cx;
        const y = clientY - cy;
        let a = Math.atan2(y, x) * 180 / Math.PI;
        a -= baseDeg;
        if (a > 180) a -= 360;
        if (a <= -180) a += 360;
        return a;
    };

    const setFromPointer = (clientX, clientY, round = false) => {
        const aRaw = angleFromPointer(clientX, clientY);

        // hard stop at edges (ignore outward input)
        if (value <= min && aRaw <= startDeg) return;
        if (value >= max && aRaw >= endDeg) return;

        const a = clamp(aRaw, startDeg, endDeg);
        let v = fromDeg(a);
        if (round && step) v = Math.round(v / step) * step;
        onChange(clamp(v, min, max));
    };

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
        window.addEventListener("mousemove", move);
        window.addEventListener("mouseup", up);
        window.addEventListener("touchmove", move, { passive: false });
        window.addEventListener("touchend", up);
        return () => {
            window.removeEventListener("mousemove", move);
            window.removeEventListener("mouseup", up);
            window.removeEventListener("touchmove", move);
            window.removeEventListener("touchend", up);
        };
    }, [dragging, step, min, max, sweep, baseDeg, value]);

    const deg = clamp(toDeg(value), startDeg, endDeg);
    const r = radius - stroke;

    const arcStart = (startDeg + baseDeg) * Math.PI / 180;
    const arcEnd = (deg + baseDeg) * Math.PI / 180;
    const sx = radius + r * Math.cos(arcStart);
    const sy = radius + r * Math.sin(arcStart);
    const ex = radius + r * Math.cos(arcEnd);
    const ey = radius + r * Math.sin(arcEnd);
    const largeArc = Math.abs(arcEnd - arcStart) > Math.PI ? 1 : 0;

    return (
        <div className="dial-wrap" style={{ userSelect: "none", touchAction: "none" }}>
            {label && <div className="label">{label}</div>}
            <svg
                ref={ref}
                width={size}
                height={size}
                onMouseDown={(e) => { setFromPointer(e.clientX, e.clientY, false); setDragging(true); }}
                onTouchStart={(e) => { const p = e.touches[0]; setFromPointer(p.clientX, p.clientY, false); setDragging(true); }}
                style={{ display: "block", cursor: "pointer" }}
            >
                <circle cx={radius} cy={radius} r={r} stroke="#2a1e3d" strokeWidth={stroke} fill="none" />
                <path d={`M ${sx} ${sy} A ${r} ${r} 0 ${largeArc} 1 ${ex} ${ey}`}
                    stroke="var(--accent, #7c3aed)" strokeWidth={stroke} fill="none" />
                <g transform={`rotate(${deg + baseDeg} ${radius} ${radius})`}>
                    <circle cx={radius} cy={radius} r={r - 10} fill="#171226" />
                    <line
                        x1={radius} y1={radius}
                        x2={radius + (r - 6) * Math.cos(0)}
                        y2={radius + (r - 6) * Math.sin(0)}
                        stroke="#e8e2ff" strokeWidth="3" strokeLinecap="round"
                    />
                </g>
            </svg>
            {hint !== undefined && <div className="hint">{hint}</div>}
        </div>
    );
}
