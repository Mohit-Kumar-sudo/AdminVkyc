import imageModel from './image.model';

import to from '../../../utilities/to';    // for better error handling of async/await with promises 

async function getImageData(reportId, imageSearchName) {
    let imageData = {};

    try {
        imageData = await to(imageModel.getImageData(reportId, imageSearchName));
    } catch(er) {
        imageData.errors = er.message;
        console.error(`Exception in getting image data by image name for (${reportId}, ${imageSearchName}): Error: ${er}`);
    }

    return (imageData);
}

module.exports = {
    getImageData
};