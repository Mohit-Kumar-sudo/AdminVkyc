const nodemailer = require('nodemailer');

const transport = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: 'testapp1627@gmail.com',
    pass: '@facebook123'
  }
});

async function sendVerifyMail(user, req, res) {
  try {
    const id = user.id ? user.id : user._id;
    const name = user.name ? user.name : `${user.firstName} ${user.lastName}`;
    const origin = req.get('origin');
    const htmlTemplate = `
      <div style="margin: 20px;border: 1px solid rgba(0,0,0,0.1);padding: 20px;border-radius:4px; font-family: serif;font-size:16px">
        <div style="margin:10px;">
          <img src="https://d262od1w3no28z.cloudfront.net/assets/logo-165a6578fb10a464fcff94360c6ff97c5cbdaeec928b3d7c6ff97abd2d3df66c.png" alt="logo">
        </div>
        <div style="margin:10px 20px;line-height: 1.5;">
          <div>Hi <strong>${name}</strong></div>
          <div>To complete your signup process, we need to verify your email address.</div>
          <div><strong>${user.email}</strong></div>
          <div>
            <a href="${origin}/verify-email/${id}" target="_blank" style="text-decoration:none;color:#fff;padding:0;">
              <button style="padding:10px 20px;margin-top:10px;background:blue;color:#fff;box-shadow: 0 3px 1px -2px rgba(0,0,0,.2), 0 2px 2px 0 rgba(0,0,0,.14), 0 1px 5px 0 rgba(0,0,0,.12);border:none;cursor:pointer;font-weight:600">
                Verify
              </button>
            </a>
          </div>
          <div>
            <h4>OR Click on below link</h4>
            <div>
              <a href="${origin}/verify-email/${id}" target="_blank">${origin}/verify-email/${id}</a>
            </div>
          </div>
        </div>
      </div>
    `;

    const message = {
      from: 'testapp1627@gmail.com',
      to: user.email,
      subject: 'Verify your email address | Wantstats',
      html: htmlTemplate
    };

    const info = await transport.sendMail(message);
    res.json({ data: info });
  } catch (err) {
    res.json({ data: err });
  }
}

export { sendVerifyMail };
