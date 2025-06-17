import videoService from './videos-filter.service';
import _ from 'lodash';
const fetch = require('node-fetch');
const cron = require("node-cron");
import utilities from '../../utilities/utils';
import HTTPStatus from 'http-status';

const videoData1 = ['Aerospace and Defense', 'Automotive', 'Consumer food and beverages', 'Chemical and materials', 'Energy and power', 'Healthcare', 'Information and communication technology', 'Construction and mining', 'Semiconductor'];
//const videoData1 = ['Aerospace and Defense'];

let globalVideo = [];

async function geVideosData() {
    globalVideo = [];
    videoData1.forEach((d1) => {
        getVideoDetails(d1);
    });
}

async function getVideoDetails(symbol) {
    let searchQuery = symbol + " industry";

    fetch(`https://www.googleapis.com/youtube/v3/search?key=AIzaSyB5MbNMzLpE_JecMM9aAZwoczp44MgmmIM&part=snippet&maxResults=20&q=${searchQuery}&type=video&relevanceLanguage=EN`, {
        method: 'get',
        headers: { 'content-type': 'application/json' }
    })
        .then(response => response.json())
        .then(data => {
            
            if (data) {
                let objArray = [];
                if (data.items && data.items.length) {
                    data.items.forEach(el => {
                        let id = '';
                        if(el.id){
                            id = el.id.videoId
                            }
                        if (el.snippet) {

                            let tempObj = {
                                title: el.snippet.title,
                                description: el.snippet.description,
                                publishedAt: el.snippet.publishedAt,
                                channelTitle: el.snippet.channelTitle,
                                thumbnail: el.snippet.thumbnails.default.url,
                                videoId: id
                            }
                            objArray.push(tempObj);
                        }

                    })

                    let obj = {
                        name: symbol,
                        results: objArray
                    }
                   globalVideo.push(obj);
                    formData()
                }else{
                    let obj = {
                        name: symbol,
                        results: []
                    }
                   globalVideo.push(obj);
                    formData()
                }
            }
        })
        .catch(error => {
            console.log(error);
        })
}
async function formData() {
    if (globalVideo.length == videoData1.length) {
        addVideos(globalVideo)
    } else {
    }
}
export async function addVideos(video) {
    try {

        if (video) {
            const videoData = video;
            const id = null;

            const stockData = await videoService.addVideos(videoData) || {};
            if (!utilities.isEmpty(stockData.errors)) {
                const errObj = stockData.errors;
            } else {
            }
        }
    } catch (er) {
        console.log("error", er);
    }
}

cron.schedule('0 0 * * *', function () {
    console.log("inside cron");
    geVideosData();
})

export async function getVideos(req, res) {
    try {
        //geVideosData();
        const stockData = await videoService.getVideos(req, res) || {}
        if (!utilities.isEmpty(stockData.errors)) {
            const errObj = stockData.errors;
            // const errObj = utilities.getErrorDetails(report.errors);
            utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
        } else {
            utilities.sendResponse(HTTPStatus.OK, stockData, res);
        }

    } catch (er) {
        utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
    }
}
