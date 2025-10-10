import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TokenService } from '../token/token.service'; 
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface CourseForm {
  _id?: string;
  name: string;
  email: string;
  countryCode: string;
  number: string;
  course: string;
  price: string;
  total_amount: number;
  payment_status?: 'pending' | 'successful' | 'failed' | 'abandoned';
  payment_receipt?: string; // Stores receipt file path on server
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
  payment_date?: Date;
  bundle_purchased?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class CourseService {

  private apiUrl = `${environment.url}/course-query`;

  constructor(private httpClient: HttpClient, private tokenService: TokenService) {}

  onCourseSave(courseForm: CourseForm): Observable<any> {
    return this.httpClient.post(this.apiUrl, courseForm);
  }

  verifyPayment(queryId: string, paymentData: any): Observable<any> {
    return this.httpClient.post(`${this.apiUrl}/verify-payment/${queryId}`, paymentData);
  }

  onCourseGetAll(): Observable<CourseForm[]> {
    return this.httpClient.get<CourseForm[]>(this.apiUrl);
  }

  onCourseDelete(id: string): Observable<any> {
    return this.httpClient.delete(`${this.apiUrl}/${id}`);
  }

  onCourseFindOne(id: string): Observable<CourseForm> {
    return this.httpClient.get<CourseForm>(`${this.apiUrl}/${id}`);
  }

  onCourseUpdate(id: string, form: CourseForm): Observable<CourseForm> {
    return this.httpClient.put<CourseForm>(`${this.apiUrl}/${id}`, form);
  }

  onCourseDeleteAll(): Observable<any> {
    return this.httpClient.delete(this.apiUrl);
  }

  // Download receipt from server
  downloadReceipt(queryId: string): Observable<Blob> {
    return this.httpClient.get(`${this.apiUrl}/download-receipt/${queryId}`, {
      responseType: 'blob'
    });
  }

  updateReceiptUrl(userId: string, receiptUrl: string): Observable<any> {
    return this.httpClient.patch(`${this.apiUrl}/update-receipt/${userId}`, { 
      payment_receipt: receiptUrl 
    });
  }

  uploadReceipt(formData: FormData): Observable<any> {
    return this.httpClient.post(`${this.apiUrl}/upload-receipt`, formData);
  }
}