import {MainSectionConstants} from '../constants/mfr.constants';

// Menu Metadata
export interface MenuMetaData {
  id: string;
  key: string,
  value: string,
  subSections?: MenuMetaData[]
}

export function getMenuMetadata(menu: MenuMetaData[], key: String): MenuMetaData {
  return menu.filter(ele => ele.key === key)[0];
}

export function getMenuMetadataById(menu: MenuMetaData[], id: String): MenuMetaData {
  return menu.filter(ele => ele.id === id)[0];
}


/* Industry Insights */
export const industryInsightsSections: MenuMetaData[] = [
  {
    id: '1',
    key: 'miltaryExpensePerCtry',
    value: 'Military Expenses per Country'
  },
  {
    id: '2',
    key: 'airCraftDeliveryPerCtry',
    value: 'Aircraft Deliveries per Country'
  },
  {
    id: '3',
    key: 'noOfAirPortPerCtry',
    value: 'Number of Airports per Country'
  }
];

/* Market Insights */
export const marketInsightsSections: MenuMetaData[] = [
  {
    id: '1',
    key: 'rawMaterialLandscape',
    value: 'Raw Material Landscape'
  },
  {
    id: '2',
    key: 'pricingAnalysis',
    value: 'Pricing Analysis'
  }
];

/* Oil and Gas Sector */
export const oilGasSectorOverviewSections: MenuMetaData[] = [
  {
    id: '1',
    key: 'oliAndGasProduction',
    value: 'Oil & Gas Production'
  },
  {
    id: '2',
    key: 'rigCount',
    value: 'Rig Count'
  },
  {
    id: '3',
    key: 'oilPrices',
    value: 'Oil Prices (USD per barrel)'
  },
  {
    id: '4',
    key: 'technologicalTrends',
    value: 'Technological trends (In automation related markets)'
  }
];

/* Power Sector */
export const powerSectorOverviewSections: MenuMetaData[] = [
  {
    id: '1',
    key: 'powerGenerationCapacity',
    value: 'Power Generation Installed Capacity (MW)'
  },
  {
    id: '2',
    key: 'powerGenerationMixPer',
    value: 'Power Generation Mix (%)'
  },
  {
    id: '3',
    key: 'listOfPowerPlants',
    value: 'List of Power Plants'
  },
  {
    id: '4',
    key: 'transAndDisInvestMents',
    value: 'Transmission & Distribution Investments (USD Million)'
  }
];

/* Parent Market Analysis */
export const parentMarketAnalysisSections: MenuMetaData[] = [
  {
    id: '1',
    key: 'productionData',
    value: 'Automobile Production Data (by Country/Vehicle Type)'
  },
  {
    id: '2',
    key: 'salesData',
    value: 'Automobile Sales Data (by Country/Vehicle Type)'
  }
];

/* Market Overview */
export const marketOverviewSections: MenuMetaData[] = [
  {
    id: '1',
    key: 'marketArchitecture',
    value: 'Market Architecture'
  },
  {
    id: '2',
    key: 'marketEvolution',
    value: 'Market Evolution'
  },
  {
    id: '3',
    key: 'inovationSpotlight',
    value: 'Innovation Spotlight'
  },
  {
    id: '4',
    key: 'impactOfTech',
    value: 'Impact Analysis of emerging technology'
  },
  {
    id: '5',
    key: 'bestPractices',
    value: 'Best Practices'
  },
  {
    id: '6',
    key: 'useCaseAnalysis',
    value: 'Use case analysis'
  },
  {
    id: '7',
    key: 'pricingModel',
    value: 'Pricing Model'
  }
];

/* Pipe Analysis */
export const pipelineAnalysisSections: MenuMetaData[] = [
  {
    id: '1',
    key: 'clinicalTrialPhases',
    value: 'Clinical Trial Phases'
  },
  {
    id: '2',
    key: 'productDevelopment',
    value: 'Product Development'
  },
  {
    id: '3',
    key: 'strategicClinicalTrials',
    value: 'Strategic Initiatives for Clinical Trials by Company'
  }
];

/* Pricing Analysis */
export const pricingAnalysisSections: MenuMetaData[] = [
  {
    id: '1',
    key: 'pricingAnalysis',
    value: 'Pricing analysis'
  },
  {
    id: '2',
    key: 'pricingMarginAnalysis',
    value: 'Price margin analysis'
  }
];

/* Brand Share Analysis */
export const bransShareAnalysisSections: MenuMetaData[] = [
  {
    id: '1',
    key: 'northAmerica',
    value: 'North America'
  },
  {
    id: '2',
    key: 'europe',
    value: 'Europe'
  },
  {
    id: '3',
    key: 'apac',
    value: 'APCA'
  },
  {
    id: '4',
    key: 'middleeast',
    value: 'Middle east'
  },
  {
    id: '5',
    key: 'africa',
    value: 'Africa'
  }
];

