Hier ist der **finale, erweiterte Masterplan**.

Ich habe ihn so strukturiert, dass **jedes Level eine komplett isolierte Datei** ist. Das macht es dir (und der KI) extrem einfach, Fehler zu finden oder Texte zu ändern, ohne das ganze Programm zu zerschießen.

Besonderer Fokus liegt nun auf **Storytelling** und **"Jargon-Busting"** (Fachbegriffe werden sofort im Kontext erklärt).

-----

# 📂 Project ARES: Engineering Simulator – Entwicklungsplan v2.0

## 1\. Projekt-Architektur & Dateistruktur

Wir nutzen eine modulare Architektur. Das "Main Game" ist nur ein Container, der die Levels lädt.

```bash
/src
  /app
    page.tsx                  # Der "Level Loader" (wechselt Components basierend auf State)
    layout.tsx                # Das globale "Terminal Design" (Rahmen)
  /components
    /ui                       # Basis-Bausteine
      TerminalCard.tsx        # Container für Textblöcke
      TypewriterText.tsx      # Effekt: Text tippt sich wie im Hacker-Film
      GlossaryTooltip.tsx     # Hover-Erklärung für Fachbegriffe
    /levels                   # HIER LIEGT DIE MAGIE (Jedes Level isoliert)
      Level1_Mechanics.tsx
      Level2_Transmission.tsx
      Level3_Electronics.tsx
      Level4_Signals.tsx
      Level5_Ethics.tsx
  /store
    gameStore.ts              # Speichert: Welches Level? Wieviel Credits?
  /lib
    physicsEngine.ts          # Formeln (ausgelagert, damit Level-Code sauber bleibt)
```

-----

## 2\. Der "Glossary-Ansatz" (Didaktik)

**Regel für die Entwicklung:** Kein Fachbegriff steht allein.
Wir nutzen eine UI-Komponente `<GlossaryTerm term="Drehmoment" definition="Die Drehkraft des Motors. Wie stark er 'zupacken' kann." />`.
Im Text sieht der Schüler: *"Das \<u\>Drehmoment\</u\> reicht nicht aus."*
Fährt er mit der Maus drüber, erscheint die Erklärung.

-----

## 3\. Level-Spezifikationen (Copy-Paste für die KI)

Hier sind die Anweisungen für jedes einzelne File.

### 🟢 DATEI: `src/components/levels/Level1_Mechanics.tsx`

**Thema:** Materialkunde (Steifigkeit vs. Dichte)
**Jargon:** E-Modul, Plastische Verformung, Dichte.

#### 1\. Story & Text (State: 'INTRO')

> **SYSTEM MELDUNG:** "Verbindung hergestellt... Unit-7 Status: KRITISCH."
>
> **SZENARIO:** "Wir haben ein Problem, Rookie. Unit-7 hat versucht, eine Gesteinsprobe zu heben. Dabei ist der Greifarm kaputt gegangen und baumelt jetzt verbogen in der falschen Position herum. Das alte Material war einfach zu schwach für diese Last."
>
> **AUFTRAG:** "Konstruiere einen neuen Arm. Er muss **steif** genug sein, um 5kg zu heben, ohne sich mehr als 2mm zu biegen. Aber Vorsicht: Wenn der Arm schwerer als 1000g ist, brennen die Schultermotoren durch."

#### 2\. Fachbegriffe (Glossary Content)

  * **Steifigkeit (E-Modul):** "Der Widerstand eines Materials gegen Verformung. Gummi hat ein niedriges E-Modul, Stahl ein sehr hohes."
  * **Dichte:** "Wie schwer das Material pro Kubikzentimeter ist."

#### 3\. Implementierungs-Logik

  * **Input:** User wählt Material (Radio Buttons).
      * *Holz:* Leicht, aber biegt sich extrem.
      * *Stahl:* Biegt sich kaum, aber extrem schwer.
      * *Aluminium:* Guter Mittelweg.
  * **Simulation (Recharts Graph):**
      * X-Achse: Gewicht der Last (0-10kg).
      * Y-Achse: Durchbiegung (mm).
      * Zeichne Rote Linie bei Y=2mm (Toleranzgrenze).
      * Zeichne Kurve des gewählten Materials live.
  * **Fail State Text:**
      * (Zu schwer): "WARNUNG: Motorstrom übersteigt 100%. Arm zu schwer\! Motoren überhitzen."
      * (Zu weich): "WARNUNG: Präzisionsfehler. Der Arm biegt sich zu stark. Ziel verfehlt."

-----

### 🟡 DATEI: `src/components/levels/Level2_Transmission.tsx`

