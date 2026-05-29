const DB_NAME = "LoaLogsHandle"
const STORE_NAME = "handles"
const HANDLE_KEY = "encountersDb"
const CHECKPOINT_KEY = "loaLogsCheckpoint"

export type EncounterCheckpoint = {
  id: number
  bossName: string
  difficulty: string
  playerName: string
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function storeFileHandle(handle: FileSystemFileHandle): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite")
    tx.objectStore(STORE_NAME).put(handle, HANDLE_KEY)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function getStoredHandle(): Promise<FileSystemFileHandle | null> {
  try {
    const db = await openDb()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly")
      const req = tx.objectStore(STORE_NAME).get(HANDLE_KEY)
      req.onsuccess = () => resolve(req.result ?? null)
      req.onerror = () => reject(req.error)
    })
  } catch {
    return null
  }
}

export async function removeStoredHandle(): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite")
    tx.objectStore(STORE_NAME).delete(HANDLE_KEY)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export function getCheckpoint(): EncounterCheckpoint | null {
  try {
    const raw = localStorage.getItem(CHECKPOINT_KEY)
    if (!raw) return null
    const cp = JSON.parse(raw) as EncounterCheckpoint
    if (typeof cp.id === "number" && cp.bossName && cp.difficulty && cp.playerName) return cp
    return null
  } catch {
    return null
  }
}

export function setCheckpoint(cp: EncounterCheckpoint): void {
  try {
    localStorage.setItem(CHECKPOINT_KEY, JSON.stringify(cp))
  } catch {}
}

export function clearCheckpoint(): void {
  try {
    localStorage.removeItem(CHECKPOINT_KEY)
  } catch {}
}

export async function checkHandlePermission(handle: FileSystemFileHandle): Promise<PermissionState> {
  try {
    return await handle.queryPermission({ mode: "read" })
  } catch {
    return "denied"
  }
}

export async function requestHandlePermission(handle: FileSystemFileHandle): Promise<boolean> {
  try {
    const state = await handle.requestPermission({ mode: "read" })
    return state === "granted"
  } catch {
    return false
  }
}

export async function requestFileHandle(): Promise<FileSystemFileHandle> {
  const [handle] = await window.showOpenFilePicker({
    types: [
      {
        description: "Encounters Database",
        accept: { "application/x-sqlite3": [".db", ".sqlite", ".sqlite3"] },
      },
    ],
    multiple: false,
  })
  const ok = await requestHandlePermission(handle)
  if (!ok) throw new Error("Permission denied for the selected file")
  await storeFileHandle(handle)
  clearCheckpoint()
  return handle
}
