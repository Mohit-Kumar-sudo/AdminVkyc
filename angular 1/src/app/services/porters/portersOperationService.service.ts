import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { PortersApiService } from './portersApi.service';
import { SubModule } from 'src/app/models/porter/subModule';


@Injectable()
export class PortersOperationService {
  constructor(private porterModuleApi: PortersApiService) {

  }

  getAllModules() : Observable<any> {
    // console.log(this.porterModuleApi.getAll());
    return this.porterModuleApi.getAll();
  }
  createNew(subModule : SubModule, _id: String) : Observable<any> {
    return this.porterModuleApi.save(subModule, _id);
  }

  deleteSubModule(_id : String) : Observable<any>{
    return this.porterModuleApi.remove(_id);
  }

  updateSubModule(_id : String, porterModule: any) : Observable<any>{
    return this.porterModuleApi.updateSubModule(_id, porterModule);
  }
  updateModule(_id : String, porterModule: any) : Observable<any>{
    return this.porterModuleApi.updateModule(_id, porterModule);
  }
  getRadar(): Observable<any> {
		// console.log(this.porterModuleApi.getRadar());
		return this.porterModuleApi.getRadar();
	  }
}