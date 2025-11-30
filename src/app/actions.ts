'use server';

import { sql } from '@/lib/db';
import { revalidatePath } from 'next/cache';

// --- Types ---
export type User = {
  id: number;
  name: string;
  created_at: Date;
  last_active: Date;
};

export type ProgressEvent = {
  id: number;
  user_id: number;
  level_id: number;
  event_type: string;
  payload: any;
  created_at: Date;
};

// --- Student / User Actions ---

/**
 * Attempts to log in a student.
 * The student must already exist in the database (created by admin).
 */
export async function loginUser(name: string): Promise<{ success: boolean; userId?: number; error?: string }> {
  try {
    // Normalize name: trim and convert to uppercase
    const cleanName = name.trim().toUpperCase();

    if (!cleanName) {
      return { success: false, error: 'Name darf nicht leer sein.' };
    }

    // Check if user exists
    const result = await sql`
      SELECT id FROM users WHERE name = ${cleanName}
    `;

    if (result.rows.length === 0) {
      return { success: false, error: 'Benutzer nicht gefunden. Bitte frage deinen Lehrer.' };
    }

    const userId = result.rows[0].id;

    // Update last active timestamp
    await sql`
      UPDATE users SET last_active = CURRENT_TIMESTAMP WHERE id = ${userId}
    `;

    // Track login event
    await trackEvent(userId, 0, 'SESSION_START', { timestamp: new Date().toISOString() });

    return { success: true, userId };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Datenbankfehler beim Login.' };
  }
}

/**
 * Tracks an event (level completion, reflection answer, etc.)
 */
export async function trackEvent(userId: number, levelId: number, eventType: string, payload: any) {
  try {
    await sql`
      INSERT INTO progress (user_id, level_id, event_type, payload)
      VALUES (${userId}, ${levelId}, ${eventType}, ${JSON.stringify(payload)})
    `;
  } catch (error) {
    console.error('Tracking error:', error);
    // We don't throw here to avoid blocking the UI if tracking fails
  }
}

// --- Admin Actions ---

/**
 * Verifies PIN and returns all admin data (students + progress).
 * PIN is hardcoded to '1111' as requested.
 */
export async function getAdminData(pin: string) {
  if (pin !== '1111') {
    return { success: false, error: 'Falscher PIN' };
  }

  try {
    // Fetch users
    const usersResult = await sql`
      SELECT * FROM users ORDER BY name ASC
    `;

    // Fetch all progress data
    // We limit to last 1000 or so if it gets too big, but for 30 students it's fine to fetch all.
    const progressResult = await sql`
      SELECT p.*, u.name as user_name 
      FROM progress p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
    `;

    return {
      success: true,
      users: usersResult.rows as User[],
      progress: progressResult.rows as (ProgressEvent & { user_name: string })[],
    };
  } catch (error) {
    console.error('Admin data fetch error FULL DETAILS:', error);
    return { success: false, error: 'Fehler beim Laden der Daten: ' + (error as Error).message };
  }
}

/**
 * Creates a new student (Admin only).
 */
export async function createStudent(name: string): Promise<{ success: boolean; error?: string }> {
  // In a real app, we'd check for an admin session here.
  // Since this is called from the protected Admin page, we assume authorization via the UI flow.

  const cleanName = name.trim().toUpperCase();
  if (!cleanName) return { success: false, error: 'Name ungültig' };

  try {
    await sql`
      INSERT INTO users (name) VALUES (${cleanName})
    `;

    revalidatePath('/admin'); // Refresh admin data if we were using server components there
    return { success: true };
  } catch (error: any) {
    if (error.code === '23505') { // Unique violation
      return { success: false, error: 'Name existiert bereits' };
    }
    console.error('Create student error:', error);
    return { success: false, error: 'Datenbankfehler' };
  }
}

/**
 * Deletes a user and all associated progress data (Admin only).
 * The ON DELETE CASCADE constraint ensures all progress records are automatically deleted.
 */
export async function deleteUser(userId: number): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await sql`
      DELETE FROM users WHERE id = ${userId}
    `;

    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('Delete user error:', error);
    return { success: false, error: 'Fehler beim Löschen des Benutzers' };
  }
}

/**
 * Deletes all progress entries for a specific user (Admin only).
 * The user account remains intact, only their progress data is cleared.
 */
export async function deleteUserProgress(userId: number): Promise<{ success: boolean; error?: string }> {
  try {
    await sql`
      DELETE FROM progress WHERE user_id = ${userId}
    `;

    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('Delete progress error:', error);
    return { success: false, error: 'Fehler beim Löschen der Progress-Daten' };
  }
}
