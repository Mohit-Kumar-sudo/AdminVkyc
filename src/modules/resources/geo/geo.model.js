import mongoose, { Schema } from 'mongoose';
import validator from 'validator';
import uniqueValidator from 'mongoose-unique-validator';
import utilities from '../../../utilities/utils';
import mongooseLeanVirtuals from 'mongoose-lean-virtuals';

// Report schema
const GeoSchema = new Schema(
{
    region: {
        type: String,
        required: [true, 'Region is required'],
        trim: true,
        validate: {
        validator(title) {
            return validator.stripLow(title, false);
        },
        message: '{VALUE} is not a valid Region.',
        },
        unique: true
    },
    countries: [{
        name: {
            type: String,
            required: [true, 'Country for a region is required'],
            validate: {
                validator(title) {
                    return validator.stripLow(title, false);
                },
            }
        }
    }], // list of countries data
}
);

// unique validator plugin
GeoSchema.plugin(uniqueValidator, {
    message: 'Title with "{VALUE}" aleady exists.',
});

GeoSchema.plugin(mongooseLeanVirtuals);

GeoSchema.methods = {
    toJSON() {
        this.id = this._id;
        delete this._id;
        delete this.__v;
        delete this.updatedAt;
        delete this.createdAt;

        return (this);
    }
};

/* GeoSchema.virtual('id').get(function () {
    //delete this._id;
    delete this.createdAt;
    delete this.updatedAt;
    delete this.__v;
}); */

const Geo = mongoose.model('Geo', GeoSchema);

const addRegion = function (regionDetails) {
    /* const rdetails = {...regionDetails};
    let reportObj = new Geo(rdetails);
    reportObj = reportObj.save(); */
    const geoPromise = Geo.insertMany(regionDetails);
    return geoPromise;
}

const addCountries = async function (countryDetails, regionId) {
    const arr = [...countryDetails];
    /* const reportObj = await Reports.findById(mongoose.Types.ObjectId(reportId));
    reportObj.toc.concat(tocDetails); 
    return reportObj.save(); */
    console.log(arr);

    const queryPromise = Geo.findByIdAndUpdate(
        mongoose.Types.ObjectId(regionId),
        { $push: { 'countries' : { $each: arr } } },
        { new: true }
    );

    return queryPromise;
}


const getGeoData = function (regionDetails) {
    const query = Geo.find();

    if (!utilities.isEmpty(regionDetails)) {
        if (regionDetails.regionId) {
            query.where({"_id": regionDetails.regionId});
        }
        
        if (regionDetails.regName) {
            query.where({"region": { "$regex": regionDetails.regName, "$options": "i" }});
        }

        if (regionDetails.ctryName) {
            query.where({"countries": {$elemMatch : {"name": { "$regex": regionDetails.ctryName, "$options": "i" }}}});
        }
    } else { // if query conditions are not set, then retrieve all regions and all nested countries data

    }

    const queryPromise = query.lean({virtuals: true}).exec();

    return queryPromise;
}

// Exporting model to external world
module.exports = {
    addRegion,
    addCountries,
    getGeoData
};
