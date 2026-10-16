import type { CoverTypeface } from "@/lib/album-cover-style";
import type { AlbumPageText } from "@/lib/album-page-text";

export type AlbumLayout = "editorial" | "gallery" | "collage";

export type AlbumPhoto = {
    id: string;
    name: string;
    blob: Blob;
    url: string;
    width: number;
    height: number;
    caption: string;
    storagePath?: string;
    /** Crop anchor inside the photo's frame, 0–1 (0.5 = centre). */
    focusX?: number;
    focusY?: number;
};

export type AlbumDraftMeta = {
    destinationId: string;
    title: string;
    year: string;
    coverTypeface?: CoverTypeface;
    coverTextColor?: string;
    coverBackground?: string;
    layout: AlbumLayout;
    step: number;
    photoIds: string[];
    captions: Record<string, string>;
    pageText?: AlbumPageText;
    focus?: Record<string, [number, number]>;
    /** Storage folder for photos uploaded before the album's first save. */
    cloudId?: string;
    updatedAt: number;
};

type StoredPhoto = Omit<AlbumPhoto, "url" | "caption">;

const DB_NAME = "itinero-album-builder";
const DB_VERSION = 1;

function openDraftDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains("draft")) db.createObjectStore("draft");
            if (!db.objectStoreNames.contains("photos")) db.createObjectStore("photos", { keyPath: "id" });
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
    return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () => reject(transaction.error);
    });
}

export async function loadAlbumDraft(): Promise<{ meta: AlbumDraftMeta | null; photos: AlbumPhoto[] }> {
    const db = await openDraftDatabase();
    try {
        const transaction = db.transaction(["draft", "photos"], "readonly");
        const done = transactionDone(transaction);
        const metaRequest = requestResult<AlbumDraftMeta | undefined>(transaction.objectStore("draft").get("current"));
        const photosRequest = requestResult<StoredPhoto[]>(transaction.objectStore("photos").getAll());
        const [storedMeta, storedPhotos] = await Promise.all([metaRequest, photosRequest]);
        await done;
        const meta = storedMeta ?? null;
        const photosById = new Map(storedPhotos.map(photo => [photo.id, photo]));
        const ordered = (meta?.photoIds ?? storedPhotos.map(photo => photo.id))
            .map(id => photosById.get(id))
            .filter((photo): photo is StoredPhoto => Boolean(photo));
        return {
            meta,
            photos: ordered.map(photo => ({ ...photo, url: URL.createObjectURL(photo.blob), caption: meta?.captions[photo.id] ?? "",
                focusX: meta?.focus?.[photo.id]?.[0] ?? 0.5, focusY: meta?.focus?.[photo.id]?.[1] ?? 0.5 })),
        };
    } finally {
        db.close();
    }
}

export async function saveAlbumDraft(meta: AlbumDraftMeta): Promise<void> {
    const db = await openDraftDatabase();
    try {
        const transaction = db.transaction("draft", "readwrite");
        const done = transactionDone(transaction);
        transaction.objectStore("draft").put(meta, "current");
        await done;
    } finally {
        db.close();
    }
}

export async function saveAlbumPhoto(photo: AlbumPhoto): Promise<void> {
    const db = await openDraftDatabase();
    try {
        const transaction = db.transaction("photos", "readwrite");
        const done = transactionDone(transaction);
        transaction.objectStore("photos").put({ id: photo.id, name: photo.name, blob: photo.blob, width: photo.width, height: photo.height, storagePath: photo.storagePath } satisfies StoredPhoto);
        await done;
    } finally {
        db.close();
    }
}

export async function deleteAlbumPhoto(id: string): Promise<void> {
    const db = await openDraftDatabase();
    try {
        const transaction = db.transaction("photos", "readwrite");
        const done = transactionDone(transaction);
        transaction.objectStore("photos").delete(id);
        await done;
    } finally {
        db.close();
    }
}

export async function clearAlbumDraft(): Promise<void> {
    const db = await openDraftDatabase();
    try {
        const transaction = db.transaction(["draft", "photos"], "readwrite");
        const done = transactionDone(transaction);
        transaction.objectStore("draft").clear();
        transaction.objectStore("photos").clear();
        await done;
    } finally {
        db.close();
    }
}
