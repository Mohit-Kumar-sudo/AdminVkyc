const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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

const videoFilterModel = mongoose.model('videoFilter', videoFilterSchema);

module.exports = videoFilterSchema;
const addVideos = function (video) {
    const queryPromise = videoFilterModel.updateOne(
        { _id: null },
        { videos: video },
        { upsert: true }
    );
    return queryPromise;
}

const getVideos = function (req, res) {
    const queryPromise = videoFilterModel.find();
    return queryPromise;
}
module.exports = { addVideos, getVideos }