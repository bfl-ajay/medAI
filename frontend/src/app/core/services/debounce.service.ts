import { Injectable } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class DebounceService {

    createDebouncer<T>(delay: number = 500) {
        const subject = new Subject<T>();

        return {
            next: (value: T) => subject.next(value),

            subscribe: (callback: (value: T) => void): Subscription => {
                return subject
                    .pipe(debounceTime(delay))
                    .subscribe(callback);
            },

            complete: () => subject.complete() // 🔥 cleanup support
        };
    }
}