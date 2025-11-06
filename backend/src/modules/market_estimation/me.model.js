import mongoose, { Schema, SchemaTypes } from 'mongoose';

// import schemas
import reportModel from '../reports/report.model';
import DATA_CONSTANTS from '../../config/dataConstants';
// const ToC = mongoose.model("TocRecord", TableOfContentSchema);

const addSegments = function (segmentData, reportId) {
    // console.log(JSON.stringify(arr));
    const queryPromise = reportModel.Reports.update(
        {"_id": mongoose.Types.ObjectId(reportId)},
        { 'me.segment' : segmentData.segmentData, 'me.bifurcationLevel': segmentData.bifurcationLevel },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return queryPromise;
}

const addMEData = function (meGridData, reportId) {
    // console.log(JSON.stringify(arr));
    const queryPromise = reportModel.Reports.update(
        {"_id": mongoose.Types.ObjectId(reportId)},
        { 'me.data' : meGridData },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return queryPromise;
}

const addMEGeoData = async function (reportId, geoData) {
    const queryPromise = reportModel.Reports.update(
        {"_id": mongoose.Types.ObjectId(reportId)},
        { 'me.geo_segment' : geoData },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return queryPromise;
}


const getMEGridDataForViews = async function (reportId, gridKeys) {

    // query
    const meGridViewData = await reportModel.Reports.aggregate([
        {
            "$match":{
                    "_id":mongoose.Types.ObjectId(reportId)
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
}

const getMEViewsSegmentData = async function (reportId, value /* segmentId */) {
    // query to return only matching segments to passed segmentId
    const queryRes = await reportModel.Reports.aggregate([
        // I. find the relevant documents in the collection
        // uses index, if defined on me.segment.pid/id
        {
            $match:{
                "$and":[
                    {
                    "_id":mongoose.Types.ObjectId(reportId)
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

    return queryRes;
}

const getMEViewsRegionData = async function (reportId, regionId) {
    /*
        const queryStr = `{"_id": ${mongoose.Types.ObjectId(reportId)}, "me.geo_segment._id": {"$in": ["${regionId}"]}}, {"me.geo_segment.$":1}`;
        const query = reportModel.Reports.find(queryStr);
        return (await query.lean().exec({"virtuals": true}));
    */

    const aggArr = [];

    aggArr.push({
        $match:{
                "_id":mongoose.Types.ObjectId(reportId)
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

    const queryPromise = reportModel.Reports.aggregate(aggArr);

    return queryPromise;

}

const getMEViewsWithoutRegionData = async function (reportId) {
  /*
      const queryStr = `{"_id": ${mongoose.Types.ObjectId(reportId)}, "me.geo_segment._id": {"$in": ["${regionId}"]}}, {"me.geo_segment.$":1}`;
      const query = reportModel.Reports.find(queryStr);
      return (await query.lean().exec({"virtuals": true}));
  */

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
// save text data for the grid tables
const saveDataForGridTables = function (reportId, gridDetail) {
    // query
    let updateRes = reportModel.Reports.update(
        {
            "_id": mongoose.Types.ObjectId(reportId),
            "me.data.key": gridDetail.key,
        },
        {
            "$set": { "me.data.$.text": gridDetail.text, "me.data.$.custom_text": gridDetail.custom_text, "me.data.$.title": gridDetail.title }
        },
        {
            "multi": true
        }
    );

    return updateRes;
}

// Exporting model to external world
module.exports = {
    addSegments,
    addMEData,
    addMEGeoData,
    getMEViewsSegmentData,
    getMEViewsWithoutRegionData,
    getMEViewsRegionData,
    getMEGridDataForViews,
    saveDataForGridTables
};
