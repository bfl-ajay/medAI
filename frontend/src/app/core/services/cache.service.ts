import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class CacheService {

    private cache = new Map<string, any>();

    // ✅ store
    set(key: string, value: any) {
        this.cache.set(key, value);
    }

    // ✅ get
    get<T>(key: string): T | null {
        return this.cache.has(key) ? this.cache.get(key) : null;
    }
    
    getOrFetch<T>(
        key: string,
        fetchFn: () => any,
        callback: (data: T) => void
    ) {
        const cached = this.get<T>(key);

        if (cached) {
            callback(cached);
        } else {
            fetchFn().subscribe((data: T) => {
                this.set(key, data);
                callback(data);
            });
        }
    }
    // ✅ delete single
    delete(key: string) {
        this.cache.delete(key);
    }

    // ✅ clear all (logout)
    clear() {
        this.cache.clear();
    }
}   