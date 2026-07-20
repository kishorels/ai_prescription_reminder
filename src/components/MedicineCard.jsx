import { motion } from 'framer-motion';
import { FiDroplet, FiRepeat, FiCalendar, FiFileText } from 'react-icons/fi';
import { HiOutlineSparkles } from 'react-icons/hi2';
import ReminderTimePicker from './ReminderTimePicker';

const ICONS = [
  { key: 'dosage', icon: <FiDroplet size={13} />, color: '#3b82f6' },
  { key: 'frequency', icon: <FiRepeat size={13} />, color: '#14b8a6' },
  { key: 'duration', icon: <FiCalendar size={13} />, color: '#f59e0b' },
  { key: 'notes', icon: <FiFileText size={13} />, color: '#7c3aed' },
];

export default function MedicineCard({ medicine, index, onScheduleChange }) {
  const name = medicine.name || medicine.medicineName || medicine.medicine_name || 'Unknown Medicine';
  const dosage = medicine.dosage || medicine.dose || '—';
  const frequency = medicine.frequency || '—';
  const duration = medicine.duration || '—';
  const notes = medicine.notes || medicine.instructions || '—';
  const schedule = medicine.schedule || {};

  const details = [
    { label: 'Dosage', value: dosage, ...ICONS[0] },
    { label: 'Frequency', value: frequency, ...ICONS[1] },
    { label: 'Duration', value: duration, ...ICONS[2] },
    { label: 'Notes', value: notes, ...ICONS[3] },
  ];

  return (
    <motion.div
      className="med-card"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.08 }}
      id={`medicine-card-${index}`}
    >
      {/* Card header */}
      <div className="med-card-header">
        <div className="med-icon-wrap">
          <HiOutlineSparkles size={16} />
        </div>
        <div className="med-name">{name}</div>
        <div className="med-badge">#{index + 1}</div>
      </div>

      {/* Details grid */}
      <div className="med-details">
        {details.map((d) => (
          <div className="med-detail-item" key={d.key}>
            <div className="med-detail-icon" style={{ color: d.color }}>
              {d.icon}
            </div>
            <div>
              <div className="med-detail-label">{d.label}</div>
              <div className="med-detail-value">{d.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Reminder schedule picker */}
      <ReminderTimePicker
        id={`reminder-${index}`}
        schedule={schedule}
        frequency={frequency}
        onChange={(updatedSchedule) => onScheduleChange(index, updatedSchedule)}
      />
    </motion.div>
  );
}
