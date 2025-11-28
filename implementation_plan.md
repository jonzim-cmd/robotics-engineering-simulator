# Implementierungsplan: Schüler-Tracking & Admin-Portal

Dieser Plan beschreibt die Schritte zur Integration eines Schüler-Logins, eines Hintergrund-Trackings via Vercel Postgres und eines geschützten Admin-Portals.

## 1. Datenbank-Setup (Vercel Postgres)

Wir verwenden Vercel Postgres als Datenbank.

### Schema

```sql
-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE, -- Eindeutige Namen verhindern Duplikate
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Progress / Reflection Table
-- Speichert den Fortschritt und die Antworten pro Level
CREATE TABLE IF NOT EXISTS progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  level_id INTEGER NOT NULL,
  event_type VARCHAR(50), -- 'LEVEL_COMPLETE', 'REFLECTION', 'CREDITS_UPDATE'
  payload JSONB, -- Flexibles Feld für Textantworten oder Stats
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## 2. Backend: Server Actions (`src/app/actions.ts`)

Wir nutzen Next.js Server Actions für die Kommunikation zwischen Client und Datenbank.

*   `loginUser(name: string)`: Erstellt User oder holt bestehende ID.
*   `trackEvent(userId: number, level: number, type: string, data: any)`: Speichert Fortschritt.
*   `getAdminData(pin: string)`: Verifiziert PIN und gibt alle User-Daten zurück.

## 3. Frontend: User Login

*   **Ort:** `src/components/levels/Level0_Intro.tsx` oder ein neuer Wrapper in `src/app/page.tsx`.
*   **Logik:**
    *   Prüfen, ob `gameStore.userName` gesetzt ist.
    *   Wenn nicht -> Eingabefeld anzeigen.
    *   Nach Eingabe -> `loginUser` Action aufrufen -> `userId` im Store speichern -> Spiel starten.

## 4. Frontend: Tracking Integration

Wir müssen an strategischen Stellen Events senden.

*   **Reflexions-Antworten:** In `ReflectionChat.tsx` (oder wo Text eingegeben wird), beim Absenden `trackEvent` aufrufen.
*   **Level-Abschluss:** Wenn `advanceLevel` im Store aufgerufen wird.

## 5. Admin Portal (`src/app/admin/page.tsx`)

*   **Zugang:** Über ein Icon im Header von `src/app/page.tsx`.
*   **UI:**
    *   **Login State:** Eingabefeld für PIN (Hardcoded: `1111`).
    *   **Dashboard State:**
        *   Tabelle aller Schüler.
        *   Akkordeon oder Detail-Ansicht pro Schüler, um deren "Reflections" (Textantworten) zu lesen.
        *   Anzeige des aktuellen Levels.

## 6. Ablaufplan der Umsetzung

1.  **Dependencies:** `npm install @vercel/postgres` (falls noch nicht vorhanden).
2.  **Datenbank:** Setup lokal simulieren oder direkt mit Vercel verknüpfen (Environment Variables `POSTGRES_URL` etc.).
3.  **Server Actions:** Erstellen von `src/app/actions.ts`.
4.  **Admin Icon:** Icon in `src/app/page.tsx` Header einfügen (Lock Icon).
5.  **Admin Page:** Seite erstellen und PIN-Logik implementieren.
6.  **Login Screen:** Startbildschirm anpassen.
7.  **Tracking Hooks:** `ReflectionChat` und `gameStore` mit Tracking versehen.

## Hinweise zur Sicherheit & Performance

*   **PIN:** `1111` ist unsicher, aber für den Schulkontext (wie angefordert) ausreichend. Client-Side Check ist ok, aber Server-Side Check in der `getAdminData` Action ist sauberer.
*   **Concurrency:** Postgres handhabt 30 gleichzeitige Verbindungen problemlos.
