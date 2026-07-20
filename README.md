# 💊 AI Prescription Reminder & Extractor

An intelligent, cloud-native full-stack application that transforms physical medical prescriptions into automated, scheduled reminders. 

Users can seamlessly upload a picture or PDF of their prescription. The system leverages an event-driven serverless architecture, AI/LLMs (via n8n), and Firebase Cloud Messaging (FCM) to extract precise medication details (dosage, frequency, duration) and automatically schedule highly reliable push notifications to remind users to take their medicine on time.

---

## 🚀 The Problem & The Solution

**The Problem:** Managing multiple prescriptions can be overwhelming. Patients often forget what time to take their medicine, confusing instructions like "Twice daily" or "After food."
**The Solution:** An automated system that requires zero manual data entry. Upload the prescription once, and the AI handles the data extraction, translates medical jargon into exact time slots (e.g., Morning 08:00, Night 20:00), and sends background notifications directly to the user's device.

---

## ✨ Key Features & Technical Highlights

- **Smart Document AI Extraction:** Built an automated pipeline using n8n and Large Language Models (LLMs) to perform accurate OCR and semantic data extraction from medical documents.
- **Event-Driven Cloud Architecture:** Utilized AWS S3 for secure storage, which instantly triggers background AI workflows (via webhooks) as soon as a document is uploaded.
- **Automated Scheduling Engine:** Engineered a specialized Node.js AWS Lambda function triggered by Amazon EventBridge every minute to process time-sensitive schedules.
- **Real-Time Push Notifications:** Implemented Firebase Cloud Messaging (FCM) and custom Service Workers to deliver background push notifications across devices.
- **Secure Presigned Uploads:** Bypassed traditional backend bottlenecks by generating secure, temporary AWS presigned URLs via API Gateway + Lambda, allowing the frontend to upload directly to S3.
- **Premium Glassmorphism UI:** Developed a highly responsive, modern, and accessible frontend using React, Tailwind-like utility CSS, and Framer Motion for micro-interactions and staggered animations.

---

## 🏗️ Architecture & Data Flow

1. **Frontend (React + Vite):** 
   - User uploads a prescription image/PDF.
   - Frontend requests a secure AWS Presigned URL via API Gateway -> Lambda.
   - File is directly uploaded to AWS S3.
2. **AI Processing (n8n Workflow Automation):**
   - S3 triggers an event to an n8n webhook.
   - n8n utilizes an LLM to read the document and extract structured medical JSON (Medicines, Dosage, Frequency, Notes).
   - n8n saves the extracted structured JSON back into the S3 `results/` directory.
3. **Frontend Polling & Syncing:**
   - The React app polls the S3 `results/` path.
   - Upon completion, the user verifies the AI-generated schedule.
   - The app requests browser Notification Permissions and fetches an FCM Token.
   - The finalized schedule + FCM Token is written back to S3.
4. **Cron-Based Reminders (AWS Lambda + EventBridge):**
   - An AWS EventBridge Cron rule triggers a Node.js Lambda function every minute.
   - The Lambda scans the S3 `results/` folder, cross-referencing user schedules with the current IST time.
   - For any exact matches, the Lambda uses the Firebase Admin SDK to push an immediate notification to the user's FCM token.

---

## 💻 Comprehensive Tech Stack

### Frontend
- **React.js (Vite):** Fast, component-driven UI architecture.
- **Framer Motion:** Complex staggered mounting animations and layout transitions.
- **Vanilla CSS / Custom Tokens:** Premium Glassmorphism design system, responsive CSS Grid/Flexbox layouts.
- **Axios:** Asynchronous API data fetching and polling.

### Backend & Cloud Infrastructure (AWS)
- **AWS S3:** Primary object storage for prescriptions and structured JSON data.
- **AWS Lambda (Node.js):** Serverless computing for generating presigned URLs and running the Cron reminder engine.
- **Amazon API Gateway:** Exposing Lambda functions to the frontend securely.
- **Amazon EventBridge:** Minute-by-minute Cron triggers for the notification engine.

### AI & Automation
- **n8n:** Node-based workflow automation orchestrating the AI extraction pipeline.
- **LLMs:** Handling OCR and semantic understanding of medical texts.

### Notifications & Service Workers
- **Firebase Cloud Messaging (FCM):** Delivering real-time push payloads.
- **Firebase Admin SDK:** Server-side notification dispatching inside AWS Lambda.
- **Service Workers:** Handling background notification rendering when the browser app is closed.

---

## 🛠️ Local Setup Instructions

### 1. Frontend Setup
1. Clone the repository.
2. Run `npm install`.
3. Create a `.env` file based on `.env.example` and fill in your AWS API URLs and Firebase config.
4. Run `npm run dev` to start the frontend.
5. *(Ensure `public/firebase-messaging-sw.js` is configured with your Firebase credentials).*

### 2. Reminder Lambda Engine Setup
1. Navigate to `reminder-lambda/`.
2. Run `npm install` (Installs AWS SDK v3 and Firebase Admin).
3. Place your Firebase Service Account JSON file in the directory as `serviceAccount.json`.
4. Zip the contents and deploy to an AWS Lambda function (Node 20.x).
5. Set `BUCKET_NAME` as an Environment Variable in Lambda.
6. Attach an EventBridge rule `cron(* * * * ? *)` to execute the Lambda every minute.

### 3. n8n AI Workflow
1. The raw n8n workflow configuration is located in the `n8n-workflow/` folder.
2. Import `ai_prescription_reminder.json` into your self-hosted or cloud n8n workspace.
3. Configure your specific AWS credentials and LLM nodes inside the n8n UI.

---
*Developed by Kishore | Showcasing advanced Cloud Architecture, AI Automation, and Modern Frontend Engineering.*