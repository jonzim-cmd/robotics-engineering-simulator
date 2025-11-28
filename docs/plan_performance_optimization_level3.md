# Performance-Optimierungsplan: Level 3 3D-Viewer

## Status Quo Analyse
Der aktuelle `Level3_TerrainViewer` ist funktional, hat aber Potenzial für Performance-Probleme, insbesondere auf mobilen Geräten oder Laptops mit integrierter Grafik.

**Identifizierte Engpässe:**
1.  **Draw Calls:** Jeder Stein im `Obstacles`-Array (ca. 40 Stück) erzeugt einen eigenen Draw Call. Das belastet die CPU-GPU-Kommunikation unnötig.
2.  **Render Loop:** Der Canvas rendert standardmäßig mit 60 FPS, auch wenn sich nichts bewegt (im "Active"-Modus ohne Auto-Rotation). Das verbraucht unnötig Batterie und GPU-Ressourcen.
3.  **Auflösung (DPR):** Auf High-DPI Displays (Retina, moderne Smartphones) rendert Three.js standardmäßig in nativer Auflösung. Das kann zu enormer Last führen (z.B. 4K Rendering auf kleinen Screens).
4.  **Schatten:** Echtzeit-Schatten sind teuer.

## Geplante Maßnahmen

### 1. Instancing für Hindernisse (`InstancedMesh`)
Anstatt 40 einzelne `<mesh>`-Objekte zu rendern, fassen wir alle Steine in einem einzigen `<instancedMesh>` zusammen. Dies reduziert die Draw Calls für Steine von 40 auf 1.

**Technische Umsetzung:**
- Verwendung von `useRef<THREE.InstancedMesh>`
- Setzen der Transformations-Matrizen in einem `useLayoutEffect` oder `useEffect`.
- Verwendung von `three.js` `Object3D` Helper zur Matrix-Berechnung.

### 2. "On-Demand" Rendering
Wenn die Auto-Rotation **deaktiviert** ist (im Analyse-Modus), muss nur gerendert werden, wenn der User die Kamera bewegt.

**Technische Umsetzung:**
- Canvas Property `frameloop` dynamisch setzen:
  - `frameloop="always"` wenn `autoRotate={true}` (Intro).
  - `frameloop="demand"` wenn `autoRotate={false}` (Active).
- Dies reduziert die GPU-Last im Idle-Zustand auf nahe 0%.

### 3. Pixel Ratio Deckelung (DPR Cap)
Wir begrenzen die Render-Auflösung auf maximal 2x (Retina), auch wenn das Gerät 3x oder 4x unterstützt. Der visuelle Unterschied ist marginal, der Performance-Gewinn riesig.

**Technische Umsetzung:**
- Canvas Property: `dpr={[1, 2]}`

### 4. Performance-Monitoring (Optional)
Einbau des `<Stats />` Helfers (nur im Dev-Mode), um FPS und Draw Calls zu überwachen.

## Implementierungs-Schritte

1.  **Datei:** `src/components/levels/Level3_TerrainViewer.tsx`
2.  **Schritt A:** `Canvas` Props anpassen (`dpr`, `frameloop`).
3.  **Schritt B:** `Obstacles` Komponente zu `InstancedObstacles` refactorn.
4.  **Schritt C:** Testen (vorher/nachher Vergleich der FPS/CPU-Last).

## Erwartetes Ergebnis
- **Batterieverbrauch:** Signifikant reduziert im "Active"-Modus durch Demand-Rendering.
- **Framerate:** Stabiler auf Low-End Geräten durch Instancing.
- **Hitzeentwicklung:** Reduziert durch DPR-Cap.
