import axios from 'axios';

// Presigned URL endpoint (Lambda function URL)
const UPLOAD_API = import.meta.env.VITE_API_URL || 'https://gjmzphhsueywqdo4sx5gsuxwmy0vrsoz.lambda-url.ap-south-1.on.aws/';

// Prescription CRUD API (API Gateway)
const PRESCRIPTION_API = import.meta.env.VITE_PRESCRIPTION_API || 'https://YOUR_API_GATEWAY_ID.execute-api.ap-south-1.amazonaws.com/prescription';

/**
 * Step 1: Get a presigned URL from Lambda and upload the file to S3.
 * @param {File} file - The file to upload
 * @param {string} uploadId - Unique UUID generated on the frontend
 * @param {Function} onProgress - Upload progress callback (0-100)
 * Returns { uploadUrl, key, jsonKey } from the Lambda response.
 */
export async function uploadPrescription(file, uploadId, onProgress) {
  // 1a. Request presigned URL, passing the unique uploadId
  const { data } = await axios.post(UPLOAD_API, {
    fileName: file.name,
    fileType: file.type || 'application/octet-stream',
    uploadId,
  });

  const { uploadUrl, key } = data;

  // 1b. Upload file to S3 via presigned PUT
  await axios.put(uploadUrl, file, {
    headers: { 'Content-Type': file.type || 'application/octet-stream' },
    onUploadProgress: (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    },
  });

  return data; // { uploadUrl, key, jsonKey? }
}

/**
 * Step 2: Fetch the generated prescription JSON from S3 via the GET API.
 */
export async function fetchPrescription(jsonKey) {
  const { data } = await axios.get(PRESCRIPTION_API, {
    params: { key: jsonKey },
  });
  return data;
}

/**
 * Step 3: Poll the GET API until the JSON is ready.
 * - Retries every 2 seconds
 * - Max 30 attempts (~60 seconds)
 * - Cancellable via AbortController (for component unmount cleanup)
 * - 404 = not ready yet, keep polling
 * - 200 with data = stop polling, resolve
 *
 * @param {string} jsonKey - e.g. "results/<uploadId>.json"
 * @param {AbortSignal} [signal] - optional AbortController signal for cleanup
 * @returns {Promise<object>} - the prescription JSON
 */
export function pollForResult(jsonKey, signal) {
  const INTERVAL = 2000;   // 2 seconds
  const MAX_RETRIES = 30;  // 30 × 2s = 60 seconds max

  return new Promise((resolve, reject) => {
    let attempt = 0;
    let timeoutId = null;

    // If caller aborts (e.g. component unmount), stop polling
    if (signal) {
      signal.addEventListener('abort', () => {
        if (timeoutId) clearTimeout(timeoutId);
        reject(new Error('Polling cancelled'));
      });
    }

    const poll = async () => {
      // Stop if aborted
      if (signal?.aborted) return;

      attempt++;
      console.log(`🔄 Poll attempt ${attempt}/${MAX_RETRIES} for ${jsonKey}`);

      try {
        const data = await fetchPrescription(jsonKey);

        // 200 response with data — stop polling immediately
        if (data && typeof data === 'object' && Object.keys(data).length > 0) {
          console.log('✅ Prescription JSON received:', data);
          resolve(data);
          return;
        }
      } catch (err) {
        // 404 or network error = not ready yet, keep polling
        console.log(`⏳ Attempt ${attempt}: not ready yet (${err.response?.status || err.message})`);
      }

      // Max retries reached — timeout
      if (attempt >= MAX_RETRIES) {
        reject(new Error('Prescription processing timed out. Please try again.'));
        return;
      }

      // Wait 2 seconds, then retry
      timeoutId = setTimeout(poll, INTERVAL);
    };

    poll();
  });
}

/**
 * Step 4: Save updated prescription (with reminder times) back to S3.
 */
export async function savePrescription(jsonKey, updatedData) {
  const { data } = await axios.post(PRESCRIPTION_API, {
    key: jsonKey,
    data: updatedData,
  });
  return data;
}
