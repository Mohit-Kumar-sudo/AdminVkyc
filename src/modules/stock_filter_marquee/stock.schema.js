import { mongoose, Schema } from 'mongoose';

const marqueeStockSchema = new Schema([{
    _id: false,
    id: { type: Schema.Types.String, required: true },
    refresh: { type: Date, default: Date.now() },
    stocks: [
        {
            _id: false,
            "Global Quote": {
                '01. symbol': { type: Schema.Types.String },
                '02. open': { type: Schema.Types.String },
                '03. high': { type: Schema.Types.String },
                '04. low': { type: Schema.Types.String },
                '05. price': { type: Schema.Types.String },
                '06. volume': { type: Schema.Types.String },
                '07. latest trading day': { type: Schema.Types.String },
                '08. previous close': { type: Schema.Types.String },
                '09. change': { type: Schema.Types.String },
                '10. change percent': { type: Schema.Types.String }
            }
        }
    ]
}]);

module.exports = marqueeStockSchema;