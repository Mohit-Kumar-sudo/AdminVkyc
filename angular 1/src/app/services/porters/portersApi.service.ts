import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { PortersModules } from 'src/app/models/porter/porterModel';
import { SubModule } from 'src/app/models/porter/subModule';
import { APIEndPoints } from 'src/app/constants/mfr.constants';

@Injectable()
export class PortersApiService {

	//For modules
	private serviceEndPoint = 'http://172.16.0.116:8081/api/newPorters';
	//For Sub modules
	private serviceEndPointSubModule = 'http://172.16.0.116:8081/api/newPorterSubModule';

	private kamleshApiEndpoint = 'http://172.16.0.116:8081/api';

	private radarServiceEndPoint = 'http://172.16.0.116:8081/api/radar';

	constructor(private httpClient: HttpClient) {
	}

	getAll(): Observable<any> {
		return this
			.httpClient
			.get(this.serviceEndPoint)

	}

	save(subModule: SubModule, _id: String): Observable<any> {
		// console.log(subModule);
		if (subModule._id === '') {
			return this
				.httpClient
				.post<PortersModules>(`${this.kamleshApiEndpoint}/add/submodule/${_id}`, subModule);
		} else {
			// console.log("update service not available");
		}
	}
	remove(_id: String): Observable<any> {
		return this
			.httpClient
			.delete<any>(`${this.serviceEndPointSubModule}/${_id}`)
	}

	updateSubModule(module_id: String, porterModule: any): Observable<any> {
		let _id = porterModule._id;
		if (_id !== '') {
			return this
				.httpClient
				.put<PortersModules>(`${this.kamleshApiEndpoint}/${module_id}/edit/submodule/${_id}`, porterModule);
		} else {
			// console.log("insert service not available");
		}
	}
	updateModule(_id: String, newPorterModule: any): Observable<any> {
		if (_id !== '') {
			return this
				.httpClient
				.put<PortersModules>(`${this.serviceEndPoint}/${_id}`, newPorterModule);
		} else {
			// console.log("insert service not available");
		}
	}
	getRadar(): Observable<any> {
		return this
			.httpClient
			.get(this.radarServiceEndPoint)
	}

	public savePortersData(reportId, tocModuleData): Observable<any> {
		const headers = new HttpHeaders({
			'Content-Type': 'application/json'
		});

		return this.httpClient
			.post(APIEndPoints.ES_API + `/${reportId}/toc`, [tocModuleData], { headers: headers })
			.pipe(
				map(response => 
					console.log('API response', response)
				),
				catchError(this.handleError)
			);
	}

	getPortersData(reportId, sid, msId): Observable<any[]> {
		return this.httpClient.get<any>(APIEndPoints.ES_API + "/" + reportId + "/toc?msid=" + msId + '&sid=' + sid);
	}


	handleError(err: HttpErrorResponse) {
		return throwError(err);
	}
}
