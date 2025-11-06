import videoService from './videos-filter.service';
import _ from 'lodash';
const fetch = require('node-fetch');
const cron = require("node-cron");
import utilities from '../../utilities/utils';
import HTTPStatus from 'http-status';

// const videoData1 = ['Aerospace and Defense', 'Automotive', 'Consumer food and beverages', 'Chemical and materials', 'Energy and power', 'Healthcare', 'Information and communication technology', 'Construction and mining', 'Semiconductor'];
const videoData1 = [
// "https://www.youtube.com/@harvardbusinessreview",
// "https://www.youtube.com/@CNBC",
// "https://www.youtube.com/@markets",
// "https://www.youtube.com/@McKinsey",
// "https://www.youtube.com/@forrester",
// "https://www.youtube.com/@nielsen",
// "https://www.youtube.com/@TheEconomist",
// "https://www.youtube.com/@wef",
// "https://www.youtube.com/@DeloitteUS",
// "https://www.youtube.com/@Gartnervideo",
// "https://www.youtube.com/@NNgroup",
// "https://www.youtube.com/@GrantCardone",
// "https://www.youtube.com/@kpmg",
// "https://www.youtube.com/@PwC",
// "https://www.youtube.com/@IBISWorld1971",
// "https://www.youtube.com/@acumenresearch",
// "https://www.youtube.com/@wsj",
// "https://www.youtube.com/@FrostSullivanGlobal",
// "https://www.youtube.com/@BusinessInsider",
// "https://www.youtube.com/@ZacksInvestmentNews",
// "https://www.youtube.com/@Reuters",
// "https://www.youtube.com/@cbinsights8643",
// "https://www.youtube.com/@datadriveninvestor3818",
// "https://www.youtube.com/@DataDrivenInvestor-ln2sc",
// "https://www.youtube.com/results?search_query=Vox+Business",
// "https://www.youtube.com/@OfficialKantar",
// "https://www.youtube.com/@gallupvideos",
// "https://www.youtube.com/@DunandBrad",
// "https://www.youtube.com/@GoldmanSachs",
// "https://www.youtube.com/@jpmorgan",
// "https://www.youtube.com/@Accenture",
// "https://www.youtube.com/@cfainstitute",
// "https://www.youtube.com/@SPGlobalMarketIntelligence",
// "https://www.youtube.com/@FinancialTimes",
// "https://www.youtube.com/@incmagazine",
// "https://www.youtube.com/@SeekingAlpha",
// "https://www.youtube.com/@nielseniq3851",
// "https://www.youtube.com/@MotleyFool",
// "https://www.youtube.com/@HarvardHBS",
// "https://www.youtube.com/@CNBCi",
// "https://www.youtube.com/@CliftonStrengths",
// "https://www.youtube.com/@McKinsey",
// "https://www.youtube.com/@ernstyoung",
// "https://www.youtube.com/@FitchRatingsVideo",
// "https://www.youtube.com/@BNNBloomberg",
// "https://www.youtube.com/@wharton",
// "https://www.youtube.com/@morningstar",
// "https://www.youtube.com/@bainandcompany",
// "https://www.youtube.com/@IBTimesUK",
// "https://www.youtube.com/Knowledge@Wharton",
// "https://www.youtube.com/@globaldataplc",
// "https://www.youtube.com/@CNBCtelevision",
// "https://www.youtube.com/@TheStreet",
// "https://www.youtube.com/@CliftonStrengths",
// "https://www.youtube.com/@OxfordbusinessgroupNews",
// "https://www.youtube.com/@markets",
// "https://www.youtube.com/@IBTimesTV",
// "https://www.youtube.com/@jdpowercorporate",
// "https://www.youtube.com/@statistaofficial",
// "https://www.youtube.com/@gallupvideos",
// "https://www.youtube.com/@Ceicdata",
// "https://www.youtube.com/@joneslanglasalle",
// "https://www.youtube.com/@TheConferenceBoard",
// "https://www.youtube.com/@HBRAscend",
// "https://www.youtube.com/@ZebraBI",
// "https://www.youtube.com/@InvestingwithTom",
// "https://www.youtube.com/@MorningBrewDailyShow",
// "https://www.youtube.com/@TheBostonConsultingGroup",
// "https://www.youtube.com/@FastCompany",
// "https://www.youtube.com/@EconomicsExplained",
// "https://www.youtube.com/@GartnerforMarketers",
// "https://www.youtube.com/@ibtmworld",
// "https://www.youtube.com/@BusinessCasual",
// "https://www.youtube.com/@MoodysCorp",
// "https://www.youtube.com/@networldmediagroup5004",
// "https://www.youtube.com/@WorkforceUpperRio",
// "https://www.youtube.com/@FrostSullivanAsiaPacific",
// "https://www.youtube.com/@instinctifpartners9180",
// "https://www.youtube.com/@thefinancialdiet",
// "https://www.youtube.com/@EConsultancyindia",
// "https://www.youtube.com/results?search_query=Silicon+Valley+Business+Journal",
// "https://www.youtube.com/@UKResearchandInnovation",
// "https://www.youtube.com/@wellsfargo",
// "https://www.youtube.com/channel/UCX2DzaAhcLS09XHSmXq3ysg",
// "https://www.youtube.com/@CliftonStrengths",
// "https://www.youtube.com/@wsj",
// "https://www.youtube.com/@DataRobot",
// "https://www.youtube.com/@RealVisionFinance",
// "https://www.youtube.com/@SPIndicesChannel",
// "https://www.youtube.com/@KiplingersPersonalFinance",
// "https://www.youtube.com/@insead",
// "https://www.youtube.com/@NewYorkTimesEvents",
// "https://www.youtube.com/@CorporateKnights",
// "https://www.youtube.com/@nielsen",
// "https://www.youtube.com/@capitaleconomics",
// "https://www.youtube.com/@HBPCorpLearning",
// "https://www.youtube.com/@gallupvideos",
// "https://www.youtube.com/@DBS",
// "https://www.youtube.com/@DunandBradstreet1",
// "https://www.youtube.com/@MarketResearchReports",
// "https://www.youtube.com/@euromonitor",
// "https://www.youtube.com/@investopedia",
// "https://www.youtube.com/@aaporHQvideo",
// "https://www.youtube.com/@TheDrumTV",
// "https://www.youtube.com/@GfKAnNIQcompanyGlobal",
// "https://www.youtube.com/@IBISWorld1971",
// "https://www.youtube.com/@cnbcawaaz",
// "https://www.youtube.com/@UBS",
// "https://www.youtube.com/@dentsuintl",
// "https://www.youtube.com/@CliftonStrengths",
// "https://www.youtube.com/@fmglobal",
// "https://www.youtube.com/@BankofAmerica",
// "https://www.youtube.com/@PwC",
// "https://www.youtube.com/@strategyand",
// "https://www.youtube.com/@adpresearchinstitute1299",
// "https://www.youtube.com/@WION",
// "https://www.youtube.com/@CBSNews",
// "https://www.youtube.com/@PBS",
// "https://www.youtube.com/@YahooFinance",
// "https://www.youtube.com/@thehill",
// "https://www.youtube.com/@StateDept",
// "https://www.youtube.com/@geonews",
// "https://www.youtube.com/@markdweinstein5516",
// "https://www.youtube.com/Gallup.com News",
// "https://www.youtube.com/Business Insider",
// "https://www.youtube.com/@Vox",
// "https://www.youtube.com/@D2E",
// "https://www.youtube.com/@FoxBusiness",
// "https://www.youtube.com/@scrippsnews",
// "https://www.youtube.com/@scrippsnews",
// "https://www.youtube.com/@VOANews",
// "https://www.youtube.com/@ArirangCoKrArirangNEWS",
// "https://www.youtube.com/@gallupvideos",
// "https://www.youtube.com/@CNN",
// "https://www.youtube.com/@Denver7",
// "https://www.youtube.com/@msnbc",
// "https://www.youtube.com/@NewsNation/streams",
// "https://www.youtube.com/@Northeastern",
// "https://www.youtube.com/@WKRGNews",
// "https://www.youtube.com/@kenyacitizentv",
// "https://www.youtube.com/@KOAT",
// "https://www.youtube.com/@CanadasDemocracyWeek",
// "https://www.youtube.com/@ForbesBreakingNews",
// "https://www.youtube.com/@11Alive",
// "https://www.youtube.com/@WorldGovSummit",
// "https://www.youtube.com/@FoxNews",
// "https://www.youtube.com/@StraightArrowNews",
// "https://www.youtube.com/@NSBAmarket",
// "https://www.youtube.com/@DiplomaticCourier",
// "https://www.youtube.com/@aaporHQvideo",
// "https://www.youtube.com/@RBDRChannel",
// "https://www.youtube.com/@TalkShowsCentral",
// "https://www.youtube.com/@MeridianCommunity",
// "https://www.youtube.com/@ThomsonReuters",
// "https://www.youtube.com/@TheB1M",
// "https://www.youtube.com/@MoscowExchangeOfficial",
// "https://www.youtube.com/@SIIA12",
// "https://www.youtube.com/@WashingtonPost",
// "https://www.youtube.com/@LeadersInSport",
// "https://www.youtube.com/@ernstyoung",
// "https://www.youtube.com/@EYFinancialServicesIreland",
// "https://www.youtube.com/@bloomberglaw",
// "https://www.youtube.com/@TheEconomicTimes",
// "https://www.youtube.com/@EYUKCareers",
// "https://www.youtube.com/@EYIndiaOfficialPage",
// "https://www.youtube.com/@EY_US",
// "https://www.youtube.com/@McKinseyCMSOforum",
// "https://www.youtube.com/@McKinsey",
// "https://www.youtube.com/@TimSparke",
// "https://www.youtube.com/@cgtnamerica",
// "https://www.youtube.com/@MConsultingPrep",
// "https://www.youtube.com/@AnalystAcademy",
// "https://www.youtube.com/@McKinseyGreaterChina",
// "https://www.youtube.com/@mltillman8826",
// "https://www.youtube.com/@nasdaq",
// "https://www.youtube.com/@wef",
// "https://www.youtube.com/@INFASupport",
// "https://www.youtube.com/@b360nepal",
// "https://www.youtube.com/@business-3603",
// "https://www.youtube.com/@DeloitteCA",
// "https://www.youtube.com/@double_barrel",
// "https://www.youtube.com/@TMXGroup",
// "https://www.youtube.com/@InnovatorsOnTheMove",
// "https://www.youtube.com/@cgi_uk",
// "https://www.youtube.com/@Accenture",
// "https://www.youtube.com/@joneslanglasalle",
// "https://www.youtube.com/@GartnerforMarketers",
// "https://www.youtube.com/@guardiannews",
// "https://www.youtube.com/@BusinessCasual",
// "https://www.youtube.com/@thebusinesscasualpodcast8304",
// "https://www.youtube.com/@indeloitte",
// "https://www.youtube.com/@londonbusinessforum",
// "https://www.youtube.com/@EYIndiaOfficialPage",
// "https://www.youtube.com/@TheEconomistIntelligenceUnit",
// "https://www.youtube.com/@uconnbizcareer",
// "https://www.youtube.com/@UGREENUS",
// "https://www.youtube.com/@bloombergmediastudios7163",
// "https://www.youtube.com/@Managementconsulted",
// "https://www.youtube.com/@CNBCtelevision",
// "https://www.youtube.com/@WonderyMedia",
// "https://www.youtube.com/@ANCalerts",
// "https://www.youtube.com/@ANUchannel",
// "https://www.youtube.com/@theamberstittshow",
// "https://www.youtube.com/@businessoffashion",
// "https://www.youtube.com/@nielseniq3851",
// "https://www.youtube.com/@DeloitteCA",
// "https://www.youtube.com/@CNBC-TV18",
// "https://www.youtube.com/@reactivemedia",
// "https://www.youtube.com/@HBRBrasilChannel",
// "https://www.youtube.com/@rsaorg",
// "https://www.youtube.com/@GallupWebcastsLIVE",
// "https://www.youtube.com/@cnbcarabiaTV",
// "https://www.youtube.com/results?search_query=Deloitte+Digital",
// "https://www.youtube.com/@Proactive247",
// "https://www.youtube.com/@africanews",
// "https://www.youtube.com/@TheBostonConsultingGroup",
// "https://www.youtube.com/@RANENetwork",
// "https://www.youtube.com/@BrainChipInc",
// "https://www.youtube.com/@Cnbcafrica410",
// "https://www.youtube.com/@thecivicresearchinitiative6158",
// "https://www.youtube.com/@InnovateInsights510",
// "https://www.youtube.com/@MarketMastersEDU",
// "https://www.youtube.com/@BizBuzzHub11",
// "https://www.youtube.com/@fintechfrontierslive",
// "https://www.youtube.com/@EconomicEchoes",
// "https://www.youtube.com/@TelecomTV2022",
// "https://www.youtube.com/@atlasanalyticsco",
// "https://www.youtube.com/@handlewealthwaves",
// "https://www.youtube.com/@StrategySphere",
// "https://www.youtube.com/@oecd",
// "https://www.youtube.com/@CNN",
// "https://www.youtube.com/@NDTVProfitHindi",
// "https://www.youtube.com/@DNAIndiaNews",
// "https://www.youtube.com/@FinanceFiesta",
// "https://www.youtube.com/@TechTideTalk-wi5fd",
// "https://www.youtube.com/@FREENVESTING",
// "https://www.youtube.com/@LeadershipLighthouse",
// "https://www.youtube.com/@Capital_Catalyst",
// "https://www.youtube.com/@InvestorsInsightt",
// "https://www.youtube.com/@MagnatesMedia",
// "https://www.youtube.com/@BizByteNews",
// "https://www.youtube.com/@insomniamarketinginnovatio4215",
// "https://www.youtube.com/@CurrentCatalyst",
// "https://www.youtube.com/@Capitaltrading",
// "https://www.youtube.com/@financial.frontline",
// "https://www.youtube.com/@THEVISIONARYHUB23",
// "https://www.youtube.com/@investorintelligencemedia",
// "https://www.youtube.com/@investorintelligencemedia",
// "https://www.youtube.com/@strategyshift",
// "https://www.youtube.com/@FinancialFuturistic",
// "https://www.youtube.com/@SkyNewsAustralia",
// "https://www.youtube.com/@TheB1M",
// "https://www.youtube.com/@Inspiretoinvest-uu7qj",
// "https://www.youtube.com/@markets",
// "https://www.youtube.com/@CRUXnews",
// "https://www.youtube.com/@Inspiretoinvest-uu7qj",
// "https://www.youtube.com/@InvestDiaryInsights-sl5wz",
// "https://www.youtube.com/@growglide6324",
// "https://www.youtube.com/@thebuzz4108",
// "https://www.youtube.com/@growglide6324",
// "https://www.youtube.com/@CNET",
// "https://www.youtube.com/@glideuk",
// "https://www.youtube.com/@TheEconomicTimes",
// "https://www.youtube.com/@WealthWiz84",
// "https://www.youtube.com/@TechCrunch",
// "https://www.youtube.com/@fintechbeatpodcast8589",
// "https://www.youtube.com/@flourishventures2082",
// "https://www.youtube.com/@madebycapital",
// "https://www.youtube.com/@TheB1M",
// "https://www.youtube.com/@MTPAmerica",
// "https://www.youtube.com/@MarketMinds-Trading",
// "https://www.youtube.com/@inferno.innovations",
// "https://www.youtube.com/@EconomicElevate",
// "https://www.youtube.com/@ProfitPulse14",
// "https://www.youtube.com/@CraftChannelYT",
// "https://www.youtube.com/@ntdtv",
// "https://www.youtube.com/@TheEpochTimesNews",
// "https://www.youtube.com/@Financefrontier13",
// "https://www.youtube.com/@InsidersInsightStockMarket",
// "https://www.youtube.com/@TechTideTales-hx5yo",
// "https://www.youtube.com/watch?v=FhpWKUWjOuc",
// "https://www.youtube.com/@CurrentCatalyst",
// "https://www.youtube.com/@Capital_Catalyst",
// "https://www.youtube.com/@ZeroTreasure",
// "https://www.youtube.com/@visionaryvaultmedia",
// "https://www.youtube.com/@BizBuzzz",
// "https://www.youtube.com/@InnovateInsight4u",
// "https://www.youtube.com/@InvestmentInsightsEnglish",
// "https://www.youtube.com/@WatchMojo",
// "https://www.youtube.com/@OdishaEconomicAssociation",
// "https://www.youtube.com/@insightinvestments297",
// "https://www.youtube.com/@insightinvestments297",
// "https://www.youtube.com/@financial.frontline",
// "https://www.youtube.com/@frontline",
// "https://www.youtube.com/@MarketMastersEDU",
// "https://www.youtube.com/@CareerAddictVideo",
// "https://www.youtube.com/@BusinessByteBurst",
// "https://www.youtube.com/@TICETV",
// "https://www.youtube.com/@ZeroTreasure",
// "https://www.youtube.com/@EconomicsIsEpic",
// "https://www.youtube.com/@capitalinvesting",
// "https://www.youtube.com/results?search_query=InnovationInsiderImpacts",
// "https://www.youtube.com/@Bizzbuzznews",
// "https://www.youtube.com/@InsiderTech",
// "https://www.youtube.com/@wealthwagon2769",
// "https://www.youtube.com/@ColdFusion",
// "https://www.youtube.com/@CapitalCrest855",
// "https://www.youtube.com/@BlitzBulletinNetwork",
// "https://www.youtube.com/@marketmind635",
// "https://www.youtube.com/@InfiniteInnovateInsights",
// "https://www.youtube.com/@EconomicsExplained",
// "https://www.youtube.com/@financial.frontline",
// "https://www.youtube.com/@BizbuzzbeesTechnologies",
// "https://www.youtube.com/@insightinnovate2194",
// "https://www.youtube.com/@moneycontrol",
// "https://www.youtube.com/@CREInvestorInsight",
// "https://www.youtube.com/@fzk11",
// "https://www.youtube.com/@MarketMastersEDU",
// "https://www.youtube.com/@InvestmentInsightsEnglish",
// "https://www.youtube.com/@innovationinsights2023"
];

