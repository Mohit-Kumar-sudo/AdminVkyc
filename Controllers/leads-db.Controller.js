const mongoose = require("mongoose");
const leadsModel = require("../Models/leads-db.model"); // Ensure you import your model correctly
const HTTPStatus = require("http-status");
const utilities = require("../utilities/utils");
const to = require("../utilities/to");

module.exports = {
  getLeads: async (req, res, next) => {
    try {
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.max(1, parseInt(req.query.limit) || 10);
      const skip = (page - 1) * limit;
  
      // Fetch leads with pagination
      const leads = await leadsModel.find().skip(skip).limit(limit).lean();
  
      // Get the total count of leads
      const count = await leadsModel.countDocuments();
  
      // Calculate total pages
      const totalPages = Math.ceil(count / limit);
  
      // Construct and send the response in the required format
      res.status(200).json({
        data: {
          leads: leads,
          count: count
        }
      });
    } catch (error) {
      next(error);
    }
  },
  
  searchByName: async (req, res) => {
    try {
      const data = req.body;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      // Convert all query fields to lowercase
      for (let key in data) {
        if (typeof data[key] === 'string') {
          data[key] = data[key].toLowerCase();
        }
      }

      if (data.full_name) {
        data.first_name = data.full_name
          .split(" ")
          .slice(0, -1)
          .join(" ")
          .toLowerCase();
        data.last_name = data.full_name
          .split(" ")
          .slice(-1)
          .join(" ")
          .toLowerCase();
      }

      let queryPromise;

      if (data.company) {
        // Perform a case-insensitive search for the company field
        queryPromise = await leadsModel.find({
          company: { $regex: new RegExp(data.company, "i") },
        })
          .skip(skip)
          .limit(limit);
      } else {
        // Perform case-insensitive searches for other fields using $regex
        queryPromise = await leadsModel.aggregate([
          {
            $match: {
              leads: {
                $elemMatch: {
                  $or: [
                    { first_name: { $regex: new RegExp(data.first_name, "i") } },
                    { last_name: { $regex: new RegExp(data.last_name, "i") } },
                    { email: { $regex: new RegExp(data.email, "i") } },
                    { designation: { $regex: new RegExp(data.designation, "i") } },
                    { country: { $regex: new RegExp(data.country, "i") } },
                  ],
                },
              },
            },
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
                      { $eq: [{ $toLower: "$$lead.first_name" }, data.first_name] },
                      { $eq: [{ $toLower: "$$lead.last_name" }, data.last_name] },
                      { $eq: [{ $toLower: "$$lead.email" }, data.email] },
                      { $eq: [{ $toLower: "$$lead.designation" }, data.designation] },
                      { $eq: [{ $toLower: "$$lead.country" }, data.country] },
                    ],
                  },
                },
              },
            },
          },
        ])
          .skip(skip)
          .limit(limit);
      }

      // Send response
      res.status(200).json({
        data: queryPromise,
      });
    } catch (error) {
      console.error("Error in searchByName:", error);
      res.status(500).json({
        error: "An error occurred while fetching the leads.",
        details: error.message,
      });
    }
  },
};