**Thema:** Getriebe & Übersetzung
**Jargon:** Drehmoment, RPM (Umdrehungen pro Minute), Übersetzung ($i$).

#### 1\. Story & Text (State: 'INTRO')

> **SZENARIO:** "Der Arm ist repariert. Gute Arbeit. Jetzt muss Unit-7 die Probe zur Basis bringen. Der Weg führt über die 'Valles Marineris' Rampe. Steigung: 20 Grad."
>
> **PROBLEM:** "Im aktuellen Zustand bleibt der Rover mitten am Hang stehen. Der Motor dreht sich, aber die Räder bewegen sich nicht. Ihm fehlt die Kraft."
>
> **AUFTRAG:** "Passe das Getriebe an. Wir brauchen mehr Kraft (Drehmoment) am Rad. Aber Achtung: Wenn du die Übersetzung zu hoch wählst, wird der Rover so langsam wie eine Schnecke und der Akku ist leer, bevor er oben ankommt."

#### 2\. Fachbegriffe (Glossary Content)

  * **Drehmoment (Torque):** "Die Kraft, mit der sich die Achse dreht. Wichtig zum Bergauffahren."
  * **RPM (Revolutions Per Minute):** "Wie oft sich das Rad in einer Minute dreht. Bestimmt die Geschwindigkeit."
  * **Übersetzung (Ratio):** "Wie beim Fahrrad: Kleiner Gang = Viel Kraft, wenig Speed. Großer Gang = Wenig Kraft, viel Speed."

#### 3\. Implementierungs-Logik

  * **Input:** Slider für Gear Ratio (1:1 bis 50:1).
  * **Visualisierung:**
      * Links: Motor (dreht immer gleich schnell).
      * Rechts: Rad (dreht sich je nach Slider langsamer/schneller).
      * Chart: Zeigt Arbeitspunkt auf der Motorkennlinie.
  * **Win Condition:**
      * Drehmoment am Rad \> 15 Nm (benötigt für Steigung).
      * Geschwindigkeit \> 2 km/h (sonst Timeout).

-----

### 🔴 DATEI: `src/components/levels/Level3_Electronics.tsx`

**Thema:** Spannungsabfall & Innenwiderstand
**Jargon:** Spannung (Volt), Strom (Ampere), Innenwiderstand, Brownout.

#### 1\. Story & Text (State: 'INTRO')

> **SZENARIO:** "Mechanisch läuft alles. Aber wir haben ein elektronisches Phänomen. Jedes Mal, wenn der Rover aus dem Stand anfährt (Vollgas), startet der Bordcomputer neu."
>
> **ANALYSE:** "Der Anlaufstrom ist riesig. Das zwingt die Batterie in die Knie. Die Systemspannung bricht kurzzeitig zusammen."
>
> **AUFTRAG:** "Analysiere das Oszilloskop. Finde eine Stromquelle, die stabil bleibt, auch wenn der Motor plötzlich viel Strom zieht."

#### 2\. Fachbegriffe (Glossary Content)

  * **Spannung (Volt):** "Der 'Druck', der den Strom durch die Leitung schiebt. Computer brauchen konstant 3.3V oder 5V."
  * **Anlaufstrom:** "Ein Motor braucht im ersten Moment des Anfahrens 5-10x mehr Strom als beim normalen Fahren."
  * **Innenwiderstand:** "Jede Batterie bremst den Stromfluss im Inneren etwas ab. Je schlechter die Batterie, desto höher dieser Widerstand."
  * **Brownout:** "Kurzer Spannungsabfall, der Computer abstürzen lässt (wie Flackerlicht)."

#### 3\. Implementierungs-Logik

  * **Visualisierung (Oszilloskop):**
      * Ein Graph zeigt konstant 12V.
      * User drückt "Motor Start".
      * Graph zeigt einen tiefen "Dip" (Einbruch).
  * **Interaktion:**
      * *Batterie A (Billig):* Dip geht runter bis 2V -\> **System Reboot (Fail).**
      * *Batterie B (High-Performance):* Dip geht nur bis 10V -\> **System Stabil.**
      * *Kondensator Add-on:* Glättet die Kurve.
  * **Fail Message:** "CRITICAL ALERT: Voltage Low. CPU Reset triggered."

-----

### 🔵 DATEI: `src/components/levels/Level4_Signals.tsx`

**Thema:** Signalverarbeitung & Prellen
**Jargon:** Rauschen (Noise), Prellen (Bouncing), Flanke.

#### 1\. Story & Text (State: 'INTRO')

