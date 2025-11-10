import { NodeModel } from './node.model';

export interface PathModel{
    _id : String,
    from : NodeModel,
    to : NodeModel
}