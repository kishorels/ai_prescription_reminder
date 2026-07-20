import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSave, FiCheckCircle } from 'react-icons/fi';
import MedicineCard from './MedicineCard';

export default function MedicineList({ medicines, onSave, saving }) {
  const [localMeds, setLocalMeds] = useState(medicines);
  const [saved, setSaved] = useState(false);

  // Keep local state in sync when parent provides new medicines
  // (e.g. after a re-fetch or new upload)
  useEffect(() => {
    if (!saving) {
      setLocalMeds(medicines);
    }
  }, [medicines, saving]);

  const handleScheduleChange = (index, schedule) => {
    setSaved(false);
    setLocalMeds((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], schedule };
      return updated;
    });
  };

  const handleSave = async () => {
    setSaved(false);
    await onSave(localMeds);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (!localMeds || localMeds.length === 0) {
    return (
      <div className="empty-meds">
        <p>No medicines found in this prescription.</p>
      </div>
    );
  }

  return (
    <div className="medicine-list" id="medicine-list">
      <div className="meds-header">
        <h2 className="meds-title">
          <span className="meds-title-icon">💊</span>
          Extracted Medicines
        </h2>
        <div className="meds-count">{localMeds.length} found</div>
      </div>

      <div className="meds-grid">
        {localMeds.map((med, i) => (
          <MedicineCard
            key={i}
            medicine={med}
            index={i}
            onScheduleChange={handleScheduleChange}
          />
        ))}
      </div>

      {/* Save button */}
      <motion.button
        className={`save-btn ${saving ? 'saving' : ''}`}
        onClick={handleSave}
        disabled={saving}
        whileTap={{ scale: 0.97 }}
        id="save-reminders-btn"
      >
        <AnimatePresence mode="wait">
          {saving ? (
            <motion.span key="saving" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="save-btn-inner">
              <span className="spinner" /> Saving...
            </motion.span>
          ) : saved ? (
            <motion.span key="saved" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="save-btn-inner">
              <FiCheckCircle size={16} /> Saved Successfully!
            </motion.span>
          ) : (
            <motion.span key="save" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="save-btn-inner">
              <FiSave size={16} /> Save Reminder Schedule
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
