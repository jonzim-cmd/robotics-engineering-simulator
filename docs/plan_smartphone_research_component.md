# Implementierungsplan: SmartphoneResearch Komponente

## Ziel
Erstellen einer wiederverwendbaren, modularen Komponente, die ein Smartphone mit Internet-Recherche-Ergebnissen darstellt. Der Nutzer kann durch mehrere Suchergebnisse/Seiten klicken.

## 1. Neue Komponente: `src/components/ui/SmartphoneResearch.tsx`

### Beschreibung
Eine modale Overlay-Komponente, die ein Smartphone-Display simuliert und mehrere Text-Seiten (Suchergebnisse) nacheinander anzeigt.

### Props Interface
```typescript
interface SearchResult {
  title: string;        // z.B. "Was ist Drehmoment?"
  content: string;      // Der Haupttext (kann mehrzeilig sein)
}

interface SmartphoneResearchProps {
  searchResults: SearchResult[];  // Array von Suchergebnissen
  onComplete: () => void;          // Callback wenn alle Seiten durchgeklickt wurden
  searchQuery?: string;            // Optional: Die Suchanfrage (z.B. "Getriebe Drehmoment")
  browserTitle?: string;           // Optional: Browser-Tab-Titel (default: "Suche")
}
```

### State Management
```typescript
const [currentPage, setCurrentPage] = useState(0);
const isLastPage = currentPage === searchResults.length - 1;
```

### UI Struktur

#### Äußerer Container (Modal Overlay)
- Fullscreen Overlay mit dunklem Hintergrund (`bg-black/90 backdrop-blur-md`)
- Zentriert das Smartphone

#### Smartphone-Frame
- Smartphone-ähnliches Design mit abgerundeten Ecken
- Notch oben (wie moderne Smartphones)
- Rand um das Display herum (Border)
- Schatten für 3D-Effekt
- Dimensionen: ca. 375px breit, 667px hoch (iPhone 8 Format)

#### Browser-UI (oben)
- **URL-Bar:**
  - Zurück/Vor-Buttons (deaktiviert, nur visuell)
  - URL: `https://www.suche.de/results?q={searchQuery}`
  - Reload-Icon (nur visuell)

- **Tab:**
  - Browser-Tab mit Titel
  - Favicon (Lupe-Icon)

#### Content-Bereich (scrollbar)
- **Suchergebnis-Card:**
  - Nummer: "Suchergebnis {currentPage + 1}"
  - Titel: Groß, fett, prominent
  - Content: Formatierter Text mit:
    - Absätzen
    - Listen
    - Hervorhebungen (fett)
    - "Merke:"-Boxen in anderer Farbe
  - Quelle unten: "www.technik-lexikon.de" (grau, klein)

#### Navigation (unten)
- **Buttons:**
  - "Vorherige Seite" (disabled wenn currentPage === 0)
  - Seitenzahl: "{currentPage + 1} / {totalPages}"
  - "Nächste Seite" / "Weiter zum Level" (je nach isLastPage)

### Visuelle Details

#### Smartphone-Design
```
┌─────────────────┐
│    ◯◯◯ Notch   │  <- Notch mit Kamera/Sensoren
├─────────────────┤
│ ← → 🔍 suche.de│  <- Browser-Bar
├─────────────────┤
│                 │
│  SUCHERGEBNIS 1 │
│                 │
│  Was ist        │
│  Drehmoment?    │
│                 │
│  Content...     │
│                 │
│                 │
├─────────────────┤
│  ← [1/4]  →    │  <- Navigation
└─────────────────┘
```

#### Farbschema
- Smartphone-Rahmen: `bg-slate-900` mit `border-slate-700`
- Display: `bg-white` (heller Hintergrund für bessere Lesbarkeit)
- Browser-Bar: `bg-slate-100`
- Text: `text-slate-900` (dunkel auf hell)
- Hervorhebungen: `text-cyan-600`
- "Merke"-Boxen: `bg-cyan-50 border-cyan-300`
- Buttons:
  - Aktiv: `bg-cyan-600 hover:bg-cyan-500`
  - Disabled: `bg-slate-300 text-slate-500`

### Content-Formatierung
Der Content sollte Markdown-ähnliche Formatierung unterstützen:
- `\n\n` → Neuer Absatz
- Listen werden erkannt und formatiert
- "Merke:" am Anfang einer Zeile → Spezielle Box

### Animationen (framer-motion)
- **Initial:** Smartphone fährt von unten ein
- **Page-Transition:** Beim Seitenwechsel:
  - Alter Content: `fadeOut` nach links
  - Neuer Content: `fadeIn` von rechts
- **Button-Hover:** Subtile Scale-Animation

## 2. Integration in Level2_Transmission.tsx

### State-Änderungen
```typescript
const [showSmartphoneResearch, setShowSmartphoneResearch] = useState(false);
```

### Flow-Änderung
**Alt:**
```
INTRO → [Klick "Mission Starten"] → ReflectionChat → ACTIVE
```

**Neu:**
```
INTRO → [Klick "Mission Starten"] → SmartphoneResearch → ACTIVE
```

### Implementierung
```typescript
const handleStart = () => {
  setShowSmartphoneResearch(true);
};

const handleResearchComplete = () => {
  setShowSmartphoneResearch(false);
  // Save state before advancing
  pushStateHistory();
  setLevelState('ACTIVE');
};
```

### JSX Integration
```tsx
{showSmartphoneResearch && (
  <SmartphoneResearch
    searchQuery="Getriebe Drehmoment"
    searchResults={[
      {
        title: "Was ist Drehmoment?",
        content: `Drehmoment beschreibt, wie stark eine Drehkraft ist.
Es geht nicht nur darum, dass sich etwas dreht, sondern wie kräftig.

