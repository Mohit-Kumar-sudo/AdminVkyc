import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private apiUrl = 'http://localhost:6969/api/v1/documents';

  constructor(private http: HttpClient) {}

  uploadDocument(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('document', file);
    return this.http.post(`${this.apiUrl}/upload`, formData);
  }

  getSection(docId: string, section: string, reportId:string): Observable<any> {
    console.log(`Fetching section: ${section} for document ID: ${docId}`);
    return this.http.get(`${this.apiUrl}/${docId}/${section}/${reportId}`);
  }
}
