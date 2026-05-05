import { STORAGE_KEYS } from "../constants.js";

const STORAGE_KEY = STORAGE_KEYS.ADMIN_CREDENTIALS;

export function makeBasicAuth(username, password) {
  return "Basic " + btoa(`${username}:${password}`);
}

export function saveAdminAuth(username, password) {
  try {
    sessionStorage.setItem(STORAGE_KEY, makeBasicAuth(username, password));
  } catch {
    // ignore (private mode etc.)
  }
}

export function getAdminAuth() {
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function clearAdminAuth() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function isAdminAuthed() {
  return Boolean(getAdminAuth());
}
