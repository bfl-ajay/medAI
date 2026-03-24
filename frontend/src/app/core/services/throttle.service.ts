import { Injectable } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { throttleTime } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ThrottleService {

  createThrottler<T>(delay: number = 1000) {
    const subject = new Subject<T>();

    return {
      next: (value: T) => subject.next(value),

      subscribe: (callback: (value: T) => void): Subscription => {
        return subject
          .pipe(throttleTime(delay))
          .subscribe(callback);
      },

      complete: () => subject.complete()
    };
  }
}