/* Future Scenario */
export const futureScenarioSections: MenuMetaData[] = [
  {
    id: '1',
    key: 'likely',
    value: 'Likely'
  },
  {
    id: '2',
    key: 'conservative',
    value: 'Conservative'
  },
  {
    id: '3',
    key: 'optimistic',
    value: 'Optimistic'
  }
];

/* Production outlook */
export const productionOutlookSections: MenuMetaData[] = [
  {
    id: '1',
    key: 'capacities',
    value: 'Production capacities'
  },
  {
    id: '2',
    key: 'costbreakup',
    value: 'Production cost breakup'
  },
  {
    id: '3',
    key: 'share',
    value: 'Production share'
  }
];

/* Pricing and raw material scenatio */
export const pricingRawMatScenatioSections: MenuMetaData[] = [
  {
    id: '1',
    key: 'analysis',
    value: 'Pricing analysis'
  },
  {
    id: '2',
    key: 'scenario',
    value: 'Raw material scenario'
  }
];

/* Market Introduction */
export const appendixSections: MenuMetaData[] = [
  {
    id: '1',
    key: 'generalSourcesAndReferences',
    value: 'General sources and references'
  },
  {
    id: '2',
    key: 'listOfAbbreviations',
    value: 'List of abbreviations'
  },
  {
    id: '3',
    key: 'relatedReports',
    value: 'Related reports'
  },
];

export const markenIntroductionSections: MenuMetaData[] = [
  {
    id: '1',
    key: 'definition',
    value: 'Definition'
  },
  {
    id: '2',
    key: 'scope',
    value: 'Scope of the study'
  },
  {
    id: '3',
    key: 'assumptions',
    value: 'List of assumptions'
  },
  {
    id: '4',
    key: 'structure',
    value: 'Market structure'
  },
  {
    id: '5',
    key: 'takeways',
    value: 'Key takeaways'
  },
  {
    id: '6',
    key: 'indicatorAnalysis',
    value: 'Macro Factor Indicators Analysis'
  },
  {
    id: '7',
    key: 'insights',
    value: 'Market insights'
  },
  {
    id: '8',
    key: 'researchObjective',
    value: 'Research Objective'
  },
  {
    id: '9',
    key: 'keyBuyingCriteria',
    value: 'Key Buying Criteria'
  },
  {
    id: '10',
    key: 'assumptionsAndLimitations',
    value: 'Assumptions and Limitations'
  }
];

/* Market Dynamics */
export const marketDynamicsCommonSections: MenuMetaData[] = [
  {
    id: '1',
    key: 'introduction',
    value: 'Introduction'
  },
  {
    id: '2',
    key: 'drivers',
    value: 'Drivers'
  },
  {
    id: '3',
    key: 'restraints',
    value: 'Restraints'
  },
  {
    id: '4',
    key: 'opportunities',
    value: 'Opportunities'
  },
  {
    id: '5',
    key: 'trends',
    value: 'Trends'
  },
  {
    id: '6',
    key: 'challenges',
    value: 'Challenges'
  }
];
export const marketDynamicsTechDomainSections: MenuMetaData[] = [
  {
    id: '7',
    key: 'techTrends',
    value: 'Technological Trends'
  },
  {
    id: '8',
    key: 'patentTrends',
    value: 'Patent Trends'
  },
  {
    id: '9',
    key: 'regStandards',
    value: 'Regulatory Landscape/Standards'
  },
  {
    id: '10',
    key: 'pricingAnalysis',
    value: 'Pricing Analysis'
  },
  {
    id: '11',
    key: 'reimbursementScenario',
    value: 'Reimbursement Scenario'
  },
  {
    id: '12',
    key: 'clinicalTrialsPipelineAnalysis',
    value: 'Clinical Trials/Pipeline Analysis'
  },
  {
    id: '13',
    key: 'covidAnalysis',
    value: 'Impact Analysis of Covid-19'
  }
];
const marketDynamicsAllSections = marketDynamicsCommonSections.concat(marketDynamicsTechDomainSections);

/* Market Factor Analysis */
export const marketFactorAnalysisSections: MenuMetaData[] = [
  {
    id: '1',
    key: 'porter',
    value: "Porter's 5 Forces"
  },
  {
    id: '2',
    key: 'supply-chain',
    value: 'Supply / Value chain'
  },
  {
    id: '10',
    key: 'supplyChain',
    value: 'Supply Chain'
  },
  {
    id: '11',
    key: 'valueChain',
    value: 'Value Chain'
  },
  {
    id: '3',
    key: 'consumerBuyingBehavior',
    value: 'Consumer Buying Behavior'
  },
  {
    id: '4',
    key: 'consumerDemographics',
    value: 'Consumer Demographics'
  },
  {
    id: '5',
    key: 'pricingAnalysis',
    value: 'Pricing Analysis'
  },
  {
    id: '6',
    key: 'regulatoryLandscape',
    value: 'Regulatory Landscape'
  },
  {
    id: '7',
    key: 'tradeAnalysis',
    value: 'Trade Analysis'
  },
  {
    id: '8',
    key: 'marketLineageOutlook',
    value: 'Market Lineage Outlook'
  },
  {
    id: '9',
    key: 'technologicalTrends',
    value: 'Technological Trends'
  },
  {
    id: '12',
    key: 'covidAnalysis',
    value: 'Impact Analysis of Covid-19'
  }
];

