import utilities from '../../utilities/utils';
import to from '../../utilities/to';    // for better error handling of async/await with promises
import cpModel from '../company_profile/cp.model';
import reportModel from '../reports/report.model';
import DATA_CONSTANTS from '../../config/dataConstants';


async function downloadPpt(coData, userId) {
  let resData = {};
  try {
    resData = await to(cpModel.addNewCompany(coData, userId));
    return resData;
  } catch (er) {
    console.error(`Exception in  adding new company data. \n : ${er}`);
    return (resData.errors = er.message);
  }
}

// export methods
module.exports = {
  downloadPpt
};
