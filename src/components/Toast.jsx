import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiAlertTriangle, FiX } from 'react-icons/fi';

/**
 * Toast notification component.
 * @param {{ visible: boolean, type: 'success'|'error', message: string, onClose: Function }} props
 */
export default function Toast({ visible, type = 'success', message, onClose }) {
  const isSuccess = type === 'success';

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={`toast toast-${type}`}
          initial={{ opacity: 0, y: -40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.95 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          id="toast-notification"
        >
          <div className="toast-icon">
            {isSuccess ? <FiCheckCircle size={18} /> : <FiAlertTriangle size={18} />}
          </div>
          <div className="toast-message">{message}</div>
          <button className="toast-close" onClick={onClose} aria-label="Close">
            <FiX size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
