import { mongoose, Schema } from 'mongoose';

const dayStockSchema = new Schema([{
    _id: false,
    id: { type: Schema.Types.String, required: true },
    refresh: { type: Date, default: Date.now() },
    stocks: [
        {
            _id: false,
            "Meta Data": {
                "1. Information": { type: Schema.Types.String },
                "2. Symbol": { type: Schema.Types.String },
                "3. Last Refreshed": { type: Schema.Types.String },
                "4. Interval": { type: Schema.Types.String },
                "5. Output Size": { type: Schema.Types.String },
                "6. Time Zone": { type: Schema.Types.String }
            },
            "Time Series (1min)": { type: Schema.Types.Array }
        }
    ]
}]);

module.exports = dayStockSchema;