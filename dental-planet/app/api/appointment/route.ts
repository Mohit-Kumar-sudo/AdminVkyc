export const runtime = "nodejs";

import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("API HIT 👉", body);

    const { name, email, phone, date, time, message } = body;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.verify();
    console.log("SMTP VERIFIED ✅");

 await transporter.sendMail({
  from: `"Dental Planet" <${process.env.EMAIL_USER}>`,
  to: process.env.ADMIN_EMAIL,
  subject: "🦷 New Appointment Booked – Dental Planet",
  html: `
  <div style="background:#f4f6f8;padding:20px;font-family:Arial,sans-serif">
    <table width="100%" cellspacing="0" cellpadding="0"
      style="max-width:600px;margin:auto;background:#ffffff;border-radius:8px">
      
      <!-- HEADER -->
      <tr>
        <td style="text-align:center;padding:20px">
          <img 
            src="https://dental-planet.vercel.app/images/logo2.png" 
            alt="Dental Planet" 
            width="80"
            style="margin-bottom:10px"
          />
          <h2 style="color:#0d6efd;margin:0">
            New Appointment Booked
          </h2>
          <p style="color:#666;margin-top:5px">
            A patient has booked a new appointment
          </p>
        </td>
      </tr>

      <!-- DETAILS -->
      <tr>
        <td style="padding:20px;color:#333">
          <table width="100%" cellpadding="6" cellspacing="0"
            style="border-collapse:collapse">
            
            <tr>
              <td style="font-weight:bold;width:140px">Name:</td>
              <td>${name}</td>
            </tr>

            <tr style="background:#f8f9fa">
              <td style="font-weight:bold">Email:</td>
              <td>${email}</td>
            </tr>

            <tr>
              <td style="font-weight:bold">Phone:</td>
              <td>${phone}</td>
            </tr>

            <tr style="background:#f8f9fa">
              <td style="font-weight:bold">Date:</td>
              <td>${date}</td>
            </tr>

            <tr>
              <td style="font-weight:bold">Time:</td>
              <td>${time}</td>
            </tr>

            <tr style="background:#f8f9fa">
              <td style="font-weight:bold;vertical-align:top">
                Message:
              </td>
              <td>${message || "N/A"}</td>
            </tr>

          </table>
        </td>
      </tr>

      <!-- FOOTER -->
      <tr>
        <td style="background:#f1f3f5;text-align:center;padding:12px;
                   font-size:12px;color:#777">
          This is an automated email from Dental Planet.
        </td>
      </tr>

    </table>
  </div>
  `,
});

await transporter.sendMail({
  from: `"Dental Planet" <${process.env.EMAIL_USER}>`,
  to: email,
  subject: "✅ Appointment Confirmed – Dental Planet",
  html: `
  <div style="background:#f4f6f8;padding:20px;font-family:Arial,sans-serif">
    <table width="100%" cellspacing="0" cellpadding="0"
      style="max-width:600px;margin:auto;background:#ffffff;border-radius:8px">
      
      <tr>
        <td style="text-align:center;padding:20px">
          <img 
            src="https://dental-planet.vercel.app/images/logo2.png" 
            alt="Dental Planet" 
            width="80"
            style="margin-bottom:10px"
          />
          <h2 style="color:#198754;margin:0">
            Appointment Confirmed
          </h2>
        </td>
      </tr>

      <tr>
        <td style="padding:20px;color:#333">
          <p>Dear <strong>${name}</strong>,</p>

          <p>
            Your dental appointment has been 
            <strong style="color:#198754">successfully confirmed</strong>.
          </p>

          <table width="100%" style="margin:15px 0">
            <tr>
              <td><strong>Date:</strong></td>
              <td>${date}</td>
            </tr>
            <tr>
              <td><strong>Time:</strong></td>
              <td>${time}</td>
            </tr>
          </table>

          <p>
            Please arrive <strong>10 minutes early</strong> for a smooth check-in.
          </p>

          <p>
            If you have any questions, feel free to reply to this email.
          </p>

          <br/>

          <p>
            Regards,<br/>
            <strong>Dental Planet Team</strong>
          </p>
        </td>
      </tr>

      <tr>
        <td style="background:#f8f9fa;text-align:center;padding:12px;
                   font-size:12px;color:#777">
          © ${new Date().getFullYear()} Dental Planet. All rights reserved.
        </td>
      </tr>

    </table>
  </div>
  `,
});


    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("EMAIL ERROR ❌", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
