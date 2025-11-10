import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PathModel } from 'src/app/models/supplyChain/path.model';


@Injectable()
export class PathApiService {

	//For supply chain node
	private serviceEndPoint = 'http://172.16.0.116:8081/api/paths';

	constructor(private httpClient: HttpClient) {
	}

	getAll(): Observable<any> {
		return this
			.httpClient
			.get(this.serviceEndPoint)
	}

	save(pathModel: PathModel): Observable<any> {
		if (pathModel._id === '') {
			return this
				.httpClient
				.post<PathModel>(this.serviceEndPoint, pathModel);
		} else {
			// console.log("update service not available");
		}
	}
	remove(_id: String): Observable<any> {
		return this
			.httpClient
			.delete<any>(`${this.serviceEndPoint}/${_id}`)
	}
	
	updateModule(_id : String, pathModel : any): Observable<any> {
		if (_id !== '') {
			return this
				.httpClient
				.put<PathModel>(`${this.serviceEndPoint}/${_id}`, pathModel);
		} else {
			// console.log("insert service not available");
		}
	}
}