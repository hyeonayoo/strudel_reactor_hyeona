// Custom vertical filter fader (0..1)
import React, { useEffect, useRef, useState } from "react";
import "./FilterFader.css";

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export default function FilterFader({ value, onChange, label = "FILTER" }) {
    const railRef = useRef(null);
    const [dragging, setDragging] = useState(false);
    const [railH, setRailH] = useState(200); // fader height (px)

    const PAD = 10;   // top/bottom padding
    const THUMB = 28; // thumb size

    // measure fader height (for layout changes)
    const measure = () => {
        const el = railRef.current;
        if (!el) return;
        const h = el.getBoundingClientRect().height;
        setRailH(h);
    };

    // resize observer to keep measurements up to date
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

    // pointer → value (0–1)
    const setFromPointer = (clientY) => {
        const rail = railRef.current;
        if (!rail) return;
        const r = rail.getBoundingClientRect();
        const grooveH = Math.max(0, r.height - PAD * 2);
        const yLocal = clamp(clientY - r.top - PAD, 0, grooveH);
        const v = clamp(1 - yLocal / grooveH, 0, 1);
        onChange(Number(v.toFixed(2)));
    };

    // drag move / release handlers
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

    // drag start
    const down = (e) => {
        const p = e.touches ? e.touches[0] : e;
        setFromPointer(p.clientY);
        setDragging(true);
    };

    // position of thumb
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
                {/* background groove */}
                <div className="vf-groove" />
                {/* movable thumb */}
                <div className="vf-thumb" style={thumbStyle} />
            </div>
            {/* numeric value */}
            <div className="vf-value">{Math.round(value * 100)}</div>
        </div>
    );
}
