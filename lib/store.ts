import fs from "node:fs/promises";
import path from "node:path";
import { defaultAppData, defaultSettings } from "@/lib/demo-data";
import type { AppData, AuditLog, DocumentRecord, LandRecord, NotificationItem, User, SystemSettings } from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "app-data.json");

function deduplicateNotifications(notifications: NotificationItem[]) {
  const seenIds = new Set<string>();
  return notifications.filter((notification) => {
    if (seenIds.has(notification.id)) return false;
    seenIds.add(notification.id);
    return true;
  });
}

async function ensureDataFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });

  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify(defaultAppData, null, 2), "utf-8");
  }
}

export async function loadAppData(): Promise<AppData> {
  await ensureDataFile();

  const raw = await fs.readFile(DATA_FILE, "utf-8");

  try {
    const parsed = JSON.parse(raw) as AppData;
    return {
      users: parsed.users ?? defaultAppData.users,
      documents: parsed.documents ?? defaultAppData.documents,
      landRecords: parsed.landRecords ?? defaultAppData.landRecords,
      notifications: deduplicateNotifications(parsed.notifications ?? defaultAppData.notifications),
      auditLogs: parsed.auditLogs ?? defaultAppData.auditLogs,
      settings: parsed.settings ?? defaultSettings,
    };
  } catch {
    return defaultAppData;
  }
}

export async function saveAppData(data: AppData) {
  await ensureDataFile();
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  return data;
}

export async function resetAppData() {
  await ensureDataFile();
  await fs.writeFile(DATA_FILE, JSON.stringify(defaultAppData, null, 2), "utf-8");
  return defaultAppData;
}

export async function appendAuditLog(log: AuditLog) {
  const data = await loadAppData();
  const next = { ...data, auditLogs: [log, ...data.auditLogs] };
  await saveAppData(next);
  return next;
}

export async function appendNotification(notification: NotificationItem) {
  const data = await loadAppData();
  const next = {
    ...data,
    notifications: [notification, ...data.notifications.filter((item) => item.id !== notification.id)],
  };
  await saveAppData(next);
  return next;
}

export async function updateNotification(id: string, updates: Partial<NotificationItem>) {
  const data = await loadAppData();
  const nextNotifications = data.notifications.map((item) => (item.id === id ? { ...item, ...updates } : item));
  const next = { ...data, notifications: nextNotifications };
  await saveAppData(next);
  return next;
}

export async function markAllNotificationsRead() {
  const data = await loadAppData();
  const nextNotifications = data.notifications.map((item) => ({ ...item, read: true }));
  const next = { ...data, notifications: nextNotifications };
  await saveAppData(next);
  return next;
}

export async function clearAllNotifications() {
  const data = await loadAppData();
  const next = { ...data, notifications: [] };
  await saveAppData(next);
  return next;
}

export async function upsertDocument(document: DocumentRecord) {
  const data = await loadAppData();
  const docs = [document, ...data.documents.filter((item) => item.id !== document.id)];
  const next = { ...data, documents: docs };
  await saveAppData(next);
  return next;
}

export async function deleteDocument(id: string) {
  const data = await loadAppData();
  const docs = data.documents.filter((item) => item.id !== id);
  const next = { ...data, documents: docs };
  await saveAppData(next);
  return next;
}

export async function upsertLandRecord(record: LandRecord) {
  const data = await loadAppData();
  const records = [record, ...data.landRecords.filter((item) => item.id !== record.id)];
  const next = { ...data, landRecords: records };
  await saveAppData(next);
  return next;
}

export async function deleteLandRecord(id: string) {
  const data = await loadAppData();
  const records = data.landRecords.filter((item) => item.id !== id);
  const next = { ...data, landRecords: records };
  await saveAppData(next);
  return next;
}

export async function upsertUser(user: User) {
  const data = await loadAppData();
  const users = [user, ...data.users.filter((item) => item.id !== user.id)];
  const next = { ...data, users };
  await saveAppData(next);
  return next;
}

export async function updateUser(id: string, updates: Partial<User>) {
  const data = await loadAppData();
  const users = data.users.map((item) => (item.id === id ? { ...item, ...updates } : item));
  const next = { ...data, users };
  await saveAppData(next);
  return next;
}

export async function updateSettings(settings: Partial<SystemSettings>) {
  const data = await loadAppData();
  const currentSettings = data.settings ?? defaultSettings;
  const nextSettings = { ...currentSettings, ...settings };
  const next = { ...data, settings: nextSettings };
  await saveAppData(next);
  return next;
}
