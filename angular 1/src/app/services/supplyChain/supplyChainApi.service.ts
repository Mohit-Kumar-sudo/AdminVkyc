import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { NodeModel } from 'src/app/models/supplyChain/node.model';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { APIEndPoints } from 'src/app/constants/mfr.constants';
import { map, catchError } from 'rxjs/operators';

@Injectable()
export class SupplyChainApiService {

	private serviceEndPoint = 'http://172.16.0.116:8081/api/supplyChainNode';
	private kamleshApiServiceEndPoint = 'http://172.16.0.116:8081/api';

	constructor(private httpClient: HttpClient) {
	}

	getAll(): Observable<any> {
		return this
			.httpClient
			.get(this.serviceEndPoint)
	}

	save(nodeModel: NodeModel): Observable<any> {
		if (nodeModel._id === '') {
			return this
				.httpClient
				.post<NodeModel>(this.serviceEndPoint, nodeModel);
		} 
	}
	remove(_id: String): Observable<any> {
		return this
			.httpClient
			.delete<any>(`${this.kamleshApiServiceEndPoint}/supply/${_id}`)
	}

	updateModule(_id: String, nodeModel: any): Observable<any> {
		if (_id !== '') {
			return this
				.httpClient
				.put<NodeModel>(`${this.kamleshApiServiceEndPoint}/supply/${_id}`, nodeModel);
		}
	}

	public saveSupplyChainData(reportId, tocModuleData): Observable<any> {
		const headers = new HttpHeaders({
			'Content-Type': 'application/json'
		});

		return this.httpClient
			.post(APIEndPoints.ES_API + `/${reportId}/toc`, [tocModuleData], { headers: headers });
	}

	getSupplyChainData(reportId, sid, msId): Observable<any[]> {
		return this.httpClient.get<any>(APIEndPoints.ES_API + "/" + reportId + "/toc?msid=" + msId + '&sid=' + sid);
	}


	handleError(err: HttpErrorResponse) {
		return throwError(err);
	}
}