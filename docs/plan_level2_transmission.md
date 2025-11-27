# Implementierungsplan: Level 2 Intro-Visualisierung & Reflexion

## Ziel
Ersetzen des textbasierten Intros in Level 2 durch eine animierte Szene (`StalledRampVisualization`) und Hinzufügen einer interaktiven Verständnisfrage vor dem Missionsstart unter Verwendung der neuen `ReflectionChat`-Komponente.

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

Der Intro-Bereich wird komplett überarbeitet und nutzt das modulare Reflexions-System.

### Neuer Ablauf (State Flow)
1.  **Animation & Szenario**: User sieht die Animation und liest das Problem (Unit-7 blockiert die Rampe).
2.  **Reflexions-Dialog (NEU)**:
    *   Nach Klick auf "Mission Starten" öffnet sich nicht sofort das Level, sondern die `ReflectionChat` Komponente.
    *   **Szenario**: Mittagspause in der Kantine.
    *   **Gespräch**: Zwei Kollegen diskutieren über Stauvermeidung. Einer behauptet, eine extrem hohe Übersetzung (für maximale Kraft) würde Staus verhindern. Der andere ist skeptisch.
    *   **Aufgabe**: Der User klinkt sich ein und erklärt, warum auch eine zu hohe Übersetzung problematisch ist.
3.  **Lösung & Start**:
    *   Die korrekte Antwort wird im Chat eingeblendet.
    *   Der "Weiter"-Button führt dann zum eigentlichen Level-Start (`ACTIVE` state).

### UI Struktur
*   **Header**: `SYSTEM STATUS: LIEFERENGPASS - SEKTOR 4`
*   **Visualisierung**: `<StalledRampVisualization />`
*   **Szenario Text**: Kurze Einleitung zum aktuellen Problem.
*   **Start-Button**: Triggert den Dialog.
*   **Overlay**: `<ReflectionChat />`
    *   **Titel**: "DISKUSSION IN DER KANTINE"
    *   **Context**: Mittagspause. Diskussion über Getriebe-Einstellungen.
    *   **Sender**: "Kollege Ben" (Logistik)
    *   **Message**: *"Hey, wenn wir einfach jedem Roboter eine riesige Übersetzung geben, haben die unendlich Kraft am Berg. Dann bleibt keiner mehr stehen und wir haben nie wieder Stau, oder? Aber Sarah meint, das wäre Quatsch."*
    *   **Correct Answer**: *"Eine zu hohe Übersetzung liefert zwar viel Kraft, macht den Roboter aber auf der Ebene extrem langsam. Er wird dann zum Verkehrshindernis und blockiert den Warenfluss genauso schlimm wie ein liegengebliebener Roboter. Wir brauchen die perfekte Balance."*

## 3. Technische Umsetzung
*   **Komponente**: `StalledRampVisualization.tsx` (bereits geplant).
*   **Level Logik**:
    *   State: `showIntroReflection` (boolean).
    *   Verwendung der `ReflectionChat` Komponente (importiert aus `@/components/ui/ReflectionChat`).
    *   Funktion `handleStart` setzt `showIntroReflection(true)`.
    *   Callback `onComplete` setzt Level auf `ACTIVE`.

## Nächste Schritte
1.  Erstellung `StalledRampVisualization.tsx`.
2.  Umbau `Level2_Transmission.tsx` zur Integration der Animation und des `ReflectionChat`.