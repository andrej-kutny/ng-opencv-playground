import { Injectable } from '@angular/core';

const DB_NAME = 'ng-cv-playground';
const DB_VERSION = 1;
const IMAGE_STORE = 'images';
const IMAGE_KEY = 'uploaded-image';
const TRANSFORMATIONS_KEY = 'ng-cv-transformations';

interface StoredTransformation {
  name: string;
  enabled: boolean;
  config: { [key: string]: any };
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private dbPromise: Promise<IDBDatabase>;

  constructor() {
    this.dbPromise = this.openDb();
  }

  private openDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(IMAGE_STORE)) {
          db.createObjectStore(IMAGE_STORE);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async saveImage(dataUrl: string): Promise<void> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IMAGE_STORE, 'readwrite');
      tx.objectStore(IMAGE_STORE).put(dataUrl, IMAGE_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async loadImage(): Promise<string | null> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IMAGE_STORE, 'readonly');
      const request = tx.objectStore(IMAGE_STORE).get(IMAGE_KEY);
      request.onsuccess = () => resolve(request.result ?? null);
      request.onerror = () => reject(request.error);
    });
  }

  saveTransformations(transformations: StoredTransformation[]): void {
    localStorage.setItem(TRANSFORMATIONS_KEY, JSON.stringify(transformations));
  }

  loadTransformations(): StoredTransformation[] | null {
    const data = localStorage.getItem(TRANSFORMATIONS_KEY);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }
}
