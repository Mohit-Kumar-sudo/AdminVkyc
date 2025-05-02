import to from '../../utilities/to';
import userCreditsModel from "./user_credits.model";

async function addCredits(data){
    let resData = {};
    try {
        resData = await to(userCreditsModel.addCredits(data));
        return resData
    } catch (error) {
        console.error(`Error in adding user credits. \n : ${error}`);
        return (resData.errors = error.message);
    }
}

async function updateCredits(data){
    let resData = {};
    try {
        resData = await to(userCreditsModel.updateCredits(data));
        return resData
    } catch (error) {
        console.error(`Error in updating user credits. \n : ${error}`);
        return (resData.errors = error);
    }
}

async function getCredits(data){
    let resData = {};
    try {
        resData = await to(userCreditsModel.getCredits(data));
        return resData
    } catch (error) {
        console.error(`Error in getting User Credits. \n : ${error}`);
        return (resData.errors = error.message);
    }
}

module.exports = {
    addCredits,
    getCredits,
    updateCredits
}