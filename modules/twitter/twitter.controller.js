import twitterService from './twitter.service';
import utilities from '../../utilities/utils';

export async function getAllTwitter(req, res) {
    try {
        //# = %23
        //@ = %3A
        const text = req.query['search'];
        // const atRate = text.replace('@', '%3A');
        // const original = text.replace('@', '');
        // console.log(original + " and " + atRate);

        const tweetData = await twitterService.getTwitterSearch(req, res, text);

        if (!utilities.isEmpty(tweetData.errors)) {
            const errObj = tweetData.errors;
            // const errObj = utilities.getErrorDetails(report.errors);
            return utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
        } else {
            return utilities.sendResponse(HTTPStatus.OK, tweetData, res);
        }

    } catch (err) {

    }
}

