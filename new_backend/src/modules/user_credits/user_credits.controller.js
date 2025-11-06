import HTTPStatus from "http-status";
import utilities from "../../utilities/utils";

const userCreditsService = require("./user_credits.service");

export async function addCredits(req, res) {
  try {
    const data = req.body;
    const APIData = await userCreditsService.addCredits(data);
    if (!utilities.isEmpty(APIData.error)) {
      const errObj = APIData.errors;
      return utilities.sendErrorResponse(
        HTTPStatus.BAD_REQUEST,
        true,
        errObj,
        res
      );
    } else {
      return utilities.sendResponse(HTTPStatus.OK, APIData, res);
    }
  } catch (er) {
    return utilities.sendErrorResponse(
      HTTPStatus.INTERNAL_SERVER_ERROR,
      true,
      er,
      res
    );
  }
}

export async function updateCredits(req, res) {
  try {
    const data = req.body;
    const APIData = await userCreditsService.updateCredits(data);
    if (!utilities.isEmpty(APIData.error)) {
      const errObj = APIData.errors;
      return utilities.sendErrorResponse(
        HTTPStatus.BAD_REQUEST,
        true,
        errObj,
        res
      );
    } else {
      return utilities.sendResponse(HTTPStatus.OK, APIData, res);
    }
  } catch (er) {
    return utilities.sendErrorResponse(
      HTTPStatus.INTERNAL_SERVER_ERROR,
      true,
      er,
      res
    );
  }
}

export async function getCredits(req, res) {
  try {
    
    const data = req.body.userId || req.user.id;
    console.log('data.........====', data)
    const APIData = await userCreditsService.getCredits(data);
    if (!utilities.isEmpty(APIData.error)) {
      const errObj = APIData.errors;
      return utilities.sendErrorResponse(
        HTTPStatus.BAD_REQUEST,
        true,
        errObj,
        res
      );
    } else {
      return utilities.sendResponse(HTTPStatus.OK, APIData, res);
    }
  } catch (er) {
    return utilities.sendErrorResponse(
      HTTPStatus.INTERNAL_SERVER_ERROR,
      true,
      er,
      res
    );
  }
}
