import secService from './sec.service';
import utilities from '../../utilities/utils';
import HTTPStatus from 'http-status';

export async function getSecCik(req, res) {
    try {
        const cik = req.query.cik
        await secService.getSecCik(req, res, cik);
    } catch (er) {
        return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
    }
}

export async function getSecCikDoc(req, res) {
    let cik = req.params['cik'];
    try {
        await secService.getSecCikDoc(req,res,cik);       
    } catch (err) {
        res.status(500).json(err)
    }
}

export async function updateJsonData(req, res) {
    let cik = req.params['cik'];
    let jsonData = req.body.jsonData

    try {
        await secService.updateJsonData(req, res, cik, jsonData);
    } catch (err) {
        res.status(500).json(err)
    }
}