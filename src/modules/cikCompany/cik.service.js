import cikCompany from './cik.model';

async function getCikData(value) {
    let data;
    try {
        data = cikCompany.find().where({ "title": { "$regex": value, "$options": "i" } });
        return data;
    } catch (error) {
        return error
    }
}

module.exports = { getCikData }