import { effect, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OpencvService {
  public _cv = signal<any>(null);
  public src = signal<any | null>(null);
  public dst = signal<any | null>(null);

  constructor() {
    (window as any).cv.then((cv: any) => this._cv.set(cv));
  }

  get cv() {
    return this._cv.asReadonly();
  }
}
