# Strudel Reactor – Part B Submission

## 1. Project Overview
Strudel Studio is a React-based preprocessor and control interface for the Strudel live-coding music environment.  
It adds a modern UI with interactive controls, a live D3.js visualisation, and JSON preset handling.  
Users can adjust volume, tempo, reverb, and filter amount, while preprocessing injects these values directly into the Strudel code.  
The project demonstrates modular React design, clean data flow, and dependable preprocessing logic.

## 2. Controls & Features

### • Volume Dial  
Custom SVG dial that controls the `<volume>` placeholder.

### • Tempo Dial  
Controls song speed by adjusting the `<tempo>` value.

### • Reverb Switch (Bootstrap)  
Toggles Strudel’s `.room()` effect on/off.

### • Filter Fader (Vertical Slider)  
Controls the `<filter>` low-pass amount.

### • PresetBar (Buttons + File Input)  
Saves/loads all settings as JSON and supports quick preset selection.

## 3. Usage Guidelines & Quirks

### • Preprocess vs Proc & Play
- **Preprocess:** Updates the REPL output only.  
- **Proc & Play:** Updates and immediately refreshes the audio.

### • D3 Graph
Displays real-time amplitude data from Strudel `.log()`; updates ~60 ms.

### • Presets
- **Save:** Exports settings as JSON.  
- **Load:** Applies settings instantly (invalid files show an alert).

### • Defaults
Volume 0.8, Tempo 1.0, Reverb Off, Filter 0.2.

## 4. React Architecture

The project is structured using a clean, modular React component layout.  
Only essential information is included here to keep the README concise.

### • App.js  
Holds all global state (volume, tempo, reverbOn, filterAmt) and manages:
- Strudel REPL instance  
- Preprocess / Proc & Play logic  
- Event listeners for real-time graph data

Acts as the single source of truth and passes props to all child components.

### • ControlPanel  
Contains all user controls:
- Volume Dial  
- Tempo Dial  
- Reverb Switch  
- Filter Fader  
- PresetBar  

All changes bubble up to App.js for synchronized state updates.

### • WavePanel  
Groups the playback and visualization UI:
- D3Graph (live amplitude graph)  
- TransportBar (Play, Stop, Preprocess controls)

### • Utility Modules  
- **preprocess.js:** Builds Strudel code by replacing placeholders.  
- **stream-frame.js:** Processes `.log()` data into graph-friendly arrays.  
- **useD3Series:** Hook for subscribing to live Strudel data events.


## 5. Song Attribution

The main song used in this project is the `stranger_tune` pattern included in the starter code.  
This pattern is **remixed and reproduced from Algorave Dave’s Strudel/Tidal live-coding example**:

- Algorave Dave – Live Coding Example  
  https://www.youtube.com/watch?v=ZCcpWzhekEY  

For this assignment, I kept the core structure (basslines, arpeggiators, drum patterns) and adapted it to work with my preprocessing logic and UI controls (volume, tempo, reverb, filter and presets).


## 6. Demo Video
🔗 *https://drive.google.com/file/d/1GxnmYUwE5Ilch61wu3nT3vAyRJOCsZAC/view?usp=sharing*

## 7. AI Usage Documentation

I used ChatGPT to assist with three specific parts of the project.  
Below are the areas where AI-generated ideas were incorporated, without code.  
(I will insert the original AI code snippets later.)

---

### 1) JSON Save & Load (Preset System)

**Prompt Example**  
“How can I save and load settings as JSON in React?”

```
export function downloadJson(name, obj) {
  const json = JSON.stringify(obj, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
}

export function readJsonFile(file) {
  return file.text().then(t => JSON.parse(t));
}
```

I used the AI’s suggested approach as the basis for my preset system  
(`downloadSettings`, `readFileAsText`, and `normalizeSettings`).

---

### 2) Dial Pointer → Angle Mapping (Knob Interaction)

**Prompt Example**  
“Show me a simple way to convert pointer drag into an angle for a dial component.”

```
function getAngleFromPointer(ref, x, y) {
  const rect = ref.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const rad = Math.atan2(y - cy, x - cx);
  return (rad * 180) / Math.PI;  // -180 ~ 180
}
```

This idea was used as the starting point for the SVG dial logic,  
which I expanded with sweep limits, clamping, drag events, and arc drawing.

