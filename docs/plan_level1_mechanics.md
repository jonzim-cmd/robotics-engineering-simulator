# Implementierungsplan: Level 1 - Materialkunde (Mechanik)

## 1. Zielsetzung & Lernziel
Der Spieler schlüpft in die Rolle eines Ingenieurs. Anstatt abstraktes Wissen abzufragen, simuliert das Level einen **Konfigurations-Prozess**:
1.  **Problem:** Ein Roboterarm muss 5kg heben, darf sich max. 2mm biegen und der Arm selbst darf max. 1000g wiegen (wegen Motorenlimit).
2.  **Lösung:** Der Spieler durchsucht eine Datenbank nach einem geeigneten Material, extrahiert die technischen Kennwerte (Dichte, E-Modul) und überträgt diese in die Simulationskonsole.
3.  **Feedback:** Eine physikalische Simulation validiert die Eingabe.

## 2. UI-Konzept (Split-Screen)

Das Interface wird in zwei Hauptbereiche unterteilt:

### Linke Seite: Material-Datenbank (Read-Only)
Eine scrollbare Liste oder ein Grid von "Datenblättern". Jedes Element repräsentiert ein reales Material.

*   **Design:** Industrieller "Card"-Look.
*   **Inhalt pro Karte:**
    *   Materialname (z.B. "Aluminium 6061-T6")
    *   Icon/Farbcode
    *   **Dichte ($
ho$):** Wert in $g/cm^3$
    *   **E-Modul ($E$):** Wert in $GPa$
    *   *Fluff-Text:* Kurze Beschreibung (z.B. "Standard im Flugzeugbau. Gutes Gewichts-Steifigkeits-Verhältnis.").

### Rechte Seite: Engineering-Terminal (Input & Simulation)
Hier findet die Interaktion statt.

1.  **Konfigurations-Panel:**
    *   Eingabefeld: `MATERIAL_DENSITY` (Unit: $g/cm^3$)
    *   Eingabefeld: `YOUNGS_MODULUS` (Unit: $GPa$)
    *   *Info:* Die Geometrie des Arms ist fixiert (Standard-Bauteil), um die Komplexität gering zu halten.
2.  **Visualisierungs-Fenster:**
    *   Zeigt schematisch den Roboterarm an der Basis.
    *   Status-LEDs für "Motor Temperature" und "Precision Sensor".
3.  **Action-Button:**
    *   `[ SIMULATION INITIALISIEREN ]`

## 3. Mathematisches Modell (Physik-Engine)

Da die Geometrie fixiert ist, hängen Masse und Biegung linear von den Eingabewerten ab.

### Konstanten (Fixierte Geometrie)
Wir nehmen einen einfachen **Kragbalken (Cantilever Beam)** mit Rechteckprofil an.

*   **Länge ($L$):** $0.5 \, m$ ($500 \, mm$)
*   **Breite ($b$):** $0.03 \, m$ ($30 \, mm$)
*   **Höhe ($h$):** $0.025 \, m$ ($25 \, mm$)
*   **Last ($F_{load}$):** $5 \, kg \approx 49.05 \, N$ ($F = m \cdot g$)

### Berechnungen

#### A. Masse des Arms
$$Volume = L \cdot b \cdot h = 0.5 \cdot 0.03 \cdot 0.025 = 0.000375 \, m^3 = 375 \, cm^3$$ 

$$Masse_{Arm} (g) = Volume (cm^3) \cdot Eingabe_{Dichte} (g/cm^3)$$
*   Formel für Code:* `armMass = 375 * densityInput`

#### B. Flächenträgheitsmoment ($I$)
Das Widerstandsmoment gegen Biegung (für Rechteckprofil):
$$I = \frac{b \cdot h^3}{12}$$
$$I = \frac{0.03 \cdot 0.025^3}{12} \approx 3.906 \cdot 10^{-8} \, m^4$$
*   *Dieser Wert ist konstant, da Geometrie fix ist.*

#### C. Maximale Durchbiegung ($\delta$)
Formel für Kragbalken mit Punktlast am Ende:
$$\delta (m) = \frac{F \cdot L^3}{3 \cdot E \cdot I}$$

