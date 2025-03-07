const mongoose = require('mongoose');
const marqueeStockModel = require('../Models/stock.Model')
const HTTPStatus = require('http-status-codes')

module.exports = {
    getMarqueeStocks : async (req, res) =>{
        try {
            const id = req.params['id'];
            console.log("idd",id)
            const stockData = await marqueeStockModel.findOne({ id: id });
            console.log("ress",res.json)
                console.log("stockData",stockData)
            if (!stockData) {
                return res.status(HTTPStatus.BAD_REQUEST).json({
                    success: false,
                    message: "Stock data not found or invalid ID",
                });
            }
                return res.status(HTTPStatus.OK).json({
                success: true,
                data: stockData,
            });

        } catch (er) {
            console.error(`Exception in getting stocks: ${er.message}`);
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "An internal server error occurred",
                error: er.message,
            });
        }
    }
}