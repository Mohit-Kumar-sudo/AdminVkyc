import tocModel from './toc.model';
import utilities from '../../utilities/utils';
import to from '../../utilities/to';    // for better error handling of async/await with promises
import reportModel from '../reports/report.model';

async function addContent(tocDetails, reportId, sectionDetails) {
    let tocData = {};
    try {
        tocData = await to(tocModel.addContent(tocDetails, reportId, sectionDetails));
        if (!tocData.errors)
            tocData = utilities.formUpdateQueryResults(tocData);
        return tocData;
    } catch (er) {
        console.error("Error: addContent: " + er);
        return (tocData.errors = er.message);
    }
}

async function getTOCByMainSection(reportId, mainSectionId) {
  let tocSectionData = {};
  try {
    tocSectionData = await to(tocModel.getTOCByMainSection(reportId, mainSectionId)) || {};
    return tocSectionData;
  } catch (er) {
    console.error(`Error: addContent: ${er}`);
    return (tocSectionData.errors = er.message);
  }
}

async function replaceContent(tocDetails, reportId, sectionDetails) {
    let tocData = {};
    try {
        tocData = await to(tocModel.replaceContent(tocDetails, reportId, sectionDetails));
        if (!tocData.errors)
            tocData = utilities.formUpdateQueryResults(tocData);
        return tocData;
    } catch (er) {
        console.error("Error: addContent: " + er);
        return (tocData.errors = er.message);
    }
}

async function getContent(reportId, sectionId, mainSectionId, sectionPid) {
    let tocData = {};
    try {
        tocData = await tocModel.getContent(reportId, sectionId, mainSectionId, sectionPid);
        return tocData;
    } catch (er) {
        console.error("Exception while retrieving toc content data: " + er.message);
        return (tocData.errors = er.message);
    }
}


async function getAllReportContent(reportId) {
    let fullReportData = null;
    let tocList = [];
    let promises = [];
    let modules = [];
    let data = {};

    try {
        const reportData = await reportModel.fetchReport(reportId) || {};

        if (utilities.isEmpty(reportData)
            && utilities.isEmpty(reportData.tocList)) {
            console.warn(`No report data found for report (id - ${reportId})`);
            return fullReportData;
        }

        tocList = reportData[0].tocList || [];
            // len - 24
            //
        for (let i=0; i<tocList.length; i++) {
            modules.push(tocList[i].section_name);
            promises.push(tocModel.getAllReportContent(reportId, null, tocList[i].section_id));
        }

        fullReportData = await Promise.all(promises);

        fullReportData.forEach((ele, idx) => {
            data[tocList[idx].section_name] = {};

            if (!utilities.isEmpty(ele)) {
                data[tocList[idx].section_name] = ele[0].toc;
            }
        });

        return data;

    } catch (er) {
        console.error("Exception while retrieving all toc content data: " + er.message);
        return (tocData.errors = er.message);
    }
}


// GET TOC content by section key
async function getContentByKey(reportId, sectionKey) {
    let tocListData = {};
    let tocData = {};

    try {
        if (!utilities.isEmpty(reportId)) {
            // I. derieve the key section id for this report from tocList
            tocListData = await reportModel.getSectionDetailsFromSectionKey(reportId, sectionKey) || {};
        }

        // if tocListdata found, then use section id of toclistdata to retrieve data
        if (!utilities.isEmpty(tocListData) && !utilities.isEmpty(tocListData.tocList)) {
            tocListData =  tocListData.tocList[0];
            tocData = await tocModel.getAllReportContent(reportId, null, tocListData.section_id);
        } else {    // else use section key to search in the "toc.meta.type"
            // II. Derieve the content using "toc.meta.type" lookup
            tocData = await tocModel.getContentByKey(reportId, sectionKey);
        }

        return (tocData);

    } catch (er) {
        console.error(`Exception while retrieving content data for section key (${sectionKey}) and report (${reportId}): ${er.message}`);
        return (tocData.errors = er.message);
    }
}

async function getContentForSectionParent(reportId, mainSectionId, sectionPid) {
    let tocData = {};
    try {
        tocData = await tocModel.getContentForSectionParent(reportId, mainSectionId, sectionPid);
        return tocData;
    } catch (er) {
        console.error("Exception while retrieving toc content data fr parent sections: " + er.message);
        return (tocData.errors = er.message);
    }
}


module.exports = {
    addContent,
    getContent,
    getAllReportContent,
    getContentByKey,
    getContentForSectionParent,
    replaceContent,
    getTOCByMainSection
};
