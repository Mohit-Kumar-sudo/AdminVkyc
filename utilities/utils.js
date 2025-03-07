const mongoose = require('mongoose');
// var logger = require('./log').get(module);

const isNumber = function (number) {
	if (typeof(number) == "number") {
		return true;
	}
	return false;
}

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
const isEmpty = function(obj) {
	let isEmptyVar = true;

	// number check
	if (isNumber(obj)) {
		isEmptyVar = isNumberEmpty(obj)
	} else{
		// check for {}, [], ""
		if (null !== obj &&
			typeof(obj) !== "undefined") {
			if (Object.keys(obj).length > 0) {
				isEmptyVar = false;
			};
		};
	}
	return isEmptyVar;
};

const messageFactory = function() {
	return {
		errorCode: false,
	};
};

const sendResponse = function(statusCode=200, data, res) {
	let msg = data;
	if (!res) {
		res = this.res;
	}
	if (!data.hasOwnProperty("errorCode")) {
		msg = {data, ...messageFactory()};
	}

	try {
		// console.log(messageJSON);
		
		res.set("Connection", "close");
		res.contentType('json');
		if (statusCode) {
			res.status(statusCode).end(msg);
		} else {
			res.json(msg);
		}
	} catch (e) {
		// logger.error('sendResponse() : ' + e);
		res.json(msg);
	}
};

const sendErrorResponse = function(statusCode = 200, errorCode = null,errorMessage = null,res) {
	console.log('errorMessage', errorMessage);
	const message = messageFactory();
	message.errorCode = errorCode;
	message.errorMessage = errorMessage;
	sendResponse(statusCode, message, res);
};

// function is to remove special characters and keep only numeric in string
const getNumbers = function(number) {
	const num = number.toString();
	return num.replace(/\D/g, '');
}

// function to check its a valid a object id
const isValidObjectId = function(objId) {
	return (mongoose.Types.ObjectId.isValid(objId));
};

const checkIfMongooseObject = function (obj) {
	if (!isEmpty(obj) && obj.constructor.name === 'model') {
		return true;
	}
	return false;
}

const getErrorDetails = function (mongoErrorObj) {
	const respObj = {};
	if (mongoErrorObj !== null
		&& Object.keys(mongoErrorObj).length > 0) {
		for (let err in mongoErrorObj) {
			respObj[err] = mongoErrorObj[err].message;
		}
	}
	
	return respObj;
}

const formUpdateQueryResults = function (res) {
	let newResp = {};

	if (isEmpty(res)) {
		return res;
	}
	
	newResp.nModified = res.nModified;
	newResp.ok = res.ok;

	return newResp;
}

/* 
	Form <key,value> Map from request key and value parmaeters.
	Request keys are seperated by comma 
	and values have multiple records seperated by comma and each value seperated by colon(:).
	ex: keys=segment,region,year&values=app:-1:2019,type:north_america:2018,app:parent
*/ 
const formKeyValueMapFromReqKeyVal = function (keysArr, recsArr) {
	const kvStore = [];

	for (let i=0;i<recsArr.length;i++) {
		const valArr = (recsArr[i] && recsArr[i].split(':')) || [];
		const kvMap = {};

		for(let k=0;k<keysArr.length;k++) {
			if (valArr[k] && valArr[k] !== '-1') {
				kvMap[`${keysArr[k]}`] = isNaN(parseInt(valArr[k], 10)) ? valArr[k] : parseInt(valArr[k], 10);
			}
		}
		kvStore.push(kvMap);
	}

	return kvStore;
}


const getTableTransposeForFirstCol = function (gridData) {
	const res = {};

    for (let i=0;i<gridData.length;i++) {
        const ele = gridData[i];
		let resRec = {};
		
		// column name to be looked up for in table
        // let colName = ele.key.replace(/_volume/ig, '');
        // colName = colName.replace(/_value/ig, '');
		const regKey = ele.regName.replace(/ /ig, '_');
		const colName = `${ele.segName.toLowerCase()}_${regKey}`;

		// for each table records fetch make trasnpose and put in diff map (res)
        for (let j=0;j<ele.value.length;j++) {
            resRec = {};
            const tabEle = ele.value[j];
            resRec = tabEle;
            const val = tabEle[colName];
            resRec[''+val] = ele.regName;
            delete resRec[''+colName];
            
            if (res[''+val]) {
                res[''+val].push(resRec);
            } else {
                res[''+val] = [resRec];
            }
		}
	}
	
	// 'Total' column is not required in new table
    delete res.Total;

    // for computing total of newly added records
    for (let key in res) {
        let totRec = {};
        for (let i=0;i<res[key].length;i++) {
            let rec = res[key][i];
            for (let col in rec) {
                totRec[''+col] = parseFloat(rec[col]) + parseFloat(totRec[col] ? totRec[col] : 0)
            }
            totRec[''+key] = "Total";
        }
        res[''+key].push(totRec);
    }

	// console.log(res);
	return res;
}

// export functions 
module.exports = {
	// functions
	isEmpty,
	messageFactory,
	sendResponse,
	sendErrorResponse,
	getNumbers,
	isValidObjectId,
	checkIfMongooseObject,
	getErrorDetails,
	formUpdateQueryResults,
	formKeyValueMapFromReqKeyVal,
	getTableTransposeForFirstCol
};