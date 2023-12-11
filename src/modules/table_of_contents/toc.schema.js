import mongoose, { Schema } from 'mongoose';

import utilities from '../../utilities/utils';
import DATA_CONSTANTS from '../../config/dataConstants';

// Table Of Contents schema
const TableOfContentSchema = new Schema(
    {
        section_name: {
            type: Schema.Types.String,
            required: [true, 'ToC title is required'],
            trim: true
        },
        main_section_id : {  // main screen section id (format 1 or 2) 
            type: Schema.Types.Number,
            required: [true, 'ToC main section id (#) is required'],
            trim: true
        },
        section_id : {  // actual section id (format 1.1 or 1.2.1) 
            type: Schema.Types.String,
            required: [true, 'ToC section id (#) is required'],
            trim: true
        }, 
        section_pid : { // immediate parent section id (format: 1 or 1.1)
            type: Schema.Types.String,
            required: [true, 'ToC section immediate parent id (#) is required'],
            trim: true,
        },
        content: [{
            _id: false,
            order_id: {type: Schema.Types.Number},
            type: {type: Schema.Types.String},
            /* id: {type: Schema.Types.String},
            text:  {type: Schema.Types.String},
            url:  {type: Schema.Types.String}, */
            source:  {type: Schema.Types.String},
            title: {type: Schema.Types.String},
            data: {type: Schema.Types.Mixed}
        }],
        meta: {
            _id: false,
            type: {
                type: mongoose.Types.String,
                enum: Object.values(DATA_CONSTANTS.MODULES_META_TYPE),
                required () { return (!utilities.isEmpty(this.meta.data)); }
            },
            data: {
                type: Schema.Types.Mixed
            }
        },
        meta_info: {type: Schema.Types.Mixed},
        status:{
            type: String,
            enum: Object.values(DATA_CONSTANTS.MODULES_STATUS),
            default: DATA_CONSTANTS.MODULES_STATUS.NOT_STARTED
        },
        analysts: {
            type: Schema.Types.ObjectId,
            // required: [true, 'Owner details are required'],
            trim: true,
            ref: 'users'
        }
        /* texts : [{
            type: Schema.Types.String,
        }],
        images : [{
            imgId: {type: Schema.Types.String}, // ex: FIG. 1
            title: {type: Schema.Types.String},
            text: {type: SchemaTypes.String},
            source: {type: SchemaTypes.String},
            url: {
                type: SchemaTypes.String,
                validate: {
                    validator(url) { return validator.isURL(url); },
                    message: '{VALUE} is not a valid url',
                },
                required: [true, 'Image URL is required for storing images.']
            }
        }], 
        tables : [{
            tabId: {type: SchemaTypes.String},   // ex: TABLE 1
            title: {type: SchemaTypes.String},
            text: {type: SchemaTypes.String},
            source: {type: SchemaTypes.String},
            data: {type: SchemaTypes.Mixed}
        }], 
        graphs : [{
            title: {type: SchemaTypes.String},
            text: {type: SchemaTypes.String},
            source: {type: SchemaTypes.String},
            data: {type: SchemaTypes.Mixed}
        }] ,*/
    },
{
    timestamps: true,
}
);

// Exporting Schema
module.exports = mongoose.model('ToC', TableOfContentSchema);