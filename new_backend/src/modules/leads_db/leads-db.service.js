import leadsModel from './leads-db.model';
import to from '../../utilities/to';
import func from 'joi/lib/types/func';

async function addLeads(lead, id) {

    console.log("In add leads")
    let resData = {};
    try {
        resData = await to(leadsModel.addLeads(lead));
        return resData;
    } catch (er) {
        console.error(`Exception in  adding or updating data in leads. \n : ${er}`);
        return (resData.errors = er.message);
    }
}

async function getLeads(req, res) {
    let resData = {}
    try {
        resData = await to(leadsModel.getLeads(req, res));
        return resData;
    } catch (er) {
        console.error(`Exception in  adding or updating data in leads. \n : ${er}`);
        return (resData.errors = er.message);
    }
}

async function addLeadsData(data, id) {
    let resData = {}
    try {
        resData = await to(leadsModel.addLeadsData(data, id))
        return resData
    } catch (er) {
        console.error(`Exception in  adding data in leads. Please add company first. \n : ${er}`);
        return (resData.errors = er.message);
    }
}

async function getLeadsById(id) {
    let resData = {}
    try {
        resData = await to(leadsModel.getLeadsById(id))
        return resData
    } catch (er) {
        console.error(`Exception in  getting leads by id. \n : ${er}`);
        return (resData.errors = er.message);
    }
}

async function searchByName(data){
  let resData = {}
  try {
      resData = await to(leadsModel.searchByName(data))
      return resData
  } catch (er) {
      console.error(`Exception in  getting leads by id. \n : ${er}`);
      return (resData.errors = er.message);
  }
}

async function searchByCompany(data){
  let resData = {}
  try {
      resData = await to(leadsModel.searchByCompany(data))
      return resData
  } catch (er) {
      console.error(`Exception in  getting leads by id. \n : ${er}`);
      return (resData.errors = er.message);
  }
}

module.exports = {
    addLeads,
    getLeads,
    addLeadsData,
    getLeadsById,
    searchByName,
    searchByCompany
}
