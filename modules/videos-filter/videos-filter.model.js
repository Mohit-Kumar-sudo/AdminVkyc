import mongoose from 'mongoose';
import videoFilterSchema from './videos-filter.schema';
const videoFilterModel = mongoose.model('videoFilter', videoFilterSchema);

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