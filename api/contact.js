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

// Example snippet inside your handler, where you send the auto‑reply:

// … after sending owner notification …

// 5b) Auto‑reply to the sender, using the responsive AWS‑style template:
await resend.emails.send({
  from:    FROM,
  to:      email,
  subject: "Thank you for reaching out to ShotByPascual!",
  html: `
    <!DOCTYPE html>
    <html lang="en" xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Thank You for Reaching Out</title>
        <style type="text/css">
          @media screen and (max-width: 600px) {
            .container {
              width: 100% !important; padding: 0 !important;
            }
            .content {
              padding: 16px !important;
            }
            .header-logo {
              font-size: 20px !important;
            }
            .button {
              width: 100% !important;
            }
          }
        </style>
      </head>
      <body style="margin:0; padding:0; background-color:#f4f4f4;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#f4f4f4">
          <tr>
            <td align="center">
              <table
                class="container"
                border="0"
                cellpadding="0"
                cellspacing="0"
                width="600"
                style="width:600px; max-width:600px; background-color:#ffffff;"
              >
                <!-- HEADER BAR -->
                <tr>
                  <td
                    style="
                      background-color: #0f1a24;
                      padding: 20px;
                      text-align: center;
                    "
                  >
                    <span
                      class="header-logo"
                      style="
                        font-family: Avenir, sans-serif;
                        font-size: 24px;
                        color: #ffffff;
                        font-weight: bold;
                      "
                    >SHOTBYPASCUAL</span>
                  </td>
                </tr>

                <!-- BODY CONTENT -->
                <tr>
                  <td class="content" style="padding: 32px; font-family: Arial, sans-serif; color: #0f1a24;">
                    <p style="font-size: 18px; margin: 0 0 16px 0;">
                      Hi <strong>${name}</strong>,
                    </p>

                    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 16px 0; color: #0f1a24;">
                      Thank you for reaching out! I have received your message and appreciate you taking the time to get in touch. I will review your inquiry and respond as soon as possible—usually within 24–48 hours.
                    </p>

                    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 24px 0; color: #0f1a24;">
                      In the meantime, feel free to explore my portfolio or follow me on social media:
                    </p>

                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td align="center">
                          <table border="0" cellpadding="0" cellspacing="0">
                            <tr>
                              <td
                                class="button"
                                align="center"
                                style="
                                  border-radius: 4px;
                                  background-color: #263745;
                                "
                              >
                                <a
                                  href="https://shotbypascual.com/portfolio"
                                  target="_blank"
                                  style="
                                    display: inline-block;
                                    padding: 12px 24px;
                                    font-family: Arial, sans-serif;
                                    font-size: 16px;
                                    color: #ffffff;
                                    text-decoration: none;
                                    font-weight: bold;
                                  "
                                >View Portfolio</a>
                              </td>
                              <td width="16">&nbsp;</td>
                              <td
                                class="button"
                                align="center"
                                style="
                                  border-radius: 4px;
                                  background-color: #263745;
                                "
                              >
                                <a
                                  href="https://instagram.com/shotbypascual"
                                  target="_blank"
                                  style="
                                    display: inline-block;
                                    padding: 12px 24px;
                                    font-family: Arial, sans-serif;
                                    font-size: 16px;
                                    color: #ffffff;
                                    text-decoration: none;
                                    font-weight: bold;
                                  "
                                >Instagram</a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <p style="font-size: 16px; line-height: 1.6; margin: 24px 0 0 0; color: #0f1a24;">
                      Again, thank you for your message. I look forward to connecting with you soon.
                    </p>

                    <p style="font-size: 16px; line-height: 1.6; margin: 16px 0 0 0;">
                      Kind regards,<br />
                      <strong>Gabriel Pascual</strong><br />
                    </p>
                  </td>
                </tr>

                <!-- FOOTER -->
                <tr>
                  <td
                    style="
                      background-color: #f4f4f4;
                      padding: 16px;
                      text-align: center;
                    "
                  >
                    <p
                      style="
                        font-family: Arial, sans-serif;
                        font-size: 12px;
                        color: #999999;
                        margin: 0;
                      "
                    >
                      ShotByPascual Photography • All rights reserved<br />
                      <a
                        href="https://shotbypascual.com"
                        target="_blank"
                        style="color: #0066cc; text-decoration: none;"
                      >shotbypascual.com</a>
                    </p>
                  </td>
                </tr>
              </table>
              <!-- End inner container -->
            </td>
          </tr>
        </table>
        <!-- End outer wrapper -->
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