let globalVideo = [];

async function geVideosData() {
    globalVideo = [];
    videoData1.forEach((d1) => {
        getVideoDetails(d1);
    });
}

async function getVideoDetails(symbol) {
    let searchQuery = symbol + " industry";
    console.log("searchQuery", searchQuery)
    fetch(`"https://www.googleapis.com/youtube/v3/search?key=AIzaSyB5MbNMzLpE_JecMM9aAZwoczp44MgmmIM&part=snippet&maxResults=20&q=${searchQuery}&type=video&relevanceLanguage=EN&order=date&publishedAfter=2024`, {
        method: 'get',
        headers: { 'content-type': 'application/json' }
    })
        .then(response => response.json())
        .then(data => {
            if (data) {
                let objArray = [];
                if (data.items && data.items.length) {
                    data.items.forEach(el => {
                        let id = '';
                        if(el.id){
                            id = el.id.videoId
                            }
                        if (el.snippet) {
                            let tempObj = {
                                title: el.snippet.title,
                                description: el.snippet.description,
                                publishedAt: el.snippet.publishedAt,
                                channelTitle: el.snippet.channelTitle,
                                thumbnail: el.snippet.thumbnails.default.url,
                                videoId: id
                            }
                            objArray.push(tempObj);
                        }
                    })
                    let obj = {
                        name: symbol,
                        results: objArray
                    }
                   globalVideo.push(obj);
                    formData()
                }else{
                    let obj = {
                        name: symbol,
                        results: []
                    }
                   globalVideo.push(obj);
                    formData()
                }
            }
        })
        .catch(error => {
            console.log(error);
        })
}
async function formData() {
    if (globalVideo.length == videoData1.length) {
        addVideos(globalVideo)
    } else {zzzz
    }
}
export async function addVideos(video) {
    try {

        if (video) {
            const videoData = video;
            const id = null;
            const stockData = await videoService.addVideos(videoData) || {};
            if (!utilities.isEmpty(stockData.errors)) {
                const errObj = stockData.errors;
            } else {
            }
        }
    } catch (er) {
        console.log("error", er);
    }
}

cron.schedule('0 0 * * *', function () {
    console.log("inside cron");
    geVideosData();
})

export async function getVideos(req, res) {
    try {
        geVideosData();
        const stockData = await videoService.getVideos(req, res) || {}
        if (!utilities.isEmpty(stockData.errors)) {
            const errObj = stockData.errors;
            return utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
        } else {
            return utilities.sendResponse(HTTPStatus.OK, stockData, res);
        }
    } catch (er) {
        return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
    }
}
