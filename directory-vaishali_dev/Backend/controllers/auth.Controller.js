const Model = require("../models/user.model");
const createError = require("http-errors");
const moment = require("moment");
const { signAccessToken, signRefreshToken } = require("../Helpers/jwt_helper");
const XLSX = require("xlsx");
const generatePassword = require("../Helpers/generatePassword");
const sendEmail = require("../Helpers/sendEmail");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const sendSMS = require("../Helpers/sendSms");

module.exports = {
  // ================== LOGIN ==================
  login: async (req, res, next) => {
    try {
      const { email, mobile, password } = req.body;
      if ((!email && !mobile) || !password) {
        throw createError.BadRequest(
          "Email or mobile and password are required"
        );
      }

      const user = await Model.findOne(email ? { email } : { mobile });
      if (!user) {
        throw createError.NotFound("User not registered");
      }

      const isMatch = await user.isValidPassword(password);
      if (!isMatch) {
        throw createError.Unauthorized("Username/password not valid");
      }

      const accessToken = await signAccessToken(user._id);
      const refreshToken = await signRefreshToken(user._id);

      console.log("Access Token:", accessToken);
      console.log("Refresh Token:", refreshToken);

      res.status(200).json({
        success: true,
        msg: "Login Successful",
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          role: user.role,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // ================== REFRESH TOKEN ==================
  refreshToken: async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) throw createError.BadRequest("Refresh token required");

      // TODO: Verify refresh token and extract userId
      // const userId = await verifyRefreshToken(refreshToken);
      const userId = "someUserId"; // Placeholder – replace with actual verification

      const accessToken = await signAccessToken(userId);
      const refToken = await signRefreshToken(userId);

      res.send({ accessToken, refreshToken: refToken });
    } catch (err) {
      next(err);
    }
  },

  // ================== PROFILE ==================
  profile: async (req, res, next) => {
    try {
      if (!req.user) throw createError.Unauthorized("User not found");

      let data = {
        success: true,
        msg: "Profile Fetched",
        user: {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
        },
      };

      data = JSON.parse(JSON.stringify(data));
      delete data.user.password;

      res.send(data);
    } catch (error) {
      if (error.isJoi === true)
        return next(createError.BadRequest("Invalid Username/Otp"));
      next(error);
    }
  },

  // ================== BULK USER UPLOAD ==================
bulkUser: async (req, res) => {
  try {
    // 1. Read Excel File
    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    let users = XLSX.utils.sheet_to_json(sheet);

    // 2. Map Excel rows to user objects
    const newUsers = users.map((u) => ({
      sNo: u["sNo"] && !isNaN(Number(u["sNo"])) ? Number(u["sNo"]) : null,
      fullName: u["fullName"] || "",
      fatherName: u["fatherName"] || "",
      gotra: u["gotra"] || "",
      address: u["address"] || "",
      landmark: u["landmark"] || "",
      city: u["city"] || "",
      occupation: u["occupation"] || "",
      pinCode: u["pincode"] || "",
      state: u["state"] || "",
      phone: u["phone"] || "",
      mobile: u["mobile"] ? String(u["mobile"]).trim() : "",
      email: u["email"] ? String(u["email"]).trim() : "",
      yearsInIndore: u["yearsinindore"] || "",
      password: generatePassword(), // raw password (hashing is automatic in model)
    }));


    const savedUsers = [];
    const skippedUsers = [];


    // 3. Prepare for duplicate checking
    const fileSNOS = newUsers.map((u) => u.sNo).filter((v) => v !== null);
    const fileMobiles = newUsers.map((u) => u.mobile).filter((v) => v);


    // 4. Find duplicates in database
    const existing = await Model.find({
      $or: [
        { sNo: { $in: fileSNOS } },
        { mobile: { $in: fileMobiles } }
      ],
    });

    const existingSNOs = new Set(existing.map((e) => Number(e.sNo)));
    const existingMobiles = new Set(existing.map((e) => String(e.mobile)));


    // 5. Detect duplicate entries in Excel file
    const fileDuplicateSNO = new Set(
      fileSNOS.filter((v, i, a) => a.indexOf(v) !== i)
    );

    const fileDuplicateMobile = new Set(
      fileMobiles.filter((v, i, a) => a.indexOf(v) !== i)
    );


    // 6. Process each row/user
    for (const u of newUsers) {
      let reason = "";

      // Validation Conditions
      if (u.sNo === null) reason += "Missing sNo. ";
      if (existingSNOs.has(u.sNo)) reason += "Duplicate sNo in database. ";
      if (u.mobile && existingMobiles.has(u.mobile))
        reason += "Duplicate mobile in database. ";
      if (fileDuplicateSNO.has(u.sNo)) reason += "Duplicate sNo in file. ";
      if (u.mobile && fileDuplicateMobile.has(u.mobile))
        reason += "Duplicate mobile in file. ";

      // If any problem → skip user
      if (reason) {
        skippedUsers.push({
          sNo: u.sNo,
          mobile: u.mobile,
          fullName: u.fullName,
          reason: reason.trim(),
        });
        continue;
      }


      try {
        // 7. Save user
        const user = new Model(u);
        await user.save();
        savedUsers.push(user);


        // 8. Send SMS
        if (u.mobile) {
          // Convert to string & clean formatting
          let mobileNumber = String(u.mobile).trim();

          // Auto add +91 if mobile is 10 digits
          if (/^\d{10}$/.test(mobileNumber)) {
            mobileNumber = "+91" + mobileNumber;
          }

          const smsResult = await sendSMS(
            mobileNumber,
            `Hello ${u.fullName || "User"},
Your account has been created!

Email: ${u.email}
Password: ${u.password}

Please change your password after login.
- Your Team`
          );

          if (!smsResult.success) {
            console.log("SMS failed for", mobileNumber, smsResult.error);
          }
        }

      } catch (saveErr) {
        skippedUsers.push({
          sNo: u.sNo,
          mobile: u.mobile,
          fullName: u.fullName,
          reason: "Failed to save: " + saveErr.message,
        });
      }
    }


    // 9. Final Response
    res.json({
      message: "Bulk upload completed",
      insertedCount: savedUsers.length,
      skippedCount: skippedUsers.length,
      savedUsers,
      skippedUsers,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to upload users" });
  }
},
  // ================== ADD SINGLE USER ==================
  addUser: async (req, res) => {
    try {
      const {
        sNo,
        fullName,
        gotra,
        fatherName,
        address,
        landmark,
        city,
        pinCode,
        state,
        phone,
        mobile,
        email,
        occupation,
        yearsInIndore,
      } = req.body;
      const existingUser = await Model.findOne({
        $or: [{ sNo }, { mobile }, { email }],
      });

      if (existingUser) {
        let message = "Duplicate entry found: ";

        if (existingUser.sNo === sNo) {
          message += "sNo already exists. ";
        }
        if (existingUser.mobile === mobile) {
          message += "mobile number already exists. ";
        }
        if (existingUser.email === email) {
          message += "email already exists. ";
        }

        return res.status(400).json({ error: message.trim() });
      }
      const password = generatePassword();

      const newUser = new Model({
        sNo,
        fullName,
        gotra,
        address,
        landmark,
        fatherName,
        city,
        pinCode,
        state,
        phone,
        mobile,
        email,
        occupation,
        yearsInIndore,
        password,
      });

      await newUser.save();

      if (email) {
        await sendEmail(
          email,
          "Your Account Created Successfully",
          `
          <p>Dear ${fullName || "User"},</p>
          <p>Your account has been created successfully.</p>
          <p><strong>Login Details:</strong></p>
          <ul>
            <li>Email: ${email}</li>
            <li>Password: ${password}</li>
          </ul>
          <p>Please change your password after logging in.</p>
          <p>Best regards,<br/>Your Team</p>
        `
        );
      }
      if (mobile) {
        const smsResult = await sendSMS(
          mobile,
          `Hello ${
            fullName || "User"
          },\n\nYour account has been created!\nEmail: ${email}\nPassword: ${password}\n\nPlease change your password after login.\n- Your Team`
        );

        if (!smsResult.success) {
          console.log("SMS failed for", mobile, smsResult.error);
        }
      }

      res.json({
        message: "User added successfully and email sent",
        user: newUser,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to add user" });
    }
  },

  // ================== GET ALL USERS ==================
  getUsers: async (req, res) => {
    try {
      let {
        page = 1,
        limit = 10,
        search = "",
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      page = parseInt(page);
      limit = parseInt(limit);

      const query = {
        $or: [
          { fullName: new RegExp(search, "i") },
          { email: new RegExp(search, "i") },
          { mobile: new RegExp(search, "i") },
          { city: new RegExp(search, "i") },
          { state: new RegExp(search, "i") },
          { gotra: new RegExp(search, "i") },
        ],
      };

      const total = await Model.countDocuments(query);

      const users = await Model.find(query)
        .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      res.json({
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        count: users.length,
        users,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  },

  // ================== GET USER BY ID ==================
  getUserById: async (req, res) => {
    try {
      const user = await Model.findById(req.params.id);
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json(user);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  },

  // ================== UPDATE USER ==================

  updateUser: async (req, res) => {
    try {
      const { sNo } = req.params;
      const updateData = req.body;
      const user = await Model.findOne({ sNo });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const fs = require("fs");

      Object.keys(updateData).forEach((key) => {
        user[key] = updateData[key];
      });

      if (req.file) {
        if (user.image && fs.existsSync(user.image)) {
          fs.unlinkSync(user.image);
        }
        user.image = req.file.path;
      }

      await user.save();

      res.json({
        success: true,
        message: "User updated successfully",
        updated: user,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to update user" });
    }
  },

  // ================== DELETE / MARK INACTIVE ==================
  deleteUser: async (req, res) => {
    try {
      const user = await Model.findByIdAndUpdate(
        req.params.id,
        { is_inactive: true },
        { new: true } // returns the updated document
      );

      if (!user) return res.status(404).json({ error: "User not found" });

      res.json({
        message: "User marked as inactive successfully",
        user,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to update user status" });
    }
  },
  activeUser: async (req, res) => {
    try {
      const user = await Model.findByIdAndUpdate(
        req.params.id,
        { is_inactive: false },
        { new: false }
      );

      if (!user) return res.status(404).json({ error: "User not found" });

      res.json({
        message: "User marked as active successfully",
        user,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to update user status" });
    }
  },
  // ================== RESET PASSWORD ==================
  resetPassword: async (req, res) => {
    try {
      const { email, mobile } = req.body;
console.log(email, mobile);
      if (!email && !mobile) {
        return res.status(400).json({ error: "Email or mobile is required" });
      }

      const user = await Model.findOne(email ? { email } : { mobile });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const newPassword = generatePassword();
      user.password = newPassword;

      await user.save();

      if (user.email) {
        await sendEmail(
          user.email,
          "Password Reset Successful",
          `
        <p>Dear ${user.fullName || user.fullName || "User"},</p>
        <p>Your password has been reset successfully.</p>
        <p><strong>New Login Details:</strong></p>
        <ul>
          <li>Email: ${user.email}</li>
          <li>Password: ${newPassword}</li>
        </ul>
        <p>Please log in and change your password immediately.</p>
        <p>Best regards,<br/>Your Team</p>
      `
        );
      }
      if (user.mobile) {
        await sendSMS(
          user.mobile,
          `Hello ${
            user.fullName || "User"
          },\n\nYour password has been reset!\nNew Password: ${newPassword}\n\nPlease login and change it immediately.\n- Your Team`
        );
      }
      res.json({
        message: "Password reset successfully. Check your email for details.",
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to reset password" });
    }
  },
  // ================== UPDATE PASSWORD ==================
  updatePassword: async (req, res, next) => {
    try {
      const { userId, currentPassword, newPassword, confirmPassword } =
        req.body;

      if (!userId || !currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({
          error:
            "User ID, current password, new password, and confirm password are required",
        });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({ error: "New passwords do not match" });
      }

      const user = await Model.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const isMatch = await user.isValidPassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }

      user.password = newPassword;
      await user.save();

      res.json({ message: "Password updated successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to update password" });
    }
  },
  searchUsers : async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      search = "",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const searchRegex = new RegExp(search, "i");

    const query = {
      $or: [
        { fullName: searchRegex },
        { gotra: searchRegex },
        { mobile: searchRegex }
      ],
    };

    if (!isNaN(search)) {
      query.$or.push({ sNo: Number(search) });
    }

    const total = await Model.countDocuments(query);

    const users = await Model.find(query)
      .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      count: users.length,
      users,
    });

  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Failed to search users" });
  }
}

};
