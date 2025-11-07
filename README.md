# Strudel Reactor – Part A Submission

## Project Overview
This project is a **React-based preprocessor and user interface** for the Strudel live-coding music environment.  
It allows users to control playback parameters such as volume, tempo, reverb, and filter through an interactive UI, and visualizes real-time Strudel `.log()` data with a D3 graph.

---

## Implemented Controls
- **Volume Dial (Dial)** → Adjusts overall master output volume  
- **Tempo Dial (Dial)** → Changes playback speed (CPS ratio)  
- **Reverb Toggle (Switch)** → Turns the reverb effect on or off  
- **Filter Fader (Vertical Slider)** → Controls the low-pass filter amount  
- **Preset Buttons (Buttons in `PresetBar`)** → Save and load control states as JSON  
---

## React Structure
The application follows a modular React architecture with centralized state management in `App.js`.  
Heavy logic such as preprocessing, D3 data computation, and JSON I/O are separated into **dedicated hooks and utility modules** for clarity and maintainability.

```plaintext
App.js
├── WavePanel.jsx
│   ├── D3Graph.jsx
│   └── TransportBar.jsx
├── ControlPanel.jsx
│   ├── Dial.jsx
│   ├── FilterFader.jsx
│   └── PresetBar.jsx
├── hooks/useD3Series.js
└── strudel/
    ├── preprocess.js         ← buildStrudelCode()
    └── stream-frame.js       ← computeBandsAndSeries()

────────────────────────────────────────────
Component Roles
────────────────────────────────────────────
App.js
• Root component and global state manager (`volume`, `tempo`, `reverbOn`, `filterAmt`).  
• Manages StrudelMirror REPL instance and evaluation flow.  
• Uses `Proc()` and `ProcAndPlay()` to preprocess and re-evaluate code.  
• Handles data broadcasting from onDraw via custom events (`d3Data`, `d3Series`).

WavePanel.jsx
• Groups visual/audio feedback components.  
• Contains D3Graph (waveform visualization) and TransportBar (playback controls).

D3Graph.jsx
• Renders real-time amplitude data as an animated D3.js bar graph.  
• Smooth transitions (60 ms) visualize live dynamic sound intensity.

TransportBar.jsx
• Provides playback and processing buttons: Preprocess, Proc & Play, Play, and Stop.  
• Directly triggers App-level handlers via props.

ControlPanel.jsx
• Hosts user controls: volume/tempo dials, filter fader, reverb toggle, and preset bar.  
• Sends all state changes upward to App via props for one-way data flow.

PresetBar.jsx
• Manages JSON-based preset saving/loading.  
• Allows importing/exporting control states through local files.

hooks/useD3Series.js
• Encapsulates event listeners for `d3Data` and `d3Series`.  
• Returns live-updating `bands` and `series` state to App.

strudel/preprocess.js (`buildStrudelCode`)
• Generates Strudel code by replacing placeholders (`<volume>`, `<tempo>`, `<filter>`, etc.).  
• Injects `.log()`, `setcps`, `gain`, and `room` statements for preprocessing.

strudel/stream-frame.js (`computeBandsAndSeries`)
• Calculates 48 frequency bands and amplitude series from `haps`.  
• Smooths transitions and clamps dynamic range to create stable data for D3Graph.

────────────────────────────────────────────
Data Flow
────────────────────────────────────────────
1. User interacts with ControlPanel → updates React state in App.  
2. App calls `Proc()` → uses `buildStrudelCode()` to generate new Strudel code.  
3. If playing, `evalIfStarted()` re-evaluates code immediately.  
4. Strudel’s `onDraw(haps)` emits live data → `computeBandsAndSeries()` processes it.  
5. Processed arrays are dispatched as events → `useD3Series()` receives updates → D3Graph renders live visual feedback.

→ This structure keeps UI, audio logic, and visualization layers fully decoupled yet synchronized.
