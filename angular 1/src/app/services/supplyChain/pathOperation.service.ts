import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { PathModel } from 'src/app/models/supplyChain/path.model';
import { PathApiService } from './pathApi.service';

@Injectable()
export class PathOperationService {
  constructor(private pathApiService: PathApiService) {

  }

  getAllNodes(): Observable<any> {
    // console.log(this.pathApiService.getAll());
    return this.pathApiService.getAll();
  }
  createNew(pathModel : PathModel): Observable<any> {
    return this.pathApiService.save(pathModel);
  }

  delete(_id : String) : Observable<any>{
    return this.pathApiService.remove(_id);
  }

  update(_id : String, pathModel: any) : Observable<any>{
    return this.pathApiService.updateModule(_id, pathModel);
  }
}