import mongoose, { Schema, mongo } from 'mongoose';

// import schemas
import SECEdgarSchema from './sec.schema';
import utilities from '../../utilities/utils';
const secModel = mongoose.model('SEC_Edgar', SECEdgarSchema);


const saveDocument = function (cik,company,hashes) {

    const queryPromise = secModel.updateOne(
        { cik: cik},
        { company: company },
        { document: hashes },
        { upsert: true }
    );
     
    return queryPromise
}

module.exports = { saveDocument }