import { Injectable } from '@angular/core';


@Injectable({
    providedIn: 'root'
})
export class LocalStorageService {

    set(key: string, value: any): void {
        localStorage.setItem(key, JSON.stringify(value));
    }

    remove(key: string) {
        localStorage.removeItem(key);
    }

    get(key: string): any {
      return JSON.parse(localStorage.getItem(key));
    }

    removeAll() {
      localStorage.clear();
    }

}