*   **Achtung Einheiten:** Der User gibt $E$ in **GPa** ein. Das muss in **Pa** umgerechnet werden ($ \cdot 10^9$).
*   Formel für Code:
    ```typescript
    // Konstanten
    const F = 5 * 9.81; // ~49.05 N
    const L = 0.5;      // m
    const I = 3.90625e-8; // m^4 (vorberechnet aus 30x25mm Profil)

    // Input Konvertierung
    const E_Pa = stiffnessInputGPa * 1e9;

    // Berechnung
    const deflectionMeters = (F * Math.pow(L, 3)) / (3 * E_Pa * I);
    const deflectionMM = deflectionMeters * 1000;
    ```

## 4. Szenarien & Gewinnbedingungen

Die Simulation prüft zwei Bedingungen (Thresholds):

1.  **Motor-Limit (Gewicht):** `armMass <= 1000 g`
2.  **Präzisions-Limit (Biegung):** `deflectionMM <= 2.0 mm`

### Material-Tabelle (Lösungen)

| Material | Dichte ($g/cm^3$) | E-Modul ($GPa$) | Masse bei 375$cm^3$ | Biegung (ca.) | Ergebnis |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Holz (Eiche)** | 0.75 | 12 | 281 g (OK) | ~17.4 mm | **FAIL** (Zu weich) |
| **ABS Plastik** | 1.04 | 2.3 | 390 g (OK) | ~91.0 mm | **FAIL** (Viel zu weich) |
| **Aluminium 6061** | 2.70 | 69 | 1012 g (KNAPP FAIL)* | ~3.0 mm | **FAIL** (Zu schwer & zu weich) |
| **Titan Grade 5** | 4.43 | 114 | 1661 g | ~1.8 mm | **FAIL** (Zu schwer) |
| **Stahl 4340** | 7.85 | 210 | 2943 g | ~1.0 mm | **FAIL** (Viel zu schwer) |
| **Carbon (CFK)** | 1.60 | 150 | 600 g (OK) | ~1.4 mm | **SUCCESS** |

*Anmerkung zur Balance:
Mit den aktuellen Maßen ($30 \times 25mm$) ist Aluminium knapp zu schwer ($1012g$) und biegt sich zu stark ($3mm$).
**Anpassung der Geometrie für das Level:**
Wir ändern die interne, unsichtbare Geometrie leicht auf **$40mm \times 40mm$ Hohlprofil** oder wir tunen die Konstanten so, dass **Aluminium** die "günstige Lösung" und **Carbon** die "High-End Lösung" ist.

**Vorschlag für getunte Konstanten (Game Design):**
Wir definieren, dass das Volumen des Arms **250 cm³** beträgt und das Trägheitsmoment so skaliert ist, dass:
1.  **Aluminium:** $250 \cdot 2.7 = 675g$ (OK). Biegung $\approx 1.8mm$ (OK). -> **Lösung A**
2.  **Stahl:** $250 \cdot 7.85 = 1962g$ (FAIL - Motor). Biegung sehr gering (OK).
3.  **Plastik:** Sehr leicht (OK). Biegung riesig (FAIL).

## 5. Implementierungsschritte

### Schritt 1: `src/lib/physicsEngine.ts` anpassen
*   Export `MATERIALS` Objekt mit realistischen Werten erweitern.
*   Hilfsfunktion `calculateArmPhysics(density, stiffness)` erstellen, die ein Objekt `{ mass, deflection, isSafeMass, isSafeDeflection }` zurückgibt.

### Schritt 2: `src/components/levels/Level1_Mechanics.tsx` Refactoring
1.  State einführen: `inputDensity` (string), `inputStiffness` (string).
2.  UI Layout ändern: Grid mit 2 Spalten.
3.  `handleSimulate` umschreiben:
    *   Parse Inputs to Float.
    *   Call `calculateArmPhysics`.
    *   Setze Animations-Status basierend auf Ergebnis.
4.  Visualisierungskomponente anpassen:
    *   Sollte Biegung visuell darstellen (CSS Rotate oder SVG Curve basierend auf `deflection`).
    *   Farbindikatoren für Motor und Materialstress.

### Schritt 3: Feedback Loop
*   Nach Simulation Textausgabe generieren:
    *   Bei Massen-Fail: "SYSTEM ALERT: Overweight detected. Motors overheating."
    *   Bei Biegungs-Fail: "SYSTEM ALERT: Structural instability. Deflection exceeds tolerance."
    *   Bei Success: "SYSTEM OPTIMAL: Mass within limits. Rigidity acceptable."
