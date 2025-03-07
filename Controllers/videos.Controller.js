const videosModel = require('../Models/videos.Model');
const _ = require('lodash');
const fetch = require('node-fetch');
const cron = require("node-cron");
const utilities = require('../utilities/utils');
const to = require('../utilities/to');
const HTTPStatus = require('http-status');

const videoData1 = []; // Add your predefined topics here
let globalVideo = [];

// Schedule a cron job to fetch video data every day at midnight
cron.schedule('0 0 * * *', async function () {
    console.log("Running scheduled video fetch...");
    await fetchAndStoreVideos();
});

// Consolidated function to fetch video data and fetch from database
async function fetchAndStoreVideos(req = null, res = null) {
    try {
        // Step 1: Fetch video data from YouTube API for predefined topics
        globalVideo = []; // Clear existing data
        for (const symbol of videoData1) {
            let searchQuery = `${symbol} industry`;
            console.log("Fetching videos for:", searchQuery);

            const response = await fetch(`https://www.googleapis.com/youtube/v3/search?key=AIzaSyB5MbNMzLpE_JecMM9aAZwoczp44MgmmIM&part=snippet&maxResults=20&q=${searchQuery}&type=video&relevanceLanguage=EN&order=date&publishedAfter=2024`);
            const data = await response.json();

            let objArray = [];
            if (data?.items?.length) {
                objArray = data.items.map(el => ({
                    title: el.snippet.title,
                    description: el.snippet.description,
                    publishedAt: el.snippet.publishedAt,
                    channelTitle: el.snippet.channelTitle,
                    thumbnail: el.snippet.thumbnails?.default?.url,
                    videoId: el.id?.videoId || ''
                }));
            }
            globalVideo.push({ name: symbol, results: objArray });
        }

        // Step 2: Fetch video data from the database if `req` and `res` are provided
        if (req && res) {
            const resData = await to(videosModel.getVideos(req, res));
            if (!utilities.isEmpty(resData.errors)) {
                return utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, resData.errors, res);
            } else {
                return utilities.sendResponse(HTTPStatus.OK, resData, res);
            }
        } else {
            console.log("Video data refreshed successfully.");
        }
    } catch (error) {
        console.error("Error in fetching or storing videos:", error);
        if (res) {
            return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, error, res);
        }
    }
}

// Exported function to handle incoming requests
async function getVideos(req, res) {
    await fetchAndStoreVideos(req, res);
}

module.exports = {
    getVideos
};
