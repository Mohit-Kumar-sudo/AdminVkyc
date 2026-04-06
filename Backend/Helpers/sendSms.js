const axios = require("axios");

async function sendSMS(to, fullName, mobile, password) {
  try {
    if (!to) throw new Error("Recipient mobile number is required");

    let cleanedNumber = to.replace(/\D/g, "");

    if (!cleanedNumber.startsWith("91")) {
      cleanedNumber = "91" + cleanedNumber;
    }

    const response = await axios.get(
      "https://login.yourbulksms.net/api/sendhttp.php",
      {
        params: {
          authkey: "3834676974616c38343605",
          mobiles: cleanedNumber,
          sender: "ITMGWN",
          route: "2",
          country: "91",
          DLT_TE_ID: "1707177192592816924",
          message: `Welcome to Khartargach Shri Sang Indore

Hello ${fullName},

Your account for the Digital Directory has been successfully created.

Login Details:
Mobile: ${mobile}
Password:${password}

Please change your password after first login.

Download App:
https://play.google.com/store/apps/details?id=com.media_picker

Thanks!

SARAWAGI`, 
        },
      },
    );

    console.log("SMS API Response:", response.data);

    if (response.data.Status === "Success") {
      return {
        success: true,
        messageId: response.data["Message-Id"],
        data: response.data,
      };
    }

    return {
      success: false,
      error: response.data.Description,
    };
  } catch (error) {
    console.error("Bulk SMS Error:", error.response?.data || error.message);
    return { success: false, error: error.message };
  }
}

module.exports = sendSMS;
