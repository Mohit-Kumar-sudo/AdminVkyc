import mongoose from 'mongoose';
import marqueeStockSchema from './stock.schema';
const marqueeStockModel = mongoose.model('AllStocks', marqueeStockSchema);

const addMarqueeStocks = function (marquee, id) {
    const queryPromise = marqueeStockModel.updateOne(
        { id: id },
        { stocks: marquee },
        { upsert: true }
    );
    return queryPromise;
}
const getMarqueeStocks = function (req, res, id) {
    const queryPromise = marqueeStockModel.findOne({ id: id });
    return queryPromise;
}
module.exports = { addMarqueeStocks, getMarqueeStocks }