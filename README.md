# Shift: Vector to 3D Model Engine

[**Remix on AI Studio**](https://ai.studio/apps/drive/1WYqqbd5DDER7bue4-jyHmwA6AC6Fn65w?fullscreenApplet=true)

This application is a powerful, real-time tool for converting 2D vector graphics (SVG) into 3D models. It features a minimalist, macOS-inspired interface with a comprehensive set of controls for geometry, materials, lighting, and post-processing effects. Built on React and Three.js, it's designed for performance and a premium user experience.

## Project Scan Sheet

| Category | Details |
| :--- | :--- |
| **Framework** | React 18.2.0, Three.js 0.180.0 |
| **Styling** | CSS-in-JS (JS Objects), Semantic Design Tokens |
| **Animation** | Framer Motion 12.x |
| **Typography** | Bebas Neue (Display), Inter (UI), Victor Mono (Code) |
| **Icons** | Phosphor Icons (Web Component) |
| **Architecture** | Atomic-based: `Core` → `Package` → `Section` → `App` |
| **Key Features** | SVG to 3D Extrusion, PBR Material Editor, Lighting Presets, Post-Processing FX, GLB Export |
| **Theme System** | Light/Dark Modes, Responsive Tokens |
| **UI/UX** | Glassmorphic Sidebar, Real-time 3D viewport with OrbitControls |


## What's Inside? (ELI10 Version)

Imagine you have a flat drawing (like an SVG) and you want to make it a 3D toy. This app is the magic machine that does it!

-   **`index.html` / `index.tsx`**: The front door and brain of our app.
-   **`Theme.tsx`**: The style guide that makes everything look cool and consistent (colors, fonts, etc.).
-   **`services/`**: The "engine room" where the hard work of converting SVG to 3D happens.
-   **`types/`**: A dictionary that defines the data our app uses.
-   **`components/`**: The LEGO pieces for building our app, organized by size.
    -   **`App/Shift.tsx`**: The main component that runs the whole 3D editor.
    -   **`Section/`**: Big parts of the app, like the `Sidebar.tsx` with all the controls, and the `Scene.tsx` where you see your 3D model.
    -   **`Package/`**: Medium-sized pieces, like the `FileUpload.tsx` area or groups of controls (`ControlGroup.tsx`).
    -   **`Core/`**: The smallest, most basic pieces like sliders, toggles, and buttons.
-   **`README.md`**: This file! Your friendly guide.

## Directory Tree

```
.
├── components/
│   ├── App/
│   │   └── Shift.tsx
│   ├── Core/
│   │   ├── Button.tsx
│   │   ├── ColorInput.tsx
│   │   ├── IconButton.tsx
│   │   ├── Loader.tsx
│   │   ├── RippleLayer.tsx
│   │   ├── Slider.tsx
│   │   ├── TabButton.tsx
│   │   └── ThemeToggleButton.tsx
│   ├── Package/
│   │   ├── ControlGroup.tsx
│   │   ├── EffectToggle.tsx
│   │   └── FileUpload.tsx
│   └── Section/
│       ├── Scene.tsx
│       ├── Sidebar.tsx
│       └── WelcomeStage.tsx
├── hooks/
│   └── useBreakpoint.tsx
├── services/
│   └── three.tsx
├── types/
│   └── three.tsx
├── README.md
├── LLM.md
├── noteBook.md
├── bugReport.md
├── Theme.tsx
├── importmap.js
├── index.html
├── index.tsx
├── metadata.json
```
