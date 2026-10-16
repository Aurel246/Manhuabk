import { mkdir, writeFile, unlink, readFile, access } from "node:fs/promises";
import { join, dirname } from "node:path";
import { randomUUID } from "node:crypto";

const BASE_DIR = join(process.cwd(), "data", "uploads");

function safeKey(key: string): string {
  const clean = key.replace(/\\/g, "/").replace(/\.\./g, "").replace(/^\/+/, "");
  if (!clean || clean.includes("..")) throw new Error("Clé de stockage invalide.");
  return clean;
}

export function localPath(key: string): string {
  return join(BASE_DIR, safeKey(key));
}

export async function saveFile(key: string, data: Buffer): Promise<string> {
  const k = safeKey(key);
  const path = localPath(k);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, data);
  return k;
}

export async function deleteFile(key: string): Promise<void> {
  try {
    await unlink(localPath(key));
  } catch {
    // ignore si déjà absent
  }
}

export async function fileExists(key: string): Promise<boolean> {
  try {
    await access(localPath(key));
    return true;
  } catch {
    return false;
  }
}

export async function readFileByKey(key: string): Promise<Buffer> {
  return readFile(localPath(key));
}

export function newKey(prefix: string, ext: string): string {
  return `${prefix}/${randomUUID()}.${ext}`;
}
