import { Observable } from 'rxjs';
import { SupplyChainApiService } from './supplyChainApi.service';
import { Injectable } from '@angular/core';
import { NodeModel } from 'src/app/models/supplyChain/node.model';

@Injectable()
export class SupplyChainOperationService {
  constructor(private supplyChainApi: SupplyChainApiService) {

  }

  getAllNodes(): Observable<any> {
    // console.log(this.supplyChainApi.getAll());
    return this.supplyChainApi.getAll();
  }
  createNew(nodeModel : NodeModel): Observable<any> {
    return this.supplyChainApi.save(nodeModel);
  }

  delete(_id : String) : Observable<any>{
    return this.supplyChainApi.remove(_id);
  }

  update(_id : String, nodeModel: any) : Observable<any>{
    return this.supplyChainApi.updateModule(_id, nodeModel);
  }
}