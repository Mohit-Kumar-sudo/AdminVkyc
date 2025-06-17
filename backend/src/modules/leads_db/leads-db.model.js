import mongoose from "mongoose";
import leadsDbSchema from "./leads-db.schema";
const leadsModel = mongoose.model("leads", leadsDbSchema);

const addLeads = function(lead) {
  console.log("Lead in model ===>", lead);
  let reportObj = new leadsModel(lead);
  return reportObj.save();
};

const getLeads = function(req, res) {
  const queryPromise = leadsModel.find();
  return queryPromise;
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

  if(query.company){
    queryPromise = leadsModel.find({company:{ "$regex": query.company, "$options": "i" }})
  } else {
     queryPromise = leadsModel.aggregate([
      {
        $match: {
          leads: {
            $elemMatch: {
              $or: [
                { "first_name": query.first_name },
                { "last_name":query.last_name},
                { "email": query.email},
                {"designation":  query.designation},
                {"country": query.country},
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
                  { $eq:["$$lead.first_name", query.first_name]},
                  { $eq:["$$lead.last_name", query.last_name]},
                  { $eq:["$$lead.email", query.email]},
                  { $eq:["$$lead.designation", query.designation]},
                  { $eq:["$$lead.country", query.country]}
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
