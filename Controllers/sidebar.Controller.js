const Reports = require('../Models/Reports.Model')
const HTTPStatus = require('http-status');
const utilities = require('../utilities/utils');
const mongoose = require("mongoose");
const _ = require("lodash");

module.exports = {
  getReportMenuItems : async (req, res) => {
    try {
      const reportId = req.params.rid;
      // console.log('Received request for reportId:', reportId);
  
      // Fetch the report data directly from the model
      const reportData = await Reports.findOne({
        _id: new mongoose.Types.ObjectId(reportId)
      });
  
      if (!reportData) {
        return utilities.sendErrorResponse(HTTPStatus.NOT_FOUND, false, 'Report not found', res);
      }
  
      // Filter the data (assuming you want to filter some part of the report data)
      const finalMenuData = filterMenuItems(reportData);
  
      // console.log('Filtered menu data:', finalMenuData);
      
      // Send the response with the final menu data
      utilities.sendResponse(HTTPStatus.OK, { finalMenuData }, res);
  
    } catch (err) {
      console.error('Error:', err);
      utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, err, res);
    }
  }
}

function filterMenuItems(reportData) {
  const finalMenuData = [];

  // Analytics
  finalMenuData.push({label: 'Analytics', link: '/dashboard'});

  // Market Breakup
  if (reportData.me && reportData.me.segment && reportData.me.segment.length) {
    finalMenuData.push({label: 'Market Breakup', link: '/market-estimation'});
  }

  // Executive Summary
  if (reportData.toc) {
    let executiveSummaryData = _.find(reportData.toc, ['section_id', "2"]);
    if (executiveSummaryData && executiveSummaryData.content && executiveSummaryData.content.length) {
      finalMenuData.push({label: 'Executive Summary', link: '/executive-summary'});
    }
  }

  // Market Introduction
  let marketIntroductionSubMenus = [];
  if (reportData.toc) {
    let mIdata = _.find(reportData.toc, ['meta_info.section_value', "Definition"]);
    if (mIdata) {
      marketIntroductionSubMenus.push({label: 'Definition', link: '/definition'});
    }
    mIdata = _.find(reportData.toc, ['meta_info.section_value', "Scope of the study"]);
    if (mIdata) {
      marketIntroductionSubMenus.push({label: 'Scope of the study', link: '/scope-of-study'});
    }

    mIdata = _.find(reportData.toc, ['meta_info.section_value', "List of assumptions"]);
    if (mIdata) {
      marketIntroductionSubMenus.push({label: 'List of assumptions', link: '/list-of-assumptions'});
    }

    mIdata = _.find(reportData.toc, ['meta_info.section_key', "structure"]);
    if (mIdata) {
      marketIntroductionSubMenus.push({label: 'Market Structure', link: '/market-structure'});
    }
    mIdata = _.find(reportData.toc, ['meta_info.section_key', "takeways"]);
    if (mIdata) {
      marketIntroductionSubMenus.push({label: 'Key takeaways', link: '/key-takeaways'});
    }
    mIdata = _.find(reportData.toc, ['meta_info.section_value', "Macro Factor Indicators Analysis"]);
    if (mIdata) {
      marketIntroductionSubMenus.push({label: 'Macro Factor Indicators Analysis', link: '/macro-factor-indicators-analysis'});
    }
    mIdata = _.find(reportData.toc, ['meta_info.section_key', "insights"]);
    if (mIdata) {
      marketIntroductionSubMenus.push({label: 'Market Insights', link: '/market-insights'});
    }
    
    if (marketIntroductionSubMenus && marketIntroductionSubMenus.length) {
      finalMenuData.push({
        label: 'Market Introduction',
        items: marketIntroductionSubMenus,
        link: marketIntroductionSubMenus[0].link
      });
    }
  }

  // Market Estimation By Segments
  if (reportData.me && reportData.me.segment && reportData.me.segment.length && reportData.me.data) {
    const menuObj = {label: 'Market Estimation By Segments', link: 'me-segments'};
    const segmentItems = _.filter(reportData.me.segment, ['pid', '1']);
    if (segmentItems.length) {
      menuObj.segmentItems = segmentItems;
    }
    finalMenuData.push(menuObj);
  }

  // Market Estimation By Region
  if (reportData.me && reportData.me.geo_segment && reportData.me.data) {
    const menuObj = {label: 'Market Estimation By Region', link: '/me-region'};
    const segmentItems = reportData.me.geo_segment;
    if (segmentItems) {
      menuObj.segmentItems = segmentItems;
    }
    finalMenuData.push(menuObj);
  }

  const marketDynamicsSubMenus = [];
  const marketFactorAnalysisSubMenus = [];
  if (reportData.toc) {
    // Market Dynamics Sub Menus
    let driversData = _.find(reportData.toc, ['section_name', "Drivers"]);
    if (driversData && driversData.content && driversData.content.length) {
      marketDynamicsSubMenus.push({label: 'Drivers', link: '/droctcontainer'});
    }

    let restraintsData = _.find(reportData.toc, ['section_name', "Restraints"]);
    if (restraintsData && restraintsData.content && restraintsData.content.length) {
      marketDynamicsSubMenus.push({label: 'Restraints', link: '/droctcontainer'});
    }

    let opportunitiesData = _.find(reportData.toc, ['section_name', "Opportunities"]);
    if (opportunitiesData && opportunitiesData.content && opportunitiesData.content.length) {
      marketDynamicsSubMenus.push({label: 'Opportunities', link: '/droctcontainer'});
    }

    let challengesData = _.find(reportData.toc, ['section_name', "Challenges"]);
    if (challengesData && challengesData.content && challengesData.content.length) {
      marketDynamicsSubMenus.push({label: 'Challenges', link: '/droctcontainer'});
    }

    let trendsData = _.find(reportData.toc, ['section_name', "Trends"]);
    if (trendsData && trendsData.content && trendsData.content.length) {
      marketDynamicsSubMenus.push({label: 'Trends', link: '/droctcontainer'});
    }

    // Market Factor Analysis Sub Menus
    let supplyChainAnalysisData = _.find(reportData.toc, ['section_name', "Suuply / Value Chain Analysis"]);
    if (supplyChainAnalysisData && supplyChainAnalysisData.content && supplyChainAnalysisData.content.length) {
      const label = (supplyChainAnalysisData.meta && supplyChainAnalysisData.meta.chain_type && supplyChainAnalysisData.meta.chain_type === 'VALUE CHAIN ANALYSIS') ? 'Value Chain Analysis' : 'Supply Chain Analysis'
      marketFactorAnalysisSubMenus.push({label: label, link: '/supply-chain-output'});
    }

    let porters5forcesData = _.find(reportData.toc, ['section_name', "Porters"]);
    if (porters5forcesData && porters5forcesData.content && porters5forcesData.content.length) {
      marketFactorAnalysisSubMenus.push({label: 'Porter’s 5 forces', link: '/porters-forces-output'});
    }
  }

  // Market Dynamics parent menu
  finalMenuData.push({label: 'Market Dynamics', link: '/driveroutput', items: marketDynamicsSubMenus});

  if (marketFactorAnalysisSubMenus.length) {
    finalMenuData.push({
      label: 'Market Factor Analysis',
      link: marketFactorAnalysisSubMenus[0].link,
      items: marketFactorAnalysisSubMenus
    });
  }

  // Top Players
  if (reportData.cp && reportData.cp.length) {
    const menuObj = {label: 'Top Players', link: '/output-company', segmentItems: []};
    const segmentItems = reportData.cp;
    reportData.cp.forEach(item => {
      menuObj.segmentItems.push({
        id: item.company_id,
        name: item.company_name
      });
    });
    finalMenuData.push(menuObj);
  }

  let competitiveLandscapeSubMenus = [];
  if (reportData.toc) {
    let competitiveOverviewData = _.find(reportData.toc, ['meta_info.section_key', 'overview']);
    if (competitiveOverviewData && competitiveOverviewData.content && competitiveOverviewData.content.length) {
      competitiveLandscapeSubMenus.push({label: 'Competitive Overview', link: '/competitive-overview'});
    }

    let marketShareStrategyRankingAnalysisData = _.find(reportData.toc, ['meta_info.section_key', 'marketAnalysis']);
    if (marketShareStrategyRankingAnalysisData && marketShareStrategyRankingAnalysisData.content && marketShareStrategyRankingAnalysisData.content.length) {
      competitiveLandscapeSubMenus.push({
        label: 'Market Share/Strategy/Ranking Analysis',
        link: '/market-share-analysis'
      });
    }

    let keyDevelopmentsAndGrowthStrategiesData = _.find(reportData.toc, ['meta_info.section_key', 'devAndGrowthStrategies']);
    if (keyDevelopmentsAndGrowthStrategiesData && keyDevelopmentsAndGrowthStrategiesData.content && keyDevelopmentsAndGrowthStrategiesData.content.length) {
      competitiveLandscapeSubMenus.push({
        label: 'Key developments and growth strategies',
        link: '/key-development-growth-strategies'
      });
    }

    let newProductServiceDevelopmentData = _.find(reportData.toc, ['meta_info.section_key', 'newDevelopment']);
    if (newProductServiceDevelopmentData && newProductServiceDevelopmentData.content && newProductServiceDevelopmentData.content.length) {
      competitiveLandscapeSubMenus.push({
        label: 'New Product/Service Development',
        link: '/new-product-service-development'
      });
    }

    let mergerAndAcquisitionData = _.find(reportData.toc, ['meta_info.section_key', 'mergerAndAquisition']);
    if (mergerAndAcquisitionData && mergerAndAcquisitionData.content && mergerAndAcquisitionData.content.length) {
      competitiveLandscapeSubMenus.push({label: 'Mergers and Acquisitions', link: '/merger-acquisition'});
    }

    let otherInsightsData = _.find(reportData.toc, ['meta_info.section_key', 'otherInsights']);
    if (otherInsightsData && otherInsightsData.content && otherInsightsData.content.length) {
      competitiveLandscapeSubMenus.push({label: 'Other Insights', link: '/other-insights'});
    }
  }

  if (competitiveLandscapeSubMenus.length) {
    finalMenuData.push({
      label: 'Competitive Landscape',
      link: competitiveLandscapeSubMenus[0].link,
      items: competitiveLandscapeSubMenus
    });
  }

  // Final Report
  if (reportData.toc) {
    let finalReportData = _.find(reportData.toc, ['meta_info.section_key', 'finalReport']);
    if (finalReportData) {
      finalMenuData.push({
        label: 'Final Report',
        link: '/final-report'
      });
    }
  }

  return finalMenuData;
}