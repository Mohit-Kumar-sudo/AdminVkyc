const fetch = require('node-fetch');
const cron = require("node-cron");
import utilities from '../../utilities/utils';
import HTTPStatus from 'http-status';
import dailyService from './day.service';

const filterData1 = ['^NYA', '^FTSE', '^N225'];

const filterData2 = ['000001.SS', 'ENX.PA', '^HSI', '399001.SZ'];

const filterData3 = ['^GSPTSE', '^BSESN', '^NSEI'];

let dailyData = [];

async function getAlphaVantageDaily(stocks) {
    stocks.forEach((d1) => {
        getDailyStock(d1);
    });
}
export async function getDailyStock(symbol) {
    fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=1min&apikey=JZH39BS6IQYDES0I`, {
        method: 'get',
        headers: { 'content-type': 'application/json' }
    })
        .then(response => response.json())
        .then(data => {
            if (data) {
                dailyData.push(data);
            }
        })
        .catch(error => {
            console.log(error);
        });
}

export async function addDailyData(data, id) {
    try {

        if (data && data.length) {
            const stockData = await dailyService.addDailyData(data, id) || {};
            if (!utilities.isEmpty(stockData.errors)) {
                const errObj = stockData.errors;
                console.log("errObj", errObj);
            } else {
                dailyData = [];
            }
        }
    } catch (er) {
        console.log("error", er);
    }
}

export async function callingStock() {
    getAlphaVantageDaily(filterData1);
    setTimeout(d => {
        getAlphaVantageDaily(filterData2)
    }, 60000);
    setTimeout(d => {
        getAlphaVantageDaily(filterData3)
    }, 120000);
    setTimeout(d => {
        addDailyData(dailyData, "12345678")
    }, 130000);
}

cron.schedule('0 */7 * * *', function () {
    console.log("inside daily cron");
    callingStock();
})
export async function getDailyStockDetails(req, res) {
    try {
        const stockData = await dailyService.getDailyStockDetails(req, res);
        if (!utilities.isEmpty(stockData.errors)) {
            const errObj = stockData.errors;
            // const errObj = utilities.getErrorDetails(report.errors);
            return utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
        } else {
            return utilities.sendResponse(HTTPStatus.OK, stockData, res);
        }

    } catch (er) {
        return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
    }
}
