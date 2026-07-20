import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import UploadPrescription from './UploadPrescription';
import MedicineList from './MedicineList';
import Toast from './Toast';
import { savePrescription, fetchPrescription } from '../api';
import { requestNotificationPermission } from '../firebase';

export default function Dashboard() {
  const [jsonKey, setJsonKey] = useState(null);
  const [prescriptionData, setPrescriptionData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [toast, setToast] = useState({ visible: false, type: 'success', message: '' });

  const showToast = (type, message) => {
    setToast({ visible: true, type, message });
    // Auto-dismiss after 4 seconds
    setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 4000);
  };

  // Called when upload + AI analysis completes
  const handleResult = useCallback((result) => {
    setJsonKey(result.jsonKey);
    setPrescriptionData(result.data);
    setSaveError('');
  }, []);

  // Extract the medicines array from data
  // Backend returns: { prescriptions: [...], uploadId: "..." }
  const getMedicines = (data) => {
    if (!data) return [];
    if (Array.isArray(data.prescriptions)) return data.prescriptions;
    if (Array.isArray(data.medicines)) return data.medicines;
    if (Array.isArray(data.medications)) return data.medications;
    if (data.prescription && Array.isArray(data.prescription.medicines)) return data.prescription.medicines;
    if (Array.isArray(data)) return data;
    return [];
  };

  // Extract uploadId from the prescription data or jsonKey
  const getUploadId = () => {
    if (prescriptionData?.uploadId) return prescriptionData.uploadId;
    // Fallback: parse from jsonKey (e.g. "results/<uploadId>.json")
    if (jsonKey) {
      const match = jsonKey.match(/results\/(.+)\.json/);
      if (match) return match[1];
    }
    return null;
  };

  // Save updated medicines (with reminder schedules)
  const handleSave = async (updatedMedicines) => {
    const uploadId = getUploadId();
    if (!uploadId) {
      showToast('error', 'Missing upload ID. Please re-upload the prescription.');
      return;
    }

    setSaving(true);
    setSaveError('');

    try {
      // Build the key from uploadId
      const key = `results/${uploadId}.json`;

      // Rebuild the full data object with updated medicines
   const fcmToken = await requestNotificationPermission();

const updatedData = {
  prescriptions: updatedMedicines,
  uploadId,
  fcmToken,
};
      // POST save — sends { key, data: updatedData }
      const response = await savePrescription(key, updatedData);

      if (response?.message) {
        showToast('success', response.message);
      } else {
        showToast('success', 'Reminder schedule saved successfully!');
      }

      // Re-fetch to confirm
      const refreshed = await fetchPrescription(key);
      setPrescriptionData(refreshed);
    } catch (err) {
      console.error('Save error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to save. Please try again.';
      setSaveError(errorMessage);
      showToast('error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const medicines = getMedicines(prescriptionData);

  return (
    <div className="dashboard" id="dashboard">
      {/* Toast notification */}
      <Toast
        visible={toast.visible}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
      />

      <div className="dashboard-inner">
        {/* Upload section — always visible */}
        <motion.div
          className="dashboard-upload"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <UploadPrescription onResult={handleResult} />
        </motion.div>

        {/* Medicine list — appears after analysis */}
        <AnimatePresence>
          {medicines.length > 0 && (
            <motion.div
              className="dashboard-results"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <MedicineList
                medicines={medicines}
                onSave={handleSave}
                saving={saving}
              />
              {saveError && (
                <motion.div className="error-msg save-error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  ⚠️ {saveError}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
