import { mongoose, Schema } from 'mongoose';

const videoFilterSchema = new Schema({
    videos: {
        'name': { type: Schema.Types.String },
        'results': [
            {
                'title': { type: Schema.Types.String },
                'description': { type: Schema.Types.String },
                'publishedAt': { type: Schema.Types.String },
                'channelTitle': { type: Schema.Types.String },
                'thumbnail': { type: Schema.Types.String },
                'videoId': { type: Schema.Types.String }
            }
        ]
    }
});

module.exports = videoFilterSchema;