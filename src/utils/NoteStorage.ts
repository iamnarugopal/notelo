import { Note } from "@/types/note";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CryptoJS from "crypto-js";
import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";
import * as SQLite from "expo-sqlite";

const KEY_NAME = "secret_notes_encryption_key";

let dbInstance: SQLite.SQLiteDatabase | null = null;

const VIEW_MODE_KEY = "notes_view_mode";
const APP_LOCK_KEY = "app_lock_enabled";

export type ViewMode = "list" | "grid";

export async function getViewMode(): Promise<ViewMode> {
  const mode = await AsyncStorage.getItem(VIEW_MODE_KEY);

  return mode === "list" ? "list" : "grid";
}

export async function saveViewMode(mode: ViewMode): Promise<void> {
  await AsyncStorage.setItem(VIEW_MODE_KEY, mode);
}

export async function getAppLockEnabled(): Promise<boolean> {
  return (await AsyncStorage.getItem(APP_LOCK_KEY)) === "true";
}

export async function saveAppLockEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(APP_LOCK_KEY, String(enabled));
}

/**
 * Convert Uint8Array → hexadecimal string
 */
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Get existing encryption key or create a new 256-bit key.
 *
 * 32 bytes = 256 bits
 */
async function getSecretKey(): Promise<string> {
  let key = await SecureStore.getItemAsync(KEY_NAME);

  if (!key) {
    const bytes = await Crypto.getRandomBytesAsync(32);

    key = bytesToHex(bytes);

    await SecureStore.setItemAsync(KEY_NAME, key);
  }

  return key;
}

/**
 * Encrypt text using AES-256-CBC.
 *
 * Returns:
 * iv:ciphertext
 */
async function encryptContent(
  content: string,
  secretKey: string,
): Promise<string> {
  // Convert our 64-character hex key into a CryptoJS WordArray.
  const key = CryptoJS.enc.Hex.parse(secretKey);

  // AES block size = 16 bytes.
  // Generate a new IV for every encryption.
  const ivBytes = await Crypto.getRandomBytesAsync(16);

  const ivHex = bytesToHex(ivBytes);
  const iv = CryptoJS.enc.Hex.parse(ivHex);

  const encrypted = CryptoJS.AES.encrypt(content, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  const ciphertext = encrypted.ciphertext.toString(CryptoJS.enc.Base64);

  return `${ivHex}:${ciphertext}`;
}

/**
 * Decrypt:
 *
 * iv:ciphertext
 */
function decryptContent(encryptedContent: string, secretKey: string): string {
  const [ivHex, ciphertextBase64] = encryptedContent.split(":");

  if (!ivHex || !ciphertextBase64) {
    throw new Error("Invalid encrypted content");
  }

  const key = CryptoJS.enc.Hex.parse(secretKey);
  const iv = CryptoJS.enc.Hex.parse(ivHex);

  const encrypted = CryptoJS.lib.CipherParams.create({
    ciphertext: CryptoJS.enc.Base64.parse(ciphertextBase64),
  });

  const decrypted = CryptoJS.AES.decrypt(encrypted, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return decrypted.toString(CryptoJS.enc.Utf8);
}

/**
 * Initialize SQLite database.
 */
export async function initializeDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync("encrypted_notes.db");

    await dbInstance.execAsync(`
      CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  return dbInstance;
}

/**
 * Save a new note.
 */

export async function createNote(): Promise<number> {
  const db = await initializeDatabase();
  const secretKey = await getSecretKey();

  const encryptedTitle = await encryptContent("", secretKey);
  const encryptedContent = await encryptContent("", secretKey);

  const result = await db.runAsync(
    "INSERT INTO notes (title, content) VALUES (?, ?);",
    [encryptedTitle, encryptedContent],
  );

  return result.lastInsertRowId;
}

export async function saveNote(title: string, content: string): Promise<void> {
  const db = await initializeDatabase();
  const secretKey = await getSecretKey();

  const encryptedTitle = await encryptContent(title, secretKey);
  const encryptedContent = await encryptContent(content, secretKey);

  await db.runAsync("INSERT INTO notes (title, content) VALUES (?, ?);", [
    encryptedTitle,
    encryptedContent,
  ]);
}

/**
 * Update an existing note.
 */
export async function updateNote(
  id: number,
  title: string,
  content: string,
): Promise<void> {
  const db = await initializeDatabase();
  const secretKey = await getSecretKey();

  const encryptedTitle = await encryptContent(title, secretKey);
  const encryptedContent = await encryptContent(content, secretKey);

  await db.runAsync("UPDATE notes SET title = ?, content = ? WHERE id = ?;", [
    encryptedTitle,
    encryptedContent,
    id,
  ]);
}

/**
 * Get a single note by ID.
 */
export async function getNoteById(id: number): Promise<Note | null> {
  const db = await initializeDatabase();
  const secretKey = await getSecretKey();

  const note = await db.getFirstAsync<Note>(
    "SELECT * FROM notes WHERE id = ?;",
    [id],
  );

  if (!note) {
    return null;
  }

  try {
    const decryptedTitle = decryptContent(note.title, secretKey);

    const decryptedContent = decryptContent(note.content, secretKey);

    return {
      ...note,
      title: decryptedTitle,
      content: decryptedContent,
    };
  } catch (error) {
    console.error("Failed to decrypt note:", error);

    return {
      ...note,
      title: "[Decryption Failed]",
      content: "[Decryption Failed]",
    };
  }
}

/**
 * Get all notes.
 */
export async function getNotes(): Promise<Note[]> {
  const db = await initializeDatabase();
  const secretKey = await getSecretKey();

  const rows = await db.getAllAsync<Note>(
    "SELECT * FROM notes ORDER BY id DESC;",
  );

  return rows.map((note) => {
    try {
      const decryptedTitle = decryptContent(note.title, secretKey);

      const decryptedContent = decryptContent(note.content, secretKey);

      return {
        ...note,
        title: decryptedTitle,
        content: decryptedContent,
      };
    } catch (error) {
      console.error(`Failed to decrypt note ${note.id}:`, error);

      return {
        ...note,
        title: "[Decryption Failed]",
        content: "[Decryption Failed]",
      };
    }
  });
}

/**
 * Delete a note.
 */
export async function deleteNote(id: number): Promise<void> {
  const db = await initializeDatabase();

  await db.runAsync("DELETE FROM notes WHERE id = ?;", [id]);
}

/**
 * Delete all notes.
 */
export async function deleteAllNotes(): Promise<void> {
  const db = await initializeDatabase();

  await db.runAsync("DELETE FROM notes;");
}

export async function resetDatabase() {
  if (dbInstance) {
    await dbInstance.closeAsync();
    dbInstance = null;
  }

  await SQLite.deleteDatabaseAsync("encrypted_notes.db");

  await initializeDatabase();
}
