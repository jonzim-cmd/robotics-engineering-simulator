# Implementierungsplan: Level 3 Terrain-Visualisierung

Dieser Plan beschreibt die technische Umsetzung der interaktiven 3D-Karte für Level 3. Ziel ist eine performante, prozedurale Darstellung des Missionsgebiets ohne externe Assets (Texturen/Modelle), um die App leichtgewichtig zu halten.

## 1. Technische Basis & Abhängigkeiten

Wir verwenden **React Three Fiber (R3F)** für die 3D-Darstellung. Dies erfordert die Installation neuer Pakete.

**Zu installierende Pakete:**
- `three`: Core 3D Library
- `@types/three`: TypeScript Definitionen
- `@react-three/fiber`: React Reconciler für Three.js
- `@react-three/drei`: Nützliche Helper (OrbitControls, Environment, Shapes)

## 2. Dateistruktur

Wir erstellen eine neue Komponente, die die gesamte 3D-Logik kapselt.

```text
src/components/levels/
├── Level3_Mechanisms.tsx       (Bestehende Datei, wird angepasst)
└── Level3_TerrainViewer.tsx    (NEU: Enthält Canvas, Szene & Logik)
```

## 3. Spezifikation: `Level3_TerrainViewer.tsx`

### 3.1. Komponentenschnittstelle
```typescript
interface Level3_TerrainViewerProps {
  className?: string;
  autoRotate?: boolean; // True im Intro, False bei Interaktion
}
```

### 3.2. Szenen-Aufbau (Scene Graph)

```jsx
<Canvas shadows camera={{ position: [8, 5, 8], fov: 50 }}>
  {/* Environment */}
  <ambientLight intensity={0.4} />
  <directionalLight 
    position={[5, 10, 5]} 
    intensity={1} 
    castShadow 
    shadow-mapSize={[1024, 1024]} 
  />
  <fog attach="fog" args={['#0f172a', 5, 30]} /> {/* Fade-out zum Hintergrund */}

  {/* World */}
  <group position={[0, -1, 0]}>
    <TerrainFloor />      {/* Der Boden & Schlamm */}
    <Obstacles />         {/* Steine & Geröll */}
    <Targets />           {/* Die Container */}
    <StartZone />         {/* Visueller Startpunkt */}
  </group>

  {/* Interaction */}
  <OrbitControls 
    enablePan={false} 
    maxPolarAngle={Math.PI / 2.2} // Nicht unter den Boden schauen
    minDistance={5}
    maxDistance={20}
    autoRotate={autoRotate}
    autoRotateSpeed={0.5}
  />
</Canvas>
```

### 3.3. Prozedurale Assets (Low-Poly Look)

Da wir keine externen Modelle laden, bauen wir die Welt aus Primitiven:

**A. Der Boden (`TerrainFloor`)**
- **Geometrie:** `PlaneGeometry` (Größe 15x15, Segmente 32x32).
- **Formgebung:** 
  - Wir modifizieren die Vertices nicht manuell (zu komplex für diesen Schritt), sondern nutzen visuelle Tricks.
  - Basis-Boden: Braun (`#5d4037`).
  - **Schlamm-Pfützen:** Flache `Circle`-Geometrien, die *leicht* über dem Boden schweben (y=0.01).
    - Farbe: Dunkelbraun/Schwarz (`#271c19`).
    - Material: Hohe `roughness: 0.1` (glänzend), `metalness: 0.1`.
  - **Rampe:** Eine rotierte `BoxGeometry`, die als Anstieg zu einem Plateau dient.

**B. Hindernisse (`Obstacles`)**
- **Steine:** `DodecahedronGeometry` (12-Flächner sehen aus wie Low-Poly Steine).
- **Verteilung:** Wir platzieren ca. 20-30 Instanzen zufällig, aber gruppiert (InstancedMesh für Performance nicht zwingend nötig bei <50 Objekten, aber sauberer).
- **Farbe:** Verschiedene Grautöne (`#64748b` bis `#334155`).

**C. Ziele (`Targets` - Container)**
- **Geometrie:** `BoxGeometry` (1.5, 1, 2.5).
- **Look:** Rostiges Metall.
  - Farbe: Orange-Braun (`#c2410c`).
  - Details: Wir können kleine schwarze Streifen (dünne Boxen) hinzufügen, um Struktur anzudeuten.
- **Platzierung:**
  1. In einer Schlammpfütze.
  2. Oben auf der Rampe.
  3. Hinter einem Steinfeld.

## 4. Integration in `Level3_Mechanisms.tsx`

Die Visualisierung dient als Header/Intro-Element.

**Änderungen:**
1.  **Import:** `import { Level3_TerrainViewer } from './Level3_TerrainViewer';`
2.  **UI-Layout:**
    - Im `INTRO`-State: Anzeige groß (Höhe 300px-400px) über dem Szenario-Text.
    - Im `ACTIVE`-State: Anzeige kleiner (Höhe 200px) oder als Overlay verfügbar.
3.  **Visuelles Feedback:**
    - Wenn der User "Kettenantrieb" wählt, könnte (optional, Ausbaustufe) ein kleiner Rover in der 3D-Szene erscheinen. Für MVP bleibt es statisch.

## 5. Action Plan

1.  **Installieren:** `npm install three @types/three @react-three/fiber @react-three/drei`
2.  **Erstellen:** `src/components/levels/Level3_TerrainViewer.tsx` implementieren.
3.  **Integrieren:** `src/components/levels/Level3_Mechanisms.tsx` anpassen.
4.  **Testen:** Sicherstellen, dass der Build (`npm run build`) funktioniert (Transpilierung von Three.js Assets).

## 6. Fallback

Falls WebGL auf dem Client nicht verfügbar ist oder Performance-Probleme auftreten, rendert `Canvas` gar nicht oder wir fangen Fehler ab. Da es eine "Engineering Simulation" ist, setzen wir WebGL-Support voraus.

