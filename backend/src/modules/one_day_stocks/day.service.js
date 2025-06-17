import dayModel from './day.model';
import to from '../../utilities/to';

async function addDailyData(stocks, id) {
    let resData = {};
    try {
        resData = await to(dayModel.addDailyData(stocks, id));
        return resData;
    } catch (er) {
        console.error(`Exception in  adding or updating data in daily intra day stocks. \n : ${er}`);
        return (resData.errors = er.message);
    }
}

async function getDailyStockDetails(req, res) {
    let resData = {}
    try {
        resData = await to(dayModel.getDailyStockDetails(req, res));
        return resData;
    } catch (er) {
        console.error(`Exception in getting stocks. \n : ${er}`);
        return (resData.errors = er.message);
    }
}

module.exports = {
    addDailyData,
    getDailyStockDetails,
}