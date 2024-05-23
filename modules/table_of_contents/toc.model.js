import mongoose, {Schema, SchemaTypes} from 'mongoose';
// import schemas
import reportModel from '../reports/report.model';
import utilities from '../../utilities/utils';

const replaceContent = async function (tocDetails, reportId, sectionDetails) {

  let updateRes = {};

  if (!utilities.isEmpty(sectionDetails.sectionPid)) {
    await removeContent(reportId, sectionDetails.sectionPid);
  }

  updateRes = await addContent(tocDetails, reportId, sectionDetails);

  return updateRes;
}

const addContent = async function (tocDetails, reportId, sectionDetails) {

  let updateRes = {};
  let oTocDetails = tocDetails;

  if (!Array.isArray(oTocDetails)) {
    oTocDetails = [oTocDetails];
  }

  for (let i = 0; i < oTocDetails.length; i++) {
    const element = oTocDetails[i];

    let updateObj = {};
    // if (!utilities.isEmpty(element.content))
    updateObj = {...updateObj, ...{"toc.$.content": element.content}};

    if (!utilities.isEmpty(element.section_name))
      updateObj = {...updateObj, ...{"toc.$.section_name": element.section_name}};

    if (!utilities.isEmpty(element.meta))
      updateObj = {...updateObj, ...{"toc.$.meta": element.meta}};


    // update the toc entry if section_id is found in toc array
    updateRes = await reportModel.Reports.update(
      {
        "_id": mongoose.Types.ObjectId(reportId),
        "toc.section_id": element.section_id
      },
      {
        "$set": updateObj
      }
    );

    // if section_id is not found in toc array
    if (!updateRes.nModified) {

      // add the toc entry with section_id in toc array
      updateRes = await reportModel.Reports.update(
        {
          "_id": mongoose.Types.ObjectId(reportId),
        },
        {
          "$push": {
            "toc": element
          }
        }
      );
      console.log(updateRes);
    }
  }
  ;

  return updateRes;
}

// for toc get content by msid
const getTOCByMainSection = async function (reportId, mainSectionId) {
  return reportModel.Reports.aggregate([
    {"$match": {_id: mongoose.Types.ObjectId(`${reportId}`)}},
    {"$unwind": "$toc"},
    {
      "$match": {
        _id: mongoose.Types.ObjectId(`${reportId}`),
        'toc.main_section_id': parseInt(mainSectionId)
      }
    }, {
      "$project": {
        "toc": 1,
        "section_pid": 1,
        "main_section_id": 1,
      }
    }]);
}

// for toc get content
const getContent = async function (reportId, sectionId, mainSectionId) {

    let matchQuery = {};

    if (!utilities.isEmpty(reportId)) {
        matchQuery = {...matchQuery, ...{"_id": mongoose.Types.ObjectId(reportId) }};
    }

    if (!utilities.isEmpty(mainSectionId)) {
        /* var arr = [parseInt(mainSectionId), ''+mainSectionId]; // Note: no slashes
        var regexArr = [];
        for (var i = 0; i < arr.length; i++) {
            regexArr[i] = new RegExp(`^${arr[i]}`, "i");
        } */
        matchQuery = {...matchQuery, ...{"toc.main_section_id": mainSectionId }};
    }

  if (!utilities.isEmpty(sectionId)) {
    matchQuery = {...matchQuery, ...{"toc.section_id": sectionId}};
  }

  const queryRes = await reportModel.Reports.aggregate([
    {
      $unwind: "$toc"
    },
    {
      $match: matchQuery
    },
    {
      $sort: {
        "toc.main_section_id": 1,
        "toc.section_id": 1
      }
    },
    {
      $group: {
        _id: "$_id", "toc": {$mergeObjects: "$toc"}
      }
    }
  ]);

  return queryRes;
}

const getContentForSectionParent = async function (reportId, mainSectionId, sectionPid) {

  let matchQuery = {};

  if (!utilities.isEmpty(reportId)) {
    matchQuery = {...matchQuery, ...{"_id": mongoose.Types.ObjectId(reportId)}};
  }

  if (!utilities.isEmpty(mainSectionId)) {
    /* var arr = [parseInt(mainSectionId), ''+mainSectionId]; // Note: no slashes
    var regexArr = [];
    for (var i = 0; i < arr.length; i++) {
        regexArr[i] = new RegExp(`^${arr[i]}`, "i");
    } */
    matchQuery = {...matchQuery, ...{"toc.main_section_id": mainSectionId}};
  }

  if (!utilities.isEmpty(sectionPid)) {
    matchQuery = {...matchQuery, ...{"toc.section_pid": sectionPid}};
  }

  const queryRes = await reportModel.Reports.aggregate([
    {
      $unwind: "$toc"
    },
    {
      $match: matchQuery
    },
    {
      $sort: {
        "toc.main_section_id": 1,
        "toc.section_id": 1
      }
    },
    {
      $group: {
        _id: "$_id", "toc": {$push: "$toc"}
      }
    }
  ]);

  return queryRes;
}


// for review Info
const getAllReportContent = async function (reportId, sectionId, mainSectionId, sectionPid) {
  let matchQuery = {};

  if (!utilities.isEmpty(reportId)) {
    matchQuery = {...matchQuery, ...{"_id": mongoose.Types.ObjectId(reportId)}};
  }

  if (!utilities.isEmpty(mainSectionId)) {
    matchQuery = {...matchQuery, ...{"toc.main_section_id": parseInt(mainSectionId)}};
  }

  if (!utilities.isEmpty(sectionPid)) {
    matchQuery = {...matchQuery, ...{"toc.section_pid": {"$regex": new RegExp(`^${sectionPid}`, "i")}}};
  }

  if (!utilities.isEmpty(sectionId)) {
    matchQuery = {...matchQuery, ...{"toc.section_id": {"$regex": new RegExp(`^${sectionId}`, "i")}}};
  }


  const queryRes = await reportModel.Reports.aggregate([
    {
      $match: matchQuery
    },
    {
      $unwind: "$toc"
    },
    {
      $match: matchQuery
    },
    {
      $group: {
        _id: "$_id", "toc": {$addToSet: "$toc"}
      }
    }
  ]);

  return queryRes;
}

const getContentByKey = function (reportId, sectionKey) {

  let matchQuery = {};
  matchQuery = {...matchQuery, ...{"_id": mongoose.Types.ObjectId(reportId)}};
  matchQuery = {...matchQuery, ...{"toc.meta.type": {$regex: (new RegExp(`.*${sectionKey.toLowerCase()}.*`, "i"))}}};

  const selectObj = {"toc.$.1": 1};

  const query = reportModel.Reports.findOne(matchQuery, selectObj);

  return (query.lean().exec({}));
}


const removeContent = function (reportId, sectionPid) {
  let matchQuery = {};
  matchQuery = {"_id": mongoose.Types.ObjectId(reportId)};

  const query = reportModel.Reports.updateMany(matchQuery, {$pull: {"toc": {"section_pid": sectionPid}}}, {multi: true})

  return (query.lean().exec({}));

}


// Exporting model to external world
module.exports = {
  addContent,
  getContent,
  getAllReportContent,
  getContentByKey,
  getContentForSectionParent,
  replaceContent,
  getTOCByMainSection
};