> **SZENARIO:** "Unit-7 ist an der Sortieranlage. Ein Laser-Sensor soll vorbeifahrende Kisten zählen. Eine Kiste fährt vorbei -\> 'Klick'."
>
> **PROBLEM:** "Der Zähler zeigt völligen Unsinn an. Eine Kiste kommt, aber der Zähler springt auf '5'. Schau dir das Signal vom Sensor genauer an."
>
> **AUFTRAG:** "Das ist kein sauberes Signal. Der Schalter 'prellt' (vibriert). Der Computer ist so schnell, dass er jedes Vibrieren als neue Kiste zählt. Repariere das Signal."

#### 2\. Fachbegriffe (Glossary Content)

  * **Prellen (Bouncing):** "Wenn Metallkontakte aufeinanderprallen, federn sie mikroskopisch klein zurück. Einmal Drücken erzeugt oft 10 kleine Signale."
  * **Rauschen (Noise):** "Störungen im Signal."

#### 3\. Implementierungs-Logik

  * **Visualisierung:** Zoom auf das Signal. Man sieht "Zick-Zack-Linien".
  * **Puzzle (Code-Block):**
      * User sieht Pseudocode: `if (Signal == HIGH) { Count = Count + 1 }`.
      * User muss einen Baustein einfügen.
      * Option A: `Wait(1 ms)` (Zu kurz, prellt immer noch).
      * Option B: `Wait(50 ms)` (Perfekt, ignoriert das Nachfedern).
      * Option C: `Voltage++` (Hilft nicht).

-----

### ⚫ DATEI: `src/components/levels/Level5_Ethics.tsx`

**Thema:** Geplante Obsoleszenz & Gyroskop
**Jargon:** Gyroskop, Proprietär, Firmware.

#### 1\. Story & Text (State: 'INTRO')

> **SZENARIO:** "Exzellente Arbeit bis hierher. Unit-7 ist fast fertig. Doch jetzt leuchtet die Warnleuchte: 'GYROSKOP FEHLER'. Ohne Gyro kippt der Rover um, da er nicht weiß, wo oben und unten ist."
>
> **DIAGNOSE:** "Das Gyro-Modul auf der Platine ist durchgebrannt. Ein Standard-Teil, Cent-Artikel."
>
> **PROBLEM:** "Du hast das Ersatzteil eingelötet. Aber der Rover verweigert den Dienst."

#### 2\. Fachbegriffe (Glossary Content)

  * **Gyroskop:** "Ein Sensor, der Neigung und Drehung misst. Der Gleichgewichtssinn des Roboters."
  * **Proprietär:** "Technik, die nur dem Hersteller gehört und verschlüsselt ist. Gegenteil von 'Open Source'."
  * **Firmware:** "Die fest eingebaute Software auf dem Chip."


-----
>
> **Anforderungen:**
>
> 1.  Nutze React, Tailwind und Framer Motion.
> 2.  Der Text muss EXAKT wie im Plan sein (Story, Intro, Szenario).
> 3.  Fachbegriffe (siehe Plan) müssen in einer `<Tooltip>` Komponente gewrappt sein, die den Erklärungstext beim Hover anzeigt.
> 4.  Nutze 'Zustand' für den globalen Fortschritt.
> 5.  Das Level hat interne States: 'INTRO' (Text lesen), 'ACTIVE' (Arbeiten/Simulieren), 'SUCCESS' (Weiter zum nächsten), 'FAIL' (Neustart Button).
> 6.  Design: Nutze Dark Mode, Monospace Fonts für Daten, Cyan für Erfolge, Rot für Fehler.
>
> **Logik:**
> #### 5\. Implementierungs-Logik

  * **Interaktion:**
      * User klickt "Bauteil tauschen" (Kosten: 5 Credits).
      * Animation: Löten erfolgreich.
      * **Alert Popup:** "ERROR CODE 99: UNAUTHORIZED HARDWARE DETECTED. SYSTEM LOCKDOWN."
  * **Story Twist:**
      * Textnachricht vom Hersteller (AresCorp): *"Sie versuchen, ein nicht-zertifiziertes Bauteil zu nutzen. Bitte kaufen Sie das offizielle Mainboard für 500 Credits."*
  * **Entscheidung:**
      * Der User *kann* das Mainboard nicht kaufen (zu teuer).
      * Er muss entscheiden: Den Roboter illegal hacken ("Jailbreak") oder die Mission abbrechen.
      * Dies ist der emotionale Höhepunkt der Lektion über "Recht auf Reparatur".

Damit hast du die perfekte Balance: Maximale Flexibilität durch einzelne Dateien, aber ein extrem dichtes und geführtes Story-Erlebnis für die Schüler.