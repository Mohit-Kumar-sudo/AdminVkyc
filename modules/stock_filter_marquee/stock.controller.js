import stockService from './stock.service';
import _ from 'lodash';
const fetch = require('node-fetch');
const cron = require("node-cron");
import utilities from '../../utilities/utils';
import HTTPStatus from 'http-status';
import mongoose from 'mongoose';

const stockData1 = ['^GSPC', '^RUT', 'DX-Y.NYB', 'USDJPY', 'EURUSD'];

const stockData2 = ['GC=F', '^TNX', 'CL=F', 'BZ=F', 'ES=F'];

const stockData3 = ['YM=F', '^FTSE', '^GDAXI', '^N225', '^SSEC'];

const filterData1 = ['^NYA', '^FTSE', '^N225'];

const filterData2 = ['000001.SS', 'ENX.PA', '^HSI', '399001.SZ'];

const filterData3 = ['^GSPTSE', '^BSESN', '^NSEI'];

let globalStock = [];
let filterStocks = [];

async function getAlphaVantageData(stocks) {
    stocks.forEach((d1) => {
        getStockDetails(d1);
    });
}

async function getStockDetails(symbol) {
    fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=MTR5TAL34JWY9WKL`, {
        method: 'get',
        headers: { 'content-type': 'application/json' }
    })
        .then(response => response.json())
        .then(data => {
            if (data) {
                globalStock.push(data);
            }
        })
        .catch(error => {
            console.log(error);
        })
}

export async function addMarqueeStocks(data, id) {
    try {

        if (data && data.length) {
            const stockData = await stockService.addMarqueeStocks(data, id) || {};
            if (!utilities.isEmpty(stockData.errors)) {
                const errObj = stockData.errors;
                console.log("errObj", errObj);
            } else {
                console.log(stockData);
                globalStock = [];
                filterStocks = [];
            }
        }
    } catch (er) {
        console.log("error", er);
    }
}

export async function callingStock() {
    getAlphaVantageData(stockData1);
    setTimeout(d => {
        getAlphaVantageData(stockData2)
    }, 60000);
    setTimeout(d => {
        getAlphaVantageData(stockData3)
    }, 120000);
    setTimeout(d => {
        addMarqueeStocks(globalStock, "1111111111")
    }, 130000);
}

export async function callingFilter() {
    getAlphaVantageFilter(filterData1)
    setTimeout(d => {
        getAlphaVantageFilter(filterData2)
    }, 60000);
    setTimeout(d => {
        getAlphaVantageFilter(filterData3)
    }, 120000);
    setTimeout(d => {
        addMarqueeStocks(filterStocks, "2222222222")
    }, 130000);
}

cron.schedule('0 */5 * * *', function () {
    console.log("inside filter cron");
    callingFilter();
})

cron.schedule('0 */3 * * *', function () {
    console.log("inside cron");
    callingStock();
})

export async function getMarqueeStocks(req, res) {
    try {
        const id = req.params['id']
        const stockData = await stockService.getMarqueeStocks(req, res, id);
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

async function getAlphaVantageFilter(stocks) {
    stocks.forEach((d1) => {
        getFilterDetails(d1);
    });
}
async function getFilterDetails(symbol) {
    fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=MTR5TAL34JWY9WKL`, {
        method: 'get',
        headers: { 'content-type': 'application/json' }
    })
        .then(response => response.json())
        .then(data => {
            if (data) {
                filterStocks.push(data);
            }
        })
        .catch(error => {
            console.log(error);
        })
}
