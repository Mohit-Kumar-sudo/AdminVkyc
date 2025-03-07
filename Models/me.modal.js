const mongoose = require('mongoose');
const { Schema, SchemaTypes } = mongoose;
// import schemas
const reportModel = require('./Reports.Model')
const DATA_CONSTANTS = require('../config/dataConstants')

module.exports = {
    getMEGridDataForViews: async(reportId, gridKeys) => {
        const meGridViewData = await reportModel.aggregate([
            {
                "$match":{
                        "_id": new mongoose.Types.ObjectId(reportId)
                }
            },
            {
                    "$unwind":"$me.data"
            },
            {
                "$match": {
                    "me.data.key": { "$in": gridKeys }
                }
            },
            {
                "$group":{
                    "_id":"null",
                    "gridData": {
                        "$addToSet":"$me.data"
                    }
                }
            }
        ]);
    
        return meGridViewData;
    },
    getMEViewsSegmentData: async(reportId, value) => {
        console.log("reportModel.Reports:", reportModel);

        const queryRes = await reportModel.aggregate([
            // I. find the relevant documents in the collection
            // uses index, if defined on me.segment.pid/id
            {
                $match:{
                    "$and":[
                        {
                        "_id": new mongoose.Types.ObjectId(reportId)
                        },
                        {
                        "me.segment":{
                            $elemMatch:{
                                "$or":[
                                    {
                                        "pid": value
                                    },
                                    {
                                        "id": value
                                    }
                                ]
                            }
                        }
                        },
    
                    ]
                }
            },
            // II. flatten array documennts
            {
                $unwind:"$me.segment"
            },
            // III. match for elements, "me.segment" is no longer an array
            {
                $match:{
                    "$or":[
                        {
                            "me.segment.pid": value
                        },
                        {
                            "me.segment.id": value
                        }
                    ]
                }
            },
            {
                $sort: {
                    "me.segment.pid": -1
                }
            },
            // IV. re-create me.segment array
            {
                $group:{
                    _id:"$_id",
                    viewRecords:{
                        $addToSet:"$me.segment"
                    }
                }
            }
        ]);
        console.log('Aggregation Result:', queryRes);
        return queryRes;
    },
    getMEViewsRegionData: async(reportId, regionId) => {
        const aggArr = [];
        aggArr.push({
            $match:{
                    "_id":new mongoose.Types.ObjectId(reportId)
            }
        });
        aggArr.push({
            $unwind:"$me.geo_segment"
        });
        if (regionId !== "-1")
            aggArr.push({
                $match:
                {
                    "me.geo_segment._id": {"$in": [`${regionId}`]}
                }
            });
        aggArr.push({
            $project:{
                "geo": "$me.geo_segment"
            }
        });
        aggArr.push({
            $unwind: "$geo.countries"
        });
        aggArr.push({
            $group :{
                "_id": "geo",
                "regions": {
                    "$addToSet": {"name": "$geo.region", "regionId": "$geo._id"}
                },
                "countries": {
                    "$addToSet": {"region": "$geo.region", "country": "$geo.countries.name", "regionId": "$geo._id", "countryId": "$geo.countries._id"}
                }
            }
        });
        const queryPromise = reportModel.aggregate(aggArr);
        return queryPromise;
    },
    getMEViewsWithoutRegionData: async(reportId) => {
        const aggArr = [];
        aggArr.push({
            $match:{
                    "_id":mongoose.Types.ObjectId(reportId)
            }
        });
        aggArr.push({
            $unwind:"$me.geo_segment"
        });
        aggArr.push({
            $project:{
                "geo": "$me.geo_segment"
            }
        });
        aggArr.push({
            $unwind: "$geo.countries"
        });
        aggArr.push({
            $group :{
                "_id": "geo",
                "regions": {
                    "$addToSet": {"name": "$geo.region"}
                },
                "countries": {
                    "$addToSet": {"region": "$geo.region", "country": "$geo.countries.name", "countryId": "$geo.countries._id"}
                }
            }
        });
        const queryPromise = reportModel.Reports.aggregate(aggArr);
        return queryPromise;
    }
};
