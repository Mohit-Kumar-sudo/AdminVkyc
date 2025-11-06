import HTTPStatus from 'http-status';
import utilities from '../../utilities/utils';
import * as _ from "lodash";

const rlmService = require('./rlm.service');



export async function getReportMenuItems(req, res) {
  try {
    const reportId = req.params.rid;
    console.log('got request')
    const data = await rlmService.getReportMenuItems(reportId) || {};
    console.log('fetched')
    const finalMenuData = filterMenuItems(data);
    console.log('converted')
    utilities.sendResponse(HTTPStatus.OK, {finalMenuData}, res);
    console.log('sent')
  } catch (er) {
    console.log('er', er)
    utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
  }
  
}

function filterMenuItems(reportData) {
  const finalMenuData = [];
  // Analytics
  // if (reportData.me.data) {
  finalMenuData.push({label: 'Analytics', link: '/dashboard'})
  // }
  // Market Breakup
  if (reportData.me && reportData.me.segment && reportData.me.segment.length) {
    finalMenuData.push({label: 'Market Breakup', link: '/market-estimation'})
  }

  // Executive Summary
  if (reportData.toc) {
    // let executiveSummaryData = _.find(reportData.toc, ['section_name', "EXECUTIVE SUMMARY"]);
    let executiveSummaryData = _.find(reportData.toc, ['section_id', "2"]);
    if (executiveSummaryData && executiveSummaryData.content && executiveSummaryData.content.length) {
      finalMenuData.push({label: 'Executive Summary', link: '/executive-summary'});
    }
  }

  // Market Introduction
  let marketIntroductionSubMenus = [];
  if (reportData.toc) {
    let mIdata = _.find(reportData.toc, ['meta_info.section_value', "Definition"])
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
      marketIntroductionSubMenus.push({
        label: 'Macro Factor Indicators Analysis',
        link: '/macro-factor-indicators-analysis'
      });
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
    // Drivers
    let driversData = _.find(reportData.toc, ['section_name', "Drivers"]);
    if (driversData && driversData.content && driversData.content.length) {
      marketDynamicsSubMenus.push({label: 'Drivers', link: '/droctcontainer'});
    }

    // Restraints
    let restraintsData = _.find(reportData.toc, ['section_name', "Restraints"]);
    if (restraintsData && restraintsData.content && restraintsData.content.length) {
      marketDynamicsSubMenus.push({label: 'Restraints', link: '/droctcontainer'});
    }

    // Opportunities
    let opportunitiesData = _.find(reportData.toc, ['section_name', "Opportunities"]);
    if (opportunitiesData && opportunitiesData.content && opportunitiesData.content.length) {
      marketDynamicsSubMenus.push({label: 'Opportunities', link: '/droctcontainer'});
    }

    // Challenges
    let challengesData = _.find(reportData.toc, ['section_name', "Challenges"]);
    if (challengesData && challengesData.content && challengesData.content.length) {
      marketDynamicsSubMenus.push({label: 'Challenges', link: '/droctcontainer'});
    }

    // Trends
    let trendsData = _.find(reportData.toc, ['section_name', "Trends"]);
    if (trendsData && trendsData.content && trendsData.content.length) {
      marketDynamicsSubMenus.push({label: 'Trends', link: '/droctcontainer'});
    }

    // Market Factor Analysis Sub Menus
    // Supply chain analysis
    let supplyChainAnalysisData = _.find(reportData.toc, ['section_name', "Suuply / Value Chain Analysis"]);
    if (supplyChainAnalysisData && supplyChainAnalysisData.content && supplyChainAnalysisData.content.length) {
      const label = (supplyChainAnalysisData.meta && supplyChainAnalysisData.meta.chain_type && supplyChainAnalysisData.meta.chain_type === 'VALUE CHAIN ANALYSIS') ? 'Value Chain Analysis' : 'Supply Chain Analysis'
      marketFactorAnalysisSubMenus.push({label: label, link: '/supply-chain-output'});
    }

    //  Porter’s 5 forces
    let porters5forcesData = _.find(reportData.toc, ['section_name', "Porters"]);
    if (porters5forcesData && porters5forcesData.content && porters5forcesData.content.length) {
      marketFactorAnalysisSubMenus.push({label: 'Porter’s 5 forces', link: '/porters-forces-output'});
    }
  }

  // Market Dynamics parent menu
  // let marketDynamicsData = _.find(reportData.toc, ['meta_info.section_key', 'introduction']);
  // if (marketDynamicsData && marketDynamicsData.content && marketDynamicsData.content.length) {
  finalMenuData.push({label: 'Market Dynamics', link: '/driveroutput', items: marketDynamicsSubMenus});
  // }

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
      })
    });
    finalMenuData.push(menuObj);
  }

  let competitiveLandscapeSubMenus = [];
  if (reportData.toc) {
    // Competitive Overview
    let competitiveOverviewData = _.find(reportData.toc, ['meta_info.section_key', 'overview']);
    if (competitiveOverviewData && competitiveOverviewData.content && competitiveOverviewData.content.length) {
      competitiveLandscapeSubMenus.push({label: 'Competitive Overview', link: '/competitive-overview'});
    }

    // Market Share/Strategy/Ranking Analysis
    let marketShareStrategyRankingAnalysisData = _.find(reportData.toc, ['meta_info.section_key', 'marketAnalysis']);
    if (marketShareStrategyRankingAnalysisData && marketShareStrategyRankingAnalysisData.content && marketShareStrategyRankingAnalysisData.content.length) {
      competitiveLandscapeSubMenus.push({
        label: 'Market Share/Strategy/Ranking Analysis',
        link: '/market-share-analysis'
      });
    }

    // Key developments and growth strategies
    let keyDevelopmentsAndGrowthStrategiesData = _.find(reportData.toc, ['meta_info.section_key', 'devAndGrowthStrategies']);
    if (keyDevelopmentsAndGrowthStrategiesData && keyDevelopmentsAndGrowthStrategiesData.content && keyDevelopmentsAndGrowthStrategiesData.content.length) {
      competitiveLandscapeSubMenus.push({
        label: 'Key developments and growth strategies',
        link: '/key-development-growth-strategies'
      });
    }

    // Product/Service Development
    let newProductServiceDevelopmentData = _.find(reportData.toc, ['meta_info.section_key', 'newDevelopment']);
    if (newProductServiceDevelopmentData && newProductServiceDevelopmentData.content && newProductServiceDevelopmentData.content.length) {
      competitiveLandscapeSubMenus.push({
        label: 'New Product/Service Development',
        link: '/new-product-service-development'
      });
    }

    // Market Share/Strategy/Ranking Analysis
    let mergerAndAcquisitionData = _.find(reportData.toc, ['meta_info.section_key', 'mergerAndAquisition']);
    if (mergerAndAcquisitionData && mergerAndAcquisitionData.content && mergerAndAcquisitionData.content.length) {
      competitiveLandscapeSubMenus.push({label: 'Merger & Acquisition', link: '/merger-and-acquisition'});
    }

    // Joint Ventures
    let jointVenturesData = _.find(reportData.toc, ['meta_info.section_key', 'jointVenture']);
    if (jointVenturesData && jointVenturesData.content && jointVenturesData.content.length) {
      competitiveLandscapeSubMenus.push({label: 'Joint Ventures', link: '/joint-ventures'});
    }
    // Competitor dashboard
    let competitorDashboardData = _.find(reportData.toc, ['meta_info.section_key', 'dashboard']);
    if (competitorDashboardData && competitorDashboardData.content && competitorDashboardData.content.length) {
      competitiveLandscapeSubMenus.push({label: 'Competitor dashboard', link: '/competitor-dashboard-output'});
    }

    // Competitive benchmarking
    let competitiveBenchmarkingData = _.find(reportData.toc, ['meta_info.section_key', 'benchMarking']);
    if (competitiveBenchmarkingData && competitiveBenchmarkingData.content && competitiveBenchmarkingData.content.length) {
      competitiveLandscapeSubMenus.push({label: 'Competitive benchmarking', link: '/competitive-benchmarking'});
    }
    if (competitiveLandscapeSubMenus.length)
      finalMenuData.push({
        label: 'Competitive Landscape',
        items: competitiveLandscapeSubMenus,
        link: competitiveLandscapeSubMenus[0].link
      });

    let parentMarketAnalysisSubMenus = [];
    // Competitive benchmarking
    let automobileProductionDataData = _.find(reportData.toc, ['meta_info.section_key', 'productionData']);
    if (automobileProductionDataData && automobileProductionDataData.content && automobileProductionDataData.content.length) {
      parentMarketAnalysisSubMenus.push({label: 'Automobile Production Data', link: '/automobile-production-data'});
    }

    // Competitive benchmarking
    let automobileSalesDataData = _.find(reportData.toc, ['meta_info.section_key', 'salesData']);
    if (automobileSalesDataData && automobileProductionDataData.content && automobileSalesDataData.content.length) {
      parentMarketAnalysisSubMenus.push({label: 'Automobile Sales Data', link: '/automobile-sales-data'});
    }
    if (parentMarketAnalysisSubMenus.length) {
      finalMenuData.push({
        label: 'Parent Market Analysis',
        items: parentMarketAnalysisSubMenus,
        link: parentMarketAnalysisSubMenus[0].link
      });
    }

    // Pricing Raw Material Scenario
    let pricingRawMaterialScenarioMenus = []
    let pricingRawMaterialScenarioData = _.find(reportData.toc, ['meta_info.section_value', 'Pricing analysis']);
    if (pricingRawMaterialScenarioData && pricingRawMaterialScenarioData && pricingRawMaterialScenarioData.content.length) {
      pricingRawMaterialScenarioMenus.push({
        label: 'Pricing Analysis',
        link: `/pricing-raw-material-scenario/${reportData._id}/pricing-analysis`
      });
    }

    let pricingRawMaterialScenarioData1 = _.find(reportData.toc, ['meta_info.section_value', 'Raw material scenario']);
    if (pricingRawMaterialScenarioData1 && pricingRawMaterialScenarioData1.content && pricingRawMaterialScenarioData1.content.length) {
      pricingRawMaterialScenarioMenus.push({
        label: 'Raw material scenario',
        link: `/pricing-raw-material-scenario/${reportData._id}/raw-material-scenario`
      });
    }

    if (pricingRawMaterialScenarioMenus.length) {
      finalMenuData.push({
        label: 'Pricing Raw Material Scenario',
        items: pricingRawMaterialScenarioMenus,
        link: pricingRawMaterialScenarioMenus[0].link
      });
    }

    // Trade Landscape
    const tradeLandscapeData = _.find(reportData.toc, ['section_name', 'Trade Landscape']);
    if(tradeLandscapeData && tradeLandscapeData.content && tradeLandscapeData.content.length) {
      finalMenuData.push({label: 'Trade Landscape', link: `/trade-landscape/${reportData._id}`})
    }

    // Regulatory Landscape

    
    // // Pricing Scenario
    // let pricingAnalysisSubMenus = [];
    // let pricingAnalysisData = _.find(reportData.toc, ['meta_info.section_key', 'pricingAnalysis']);
    // if (pricingAnalysisData && pricingAnalysisData.content && pricingAnalysisData.content.length) {
    //   pricingAnalysisSubMenus.push({
    //     label: 'Pricing Analysis',
    //     link: `/pricing-scenario/${reportData._id}/pricing-analysis`
    //   });
    // } else {
    //   pricingAnalysisData = _.find(reportData.toc, ['meta_info.section_value', 'Pricing analysis']);
    //   if (pricingAnalysisData && pricingAnalysisData.content && pricingAnalysisData.content.length) {
    //     pricingAnalysisSubMenus.push({
    //       label: 'Pricing Analysis',
    //       link: `/pricing-scenario/${reportData._id}/pricing-analysis`
    //     });
    //   }
    // }
    // if (pricingAnalysisSubMenus.length) {
    //   finalMenuData.push({
    //     label: 'Pricing Scenario',
    //     items: pricingAnalysisSubMenus,
    //     link: pricingAnalysisSubMenus[0].link
    //   });
    // }

    // Production Outlook
    let productionOutlookMenus = [];
    let productionOutlookData = _.find(reportData.toc, ['meta_info.section_value', 'Production capacities']);
    if (productionOutlookData && productionOutlookData.content && productionOutlookData.content.length) {
      productionOutlookMenus.push({
        label: 'Production capacities',
        link: `/production-outlook/${reportData._id}/production-capacities`
      });
    }

    productionOutlookData = _.find(reportData.toc, ['meta_info.section_value', 'Production cost breakup']);
    if (productionOutlookData && productionOutlookData.content && productionOutlookData.content.length) {
      productionOutlookMenus.push({
        label: 'Production cost breakup',
        link: `/production-outlook/${reportData._id}/production-cost-breakup`
      });
    }

    productionOutlookData = _.find(reportData.toc, ['meta_info.section_value', 'Production share']);
    if (productionOutlookData && productionOutlookData.content && productionOutlookData.content.length) {
      productionOutlookMenus.push({
        label: 'Production share',
        link: `/production-outlook/${reportData._id}/production-share`
      });
    }


    if (productionOutlookMenus.length) {
      finalMenuData.push({
        label: 'Production Outlook',
        items: productionOutlookMenus,
        link: productionOutlookMenus[0].link
      });
    }

    // Pipeline Analysis
    let pipelineAnalysisMenus = [];
    let pipelineAnalysisData = _.find(reportData.toc, ['meta_info.section_value', 'Clinical Trial Phases']);
    if (pipelineAnalysisData && pipelineAnalysisData.content && pipelineAnalysisData.content.length) {
      pipelineAnalysisMenus.push({
        label: 'Clinical Trial Phases',
        link: `/pipeline-analysis/${reportData._id}/clinical-trial-phases`
      });
    }

    pipelineAnalysisData = _.find(reportData.toc, ['meta_info.section_value', 'Product Development']);
    if (pipelineAnalysisData && pipelineAnalysisData.content && pipelineAnalysisData.content.length) {
      pipelineAnalysisMenus.push({
        label: 'Product Development',
        link: `/pipeline-analysis/${reportData._id}/product-development`
      });
    }

    pipelineAnalysisData = _.find(reportData.toc, ['meta_info.section_value', 'Strategic Initiatives for Clinical Trials by Company']);
    if (pipelineAnalysisData && pipelineAnalysisData.content && pipelineAnalysisData.content.length) {
      pipelineAnalysisMenus.push({
        label: 'Strategic Initiatives for Clinical Trials by Company',
        link: `/pipeline-analysis/${reportData._id}/strategic-initiatives-for-clinical-trials-by-company`
      });
    }

    if (pipelineAnalysisMenus.length) {
      finalMenuData.push({
        label: 'Pipeline Analysis',
        items: pipelineAnalysisMenus,
        link: pipelineAnalysisMenus[0].link
      });
    }

    if (reportData.tocList) {
      const otherModules = _.filter(reportData.tocList, ['urlpattern', 'other-module']);
      otherModules.forEach(oM => {
        if (oM.section_name !== 'RESEARCH METHODOLOGY' && oM.section_name !== "Research Methodology") {
          const data = _.find(reportData.toc, ['section_id', oM.section_id.toString()])
          if (data && data.content) {
            finalMenuData.push({
              label: oM.section_name,
              link: '/other-module',
              sectionId: oM.section_id,
              mainSectionId: oM.main_section_id
            })
          }
        }
      })
    }
  }
  return finalMenuData;
}
