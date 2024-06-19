import HTTPStatus from 'http-status';
import utilities from '../../utilities/utils';
import * as _ from "lodash";

const rlmService = require('../reports-leftmenu/rlm.service');
import reportService from '../reports/report.service'
import rsService from './rs.service';

export async function getReportMenuItems(req, res) {
    try {
        const reportId = req.params.rid;
        const data = await reportService.fetchReport(reportId) || {};
        const statusData = await checkData(req, res, data)
        return utilities.sendResponse(HTTPStatus.OK, { reportData: data }, res);
    } catch (er) {
        console.log(er);
        return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
    }
}

async function checkData(req, res, data) {
    var statusArr = [];
    const existingData = await rsService.getReportStatus(data._id);
    if (data.toc && data.toc.length) {
        // console.log(data);

        data.toc.forEach(d => {
            if (d.content && d.content.length) {
                statusArr.push({
                    section_id: d.section_id,
                    section_name: d.section_name,
                    main_section_id: d.main_section_id,
                    section_pid: d.section_pid,
                    status: 'started'
                })
            }
        })
        if (statusArr && statusArr.length) {
            statusArr.forEach(d => {
                data.tocList.forEach(dd => {
                    if (dd.section_id === d.main_section_id && d.status != 'Finished') {
                        d.status = "started"
                    }
                })
            });
        }
    }

    if (data.me.geo_segment && data.me.geo_segment.region.length) {
        statusArr.push({
            section_id: 1,
            section_name: "MARKET ESTIMATION",
            main_section_id: '1',
            section_pid: "",
            status: 'started'
        })
    }
    if (data.cp && data.cp.length) {
        let cp = false;
        data.cp.forEach(d => {
            if (d.swot_analysis && d.swot_analysis.length) {
                cp = true
            } else if (d.company_overview && d.company_overview.length) {
                cp = true
            } else if (d.key_development && d.key_development.length) {
                cp = true
            } else if (d.strategy && d.strategy.length) {
                cp = true
            } else {
                false
            }
        })
        if (cp) {
            statusArr.push({
                section_id: 9,
                section_name: "COMPANY PROFILES",
                main_section_id: '9',
                section_pid: "",
                status: 'started'
            })
        }
    }
    statusArr = _.uniqBy(statusArr, function (e) {
        return e.main_section_id
    })
    if (existingData && existingData.status.length) {

        statusArr.forEach(d => {
            existingData.status.forEach(dd => {
                if (`${d.main_section_id}` === dd.main_section_id) {
                    d.status = dd.status
                }
            })
        })
    }
    if (statusArr && statusArr.length) {
        // const updateStatus = 
        try {
            const reportId = data._id;
            const datas = await rsService.addReportStatus(statusArr, reportId) || {};
            if (datas)
                return utilities.sendResponse(HTTPStatus.OK, datas, res);
        } catch (er) {
            console.log(er);

            return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
        }
    }
}

export async function getReportStatus(req, res) {
    try {
        const reportId = req.params.rid;
        const data = await rsService.getReportStatus(reportId) || {};
        return utilities.sendResponse(HTTPStatus.OK, data, res);
    } catch (er) {
        console.log(er);

        return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
    }
}

export async function updateReportStatus(req, res) {
    try {
        const reportId = req.params.rid;
        const statusData = req.body;
        const data = await rsService.updateReportStatus(statusData, reportId) || {};
        return utilities.sendResponse(HTTPStatus.OK, data, res);
    } catch (er) {
        console.log(er);

        return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
    }
}