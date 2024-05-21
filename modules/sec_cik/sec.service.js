import to from '../../utilities/to';
import fetch, { Headers } from 'node-fetch';
import * as cheerio from 'cheerio';
import secModel from './sec.model';

async function getSecCik(req, res, cik) {
    let resData = [];
    let company_details = [];
    let link = ["https://sec.report/CIK/" + cik]
    Promise.all(
        link.map(d=>{
            return fetch(d,{
                method:"get",
                headers: new Headers({
                    "content-type":"text/html",
                    "User-Agent":'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36'
                })
            }).then(response => response.text())
        }))
        .then(d => {
            if (d && d.length) {
                resData.push({
                    cik: cik
                })
                var $ = cheerio.load(d[0]);
                let title = $('.jumbotron').find('h1').text();
                let len = $('.panel.panel-default').length;
                $('.panel.panel-default').each(function (i, ele) {
                    let heads = $(ele).children().html();
                    let hasTabs = $(ele).has('.table').html();
                    let tabs = $(ele).children().has('table').html();
                    if (i == 0) {
                        let overview = $(this).text();
                        resData.push({
                            title: title,
                            overview: overview,
                        })
                    }
                    if (hasTabs) {
                        if (heads.startsWith('Company Details') || heads == 'Company Details') {
                            resData.push({
                                'company_details': tabs
                            })
                        }
                    }
                    if(i == (len-1)){
                        res.json({data:resData})
                        saveSecCikDoc(req, res, cik, resData)
                    }
                })
            }
        }).catch(err => {
            console.log(err);

        })
}

function saveSecCikDoc(req, res, cik, data) {
    secModel.updateOne({ cik: cik }, { data: data }, { upsert: true }, async (err, data) => {
        if (err || !data) {
            res.status(500).json(err)
        } else if (data) {
            // setTimeout(async()=>{await getSecCikDoc(req, res, cik);},5000)            
        }
    })
}

async function getSecCikDoc(req, res, cik) {
    let data;
    try {
        data = secModel.find({ cik: cik }).then(data => {
            if (data) {
                res.json(data)
            } else {
                res.json({ msg: "not found" })
            }
        }).catch(err => {
            res.status(500).json(err);
        });

    } catch (error) {
        res.status(500).json(error)
    }
}

async function updateJsonData(req, res, cik, data) {
    secModel.updateOne({ cik: cik }, { jsonData: data }, (err, data) => {
        if (err || !data) {
            res.status(500).json(err)
        }
        res.json(data)
    })
}
module.exports = { getSecCik, saveSecCikDoc, getSecCikDoc, updateJsonData }