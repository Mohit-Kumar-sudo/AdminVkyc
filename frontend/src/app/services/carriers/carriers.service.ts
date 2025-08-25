import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// Add this interface definition
export interface Carrier {
  _id: string;
  jobTitle: string;
  jobSkills: string;
  jobDuration: string;
  jobRole: string;
  jobLocation: string;
  jobExperience: string;
  jobType: string;
  jobDescription: string;
  jobPreference: string;
  jobSalary: string;
  created_at: string;
  updated_at: string;
  // Add any other properties that your carriers have
}

@Injectable({
  providedIn: 'root'
})
export class CarriersService {
  nativeElement: any;
  //private apiUrl = `${environment.url}/carriers`;

  constructor(private http: HttpClient) { }

  onCarriersGetAllPublic() {
    return this.http.get(`${environment.url}/carriers/public`);
  }

  onCarriersFindOne(id: string) {
    return this.http.get(`${environment.url}/carriers/get/${id}`);
  }

  // New method to get carriers with pagination and filters
  getCarriersWithFilters(queryParams: any): Observable<any> {
    let params = new HttpParams()
      .set('page', queryParams.page || 1)
      .set('limit', queryParams.limit || 10);
    
    // Add filter parameters if present
    if (queryParams.jobType) {
      params = params.set('jobType', queryParams.jobType);
    }
    
    if (queryParams.jobPreference) {
      params = params.set('jobPreference', queryParams.jobPreference);
    }
    
    if (queryParams.expRanges) {
      params = params.set('expRanges', queryParams.expRanges);
    }
    
    // Add any other query parameters
    Object.keys(queryParams).forEach(key => {
      if (!['page', 'limit', 'jobType', 'jobPreference', 'expRanges'].includes(key)) {
        params = params.set(key, queryParams[key]);
      }
    });
    
    return this.http.get(`${environment.url}/carriers/public`, { params });
  }

  get(carriersRoute: String, query: any): Observable<any> {
    return this.http.get(`${environment.url}/${carriersRoute}`, { params: query })
  }

  getById(carriersRoute: String, id: any): Observable<any> {
    return this.http.get(`${environment.url}/${carriersRoute}/${id}`)
  }

  post(carriersRoute: String, data: any): Observable<any> {
    return this.http.post(`${environment.url}/${carriersRoute}`, data)
  }

  put(carriersRoute: String, id: any, data: any): Observable<any> {
    return this.http.put(`${environment.url}/${carriersRoute}/${id}`, data)
  }

  delete(carriersRoute: String, id: any): Observable<any> {
    return this.http.delete(`${environment.url}/${carriersRoute}/${id}`)
  }
}