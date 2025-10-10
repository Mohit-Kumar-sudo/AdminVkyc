// blog.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { catchError, map } from 'rxjs/operators';
import { of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  constructor(private httpClient: HttpClient) {}

  onBlogGetAllPublic() {
    return this.httpClient
      .get(`${environment.url}/blogs/public`, { responseType: 'text' })
      .pipe(
        map(text => {
          // try parse JSON; if not JSON we can return fallback or throw
          try {
            return JSON.parse(text);
          } catch (err) {
            // log raw HTML/error so you can inspect it
            console.error('Non-JSON response from /blogs/public:', text);
            // return empty array so UI doesn't crash; change this as desired
            return [];
          }
        }),
        catchError((err: HttpErrorResponse) => {
          console.error('HTTP error fetching blogs:', err);
          // return fallback so components don't break
          return of([]);
          // or rethrow: return throwError(() => err);
        })
      );
  }

  onBlogFindOne(id: string) {
    return this.httpClient.get(`${environment.url}/blogs/get/${id}`);
  }
}