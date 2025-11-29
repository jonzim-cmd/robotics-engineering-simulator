# Implementation Plan: Admin Portal Improvements

## Objective
Enhance the "CLASSROOM MANAGEMENT" Admin Portal (`src/app/admin/page.tsx`) to improve usability for teachers managing many students.

## Requirements

1.  **User Deletion:** Ability to delete users (and their data) directly from the roster.
2.  **Student Filtering:** Click on a student in the roster to view only their specific activities.
3.  **"All" View:** Ability to revert to viewing activities for all students.
4.  **Clean Event Logs:** Reduce verbosity of event logs, specifically hiding technical JSON structures and prioritizing student answers.

## Proposed Changes

### 1. Backend Actions (`src/app/actions.ts`)

*   **New Action:** `deleteUser(userId: number)`
    *   **Logic:** Delete the user from the `users` table.
    *   **Note:** Since the `progress` table is defined with `ON DELETE CASCADE`, this will automatically clean up the student's event logs.

### 2. Admin Page Logic (`src/app/admin/page.tsx`)

*   **State Management:**
    *   Add `const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);`
    *   This state controls the filter for the right-hand content column.

*   **User Roster UI:**
    *   Add a "Delete" button (X icon, e.g., `X` or `Trash2` from lucide-react) to each row.
    *   Implement a confirmation check (`window.confirm`) before calling `deleteUser`.
    *   Make the user name/row clickable to set `selectedStudentId`.
    *   Add a distinct "All Students" / "Overview" button or row at the top of the list to set `selectedStudentId(null)`.
    *   Highlight the currently selected student (or "All").

*   **Activity & Reflection View (Right Column):**
    *   **Filtering:**
        *   If `selectedStudentId` is set, filter `users` (for the reflection loop) and `progress` (for the event log) to match the ID.
        *   If `null`, show all (current behavior).

*   **Event Log Presentation:**
    *   **Problem:** Current logs show raw JSON: `{"answer":"...","message":"...","partner":"..."}`.
    *   **Solution:** Create a helper function or component `renderEventPayload(payload: any)`.
    *   **Logic:**
        *   If `payload` is a string, display it.
        *   If `payload` is an object:
            *   Prioritize showing `payload.answer` (Student's input).
            *   Hide/minimize context fields like `message` (The question) or `partner`.
            *   Maybe show `message` in a tooltip or smaller text if relevant.
        *   Truncate extremely long text to keep the UI clean.

## Implementation Steps

1.  **Backend:** Implement `deleteUser` in `src/app/actions.ts`.
2.  **Frontend:** Update `src/app/admin/page.tsx` to include the `selectedStudentId` state.
3.  **Frontend:** Refactor the Roster list to include the "All" option, selection styling, and Delete button.
4.  **Frontend:** Update the main content area to respect the filter.
5.  **Frontend:** Implement the `renderEventPayload` logic to clean up the log display.

## Example of Cleaned Log Output

**Raw:**
```json
{"answer":"du kleine Hexe","message":"Kollege Arianit hat gesagt...","partner":"Mitarbeiter Yazid"}
```

**Visual:**
> **Answer:** du kleine Hexe
> *Context: Mitarbeiter Yazid asked about...* (Optional/Collapsed)
