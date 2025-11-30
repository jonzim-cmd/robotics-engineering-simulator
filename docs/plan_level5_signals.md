# Level 5 Konzept: "Der Geist in der Maschine" (Signale & Rauschen)

## 1. Übersicht & Lernziel
In diesem Level lernt der Spieler, dass Sensoren in der echten Welt niemals perfekte digitale Werte (0 oder 1) liefern, sondern analoge, verrauschte Signale. Um Roboter zuverlässig zu machen, müssen **Schwellenwerte (Thresholds)** definiert werden, um Rauschen (Noise) von echten Hindernissen zu unterscheiden.

**Kernmechanik:** Tuning eines Schwellenwerts, um "Geister-Hindernisse" auszufiltern.

---

## 2. Szenario & Story
**Der Aufhänger:**
Die Nachtschicht im Lager meldet, dass Unit-7 "besessen" ist. Er sieht Hindernisse, wo keine sind, zuckt panisch zurück und dreht sich im Kreis. Harald (CEO) denkt, die KI entwickelt ein Bewusstsein (oder Angst vor der Dunkelheit).

**Die Realität:**
Ein billiger Ultraschallsensor hat ein hohes Grundrauschen. Die Software interpretiert dieses Rauschen fälschlicherweise als nahestehende Objekte.

---

## 3. Visueller Aufbau (Das "Remote Dashboard")

Der Screen ist aufgebaut wie ein professionelles Debugging-Tool für Ingenieure, die sich remote auf den Roboter schalten.

### A. Linke Seite: Das Terminal (Log-Stream)
Ein klassisches Terminal-Fenster (schwarzer Hintergrund, grüne Monospace-Schrift), in dem Log-Nachrichten in rasender Geschwindigkeit durchlaufen. Dies erzeugt Stress und verdeutlicht das Problem textuell.

**Beispiel-Logs (Deutsch):**
```text
[14:02:23.455] SENSOR_01: Distanz 245cm (OK)
[14:02:23.480] SENSOR_01: Distanz 0.4cm (KRITISCH)
[14:02:23.482] SYSTEM: NOT-STOPP AUSGELÖST!
[14:02:23.490] MOTOR: Vollbremsung
[14:02:24.100] SENSOR_01: Distanz 244cm (OK)
[14:02:24.150] SYSTEM: Fahre weiter...
[14:02:24.200] SENSOR_01: Distanz 0.2cm (KRITISCH)
[14:02:24.210] SYSTEM: HINDERNIS ERKANNT - RÜCKZUG
```

### B. Rechte Seite: Die 3D-Visualisierung (Three.js)
Ein 3D-View des Roboters in einer abstrakten "Grid-World" (Tron-Look oder Wireframe), um den "Maschinen-Blick" zu simulieren.

**Animationen des "verrückten" Roboters:**
Der Roboter spielt einen Loop ab, solange das Problem nicht gelöst ist:
1.  **Normalfahrt:** Fährt kurz geradeaus.
2.  **Der "Schreck":** Stoppt abrupt (Bremsspur-Partikel?).
3.  **Die Panik:** Dreht sich wild im Kreis (sucht das Hindernis).
4.  **Das Zittern:** Fährt ruckartig vor und zurück (Vibration), weil das Signal zwischen "Wand da" und "Wand weg" springt.
5.  **Phantom-Visualisierung:** Rote, halb-transparente Kugeln ploppen kurz vor dem Roboter auf und verschwinden sofort wieder (Visualisierung der falschen Sensorwerte).

---

## 4. Interaktion & Gameplay

### Schritt 1: Diagnose ("Debug Mode aktivieren")
Der Spieler klickt auf einen Button "Sensor-Diagnose".
Ein Overlay schiebt sich über den unteren Bereich des Screens (oder öffnet sich als Modal).

**Das Oszilloskop:**
*   Man sieht einen Graphen, der von links nach rechts läuft (Zeitverlauf).
*   Die Linie (das Sensorsignal) ist "zackig" (Noise).
*   Die meiste Zeit ist die Linie oben (kein Hindernis), aber sie hat Spikes nach unten.
*   Manchmal taucht eine echte Wand auf (Linie geht dauerhaft ganz nach unten).

### Schritt 2: Das Tuning (Threshold Slider)
Es gibt eine horizontale Linie im Graphen: **Der Schwellenwert**.

*   **Status Quo (Fehler):** Der Schwellenwert ist zu hoch eingestellt. Das normale "Rauschen" der Sensoren unterschreitet die Linie -> Der Roboter denkt "Hindernis!".
*   **Die Aufgabe:** Der Spieler muss den Schwellenwert nach unten ziehen (via Slider).
*   **Die Gefahr:** Zieht man ihn zu weit nach unten (auf 0), wird auch die echte Wand nicht mehr erkannt und der Roboter würde im Simulations-Check gegen die Wand fahren.

### Schritt 3: Erfolg
Sobald der Schwellenwert im "Sweet Spot" ist (unterhalb des Rauschens, aber oberhalb des echten Wand-Signals):
1.  Der Graph wird grün.
2.  Die Logs im Terminal beruhigen sich (`Status: Nominal`).
3.  Der 3D-Roboter hört auf zu zittern und fährt eine saubere Kurve durch den Raum.

---

## 5. Technische Komponenten

1.  **`LogTerminal.tsx`**:
    *   Erhält Array von Strings.
    *   Auto-Scroll Logik.
    *   Styling: Retro-Terminal Look.

2.  **`CrazyRobotScene.tsx` (Three.js)**:
    *   Szene mit GridHelper.
    *   Low-Poly Roboter Model (wiederverwendet aus Level 1-4).
    *   Animations-Logik: Ein State-Machine Hook, der zufällig zwischen `SPIN`, `MOVE`, `SHAKE` wechselt, basierend auf einem `chaosLevel` Prop.

3.  **`SignalOscilloscope.tsx`**:
    *   Canvas oder SVG basierter Graph.
    *   Generiert Perlin-Noise oder Random-Noise in Echtzeit.
    *   Interaktiver Slider für den Threshold Y-Wert.

4.  **`Level5_Signals.tsx`**:
    *   Main Container, der den State (Threshold Wert) verwaltet und an die Komponenten verteilt.

---

## 6. Abschluss & Belohnung
*   **Harald:** "Ah, er hat nur Gespenster gesehen! Gute Arbeit. Ich dachte schon, wir brauchen einen Exorzisten."
*   **Unlocks:** Freischaltung von Level 6 (Ethik & Vendor Lock-in).
