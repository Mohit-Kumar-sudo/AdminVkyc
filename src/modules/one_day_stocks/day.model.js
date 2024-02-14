import mongoose from 'mongoose';
import dailySchema from './day.schema';
const dailyStockModel = mongoose.model('oneDayStocks', dailySchema);

const addDailyData = function (data, id) {
    const queryPromise = dailyStockModel.updateOne(
        { id: id },
        { stocks: data },
        { upsert: true }
    );
    return queryPromise;
}
const getDailyStockDetails = function (req, res) {
    const queryPromise = dailyStockModel.findOne();
    return queryPromise;
}
module.exports = { addDailyData, getDailyStockDetails }