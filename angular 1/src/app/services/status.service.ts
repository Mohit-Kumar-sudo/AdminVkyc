import { Injectable } from '@angular/core';
import { APIEndPoints } from '../constants/mfr.constants';

@Injectable({
  providedIn: 'root'
})
export class StatusService {

  constructor() { }

  baseUrl = APIEndPoints.REPORT_API
  addStatus(id) {
    return fetch(this.baseUrl + '/status/' + id, {
      method: 'get',
      headers: { 'content-type': 'application/json' }
    });
  }

  getStatus(id) {
    return fetch(this.baseUrl + '/reportmodule/status/' + id, {
      method: 'get',
      headers: { 'content-type': 'application/json' }
    });
  }

  updateStatus(data, id) {
    return fetch(this.baseUrl + '/status/' + id, {
      method: 'post',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(data)
    });
  }
}
