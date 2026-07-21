import { motion } from 'framer-motion';
import { FiDroplet, FiRepeat, FiCalendar, FiFileText } from 'react-icons/fi';
import { HiOutlineSparkles } from 'react-icons/hi2';
import ReminderTimePicker from './ReminderTimePicker';

const ICONS = [
  { key: 'dosage', icon: <FiDroplet size={12} />, color: '#60a5fa' },
  { key: 'frequency', icon: <FiRepeat size={12} />, color: '#2dd4bf' },
  { key: 'duration', icon: <FiCalendar size={12} />, color: '#fbbf24' },
  { key: 'notes', icon: <FiFileText size={12} />, color: '#a78bfa' },
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1, ease: [0.4, 0, 0.2, 1] }}
      id={`medicine-card-${index}`}
    >
      {/* Card header */}
      <div className="med-card-header">
        <div className="med-icon-wrap">
          <HiOutlineSparkles size={15} />
        </div>
        <div className="med-name">{name}</div>
        <div className="med-badge">#{index + 1}</div>
      </div>

      {/* Details as pill-style tags */}
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
