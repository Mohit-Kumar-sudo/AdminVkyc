import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class CoursesService {

  constructor(private http: HttpClient) { }

  onCoursesGetAllPublic() {
    return this.http.get(`${environment.url}/courses/public`);
  }
  
  onCoursesFindOne(id: string) {
    return this.http.get(`${environment.url}/courses/get/${id}`);
  }

  get(coursesRoute: String, query: any): Observable<any> {
    return this.http.get(`${environment.url}/${coursesRoute}`, { params: query })
  }

  getById(coursesRoute: String, id: any): Observable<any> {
    return this.http.get(`${environment.url}/${coursesRoute}/${id}`)
  }

  post(coursesRoute: String, data: any): Observable<any> {
    return this.http.post(`${environment.url}/${coursesRoute}`, data)
  }

  put(coursesRoute: String, id: any, data: any): Observable<any> {
    return this.http.put(`${environment.url}/${coursesRoute}/${id}`, data)
  }

  delete(coursesRoute: String, id: any): Observable<any> {
    return this.http.delete(`${environment.url}/${coursesRoute}/${id}`)
  }
}
