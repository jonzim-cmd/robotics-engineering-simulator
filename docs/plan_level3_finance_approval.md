# Plan: Level 3 Finance Approval & Harald Schuldenbremse

## Objective
Enhance Level 3 (`Level3_Mechanisms.tsx`) by introducing a budget constraint. Users must select the optimal configuration (Tracks + Electromagnet) but will lack the funds to proceed. This triggers a bureaucratic side-quest involving "Harald Schuldenbremse" to secure funding.

## 1. Cost System Implementation
Modify `Level3_Mechanisms.tsx` to include costs for components.

### Data Structure
Define costs for each component type (minimum 100 Credits).

```typescript
const DRIVE_COSTS: Record<DriveType, number> = {
  wheels: 120,
  tracks: 350, // Expensive but correct
  mecanum: 200,
  legs: 500,
  hover: 800
};

const GRIPPER_COSTS: Record<GripperType, number> = {
  claw: 150,
  vacuum: 180,
  magnetic: 300, // Expensive but correct
  soft: 250,
  needle: 120
};
```

### UI Updates
- Update `SelectionCard` to accept and display a `cost` prop.
- Display a "Total Cost" summary in the footer next to the "Konfiguration testen" button.
- Display "Available Credits" (read from `gameStore`).

## 2. Logic Modification in `Level3_Mechanisms`
Update `handleSimulate` to handle the "Insufficent Funds" scenario.

### Current Logic
- Checks if Drive and Gripper are correct.
- If yes -> Success.

### New Logic
1. Check correctness (`driveOk` && `gripperOk`).
2. Calculate `totalCost`.
3. Check `canAfford = currentCredits >= totalCost`.
4. **Scenario A: Incorrect Selection** -> Standard failure message.
5. **Scenario B: Correct Selection + Can Afford** -> Standard Success (deduct credits).
6. **Scenario C: Correct Selection + Cannot Afford** ->
   - Set result to a special "Funding Required" state.
   - Display message: "CONFIGURATION OPTIMAL. SYSTEM READY. ERROR: INSUFFICIENT CREDITS."
   - Show button: "Termin mit Finanzbuchhalter Harald Schuldenbremse vereinbaren".

## 3. New Component: `HaraldDialog.tsx`
Create `src/components/ui/HaraldDialog.tsx`. This is a self-contained modal.

### States
1.  **Monologue**: Harald speaks.
2.  **Form**: The bureaucracy interface.
3.  **Stamp**: The approval animation.

### Phase 1: The Monologue
-   **Content**: The provided text from the prompt.
-   **Interaction**:
    -   Typewriter effect (optional but nice).
    -   **Cheat Code**: Pressing `ArrowRight` twice immediately shows the full text (skips typing/waiting).
    -   "Next" button appears after text is fully shown.

### Phase 2: The Form (Formular A-17b)
-   **Design**: Looks like a paper form on a clipboard or digital tablet.
-   **Fields**:
    -   *Project*: "Unit-7 Recovery" (Read-only/Pre-filled)
    -   *Cost Center*: "Robotics-Dept 42" (Read-only/Pre-filled)
    -   *Name*: Input field (User types name)
    -   *Date*: Input field (User types date)
    -   *Justification*: Textarea ("Why these parts?").
-   **Signature**:
    -   A box at the bottom.
    -   Clicking it triggers a handwriting animation of the user's name or a generic signature.
-   **Submission**:
    -   "Antrag einreichen" button active only after all fields filled + signed.

### Phase 3: Approval
-   On submit, a massive green **"GENEHMIGT"** stamp slams onto the form with a sound effect (visual shake).
-   Wait 2 seconds.
-   Trigger `onApproved` callback.

## 4. Integration & Completion
In `Level3_Mechanisms`:

1.  Pass `handleHaraldApproval` to `HaraldDialog`.
2.  **`handleHaraldApproval`**:
    -   Calculate `shortfall = totalCost - currentCredits`.
    -   Grant `shortfall` + small buffer (e.g., 50 credits) to `gameStore`.
    -   Or simply: `addCredits(5000)` (The "Budget Approval").
    -   Immediately `removeCredits(totalCost)` to pay for the parts.
    -   Update header credits.
    -   Set `levelState` to 'SUCCESS'.
    -   Close Dialog.
    -   Show "Mission Complete".

## 5. Design Specs
-   **Harald's Theme**: Slightly desaturated, bureaucratic grey/beige vs the game's high-tech Cyan/Dark.
-   **Font**: Maybe a serif font for the form to look "official".

## 6. File Structure
-   `src/components/ui/HaraldDialog.tsx`: New file.
-   `src/components/levels/Level3_Mechanisms.tsx`: Modified.
