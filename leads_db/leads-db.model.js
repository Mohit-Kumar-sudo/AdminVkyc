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
  console.log("Page ===>", page);
  console.log("Limit ===>", limit);
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

const searchByName = function(data) {
  const query = data;
  if (query.full_name) {
    query.first_name = query.full_name
      .split(" ")
      .slice(0, -1)
      .join(" ");
    query.last_name = query.full_name
      .split(" ")
      .slice(-1)
      .join(" ");
  }

  let queryPromise;

  if (query.company) {
    queryPromise = leadsModel.find({
      company: { $regex: query.company, $options: "i" }
    });
  } else {
    queryPromise = leadsModel.aggregate([
      {
        $match: {
          leads: {
            $elemMatch: {
              $or: [
                { first_name: query.first_name },
                { last_name: query.last_name },
                { email: query.email },
                { designation: query.designation },
                { country: query.country }
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
                  { $eq: ["$$lead.first_name", query.first_name] },
                  { $eq: ["$$lead.last_name", query.last_name] },
                  { $eq: ["$$lead.email", query.email] },
                  { $eq: ["$$lead.designation", query.designation] },
                  { $eq: ["$$lead.country", query.country] }
                ]
              }
            }
          }
        }
      }
    ]);
  }
  return queryPromise;
};

module.exports = {
  addLeads,
  getLeads,
  addLeadsData,
  getLeadsById,
  searchByName
};
