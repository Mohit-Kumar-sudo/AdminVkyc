import videosModel from './videos-filter.model';
import to from '../../utilities/to';

async function addVideos(video, id) {
    console.log("In add videos")
    let resData = {};
    try {
        resData = await to(videosModel.addVideos(video));
        return resData;
    } catch (er) {
        console.error(`Exception in  adding or updating data in videos. \n : ${er}`);
        return (resData.errors = er.message);
    }
}

async function getVideos(req, res) {
    let resData = {}
    try {
        resData = await to(videosModel.getVideos(req, res));
        return resData;
    } catch (er) {
        console.error(`Exception in  adding or updating data in videos. \n : ${er}`);
        return (resData.errors = er.message);
    }
}
module.exports = {
    addVideos,
    getVideos
}