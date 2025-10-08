import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TokenService } from '../token/token.service'; 
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface CourseForm {
  _id?: string;  // Optional ID property if it exists
  name: string;
  email: string;
  countryCode: string;
  number: string;
  course: string;
  price: string;
  // --- NEW FIELDS ---
  payment_status?: 'pending' | 'successful' | 'failed' | 'abandoned';
  bundle_purchased?: boolean;
  total_amount: number;
  razorpay_order_id?: string;
}


@Injectable({
  providedIn: 'root'
})
export class CourseService {

  private apiUrl = `${environment.url}/course-query`;

  constructor(private httpClient: HttpClient, private tokenService: TokenService) {}

  // This function now returns the user data AND the Razorpay order
  onCourseSave(courseForm: CourseForm): Observable<any> {
    return this.httpClient.post(this.apiUrl, courseForm);
  }

  // --- NEW: VERIFY PAYMENT METHOD ---
  verifyPayment(queryId: string, paymentData: any): Observable<any> {
    return this.httpClient.post(`${this.apiUrl}/verify-payment/${queryId}`, paymentData);
  }

  // Get all Course forms
  onCourseGetAll(): Observable<CourseForm[]> {
    //const token = this.tokenService.getToken(); // Retrieve token from TokenService
    //console.log('Token used for request:', token); // Log the token for debugging
    //const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.httpClient.get<CourseForm[]>(this.apiUrl);
  }
  
  // Delete a specific Course form by ID
  onCourseDelete(id: string): Observable<any> {
    //const token = this.tokenService.getToken();
    //const headers = new HttpHeaders().set('Authorization', `Bearer ${token ? token : ''}`);
    return this.httpClient.delete(`${this.apiUrl}/${id}`);
  }
  
  // Find a specific Course form by ID
  onCourseFindOne(id: string): Observable<CourseForm> {
    //const token = this.tokenService.getToken();
    //const headers = new HttpHeaders().set('Authorization', `Bearer ${token ? token : ''}`);
    return this.httpClient.get<CourseForm>(`${this.apiUrl}/${id}`);
  }
  
  // Update a specific Course form by ID
  onCourseUpdate(id: string, form: CourseForm): Observable<CourseForm> {
    //const token = this.tokenService.getToken();
    //const headers = new HttpHeaders().set('Authorization', `Bearer ${token ? token : ''}`);
    return this.httpClient.put<CourseForm>(`${this.apiUrl}/${id}`, form);
  }
  
  // Delete all Course forms
  onCourseDeleteAll(): Observable<any> {
    //const token = this.tokenService.getToken();
    //const headers = new HttpHeaders().set('Authorization', `Bearer ${token ? token : ''}`);
    return this.httpClient.delete(this.apiUrl);
  }
}
