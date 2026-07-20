import { initializeApp, cert } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

import fs from "fs";

// ===============================
// Firebase Initialization
// ===============================
const serviceAccount = JSON.parse(
  fs.readFileSync("./serviceAccount.json", "utf8")
);

initializeApp({
  credential: cert(serviceAccount),
});

const messaging = getMessaging();

// ===============================
// AWS S3
// ===============================
const s3 = new S3Client({
  region: "ap-south-1",
});

const BUCKET = "ai-prescription-reminder";

// ===============================
// Get Current IST Time
// ===============================
function getCurrentISTTime() {
  return new Date().toLocaleTimeString("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

// ===============================
// Read JSON from S3
// ===============================
async function readJson(key) {
  const response = await s3.send(
    new GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })
  );

  const body = await response.Body.transformToString();
  return JSON.parse(body);
}
// ===============================
// List all JSON files in results/
// ===============================
async function getAllResultFiles() {
  const response = await s3.send(
    new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: "results/",
    })
  );

  if (!response.Contents) {
    return [];
  }

  return response.Contents.filter(
    (file) =>
      file.Key &&
      file.Key.endsWith(".json") &&
      file.Size > 0
  );
}

// ===============================
// Read all prescriptions
// ===============================
async function getAllPrescriptions() {
  const files = await getAllResultFiles();

  const prescriptions = [];

  for (const file of files) {
    try {
      const data = await readJson(file.Key);

      prescriptions.push({
        key: file.Key,
        data,
      });
    } catch (err) {
      console.log("Error reading:", file.Key, err.message);
    }
  }

  return prescriptions;
}
// ===============================
// Check reminders and send notifications
// ===============================
async function checkReminders() {
  const currentTime = getCurrentISTTime();
  const prescriptions = await getAllPrescriptions();

  console.log(`Found ${prescriptions.length} prescription file(s)`);

  for (const prescription of prescriptions) {
    const data = prescription.data;

    if (!data.fcmToken) {
      console.log(`No FCM token in ${prescription.key}`);
      continue;
    }

    if (!Array.isArray(data.prescriptions)) {
      continue;
    }

    for (const medicine of data.prescriptions) {
      if (!Array.isArray(medicine.schedule)) {
        continue;
      }

      for (const reminderTime of medicine.schedule) {
        if (reminderTime !== currentTime) {
          continue;
        }

        console.log(
          `Sending reminder for ${medicine.name} at ${reminderTime}`
        );

        const message = {
          token: data.fcmToken,
          notification: {
            title: "💊 Medicine Reminder",
            body: `Time to take ${medicine.name}`,
          },
          data: {
            medicine: medicine.name,
            dosage: medicine.dosage || "",
            time: reminderTime,
          },
        };

        try {
          const response = await messaging.send(message);

          console.log("Notification sent:", response);
        } catch (err) {
          console.error(
            `Failed sending notification for ${medicine.name}:`,
            err.message
          );
        }
      }
    }
  }
}
// ===============================
// Lambda Handler
// ===============================
export const handler = async () => {
  try {
    console.log("==================================");
    console.log("Reminder Lambda Started");
    console.log("Current IST Time:", getCurrentISTTime());

    await checkReminders();

    console.log("Reminder Lambda Completed");

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: "Reminder check completed",
      }),
    };
  } catch (error) {
    console.error("Lambda Error:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message,
      }),
    };
  }
};