import utilities from '../../utilities/utils';
import to from '../../utilities/to';    // for better error handling of async/await with promises 
import DATA_CONSTANTS from '../../config/dataConstants';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import * as htmlToText from 'html-to-text';
import secModel from './sec.schema';


async function getParentFiling(cik, company) {
    let resData = {};
    let link;
    let parentFiling = [];
    if (cik) {
        link = `https://searchwww.sec.gov/EDGARFSClient/jsp/EDGAR_MainAccess.jsp?search_text=*&sort=Date&formType=Form10K&isAdv=true&stemming=true&numResults=10&queryCik=${cik}&numResults=10`
    } else {
        link = `https://searchwww.sec.gov/EDGARFSClient/jsp/EDGAR_MainAccess.jsp?search_text=*&sort=Date&formType=Form10K&isAdv=true&stemming=true&numResults=10&queryCo=${company}&numResults=10`
    }
    try {
        fetch(link, {
            method: 'get',
            headers: { 'content-type': 'text/html' }
        }).then(response => response.text())
            .then(data => {
                if (data) {
                    resData = `${data}`
                    let $ = cheerio.load(resData);
                    var tdData = $('td.iframe>div>table> tbody > tr');
                    for (let i = 0; i < tdData.length; i++) {
                        if ($(tdData[i]).hasClass('infoBorder')) {
                            var url = $(tdData[i]).find('a#viewFiling.clsBlueBg').attr('href');
                            if (url && (url.indexOf('javascript:opennewfiling') != -1)) {
                                url = url.split("javascript:opennewfiling('")[1].split("','")[0];
                                parentFiling.push(url);
                            }
                        }
                    }
                    if (parentFiling && parentFiling.length) {
                        openParentFiling(parentFiling[0], cik, company);
                    }
                }
            }).catch(err => {
                console.log(err);

            })

    } catch (er) {
        console.error(`Exception in  getting parent filing. \n : ${er}`);
        // return (resData.errors = er.message);
    }
}

async function openParentFiling(parentFiling, cik, company) {
    let link = parentFiling;
    let resData;
    let hashes = [];
    let allData = [];
    let extraHash = [];
    let txts;

    try {
        fetch(link, {
            method: 'get',
            headers: { 'content-type': 'text/html' }
        }).then(response => response.text())
            .then(data => {
                if (data) {
                    resData = data.substring(data.indexOf('TABLE OF CONTENTS'));
                    // console.log(resData);

                    //     txts = htmlToText.fromString(data, {
                    //         wordwrap: 130
                    //     });

                    let $ = cheerio.load(resData);
                    $('tr').each((i, el) => {
                        let url = $(el).find('a').attr('href');
                        if (url && url.indexOf('#') != -1) {
                            let txt = $(el).find(`a`).text();
                            hashes.push({
                                hashId: url,
                                headings: txt
                            })
                        }
                    });
                    // if (hashes && hashes.length) {
                    //     resData = resData.substring('PART I')
                    //     hashes.forEach((d, i) => {
                    //         let data = $(`div`).nextUntil(`div${d.hashId}`).text()
                    //         console.log('data', data);

                    //     })
                    // }
                    // if (allData && allData.length) {
                    // console.log("hashes", allData[1]);

                    // hashes.forEach(d => {
                    //     allData.forEach(ld => {
                    //         let rmStr = d.hashId.substring(1, d.hashId.length);

                    //         let str = ld.substring(rmStr);
                    //         if (str) {
                    //             d.data = ld
                    //         }
                    //     })
                    // })
                    // }
                }
                if (hashes && hashes.length) {
                    saveDocument(cik, company, hashes, resData);
                    hashes = [];

                }
            }).catch(err => {
                console.log(err);

            })
    } catch (er) {
        console.error(`Exception in  getting parent filling. \n : ${er}`);
        return (resData.errors = er.message);
    }
}

function saveDocument(cik, company, hashes, resData) {
    let secM = new secModel({ cik: cik, company: company, document: hashes, htmlDoc: resData })
    try {
        secM.save((err, data) => {
            if (err || !data) {
                console.log('error', err);

            } else {
                console.log("result", data);

            }
        })
    } catch (err) {
        console.log(err);
    }

}
module.exports = {
    getParentFiling,
    openParentFiling,
    saveDocument
}