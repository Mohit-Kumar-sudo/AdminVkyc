import HTTPStatus from 'http-status';
import utilities from '../../../utilities/utils';

const uploadService = require('./upload.service');

export async function uploadImage(req, res) {
    try {
        const reportId = req.params['rid'];
        const destPath = `./public/images/${reportId}`;
        const filename = `image-${reportId}-${Date.now()}`;

        const uploadObj = uploadService.uploadImage(reportId, destPath, filename);
        uploadObj(req,res,(err, data) => {
            if(err){
                console.log(err);
                return utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, err, res);
            } else {
                console.log('image file uploaded!');
                console.log(err);
                return utilities.sendResponse(HTTPStatus.OK, {"reportId": reportId, "path": `${destPath}/${filename}`}, res);
            }
        });

    } catch (er) {
        console.log(er);
        return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
    }
}
