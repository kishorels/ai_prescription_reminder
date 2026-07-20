import { FiClock, FiSunrise, FiSun, FiMoon } from 'react-icons/fi';

/**
 * Parse a medicine's frequency string to determine how many time slots to show.
 * Returns an array of { key, label, icon, defaultTime } entries.
 */
function getTimeSlots(frequency) {
  const freq = (frequency || '').toLowerCase();

  if (/thrice|three times|3\s*times/i.test(freq)) {
    return [
      { key: 'morning', label: 'Morning', icon: <FiSunrise size={12} />, defaultTime: '08:00' },
      { key: 'afternoon', label: 'Afternoon', icon: <FiSun size={12} />, defaultTime: '14:00' },
      { key: 'night', label: 'Night', icon: <FiMoon size={12} />, defaultTime: '20:00' },
    ];
  }

  if (/twice|two times|2\s*times|bid/i.test(freq)) {
    return [
      { key: 'morning', label: 'Morning', icon: <FiSunrise size={12} />, defaultTime: '08:00' },
      { key: 'night', label: 'Night', icon: <FiMoon size={12} />, defaultTime: '20:00' },
    ];
  }

  if (/four|4\s*times|qid/i.test(freq)) {
    return [
      { key: 'morning', label: 'Morning', icon: <FiSunrise size={12} />, defaultTime: '06:00' },
      { key: 'afternoon', label: 'Afternoon', icon: <FiSun size={12} />, defaultTime: '12:00' },
      { key: 'evening', label: 'Evening', icon: <FiSun size={12} />, defaultTime: '18:00' },
      { key: 'night', label: 'Night', icon: <FiMoon size={12} />, defaultTime: '23:00' },
    ];
  }

  // Default: once daily
  return [
    { key: 'morning', label: 'Morning', icon: <FiSunrise size={12} />, defaultTime: '08:00' },
  ];
}

export default function ReminderTimePicker({ schedule, frequency, onChange, id }) {
  const slots = getTimeSlots(frequency);

  const handleSlotChange = (slotKey, time) => {
    const updated = { ...(schedule || {}) };
    updated[slotKey] = time;
    onChange(updated);
  };

  return (
    <div className="reminder-picker-multi" id={id}>
      <div className="reminder-header">
        <FiClock size={13} />
        <span>Reminder Schedule</span>
      </div>
      <div className="reminder-slots">
        {slots.map((slot) => (
          <div className="reminder-slot" key={slot.key}>
            <label className="slot-label">
              {slot.icon}
              <span>{slot.label}</span>
            </label>
            <input
              type="time"
              className="time-input"
              value={schedule?.[slot.key] || ''}
              placeholder={slot.defaultTime}
              onChange={(e) => handleSlotChange(slot.key, e.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
