import mongoose, { Schema } from 'mongoose';
import validator from 'validator';
import uniqueValidator from 'mongoose-unique-validator';
import utilities from '../../../utilities/utils';
// import mongooseLeanVirtuals from 'mongoose-lean-virtuals';
import DATA_CONSTANTS from '../../../config/dataConstants';

// Report schema
const VerticalSchema = new Schema(
{
    name: {
        type: String,
        required: [true, 'Vertical is required'],
        trim: true,
        validate: {
        validator(title) {
            return validator.stripLow(title, false);
        },
        message: '{VALUE} is not a valid Vertical name.',
        },
        unique: true
    },
    category: {
        type: String,
        enum: Object.values(DATA_CONSTANTS.REPORT_CATEGORY),
        required: [true, 'Report Category is required'],
    },
    toc: [{
        _id: false,
        section_id: {
            type: Number,
            required: [true, 'Section Id for a section / module is required'],
            unique: true
        },
        section_name: {
            type: String,
            required: [true, 'Section name for a section / module is required'],
            validate: {
                validator(title) {
                    return validator.stripLow(title, false);
                },
            }
        },
        urlpattern: {
            type: String,
            /* required: [true, 'Section urlpattern for a section / module is required'],
            validate: {
                validator(title) {
                    return validator.stripLow(title, false);
                },
            } */
        },
        section_key: {
            type: String,
            /* required: [true, 'Section key for a section / module is required'],
            validate: {
                validator(title) {
                    return validator.stripLow(title, false);
                },
            } */
        },
        "is_main_section_only": {
            type: Boolean
        }
    }],
}
);

// unique validator plugin
VerticalSchema.plugin(uniqueValidator, {
    message: 'Title with "{VALUE}" aleady exists.',
});

// VerticalSchema.plugin(mongooseLeanVirtuals);

VerticalSchema.methods = {
    toJSON() {
        if(this._id)
            this.id = this._id;
        delete this._id;
        delete this.__v;
        delete this.updatedAt;
        delete this.createdAt;
        return (this);
    }
};

const Vertical = mongoose.model('verticals', VerticalSchema);

const addVertical = function (verticalDetails) {
    const vDetails = {...verticalDetails};
    const verticalObj = new Vertical(vDetails);
    const queryPromise = verticalObj.save();
    return queryPromise;
}


const getVerticals = function (verticalId, verticalName) {
    const query = Vertical.find();

    if (!utilities.isEmpty(verticalId)) {
        query.where({"_id": mongoose.Types.ObjectId(verticalId)});
    } 
    else if (!utilities.isEmpty(verticalName)) {
        query.where({"name": { "$regex": verticalName, "$options": "i" }});
    }

    const queryPromise = query.lean({virtuals: true}).exec();

    return queryPromise;
}

// get all `default` toc modules list for Tech/Non-Tech category
const getDefaultVerticalModulesList = function (category) {
    const query = Vertical.find();

    query.where({"name": 'DEFAULT'});
    if (!utilities.isEmpty(category)) {
        query.where({"category": category});
    } 

    const queryPromise = query.lean({virtuals: true}).exec();

    return queryPromise;
}

// Exporting model to external world
module.exports = {
    addVertical,
    getVerticals,
    getDefaultVerticalModulesList
};