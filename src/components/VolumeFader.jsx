// Custom vertical volume fader (0..1)
import React, { useEffect, useRef, useState } from "react";
import "./VolumeFader.css";

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export default function VolumeFader({ value, onChange, label = "VOLUME" }) {
    const railRef = useRef(null);
    const [dragging, setDragging] = useState(false);
    const [railH, setRailH] = useState(200); // px

    const PAD = 10;      // groove top/bottom padding in CSS
    const THUMB = 28;    // thumb size in CSS

    const measure = () => {
        const el = railRef.current;
        if (!el) return;
        const h = el.getBoundingClientRect().height;
        setRailH(h);
    };

    useEffect(() => {
        measure();
        const ro = new ResizeObserver(measure);
        if (railRef.current) ro.observe(railRef.current);
        window.addEventListener("resize", measure);
        return () => {
            ro.disconnect();
            window.removeEventListener("resize", measure);
        };
    }, []);

    const setFromPointer = (clientY) => {
        const rail = railRef.current;
        if (!rail) return;
        const r = rail.getBoundingClientRect();
        const grooveH = Math.max(0, r.height - PAD * 2);
        const yLocal = clamp(clientY - r.top - PAD, 0, grooveH);
        const v = clamp(1 - yLocal / grooveH, 0, 1);
        onChange(Number(v.toFixed(2)));
    };

    useEffect(() => {
        const move = (e) => {
            if (!dragging) return;
            const p = e.touches ? e.touches[0] : e;
            if (e.cancelable) e.preventDefault();
            setFromPointer(p.clientY);
        };
        const up = (e) => {
            if (!dragging) return;
            const p = e.changedTouches ? e.changedTouches[0] : e;
            setFromPointer(p.clientY);
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

    const down = (e) => {
        const p = e.touches ? e.touches[0] : e;
        setFromPointer(p.clientY);
        setDragging(true);
    };

    const grooveH = Math.max(0, railH - PAD * 2);
    const topPx = PAD + (1 - value) * grooveH - THUMB / 2;
    const thumbStyle = { top: `${topPx}px` };

    return (
        <div className="vf-wrap">
            <div className="vf-label">{label}</div>
            <div
                className="vf-rail"
                ref={railRef}
                onMouseDown={down}
                onTouchStart={down}
                role="slider"
                aria-valuemin={0}
                aria-valuemax={1}
                aria-valuenow={value}
            >
                <div className="vf-groove" />
                <div className="vf-thumb" style={thumbStyle} />
            </div>
            <div className="vf-value">VOL {Math.round(value * 100)}</div>
        </div>
    );
}
