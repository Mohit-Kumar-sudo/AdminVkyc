import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TokenService } from '../token/token.service'; 
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';


export interface CarrierForm {
  _id?: string;  // Optional ID property if it exists
  name: string;
  email: string;
  countryCode: string;
  number: string;
  linkedin: string;
  category: string;
  experience: string;
  resume: string;
}

@Injectable({
  providedIn: 'root'
})
export class CarrierQueryService {


  private apiUrl = `${environment.url}/carrier-query`;
  private fileApiUrl = `${environment.url}/file`;

  constructor(private httpClient: HttpClient, private tokenService: TokenService) {}

  onCarrierFormSave(carrierForm: CarrierForm) {
    console.log(carrierForm);
    return this.httpClient.post(`${environment.url}/carrier-query`, carrierForm);
  }

  // Get all CarrierForm forms
  onCarrierFormGetAll(): Observable<CarrierForm[]> {
    //const token = this.tokenService.getToken(); // Retrieve token from TokenService
    //console.log('Token used for request:', token); // Log the token for debugging
    //const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.httpClient.get<CarrierForm[]>(this.apiUrl);
  }
  
  // Delete a specific CarrierForm form by ID
  onCarrierFormDelete(id: string): Observable<any> {
    //const token = this.tokenService.getToken();
    //const headers = new HttpHeaders().set('Authorization', `Bearer ${token ? token : ''}`);
    return this.httpClient.delete(`${this.apiUrl}/${id}`);
  }
  
  // Find a specific CarrierForm form by ID
  onCarrierFormFindOne(id: string): Observable<CarrierForm> {
    //const token = this.tokenService.getToken();
    //const headers = new HttpHeaders().set('Authorization', `Bearer ${token ? token : ''}`);
    return this.httpClient.get<CarrierForm>(`${this.apiUrl}/${id}`);
  }
  
  // Update a specific CarrierForm form by ID
  onCarrierFormUpdate(id: string, form: CarrierForm): Observable<CarrierForm> {
    //const token = this.tokenService.getToken();
    //const headers = new HttpHeaders().set('Authorization', `Bearer ${token ? token : ''}`);
    return this.httpClient.put<CarrierForm>(`${this.apiUrl}/${id}`, form);
  }
  
  // Delete all CarrierForm forms
  onCarrierFormDeleteAll(): Observable<any> {
    //const token = this.tokenService.getToken();
    //const headers = new HttpHeaders().set('Authorization', `Bearer ${token ? token : ''}`);
    return this.httpClient.delete(this.apiUrl);
  }

  getResumeFile(resumePath: string): Observable<Blob> {
    // Extract the year/month/filename pattern from the path
    const pathParts = resumePath.replace(/\\/g, '/').split('/');
    const relevantParts = pathParts.slice(-3); // Gets [year, month, filename]
    
    // Construct URL matching backend route
    const downloadUrl = `${this.fileApiUrl}/download/${relevantParts[0]}/${relevantParts[1]}/${relevantParts[2]}`;
    
    return this.httpClient.get(downloadUrl, {
        responseType: 'blob'
    });
}

downloadResumeFile(resumePath: string): Observable<any> {
    const pathParts = resumePath.replace(/\\/g, '/').split('/');
    const relevantParts = pathParts.slice(-3);
    const downloadUrl = `${this.fileApiUrl}/download/${relevantParts[0]}/${relevantParts[1]}/${relevantParts[2]}`;
    
    return this.httpClient.get(downloadUrl, {
        responseType: 'blob',
        observe: 'response'
    });
}
}
