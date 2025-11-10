import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { NodeModel } from 'src/app/models/supplyChain/node.model';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { APIEndPoints } from 'src/app/constants/mfr.constants';
import { map, catchError } from 'rxjs/operators';

@Injectable()
export class CompetitiveDashboardServiceApi {

	constructor(private httpClient: HttpClient) {

	}

	public saveCompetitiveDashboard(reportId, tocModuleData): Observable<any> {
		const headers = new HttpHeaders({
			'Content-Type': 'application/json'
		});
		return this.httpClient
			.post(APIEndPoints.ES_API + `/${reportId}/toc/`, [tocModuleData], { headers: headers })
			.pipe(
				map(response =>
					 console.log(response)
				),
				catchError(this.handleError)
			);
	}

	getCompetitorDashboardColumns(reportId, sid, msId): Observable<any[]> {
		return this.httpClient.get<any>(APIEndPoints.REPORT_API + `/${reportId}` + "?select=me.segment");
	}

	getCompetitorDashboardData(reportId, sid, msId): Observable<any[]> {
		return this.httpClient.get<any>(APIEndPoints.ES_API + "/" + reportId + "/toc?msid=" + msId + '&sid=' + sid);
	}

	handleError(err: HttpErrorResponse) {
		return throwError(err);
	}
}