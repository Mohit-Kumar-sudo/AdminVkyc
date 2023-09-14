const mammoth = require("mammoth");
const fs = require('fs');
const path = require('path');
const ba64 = require('ba64');
const glob = require("glob");
var shell = require('shelljs');
var shellescape = require('shell-escape');
var request = require("request");
var rp = require('request-promise');

// const reportService = require('../modules/reports/report.model');
// const tocService = require('../modules/table_of_contents/toc.service');

// const HtmlTableToJson = require('html-table-to-json');

const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const INDUSTRY_MAPPING_KEYS = ["market dynamics", "company profiles", "supply chain analysis", "drivers", "restrains", "restraints", "oppurtunity", "opportunities", "value chain analysis", "porters five forces", "porter's five forces", "supply chain analysis"];
const INDUSTRY_MAPPING_KEYS_IGNORE = ["introduction", "overview", "summary"];
const BASE_PATH = `${__dirname + path.sep}parse_data${path.sep}`;
let IMAGE_PATH = "images"
let REL_IMAGE_PATH = "";
const REPORT_PATH = "src/services/files/"; // "../../Desktop/Word\ File/"; 

// main function to excute all the tasks in scraping and saving the report
const main = async function (filepath, fileIndustryName) {
	/* 
	// fs.readdirSync("./reports/").forEach(async filename => {
	let filename = "V1 Global Frozen Fruits and Vegetables Market – Forecast To 2027.docx"
	// let filename = "V5 Global Video Streaming Market Research Report Forecast to 2023.docx";
		// let filename = "Dermal Fillers/Report-Global Dermal Fillers Market – Trends & Forecast, 2017-2023.docx";
	// let filename = "Global Aesthetics Market  Trends  Forecast 2017-2023.docx";
	// let filename = "Facial Injectables/Facial Injectables_Final Report.docx";
	// let filename = "Report-Global Dermal Fillers Market – Trends & Forecast, 2017-2023.docx";
	 */

	const decFilepath = decodeURIComponent(filepath);
	console.log(`${filepath.replace(/[ &[,*^$()+?{|]/g, '\\$&')}`);

	console.log(`${decFilepath.replace(/[ &[,*^$()+?{|]/g, '\\$&')}`);


	shell.exec(`mv ${filepath.replace(/[ &[*,^$()+?{|]/g, '\\$&')} ${decFilepath.replace(/[ &[,*^$()+?{|]/g, '\\$&')}`);
	filepath = decFilepath;

	let filename = path.basename(filepath);

	console.log(`Working upon file: ${filename}`);
	filename = path.basename(filename, '.doc');
	filename = path.basename(filename, '.docx');
	console.log(`File basename: ${filename}`);
	let filenamewoext = path.parse(filename).name;
	
	filenamewoext = removeWhiteSpaces(filenamewoext);
	filenamewoext = filenamewoext.replace(/ /g, '_');
	filenamewoext = filenamewoext.toLowerCase();

	REL_IMAGE_PATH = `${filenamewoext}/images`;

	// create a file directory
	console.log(filenamewoext);
	let fpath = BASE_PATH + filenamewoext;
	if (!fs.existsSync(fpath)) {
		fs.mkdirSync(fpath);
	}
	// set image directory path for all images of this report
	IMAGE_PATH = path.join(fpath, "images/");
	// create directory if does not exists
	if (!fs.existsSync(IMAGE_PATH)) {
		fs.mkdirSync(IMAGE_PATH);
	}


	// industry name parsing from filename logic; if fails then filename is written as industry name
	const filenameSplitArr = filename.match(/\b(\w+)\b/g);
	let industryName = "";
	let indsName = false;

	for (let i = 0; i < filenameSplitArr.length; i++) {
		const str = removeWhiteSpaces(filenameSplitArr[i]);
		if (str.toLowerCase().indexOf("global") !== -1) {
			indsName = true;
			continue;
		}

		if (str.toLowerCase().indexOf("market") !== -1) {
			indsName = false;
			continue;
		}

		if (indsName) {
			industryName += str;
		}
	}

	if (isEmpty(industryName)) {
		const filenameArr = filename.split(path.sep);
		if (filenameArr.length > 2) {
			industryName = filenameArr[filenameArr.length - 2];
		} else {
			industryName = (filenameArr.length > 0) ? filenameArr[0] : filename;
		}
	}

	industryName = industryName.substr(0, industryName.lastIndexOf('.')) || industryName;
	industryName = industryName.replace(/report/ig, '');
	industryName = industryName.replace(/final/ig, '');
	industryName = industryName.replace(/_/ig, '');
	industryName = industryName.replace(/-/ig, '');


	console.log(`
            Industry Name: ${industryName}
        `);

	// I - Docx -> HTML
	console.log(` 
            1 of 3 :: Converting file ${filename} file to HTML!
        `);

	 convertDocxToHTML(filepath, fpath);
	
	// fpath = fpath.replace(/[ ,&.[*^$()+?{|]/g, '\\$&');
	// filename = filename.replace(/[ ,&.[*^$()+?{|]/g, '\\$&');
	
	const htmlData = fs.readFileSync(`${fpath}/${filename}.html`, 'UTF-8');

	// II - parse HTML
	console.log(`
            2 of 3 :: Parsing generated HTML data!
        `);
	const data = parseHTML(htmlData, industryName);
	data.industryName = industryName;

	if (!isEmpty(fileIndustryName)) {
		data.fileIndustryName = fileIndustryName;
	}

	// console.log(data);

	// write all data without images
	filenamewoext = filenamewoext.replace(' ', '_');
	filenamewoext = filenamewoext.replace('&', '\&');
	fs.writeFileSync(`${fpath}/${filenamewoext}.json`, JSON.stringify(data));

	await pushData(data);

	console.log(`All Files for this report written to this path ${fpath}`);

	console.log("\n\n\n\n\n\n\n");
	
	// III - Copying all files to images
	console.log(`
            3 of 3 :: Copying all images to 'images' directory!
        `);

	let filenamewoextfr = filenamewoext.replace(/ /g, '\\ ');
	filenamewoextfr = filenamewoext.replace(/[ &%[\*^$()+?{|]/g, '\\&');
	//sed 's/[ &%.[\*^$()+?{|]/\\&/g'
	let pat = 'parse_data/' + filenamewoextfr + '/';
	pat = path.join(__dirname, pat);

	// moving images
	if (shell.mv(`${pat}*.gif`, `${pat}images/`)) {
		console.log(`Copied all images to images directory: parse_data/${pat}/images`);
	} else {
		console.error(`Error in copy images to appropriate directory.`);
	}

	if (shell.mv(`${pat}*.png`, `${pat}images/`)) {
		console.log(`Copied .png images to images directory: parse_data/${pat}/images`);
	} else {
		console.error(`Error in copy images to appropriate directory.`);
	}

	if (shell.mv(`${pat}*.jpg`, `${pat}images/`)) {
		console.log(`Copied .jpg images to images directory: ${pat}images/`);
	} else {
		console.error(`Error in copy images to appropriate directory.`);
	}

	if (shell.mv(`${pat}*.jpeg`, `${pat}images/`)) {
		console.log(`Copied .jpeg images to images directory: ${pat}images/`);
	} else {
		console.error(`Error in copy images to appropriate directory.`);
	}

	if (shell.mv(`${pat}*.emf`, `${pat}images/`)) {
		console.log(`Copied .emf images to images directory: ${pat}images/`);
	} else {
		console.error(`Error in copy images to appropriate directory.`);
	}

	// re-naming images
	let cmnd = 'for file in ' + pat + 'images/*.png ;do NAME=$(echo $file | grep -oE "[^_]+$") && result=$(sed -e "s/ /\\\\\\ /g" -e "s/&/\\\\\\&/g" <<<"$file") && (echo $result '+ pat + 'images/$NAME | xargs mv); done';
	// console.log(cmnd);
	if (shell.exec(cmnd).code === 0) {
		console.log(`Copied all images to images directory: ${pat}images`);
	} else {
		console.error(`Error in copy images to appropriate directory.`);
	}

	cmnd = 'for file in ' + pat + 'images/*.gif ;do NAME=$(echo $file | grep -oE "[^_]+$") && result=$(sed -e "s/ /\\\\\\ /g" -e "s/&/\\\\\\&/g" <<<"$file") && (echo $result '+ pat + 'images/$NAME | xargs mv); done';
	if (shell.exec(cmnd).code === 0) {
		console.log(`Copied all images to images directory: ${pat}images`);
	} else {
		console.error(`Error in copy images to appropriate directory.`);
	}

	cmnd = 'for file in ' + pat + 'images/*.jpg ;do NAME=$(echo $file | grep -oE "[^_]+$") && result=$(sed -e "s/ /\\\\\\ /g" -e "s/&/\\\\\\&/g" <<<"$file") && (echo $result '+ pat + 'images/$NAME | xargs mv); done';	if (shell.exec(cmnd).code === 0) {
		console.log(`Copied all images to images directory: ${pat}images`);
	} else {
		console.error(`Error in copy images to appropriate directory.`);
	}

	cmnd = 'for file in ' + pat + 'images/*.jpeg ;do NAME=$(echo $file | grep -oE "[^_]+$") && result=$(sed -e "s/ /\\\\\\ /g" -e "s/&/\\\\\\&/g" <<<"$file") && (echo $result '+ pat + 'images/$NAME | xargs mv); done';
	if (shell.exec(cmnd).code === 0) {
		console.log(`Copied all images to images directory: ${pat}images`);
	} else {
		console.error(`Error in copy images to appropriate directory.`);
	}

	 // process.exit();
}


// I - convert from docx to html
const convertDocxToHTML = function (filename, outHTMLFilePath) {
	filename = filename.replace(/ /g, '\\ ');
	filename = filename.replace(/&/g, '\\&');

	outHTMLFilePath = outHTMLFilePath.replace(/ /g, '\\ ');
	outHTMLFilePath = outHTMLFilePath.replace(/&/g, '\\&');

	if (!shell.which('/Applications/LibreOffice.app/Contents/MacOS/soffice')) {
		shell.echo('Sorry, this script requires LibreOffice');
		shell.exit(1);
	}

	console.log(`/Applications/LibreOffice.app/Contents/MacOS/soffice --headless --convert-to html:HTML --outdir ${outHTMLFilePath} --convert-images-to "png" ${filename}`);

	if (shell.exec(`/Applications/LibreOffice.app/Contents/MacOS/soffice --headless --convert-to html:HTML --outdir ${outHTMLFilePath} --convert-images-to "png" ${filename}`).code === 0) {
		shell.echo('Success: Docx to HTML covert command executed.');
		//shell.exit(1);
	} else {
		shell.echo('Error: LibreOffice Docx to HTML covert command failed.');
		shell.exit(1);
	}

	/* var htmlData = "";
	console.log(filename);
		const promise = new Promise((resolve, reject) => {
			try {
					mammoth.convertToHtml({path: filename})
                    .then((result) => {
				        htmlData = result.value; // The generated HTML

				        const messages = result.messages; // Any messages, such as warnings during conversion
                        console.warn(`Warning Messages while Docx -> html conversin:  ${JSON.stringify(messages)}`);

                        resolve(htmlData);
                    })
                    .done(); 
                } catch(ex) {
                    reject();
					console.error(`Exception while converting docx -> html. Error: ${ex}`);
				}
		});

	return promise; */
}

// II - parse html to form a JSON data which will be store in backend
const parseHTML = function (htmldata, industryName) {
	try {
		// data = fs.readFileSync('/Users/gaurav/abcd/IM/examples/output.html', 'utf8');
		// console.log(data.toString());

		const dom = new JSDOM(htmldata);
		const document = dom.window.document;
		global.document = document;

		// console.log(dom.window.document.getElementsByTagName("p"));
		const as = document.getElementsByTagName("a");
		const reportData = {};
		const industryMappingData = {};
		industryMappingData.industryName = industryName;
		let checkSectionId = false;
		let nextSectionId = null;
		let checkMainSection = false;
		let sectionIdDots = 0;
		let key_mapping = "";

		for (let i = 0; i < as.length; i++) {
			const a = as[i];
			let data = {};
			let sectionId = "_";
			let rawSectionId = null;

			if (a && a.href) {

				// if a hrefs are not useful then just continue with next value and skip everything
				if (a.href.indexOf('http') !== -1
					|| a.href.indexOf('mailto') !== -1
					|| a.href.indexOf('tel:') !== -1) {
					continue;
				}
				if (!a.text) {
					a.text = "";
				}
				// dataObj.title = a.text;	// store title
				a.text = removeWhiteSpaces(a.text); // removes newline charecters
				let sectionIdArr = a.text.split(" ") || [];

				if (sectionIdArr.length > 0) {
					if (a.text.toLowerCase().indexOf('figure') !== -1) {
						if (parseInt(sectionIdArr[1])) {	// FIGURE 21
							sectionId += `${sectionIdArr[0]}_${sectionIdArr[1]}`;
						} else { // ex: FIGURE21
							let sarr = a.text.split(/(\d+)/).filter(Boolean);
							sectionId += `${sarr[0]}_${sarr[1]}`;
						}
					} else if (sectionIdArr[0].toLowerCase().indexOf('table') !== -1) {
							sectionId += `${sectionIdArr[0]}_${sectionIdArr[1]}`
					} else {
						sectionId += sectionIdArr[0].trim(); // append _ to maintain order ing in json object
					}

				}
				reportData[sectionId] = {};

				let source = "";
				let textContent = "";
				let id = a.href;

				id = id.replace(/(.*)_/, '_');	// to derieve the id from the href value

				let p = document.getElementsByName(id) || {};
				if (p)
					p = p[0];

				if (p && p.parentElement) {
					let pp = p.parentElement;
					// textContent = textContent + pp.textContent;	// append text content of siblings
					let titleFlag = true;

					do {
						if (titleFlag) {
							titleFlag = false;
							data.title = removeWhiteSpaces(pp.textContent) || "";	// store title
							data.title = data.title.toUpperCase();
							data.title = data.title.replace(/\s\s+/g, ' ');

							let sid = sectionId.split("_") || [];
							if (sid.length == 2
								&& sid[1].indexOf(".") === -1) {
								checkMainSection = false;
								sectionIdDots = 0;
								key_mapping = "";
							}

							// for maitaining the mapping between industry and key sections
							if (INDUSTRY_MAPPING_KEYS.includes(data.title.toLowerCase()) && sid[1].indexOf(".") === -1) {
								checkMainSection = true;
								continue;
							}

							if (checkMainSection) {

								if (INDUSTRY_MAPPING_KEYS_IGNORE.includes(data.title.toLowerCase())) {
									continue;
								}
								if (sectionIdDots && sectionId.split(".").length > sectionIdDots) {
									industryMappingData[key_mapping].push(data.title.toLowerCase());
								} else {
									key_mapping = data.title.toLowerCase();
									industryMappingData[key_mapping] = [];
									sectionIdDots = sectionId.split(".").length;
									checkSectionId = true;
								}
							}
							continue;
						}

						let tmp = pp.nextElementSibling;// || pp.nextSibling;
						if (!tmp || pp.nodeName == "#text") {
							while (pp.parentElement !== null
								&& pp.parentElement.tagName !== "BODY") {
								pp = pp.parentElement;
							}
							pp = pp.nextElementSibling;// || pp.nextSibling;
							if (!pp) break;
						} // break if element is null
						else {
							pp = tmp;
						}
						if (pp.querySelector('a') && pp.querySelector('a').name) {   // break if element has a `valid` element
							let isValidAFound = false;
							let aArr = pp.querySelectorAll('a');

							for (let i = 0; i < aArr.length; i++) {
								const ele = aArr[i];
								// const a = document.querySelector(`a[href="#${ele.id}"]`);
								const a = document.querySelector(`a[href="#${ele.name}"]`);
								if (a) {
									isValidAFound = true;
									break;
								}
							};
							if (isValidAFound) break;
						}
						let img = pp.querySelector("img") || null;
						const table = pp.querySelector("tbody") && pp.querySelector("tbody").parentElement || null;

						if (table) {	// save the table text data as array of json obj 
							data.type = "table";
							const jsonTabObj = convertTableToJSON(table, data.title, sectionId);
							data.tableContent = jsonTabObj;
						} else if (img) {

							data.type = "image";

							// save image files
							let imgSavedData = saveImageDataAsFile(data.title, sectionId, img.src);
							if (imgSavedData.error) {
								data.src = imgSavedData.data;
							} else {
								data.path = imgSavedData.path;
							}

							// TODO: Host images on server and then assign that url here
						} else {
							try {
								if (pp.textContent.split('source:').length > 1
									|| pp.textContent.split('Source:').length > 1
									|| pp.textContent.split('SOURCE:').length > 1) {
									source +=  removeWhiteSpaces(pp.textContent);
								} else {
									textContent += removeWhiteSpaces(pp.textContent);	// append text content of siblings
								}
							} catch (e) {}
						}
					} while (true)
				}
				!isEmpty(source) ? data.source = source : void(0);
				!isEmpty(textContent) ? data.textContent = textContent : void(0);
				
				reportData[sectionId] = data;

				if (data.type == "image" || data.type == "table") {
					continue;	// skipping the finding of all figures and tables
				}

				// Find all figures and tables inside this section
				const aNext = as[i + 1];
				let idNext = aNext.href;
				idNext = idNext.replace(/(.*)_/, '_');	// to derieve the id from the href value
				// const pNext = document.getElementById(idNext) || {};
				let pNext = document.getElementsByName(idNext) || {};
				if (pNext && pNext.length > 0)
					pNext = pNext[0];

				let aEle = {};
				let pe = p.parentElement.tagName !== "BODY" ? p.parentElement : pe;
				data.images = [];
				data.tables = [];

				if (!pe || pe.tagName === "BODY") {
					continue;
				}

				do {
					const table = pe.querySelector("tbody") && pe.querySelector("tbody").parentElement || null;
					const img = pe.querySelector("img") || null;
					if (table) {
						let preEle = ((table.parentElement && table.parentElement.tagName === "BODY") ? table.previousElementSibling : table.parentElement) || null;
						while (preEle && !preEle.querySelector('a')) {
							preEle = preEle.previousElementSibling;
						}
						if (preEle) {
							const aArr = preEle.querySelectorAll('a');

							for (let i = 0; i < aArr.length; i++) {
								const ele = aArr[i];
								// const a = document.querySelector(`a[href="#${ele.id}"]`);
								let a = document.querySelector(`a[href="#${ele.name}"]`);

								if (a) {
									let sectionId = "";
									if (!a.text) {
										a.text = "";
									}
									a.text = a.text.replace(/\s\s|\t|\r|\n|\r\n+/g, ' ');
									let sectionIdArr = a.text.split(" ") || [];
									if (sectionIdArr.length > 0) {
										if (sectionIdArr[0].toLowerCase().indexOf('table') !== -1) {
											sectionId += `${sectionIdArr[0]}_${sectionIdArr[1]}`;
										} else if (sectionIdArr[0].toLowerCase().indexOf('table') !== -1
											&& parseInt(sectionIdArr[1])) {
											sectionId += `${sectionIdArr[0]}_${sectionIdArr[1]}`;
										} else {
											sectionId += sectionIdArr[0].trim(); // append _ to maintain order ing in json object
										}
									}
									data.tables.push(sectionId);
									break;
								}
							};
						}
					}

					if (img) {

						let preEle = ((img.parentElement && img.parentElement.tagName === "BODY") ? img.previousElementSibling : img.parentElement) || null; // img.parentElement || null;

						while (preEle && !preEle.querySelector('a')) {
							preEle = preEle.previousElementSibling;
						}

						if (preEle) {
							const aArr = preEle.querySelectorAll('a');

							for (let i = 0; i < aArr.length; i++) {
								const ele = aArr[i];
								// const a = document.querySelector('a[href="#'+ele.id+'"]');
								const a = document.querySelector('a[href="#' + ele.name + '"]');
								if (a) {
									let sectionId = "";
									if (!a.text) {
										a.text = "";
									}
									a.text = removeWhiteSpaces(a.text);
									let sectionIdArr = a.text.split(" ") || [];
									if (a.text.toLowerCase().indexOf('figure') !== -1) {
										if (sectionIdArr.length > 0) {
											if (parseInt(sectionIdArr[1])) {	// FIGURE 21
												sectionId += `${sectionIdArr[0]}_${sectionIdArr[1]}`;
											} else { // ex: FIGURE21
												let sarr = a.text.split(/(\d+)/).filter(Boolean);
												sectionId += `${sarr[0]}_${sarr[1]}`;
											}
										}
									} else {
										sectionId = sectionIdArr[0];
									}

									data.images.push(sectionId);
									break;
								}
							};
						}
					}

					let tmp = pe.nextElementSibling;// || pe.nextSibling;
					if (!tmp) {
						while (pe.parentElement !== null
							&& pe.parentElement.tagName !== "BODY") {
							pe = pe.parentElement;
						}
						// pe = pe.nextElementSibling;// || pe.nextSibling;
						if (!pe.nextElementSibling) break;
					} else {
						
						pe = tmp;
					}
					// console.log(pe);

					const aArr = pe.querySelectorAll('a') || {};
					for (let i = 0; i < aArr.length; i++) {
						const ele = aArr[i];
						// const a = document.querySelector(`a[href="#${ele.id}"]`);
						const a = document.querySelector(`a[href="#${ele.name}"]`);
						if (a
							&& pNext.name === aArr[i].name) {
							aEle = aArr[i];
							break;
						}
					};
				} while (pNext.name != aEle.name)

			}

		}
		return ({
			reportData: reportData,
			industryMappingData: industryMappingData
		});
	} catch (e) {
		console.log(`Error in parsing HTML File.
        Error: ${e.stack}`);
	}
};


// Utilities functions

const removeWhiteSpaces = function (str = "") {
	let str1 = str;

	str1 = str1.replace(/\s\s|\t|\r|\n|\r\n+/g, ' ');
	str1 = str1.trim();

	return str1;
}

// check if number or not 
const isNumber = function (number) {
	if (typeof (number) == "number") {
		return true;
	}
	return false;
}

// Check for emptiness for number
const isNumberEmpty = function (obj) {
	let isEmpty = true;

	if (isNumber(obj)) {
		if (null !== obj && !isNaN(obj)) {
			isEmpty = false;
		}
	}
	return isEmpty;
}

// Check if empty or not for ({}, [], "", number)
const isEmpty = function (obj) {
	var isEmpty = true;

	// number check
	if (isNumber(obj)) {
		isEmpty = isNumberEmpty(obj)
	} else {
		// check for {}, [], ""
		if (null !== obj &&
			typeof (obj) !== "undefined") {
			if (Object.keys(obj).length > 0) {
				isEmpty = false;
			};
		};
	}
	return isEmpty;
};

// traverse files in a directories
const getDirectories = async function (src, callback) {
	await glob(src + '/**/*', callback);
};

const convertTableToJSON = function (tab, title, sectionId) {

	let rows = tab.rows || tab.querySelector('tbody').rows || [];
	let isFirstRowHeader = true;
	let jsonArr = [];
	let jsonData = {};
	jsonData.headers = [];
	jsonData.data = [];
	let headers = [];

	for (let i = 0; i < rows.length; i++) {
		let row = rows[i];
		var cols = row.cells || [];
		var jsonObj = {};

		if (isFirstRowHeader && i == 0) { // for headers
			isFirstRowHeader = false;
			for (let l = 0; l < cols.length; l++) {
				if (cols[l] && cols[l].colSpan) {
					let cs = cols[l].colSpan;
					for (let z = 0; z < cs; z++) {
						headers.push(cols[l]);
						jsonData['headers'].push(removeWhiteSpaces(cols[l].textContent));
					}
				}
			}

			continue;
		}

		for (let j = 0; j < cols.length; j++) {

			let data = "";
			if (cols[j] && cols[j].querySelector('img')) {

				let img = cols[j].querySelector('img');
				img.id = `${title}-${sectionId}`;
				let imgData = saveImageDataAsFile('TableData-' + title, sectionId, img.src);
				if (imgData.error) {
					data += data = cols[j].innerHTML;
				} else {
					if (img.parentNode) {
						img.parentNode.removeChild(img)
						data += `<p><img id="${title}-${sectionId}" src="${imgData.path}"></img><p>`;
					} else {
						data += cols[j].textContent;
					}
				}
			} else {
				data += cols[j].textContent;
			}

			jsonObj[removeWhiteSpaces(headers[j].textContent)] = removeWhiteSpaces(data);
		}
		jsonArr.push(jsonObj);
	}
	jsonData.data = jsonArr;
	return jsonData;
}

const saveImageDataAsFile = function (title, sectionId, imgPath) {
	// save image files
	try {
		// ba64.writeImageSync(`${IMAGE_PATH}/${title}-${sectionId}`, b64Data); 
		let imgPathArr = imgPath.split('_') || [];
		let path = imgPath;

		if (imgPathArr.length > 2) {
			path = imgPathArr[2];
		}

		return {
			"path": `[SERVER_URL]/[PATH_URL]/${REL_IMAGE_PATH}/${path}`,
			"error": false
		};
	} catch (er) {
		console.error(`Image File not created. Appending to data obj. 
		For Image: ${title}-${sectionId}
		Error: ${er}`);
		// if save fails then maintain data in data.src
		return {
			"data": imgPath,
			"error": true
		};
	}
}

const pushData = async function (data) {
	
	let reportData = data.reportData;
	let industryMappingData = data.industryMappingData;
	let reqData = [];

	// create a new report
	// let reportObj = await reportService.createReport({
	// 	"title": reportData.industryName,
	// 	"vertical": null,
	// 	"category": null
	// });
	let robj = { 
		'title': data.industryName,
		'vertical': null,
		'category': null,
		'status': 'PUBLISHED'
	};

	var options = { 
		'method': 'POST',
		'url': 'http://localhost:6969/api/v1/report/',
		'headers': 
		{ 
			'cache-control': 'no-cache',
			'Content-Type': 'application/json',
			'Authorization': 'jwt eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVjZDY2OTUyYzJlZTA3ZjQ0MDk4OGI2MCIsImZpcnN0TmFtZSI6IkdhdXJhdiIsImxhc3ROYW1lIjoiQm9yYSIsImVtYWlsIjoiZ2F1cmF2dmJvcmFAZ21haWwuY29tIiwiaWF0IjoxNTU4MjQyMjIxfQ.MZoP5cU6K03SEk-57vvXbZXltCndbsF1a-oCmX26df0' 
		},
		'body': robj,
		'json': true 
	};
	
	console.log(options);

	let resp = await rp(options);
		if (resp.err) {
			console.log(`PushData::::REPORT::::Error::::${reportData.industryName}::::${error}\n\n`);
			return;
		} 

			let reportId = resp.data.id;
	
			for (let key in reportData) {
				if (reportData.hasOwnProperty(key)) {
					let obj = reportData[key];
					let reqObj = {};
					reqObj.section_id = key.replace('_', '');
					let spidArr = reqObj.section_id.split('.');
					if (spidArr.length > 1) {
						spidArr.pop();
						reqObj.section_pid = spidArr.join('.');
					} else {
						reqObj.section_pid = null;
					}
	
					reqObj.title = obj.title;
					reqObj.content = [];
					reqObj.status = 'PUBLISHED';
	
					let contentObj = createContentObj(obj) || null;
					if (contentObj) { // dont insert invalid content objects
						reqObj.content.push(contentObj);
					}
	
					if (obj.images && obj.images.length > 0) {
						for (let i=0;i<obj.images.length;i++) {
							contentObj = {};
							let imgKey = obj.images[i];
							let imgObj = imgKey.startsWith('_') ? reportData[imgKey] : reportData[`_${imgKey}`];
							if (imgObj) {
								contentObj = createContentObj(imgObj, imgKey);
								reqObj.content.push(contentObj);	
							}
						}
					}
	
					if (obj.tables && obj.tables.length > 0) {
						for (let i=0;i<obj.tables.length;i++) {
							contentObj = {};
							let tabKey = obj.tables[i];
							let tabObj = tabKey.startsWith('_') ? reportData[tabKey] : reportData[`_${tabKey}`];
							if (tabObj) {
								contentObj = createContentObj(tabObj, tabKey);
								reqObj.content.push(contentObj);	
							}
						}
					}
					reqData.push(reqObj);
				}
			}
			// let tocData = await reportService.addTocDetails(reqObj, reportId);
			let url = 'http://localhost:6969/api/v1/'+reportId+'/toc/';
			var options1 = { method: 'POST',
			url: url,
			headers: 
			{ 'cache-control': 'no-cache',
				'Authorization': 'jwt eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVjZDY2OTUyYzJlZTA3ZjQ0MDk4OGI2MCIsImZpcnN0TmFtZSI6IkdhdXJhdiIsImxhc3ROYW1lIjoiQm9yYSIsImVtYWlsIjoiZ2F1cmF2dmJvcmFAZ21haWwuY29tIiwiaWF0IjoxNTU4MjQyMTIwfQ.VfEshm7OSPuNPdtUrx-xWoykNkDDR1TGjXimnP81JN8',
				'Content-Type': 'application/json' },
			body: reqData,
			json: true };
			
			console.log('####### push toc data!!!');
			console.log(options1);
	
			await rp(options1);

	// request(options, async function (error, response, body) {
	// if (error) {
	// 	console.log(`PushData::::REPORT::::Error::::${reportData.industryName}::::${error}\n\n`);
	// 	return;
	// } else {
	// 	let reportId = body.data.id;

	// 	for (let key in reportData) {
	// 		if (reportData.hasOwnProperty(key)) {
	// 			let obj = reportData[key];
	// 			let reqObj = {};
	// 			reqObj.section_id = key.replace('_', '');
	// 			let spidArr = reqObj.section_id.split('.');
	// 			if (spidArr.length > 1) {
	// 				spidArr.pop();
	// 				reqObj.section_pid = spidArr.join('.');
	// 			} else {
	// 				reqObj.section_pid = null;
	// 			}

	// 			reqObj.title = obj.title;
	// 			reqObj.content = [];
	// 			reqObj.status = 'PUBLISHED';

	// 			let contentObj = createContentObj(obj) || null;
	// 			if (contentObj) { // dont insert invalid content objects
	// 				reqObj.content.push(contentObj);
	// 			}

	// 			if (obj.images && obj.images.length > 0) {
	// 				for (let i=0;i<obj.images.length;i++) {
	// 					contentObj = {};
	// 					let imgKey = obj.images[i];
	// 					let imgObj = imgKey.startsWith('_') ? reportData[imgKey] : reportData[`_${imgKey}`];
	// 					if (imgObj) {
	// 						contentObj = createContentObj(imgObj, imgKey);
	// 						reqObj.content.push(contentObj);	
	// 					}
	// 				}
	// 			}

	// 			if (obj.tables && obj.tables.length > 0) {
	// 				for (let i=0;i<obj.tables.length;i++) {
	// 					contentObj = {};
	// 					let tabKey = obj.tables[i];
	// 					let tabObj = tabKey.startsWith('_') ? reportData[tabKey] : reportData[`_${tabKey}`];
	// 					if (tabObj) {
	// 						contentObj = createContentObj(tabObj, tabKey);
	// 						reqObj.content.push(contentObj);	
	// 					}
	// 				}
	// 			}
	// 			reqData.push(reqObj);
	// 		}
	// 	}
	// 	// let tocData = await reportService.addTocDetails(reqObj, reportId);
	// 	let url = 'http://localhost:6969/api/v1/'+reportId+'/toc/';
	// 	var options1 = { method: 'POST',
	// 	url: url,
	// 	headers: 
	// 	{ 'cache-control': 'no-cache',
	// 		'Authorization': 'jwt eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVjZDY2OTUyYzJlZTA3ZjQ0MDk4OGI2MCIsImZpcnN0TmFtZSI6IkdhdXJhdiIsImxhc3ROYW1lIjoiQm9yYSIsImVtYWlsIjoiZ2F1cmF2dmJvcmFAZ21haWwuY29tIiwiaWF0IjoxNTU4MjQyMTIwfQ.VfEshm7OSPuNPdtUrx-xWoykNkDDR1TGjXimnP81JN8',
	// 		'Content-Type': 'application/json' },
	// 	body: reqData,
	// 	json: true };
		
	// 	console.log('####### push toc data!!!');
	// 	console.log(options1);

	// 	await request(options1);
	// }
	// });


	

		
}

const createContentObj = function (obj, key) {
	let contentObj= {};
	contentObj.id = key;
	contentObj.contentType = obj.type ? obj.type : "text";
	contentObj.text = obj.textContent;

	switch (contentObj.contentType) {
		case "text": // nothing	
			if (!obj.textContent) {
				return null;
			}
			break;
		case "image":
			if (!obj.path) {
				return null;
			}
			contentObj.url = obj.path;
			contentObj.source = obj.source;
			contentObj.title = obj.title;
			break;
		case "table":
			if (!obj.tableContent) {
				return null;
			}
			contentObj.source = obj.source;
			contentObj.title = obj.title;
			contentObj.data = obj.tableContent;
			break;
		default:
			console.error("Missing section content type!");
			break;
	}

	return contentObj;
}

// traverse files in a directories
getDirectories(REPORT_PATH, async (err, dirResults) => {
	if (err) {
		console.log(`Error while reading Directories- ${err}`);
	} else {
		for (let i = 0; i < dirResults.length; i++) {
			const stats = fs.statSync(dirResults[i]);
			let fileIndustryName;
			if (stats.isDirectory()) {
				fileIndustryName = path.basename(dirResults[i]);
			} else if (stats.isFile()) {
				try {
					await main(dirResults[i], fileIndustryName);
				} catch (e) {
					console.error(`Error::::${dirResults[i]}::::${e.message}\n\n`);
				}
			}

		}
		// main('../../Desktop/Word File/AnD/Global Civil Helicopter Market.docx', 'AnD');
		// main("src/services/files/Global Liquid Chromatography Instruments Market - Trends & Forecast%2c2017-2027.docx", 'AnD');
	}
});


