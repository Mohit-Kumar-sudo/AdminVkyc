import stockModel from './stock.model';
import to from '../../utilities/to';

async function addMarqueeStocks(stocks, id) {
    let resData = {};
    try {
        resData = await to(stockModel.addMarqueeStocks(stocks, id));
        return resData;
    } catch (er) {
        console.error(`Exception in  adding or updating data in marquee stocks. \n : ${er}`);
        return (resData.errors = er.message);
    }
}

async function getMarqueeStocks(req, res, id) {
    let resData = {}
    try {
        resData = await to(stockModel.getMarqueeStocks(req, res, id));
        return resData;
    } catch (er) {
        console.error(`Exception in getting stocks. \n : ${er}`);
        return (resData.errors = er.message);
    }
}

module.exports = {
    addMarqueeStocks,
    getMarqueeStocks,
}