/* Competitive Landscape */
export const competiveLandscapeCommonSections: MenuMetaData[] = [
  {
    id: '1',
    key: 'overview',
    value: 'Competitive Overview'
  },
  {
    id: '2',
    key: 'marketAnalysis',
    value: 'Market Share/Strategy/Ranking Analysis'
  },
  {
    id: '3',
    key: 'devAndGrowthStrategies',
    value: 'Key developments and growth strategies',
    subSections: [
      {
        id: '1',
        key: 'newDevelopment',
        value: 'New Product/Service Development'
      },
      {
        id: '2',
        key: 'mergerAndAquisition',
        value: 'Merger & Acquisition'
      },
      {
        id: '3',
        key: 'jointVenture',
        value: 'Joint Ventures'
      }
    ]
  },
  {
    id: '6',
    key: 'brandShareAnalysis',
    value: 'Brand Share Analysis'
  },
  {
    id: '7',
    key: 'majorGrowthStrategy',
    value: 'Major growth strategy'
  },
  {
    id: '8',
    key: 'theLeadingPlayer',
    value: 'The Leading Player'
  },
  {
    id: '9',
    key: 'majorPlayersFinancialMatrixAndMarketRatio',
    value: 'Major Players Financial Matrix & Market ratio'
  }
];
export const competiveLandscapeTechDomainSections: MenuMetaData[] = [
  {
    id: '4',
    key: 'dashboard',
    value: 'Competitor dashboard'
  },
  {
    id: '5',
    key: 'benchMarking',
    value: 'Competitive benchmarking'
  }
];
const competiveLandscapeSections = competiveLandscapeCommonSections.concat(competiveLandscapeTechDomainSections);

export const companyProfilesSections: MenuMetaData[] = [
  {
    id: '1',
    key: 'companyOverview',
    value: 'Company Overview'
  },
  {
    id: '2',
    key: 'financialOverview',
    value: 'Financial Overview'
  },
  {
    id: '3',
    key: 'productOfferings',
    value: 'Product offerings'
  },
  {
    id: '4',
    key: 'keyDevelopments',
    value: 'Key developments'
  },
  {
    id: '5',
    key: 'swotAnalysis',
    value: 'SWOT analysis'
  },
  {
    id: '6',
    key: 'strategy',
    value: 'Strategy'
  }
]


export function getSubSectionMenuInfo(key: String): MenuMetaData[] {
  return sectionSubSectionInfo.filter(ele => ele.key === key).map(ele => ele.value)[0];
}


export const sectionSubSectionInfo = [
  {
    key: MainSectionConstants.INDUSTRY_INSIGHTS,
    value: industryInsightsSections
  },
  {
    key: MainSectionConstants.MARKET_INSIGHTS,
    value: marketInsightsSections
  },
  {
    key: MainSectionConstants.OIL_GAS_SECTOR_OVERVIEW,
    value: oilGasSectorOverviewSections
  },
  {
    key: MainSectionConstants.POWER_SECTOR_OVERVIEW,
    value: powerSectorOverviewSections
  },
  {
    key: MainSectionConstants.PARENT_MARKET_ANALYSIS,
    value: parentMarketAnalysisSections
  },
  {
    key: MainSectionConstants.MARKET_OVERVIEW,
    value: marketOverviewSections
  },
  {
    key: MainSectionConstants.PIPELINE_ANALYSIS,
    value: pipelineAnalysisSections
  },
  {
    key: MainSectionConstants.PRICING_ANALYSIS,
    value: pricingAnalysisSections
  },
  {
    key: MainSectionConstants.BRAND_SHARE_ANALYSIS,
    value: bransShareAnalysisSections
  },
  {
    key: MainSectionConstants.FUTURE_SCENARIO,
    value: futureScenarioSections
  },
  {
    key: MainSectionConstants.PRODUCTION_OUTLOOK,
    value: productionOutlookSections
  },
  {
    key: MainSectionConstants.PRICING_RAW_MAT_SCENARIO,
    value: pricingRawMatScenatioSections
  },
  {
    key: MainSectionConstants.MARKET_INTRODUCTION,
    value: markenIntroductionSections
  },
  {
    key: MainSectionConstants.MARKET_DYNAMICS,
    value: marketDynamicsAllSections
  },
  {
    key: MainSectionConstants.COMPETITIVE_LANDSCAPE,
    value: competiveLandscapeSections
  },
  {
    key: MainSectionConstants.COMPANY_PROFILES,
    value: companyProfilesSections
  },
  {
    key: MainSectionConstants.MARKET_FACTOR_ANALYSIS,
    value: marketFactorAnalysisSections
  }
]