Stell dir einen Schraubenschlüssel vor:
Wenn der Griff länger ist, kannst du dieselbe Schraube leichter lösen → mehr Drehmoment.

Beim Fahrrad:
Wenn du fest aufs Pedal drückst, übst du Drehmoment auf die Kurbel aus.

Merke:
Viel Drehmoment = Es ist leichter, etwas zu drehen (z.B. ein Rad oder eine Welle).`
      },
      {
        title: "Was ist ein Getriebe?",
        content: `Ein Getriebe besteht meistens aus Zahnrädern, die ineinandergreifen.
Es verbindet den Motor mit den Rädern.

Ein Getriebe kann:
• die Drehzahl ändern (wie schnell sich etwas dreht)
• das Drehmoment ändern (wie kräftig sich etwas dreht)

Beispiel Fahrrad:
Wenn du den Gang wechselst, ändert sich das Verhältnis zwischen kleinem und großem Zahnrad.

Das ist im Prinzip auch ein Getriebe.`
      },
      {
        title: "Was bedeutet Übersetzung?",
        content: `Die Übersetzung beschreibt das Verhältnis der Zahnräder im Getriebe.

Einfach gesagt:
Ein Zahnrad dreht sich schnell, das andere langsam.
Oder umgekehrt.

Beispiel:
Kleines Zahnrad treibt ein großes an →
Das große dreht sich langsamer, hat aber mehr Drehmoment.

Großes Zahnrad treibt ein kleines an →
Das kleine dreht sich schneller, hat aber weniger Drehmoment.

Merke:
Übersetzung bestimmt, wie viel Drehmoment und wie viel Geschwindigkeit an den Rädern ankommt.`
      },
      {
        title: "Kraft oder Geschwindigkeit? – der Tausch",
        content: `Bei Getrieben gibt es immer einen Tausch:
• Mehr Drehmoment am Rad → weniger Geschwindigkeit
• Mehr Geschwindigkeit am Rad → weniger Drehmoment

Beispiele:

Leichter Gang am Fahrrad:
Du kommst den Berg hoch (viel Drehmoment),
aber du bist langsam.

Schwerer Gang:
Du kannst schnell fahren (hohe Geschwindigkeit),
aber es ist schwer, einen Berg hochzukommen (wenig Drehmoment).

Merke:
In Maschinen ist es genauso:
Man kann nicht gleichzeitig maximale Kraft und maximale Geschwindigkeit haben.`
      }
    ]}
    onComplete={handleResearchComplete}
  />
)}
```

## 3. Wiederverwendbarkeit

Die Komponente ist modular aufgebaut und kann in anderen Levels verwendet werden:

### Beispiel: Level 3 - Electronics
```tsx
<SmartphoneResearch
  searchQuery="Spannung Strom Widerstand"
  searchResults={[
    { title: "Was ist Spannung?", content: "..." },
    { title: "Was ist Strom?", content: "..." },
    { title: "Ohmsches Gesetz", content: "..." }
  ]}
  onComplete={handleComplete}
/>
```

### Beispiel: Level 4 - Signals
```tsx
<SmartphoneResearch
  searchQuery="PWM Signal Frequenz"
  searchResults={[
    { title: "Was ist ein Signal?", content: "..." },
    { title: "PWM erklärt", content: "..." }
  ]}
  onComplete={handleComplete}
/>
```

## 4. Technische Details

### Dependencies
- `framer-motion` (bereits vorhanden)
- `react` (bereits vorhanden)
- Tailwind CSS (bereits vorhanden)

### Icons
- Verwende SVG-Icons für Browser-UI (Zurück, Vor, Reload, Lupe)
- Heroicons oder eigene SVGs

### Responsive Design
- Smartphone sollte auf kleinen Bildschirmen skalieren
- Max-Width für sehr große Screens

### Accessibility
- Keyboard-Navigation (Pfeiltasten für vor/zurück)
- ARIA-Labels für Buttons
- Focus-Management

## 5. Dateistruktur

```
src/
  components/
    ui/
      SmartphoneResearch.tsx       <-- NEU
      ReflectionChat.tsx           (behalten, für andere Zwecke)
    levels/
      Level2_Transmission.tsx      <-- UPDATE (Integration)
```

## 6. Nächste Schritte

1. **Komponente erstellen** (`SmartphoneResearch.tsx`)
   - Props Interface definieren
   - Smartphone-UI aufbauen
   - Content-Rendering mit Formatierung
   - Navigation implementieren
   - Animationen hinzufügen

2. **Level2 aktualisieren**
   - Import der neuen Komponente
   - State Management anpassen
   - Integration statt ReflectionChat
   - Suchergebnisse definieren

3. **Testing**
   - Durchklicken durch alle 4 Seiten
   - Vor/Zurück Navigation testen
   - "Weiter zum Level" Button funktioniert

## 7. Optional: Erweiterte Features (später)

- **Scroll-Animation:** Content scrollt sanft beim Wechsel
- **Browser-History:** Zurück-Button wird aktiv wenn man eine Seite weiter ist
- **Loading-Animation:** Beim Seitenwechsel kurzes Laden simulieren
- **Favoriten-Button:** Visuell, ohne Funktion
- **Weitere Browser-Tabs:** Visuell im Hintergrund
- **Dark Mode:** Smartphone kann Dark Mode haben

---

## Zusammenfassung

Die `SmartphoneResearch` Komponente ist:
- ✅ Modular und wiederverwendbar
- ✅ Visuell ansprechend (Smartphone-Design)
- ✅ Einfach zu integrieren (wie ReflectionChat)
- ✅ Flexibel (beliebig viele Suchergebnisse)
- ✅ Konsistent mit dem bestehenden UI-Design
