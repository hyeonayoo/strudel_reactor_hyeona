// src/hooks/useStrudelEngine.js
import { useEffect, useRef } from "react";
import { StrudelMirror } from "@strudel/codemirror";
import { evalScope } from "@strudel/core";
import { initAudioOnFirstClick } from "@strudel/webaudio";
import { transpiler } from "@strudel/transpiler";
import { getAudioContext, webaudioOutput, registerSynthSounds } from "@strudel/webaudio";
import { registerSoundfonts } from "@strudel/soundfonts";
import { computeBandsAndSeries } from "../strudel/stream-frame.js";

const BANDS = 48;
const MAX_POINTS = 100;

export default function useStrudelEngine() {
    const editorRef = useRef(null);
    const hasRunRef = useRef(false);
    const bandPrevRef = useRef(new Array(BANDS).fill(0));
    const streamBufRef = useRef([]);
    const lastGraphUpdateRef = useRef(0);

    useEffect(() => {
        if (hasRunRef.current) return;
        hasRunRef.current = true;

        const editor = new StrudelMirror({
            defaultOutput: webaudioOutput,
            getTime: () => getAudioContext().currentTime,
            transpiler,
            root: document.getElementById("editor"),
            drawTime: [-6, 6],
            onDraw: (haps) => {
                const now = performance.now();
                if (now - lastGraphUpdateRef.current < 200) return;
                lastGraphUpdateRef.current = now;

                const { bands: nextBands, series: nextSeries } =
                    computeBandsAndSeries(haps, bandPrevRef.current, streamBufRef.current, MAX_POINTS);
                bandPrevRef.current = nextBands;
                streamBufRef.current = nextSeries;
                document.dispatchEvent(new CustomEvent("d3Data", { detail: nextBands }));
                document.dispatchEvent(new CustomEvent("d3Series", { detail: nextSeries }));
            },
            prebake: async () => {
                initAudioOnFirstClick();
                const loadModules = evalScope(
                    import("@strudel/core"),
                    import("@strudel/mini"),
                    import("@strudel/tonal"),
                    import("@strudel/webaudio")
                );
                await Promise.all([loadModules, registerSynthSounds(), registerSoundfonts()]);
            },
        });

        editorRef.current = editor;

        return () => {
            editorRef.current?.stop?.();
        };
    }, []);

    const setCode = (code) => {
        editorRef.current?.setCode(code);
    };

    const evaluate = () => {
        editorRef.current?.evaluate();
    };

    const evaluateIfStarted = () => {
        const repl = editorRef.current?.repl;
        if (repl?.state?.started === true) {
            editorRef.current.evaluate();
        }
    };

    const stop = () => {
        editorRef.current?.stop();
    };

    return { setCode, evaluate, evaluateIfStarted, stop };
}
