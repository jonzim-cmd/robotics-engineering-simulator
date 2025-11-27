# Implementierungsplan: Level 2 Intro-Visualisierung & Reflexion

## Ziel
Ersetzen des textbasierten Intros in Level 2 durch eine animierte Szene (`StalledRampVisualization`) und Hinzufügen einer interaktiven Verständnisfrage vor dem Missionsstart.

## 1. Neue Komponente: `src/components/ui/StalledRampVisualization.tsx`

Diese Komponente visualisiert das "Verhungern" am Berg aufgrund von Drehmomentmangel.

### Visuelle Elemente (Szene)
*   **Hintergrund**: Technisches Grid, düstere Atmosphäre.
*   **Rampe**: Steiler Anstieg (20°) von links nach rechts.
*   **Hero Robot (Unit-7)**:
    *   Fährt auf der Ebene sehr schnell (hohe Übersetzung), wird am Hang sofort langsamer und bleibt stehen.
*   **Der Stau**:
    *   Nachfolgende Roboter kommen an, bremsen hart.
    *   Warnsymbole/Emotes über den Robotern.

## 2. Integration in `src/components/levels/Level2_Transmission.tsx`

Der Intro-Bereich wird komplett überarbeitet.

### Neuer Ablauf (State Flow)
1.  **Animation & Szenario**: User sieht die Animation und liest das Problem.
2.  **Reflexions-Aufgabe (NEU)**:
    *   User muss in ein Textfeld schreiben, warum *zu viel* Kraft (zu hohe Übersetzung) ebenfalls problematisch ist.
    *   Button "Überprüfen" (keine echte Validierung, nur Trigger).
3.  **Lösung & Start**:
    *   Die korrekte Antwort wird eingeblendet: *"Eine zu hohe Übersetzung liefert zwar viel Kraft, macht den Roboter aber extrem langsam. Er wird zum Verkehrshindernis und blockiert den Warenfluss genauso wie ein liegengebliebener Roboter."*
    *   Der Button "Getriebe konfigurieren" wird freigeschaltet.

### UI Struktur
*   **Header**: `SYSTEM STATUS: LIEFERENGPASS - SEKTOR 4`
*   **Visualisierung**: `<StalledRampVisualization />`
*   **Szenario Text**: Erklärung von Kraft vs. Geschwindigkeit.
*   **Input Section**:
    *   Frage: *"Hypothese: Warum führt auch eine sehr hohe Übersetzung (maximale Kraft) zu einem Stau?"*
    *   `<textarea>` für User-Input.
    *   `<button>` "Hypothese prüfen".
*   **Resolution Section** (erscheint nach Klick):
    *   Lösungstext (System-Antwort).
    *   `<button>` "Mission Starten" (führt zur Simulation).

## 3. Technische Umsetzung
*   **Komponente**: `StalledRampVisualization.tsx` (Framer Motion).
*   **Level Logik**:
    *   `useState` für `userHypothesis` (string).
    *   `useState` für `showSolution` (boolean).
    *   Styling: Tailwind CSS (Slate/Cyan Theme).

## Nächste Schritte
1.  Erstellung `StalledRampVisualization.tsx`.
2.  Umbau `Level2_Transmission.tsx` mit Animation und neuer Input-Logik.
