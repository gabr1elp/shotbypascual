// pages/api/contact.js

import { Resend } from "resend";
import { MongoClient } from "mongodb";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM   = "ShotByPascual <noreply@shotbypascual.com>";
const OWNER  = "gabepmedia@gmail.com";

// These should match your environment variables
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB  = process.env.MONGODB_DB;

// We'll cache the MongoClient and DB between function invocations
let cachedClient = null;
let cachedDb     = null;

// Utility to connect (or reuse) MongoDB connection
async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }
  // Create a new MongoClient
  const client = new MongoClient(MONGODB_URI, {
    useNewUrlParser:    true,
    useUnifiedTopology: true,
  });
  await client.connect();
  const db = client.db(MONGODB_DB);

  // Ensure TTL index on 'createdAt' in 'ip_rates' collection
  // This index makes documents expire (auto‑delete) 30 days after 'createdAt'.
  await db.collection("ip_rates").createIndex(
    { createdAt: 1 },
    { expireAfterSeconds: 30 * 24 * 60 * 60 } // 30 days in seconds
  );

  cachedClient = client;
  cachedDb     = db;
  return { client, db };
}

export default async function handler(req, res) {
  // 1) Allow a quick GET check if you want:
  if (req.method === "GET") {
    return res.status(200).json({ message: "Contact API is running." });
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // 2) Connect to MongoDB
  let db;
  try {
    ({ db } = await connectToDatabase());
  } catch (err) {
    console.error("MongoDB connection error:", err);
    return res.status(500).json({ error: "Database connection failed" });
  }

  // 3) RATE-LIMIT LOGIC
  // Determine client IP (behind proxies, Vercel sets x-forwarded-for)
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";
  const ipRatesCol = db.collection("ip_rates");
  const now = new Date();

  try {
    // Try to find an existing record for this IP
    const record = await ipRatesCol.findOne({ ip });

    if (!record) {
      // No record exists → insert a new one with count:1
      await ipRatesCol.insertOne({
        ip,
        count:     1,
        createdAt: now,
      });
    } else {
      // A record exists. Check if it's older than 30 days:
      const createdAt = record.createdAt;
      const elapsedMs = now - createdAt;

      if (elapsedMs >= 30 * 24 * 60 * 60 * 1000) {
        // Window expired → reset
        await ipRatesCol.updateOne(
          { ip },
          { $set: { count: 1, createdAt: now } }
        );
      } else {
        // Still within 30-day window:
        if (record.count >= 10) {
          return res.status(429).json({
            error: "Monthly message limit reached. Please try again next month.",
          });
        }
        // Under limit → increment
        await ipRatesCol.updateOne(
          { ip },
          { $inc: { count: 1 } }
        );
      }
    }
  } catch (err) {
    console.error("Rate‑limit (MongoDB) error:", err);
    // If Mongo throws for some reason, allow the request through:
    // (Optionally you could return a 503 here instead)
  }

  // 4) PARSE + VALIDATE REQUEST BODY
  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch (err) {
      return res.status(400).json({ error: "Invalid JSON" });
    }
  }

  const { name, email, message } = body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ error: "Missing fields" });
  }

  // 5) SEND EMAILS VIA Resend
  try {
    // 5a) Notify YOU (owner)
    await resend.emails.send({
      from:    FROM,
      to:      OWNER,
      subject: `New inquiry from ${name}`,
      text:    `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
    });

    // 5b) Auto‑reply to the sender with a stunning photographer-worthy design:
    await resend.emails.send({
      from:    FROM,
      to:      email,
      subject: "Thank you for reaching out to ShotByPascual",
      html: `
        <!DOCTYPE html>
        <html lang="en" xmlns="http://www.w3.org/1999/xhtml">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            <title>Thank You</title>
            <style type="text/css">
              @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@300;400;500&display=swap');
              @import url('https://fonts.cdnfonts.com/css/graphik');
              
              @media screen and (max-width: 600px) {
                .container {
                  width: 100% !important;
                }
                .content {
                  padding: 24px 20px !important;
                }
                .header-logo {
                  font-size: 22px !important;
                  letter-spacing: 3px !important;
                }
                .hero-title {
                  font-size: 28px !important;
                  line-height: 1.3 !important;
                }
                .button-wrapper {
                  display: block !important;
                  width: 100% !important;
                }
                .button {
                  display: block !important;
                  width: 100% !important;
                  margin: 8px 0 !important;
                }
                .spacer {
                  display: none !important;
                }
              }
            </style>
          </head>
          <body style="margin:0; padding:0; background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%);">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%);">
              <tr>
                <td align="center" style="padding: 40px 20px;">
                  <table
                    class="container"
                    border="0"
                    cellpadding="0"
                    cellspacing="0"
                    width="600"
                    style="width:600px; max-width:600px; background-color:#ffffff; box-shadow: 0 20px 60px rgba(0,0,0,0.5); border-radius: 0;"
                  >
                    <!-- ELEGANT HEADER -->
                    <tr>
                      <td
                        style="
                          background: linear-gradient(135deg, #0f1a24 0%, #1a2b3a 100%);
                          padding: 48px 40px;
                          text-align: center;
                          border-bottom: 3px solid #c9a961;
                        "
                      >
                        <h1
                          class="header-logo"
                          style="
                            font-family: 'Graphik', 'Inter', Arial, sans-serif;
                            font-size: 32px;
                            color: #ffffff;
                            font-weight: 700;
                            letter-spacing: 6px;
                            margin: 0;
                            text-transform: uppercase;
                          "
                        >ShotByPascual</h1>
                        <div style="
                          width: 60px;
                          height: 2px;
                          background-color: #c9a961;
                          margin: 20px auto 0;
                        "></div>
                      </td>
                    </tr>

                    <!-- HERO GREETING -->
                    <tr>
                      <td style="padding: 0; background-color: #f8f8f8;">
                        <table width="100%" border="0" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="padding: 48px 40px 32px; text-align: center; background-color: #f8f8f8;">
                              <h2
                                class="hero-title"
                                style="
                                  font-family: 'Playfair Display', Georgia, serif;
                                  font-size: 36px;
                                  color: #1a1a1a;
                                  font-weight: 400;
                                  margin: 0 0 16px 0;
                                  line-height: 1.4;
                                "
                              >Thank You, ${name}</h2>
                              <div style="
                                width: 40px;
                                height: 2px;
                                background-color: #c9a961;
                                margin: 0 auto;
                              "></div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- MAIN CONTENT -->
                    <tr>
                      <td class="content" style="padding: 40px 48px; font-family: 'Inter', Arial, sans-serif; color: #2c2c2c; background-color: #ffffff;">
                        <p style="font-size: 17px; line-height: 1.8; margin: 0 0 24px 0; color: #2c2c2c; font-weight: 300;">
                          Your message has been received and I truly appreciate you taking the time to reach out. Whether you're interested in booking a session, collaborating on a project, or simply connecting, I'm excited to hear from you.
                        </p>

                        <p style="font-size: 17px; line-height: 1.8; margin: 0 0 32px 0; color: #2c2c2c; font-weight: 300;">
                          I will personally review your inquiry and respond within <strong style="color: #0f1a24;">24–48 hours</strong>. In the meantime, I invite you to explore my work and vision.
                        </p>

                        <!-- DIVIDER -->
                        <div style="
                          width: 100%;
                          height: 1px;
                          background: linear-gradient(to right, transparent, #c9a961, transparent);
                          margin: 32px 0;
                        "></div>

                        <!-- CTA BUTTONS -->
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td align="center">
                              <table class="button-wrapper" border="0" cellpadding="0" cellspacing="0" style="display: inline-block;">
                                <tr>
                                  <td
                                    class="button"
                                    align="center"
                                    style="
                                      border: 2px solid #0f1a24;
                                      background-color: #0f1a24;
                                      transition: all 0.3s ease;
                                    "
                                  >
                                    <a
                                      href="https://shotbypascual.com/portfolio"
                                      target="_blank"
                                      style="
                                        display: inline-block;
                                        padding: 16px 36px;
                                        font-family: 'Inter', Arial, sans-serif;
                                        font-size: 14px;
                                        color: #ffffff;
                                        text-decoration: none;
                                        font-weight: 500;
                                        letter-spacing: 1.5px;
                                        text-transform: uppercase;
                                      "
                                    >View Portfolio</a>
                                  </td>
                                  <td class="spacer" width="16">&nbsp;</td>
                                  <td
                                    class="button"
                                    align="center"
                                    style="
                                      border: 2px solid #0f1a24;
                                      background-color: transparent;
                                      transition: all 0.3s ease;
                                    "
                                  >
                                    <a
                                      href="https://instagram.com/shotbypascual"
                                      target="_blank"
                                      style="
                                        display: inline-block;
                                        padding: 16px 36px;
                                        font-family: 'Inter', Arial, sans-serif;
                                        font-size: 14px;
                                        color: #0f1a24;
                                        text-decoration: none;
                                        font-weight: 500;
                                        letter-spacing: 1.5px;
                                        text-transform: uppercase;
                                      "
                                    >Instagram</a>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>

                        <!-- DIVIDER -->
                        <div style="
                          width: 100%;
                          height: 1px;
                          background: linear-gradient(to right, transparent, #c9a961, transparent);
                          margin: 36px 0 32px 0;
                        "></div>

                        <p style="font-size: 17px; line-height: 1.8; margin: 0 0 24px 0; color: #2c2c2c; font-weight: 300;">
                          I look forward to connecting with you and exploring how we can create something extraordinary together.
                        </p>

                        <p style="font-size: 16px; line-height: 1.8; margin: 0; color: #2c2c2c;">
                          Kind regards,
                        </p>
                        <p style="
                          font-family: 'Playfair Display', Georgia, serif;
                          font-size: 24px;
                          font-weight: 400;
                          color: #0f1a24;
                          margin: 12px 0 0 0;
                        ">Gabriel Pascual</p>
                        <p style="font-size: 14px; color: #666; margin: 4px 0 0 0; font-weight: 300; letter-spacing: 0.5px;">
                          Photographer
                        </p>
                      </td>
                    </tr>

                    <!-- ELEGANT FOOTER -->
                    <tr>
                      <td
                        style="
                          background: linear-gradient(135deg, #0f1a24 0%, #1a2b3a 100%);
                          padding: 32px 40px;
                          text-align: center;
                          border-top: 3px solid #c9a961;
                        "
                      >
                        <p
                          style="
                            font-family: 'Inter', Arial, sans-serif;
                            font-size: 12px;
                            color: rgba(255,255,255,0.7);
                            margin: 0 0 8px 0;
                            letter-spacing: 1px;
                            text-transform: uppercase;
                          "
                        >
                          ShotByPascual Photography
                        </p>
                        <a
                          href="https://shotbypascual.com"
                          target="_blank"
                          style="
                            font-family: 'Inter', Arial, sans-serif;
                            color: #c9a961;
                            text-decoration: none;
                            font-size: 13px;
                            font-weight: 400;
                          "
                        >shotbypascual.com</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("EMAIL ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
}