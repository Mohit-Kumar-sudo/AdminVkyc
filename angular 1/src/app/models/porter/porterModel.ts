import { SubModule } from './subModule';

export interface PortersModules{
    _id: String,
    conclusion : String,
    subModules : SubModule[];
}