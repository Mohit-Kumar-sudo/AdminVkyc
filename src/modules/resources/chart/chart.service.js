import chartModel from './chart.model';

import to from '../../../utilities/to';    // for better error handling of async/await with promises 

async function getChartData(reportId, chartName) {
    let chartData = {};

    try {
        chartData = await to(chartModel.getChartData(reportId, chartName));
    } catch(er) {
        console.error("Exception while getting chart details by name : ex: " + er);
        chartData.errors = er.message;
    }

    return (chartData);
}

module.exports = {
    getChartData
};