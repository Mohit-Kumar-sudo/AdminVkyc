import mongoose from "mongoose";
import leadsDbSchema from "./leads-db.schema";
import { promises } from "fs";
const leadsModel = mongoose.model("leads", leadsDbSchema);

const addLeads = function(lead) {
  console.log("Lead in model ===>", lead);
  let reportObj = new leadsModel(lead);
  return reportObj.save();
};

const getLeads = async function(req, res) {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const queryPromise = leadsModel
    .find()
    .skip(skip)
    .limit(limit)
    .lean(); // Add the lean() method to return plain JavaScript objects.
  // Get the count of all leads
  const countPromise = leadsModel.countDocuments();

  const [leads, count] = await Promise.all([queryPromise, countPromise]);
  const data = { leads, count };
  return data;
};

const addLeadsData = function(data, id) {
  const exLead = [...data];
  const queryPromise = leadsModel.findByIdAndUpdate(
    mongoose.Types.ObjectId(id),
    { $push: { leads: { $each: exLead } } },
    { new: true }
  );
  return queryPromise;
};

const getLeadsById = function(id) {
  const queryPromise = leadsModel.findById(mongoose.Types.ObjectId(id));
  return queryPromise;
};

const searchByName = function(data, page = 1, limit = 10) {
  const query = data;
  const skip = (page - 1) * limit;

  // Convert all query fields to lowercase
  for (let key in query) {
    if (typeof query[key] === 'string') {
      query[key] = query[key].toLowerCase();
    }
  }

  if (query.full_name) {
    query.first_name = query.full_name
      .split(" ")
      .slice(0, -1)
      .join(" ")
      .toLowerCase();
    query.last_name = query.full_name
      .split(" ")
      .slice(-1)
      .join(" ")
      .toLowerCase();
  }

  let queryPromise;

  if (query.company) {
    // Perform a case-insensitive search for company field
    queryPromise = leadsModel.find({
      company: { $regex: new RegExp(query.company, "i") }
    }).skip(skip).limit(limit);
  } else {
    // Perform case-insensitive searches for other fields using $regex
    queryPromise = leadsModel.aggregate([
      {
        $match: {
          leads: {
            $elemMatch: {
              $or: [
                { first_name: { $regex: new RegExp(query.first_name, "i") } },
                { last_name: { $regex: new RegExp(query.last_name, "i") } },
                { email: { $regex: new RegExp(query.email, "i") } },
                { designation: { $regex: new RegExp(query.designation, "i") } },
                { country: { $regex: new RegExp(query.country, "i") } }
              ]
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          company: 1,
          leads: {
            $filter: {
              input: "$leads",
              as: "lead",
              cond: {
                $or: [
                  { $eq: [{ $toLower: "$$lead.first_name" }, query.first_name] },
                  { $eq: [{ $toLower: "$$lead.last_name" }, query.last_name] },
                  { $eq: [{ $toLower: "$$lead.email" }, query.email] },
                  { $eq: [{ $toLower: "$$lead.designation" }, query.designation] },
                  { $eq: [{ $toLower: "$$lead.country" }, query.country] }
                ]
              }
            }
          }
        }
      }
    ]).skip(skip).limit(limit);
  }
  return queryPromise;
};

const searchByCompany = function(companyName) {
  const query = companyName ? companyName.trim() : '';

  const queryPromise = leadsModel.find({
    company: { $regex: query, $options: "i" }
  });

  return queryPromise;
};


module.exports = {
  addLeads,
  getLeads,
  addLeadsData,
  getLeadsById,
  searchByName,
  searchByCompany
};
