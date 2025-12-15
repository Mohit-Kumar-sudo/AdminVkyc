const Model = require("../models/family.model");
const createError = require("http-errors");
var moment = require("moment");
const XLSX = require("xlsx");

module.exports = {
createBulk: async (req, res) => {
try {
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const grouped = {};
    data.forEach((row) => {
      const sNo = row.sNo;
      if (!grouped[sNo]) {
        grouped[sNo] = {
          sNo,
          leaderName: row["Name of the leader"],
          members: [],
        };
      }

      grouped[sNo].members.push({
        name: row["Member's name"],
        relation: row["Realtion with leader"],
        DOB: row["DOB"],
        education: row["Education"],
        occupation: row["Occupation"],
        merrital_status: row["Merrital status"],
        blood_group: row["Blood group"],
        mobile: row["mobile"],
      });
    });

    await Model.insertMany(Object.values(grouped));

    res.json({ success: true, inserted: Object.keys(grouped).length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to upload file" });
  }
},
create: async (req, res) => {
  try {
    const {
      sNo,
      memberName,
      relation,
      DOB,
      education,
      occupation,
      merrital_status,
      blood_group,
      mobile,
    } = req.body;

    if (!sNo ||  !memberName) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existingLeader = await Model.findOne({ sNo });

    if (existingLeader) {
      existingLeader.members.push({
        name: memberName,
        relation,
        DOB,
        education,
        occupation,
        merrital_status,
        blood_group,
        mobile,
      });

      const updated = await existingLeader.save();

      return res.json({
        success: true,
        message: "Member added to existing leader",
        updated,
      });
    } else {
      const newEntry = await Model.create({
        sNo,
        members: [
          {
            name: memberName,
            relation,
            DOB,
            education,
            occupation,
            merrital_status,
            blood_group,
            mobile,
          },
        ],
      });

      return res.json({
        success: true,
        message: "New leader created with first member",
        inserted: newEntry,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create or update entry" });
  }
},
getBySNo: async (req, res) => {
  try {
    let { sNo } = req.params;

    // ❗ Validate missing or invalid sNo
    if (!sNo || isNaN(Number(sNo))) {
      return res.status(400).json({ error: "Invalid or missing sNo" });
    }

    sNo = Number(sNo);

    // ✅ Only fetch active records
    const leader = await Model.findOne({
      sNo,
      $or: [
        { is_inactive: { $exists: false } },
        { is_inactive: false }
      ]
    });

    if (!leader) {
      return res.status(404).json({ error: "Leader not found or inactive" });
    }

    res.json({ success: true, data: leader });
  } catch (err) {
    console.error("getBySNo Error:", err);
    res.status(500).json({ error: "Failed to fetch leader details" });
  }
},

updateFamily: async (req, res) => {
  try {
    const { sNo, memberId } = req.params;
    const updateData = req.body;

    const family = await Model.findOne({ sNo });
    if (!family) {
      return res.status(404).json({ error: "Family not found" });
    }

    let updatedMember = null;

    const fs = require("fs");

    if (memberId) {
      const member = family.members.id(memberId);
      if (!member) {
        return res.status(404).json({ error: "Member not found" });
      }

      Object.keys(updateData).forEach((key) => {
        member[key] = updateData[key];
      });

      if (req.file) {
        if (member.image && fs.existsSync(member.image)) {
          fs.unlinkSync(member.image); // delete old
        }
        member.image = req.file.path; // set new
      }

      updatedMember = member;

    } else {
      Object.keys(updateData).forEach((key) => {
        family[key] = updateData[key];
      });

      if (req.file) {
        if (family.image && fs.existsSync(family.image)) {
          fs.unlinkSync(family.image); // delete old
        }
        family.image = req.file.path; // set new
      }
    }

    await family.save();

    res.json({
      success: true,
      message: memberId
        ? "Family member updated successfully"
        : "Family leader updated successfully",
      updated: memberId ? updatedMember : family,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update family record" });
  }
}

}
