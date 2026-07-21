import { useEffect } from 'react';
import { FiShield, FiClock, FiCheck, FiZap } from 'react-icons/fi';
import { HiOutlineSparkles, HiOutlineCpuChip } from 'react-icons/hi2';
import { motion } from 'framer-motion';
import Dashboard from './components/Dashboard';
import { requestNotificationPermission } from './firebase';

const FEATURES = [
  { icon: <HiOutlineCpuChip />, title: 'AI Analysis', desc: 'Extract medicines instantly', color: 'blue' },
  { icon: <FiClock />, title: 'Smart Reminder', desc: 'Timely medicine reminders', color: 'teal' },
  { icon: <FiShield />, title: 'AWS Secure', desc: 'Data stored securely on AWS', color: 'amber' },
  { icon: <FiZap />, title: 'Fast Upload', desc: 'Upload in seconds', color: 'violet' },
];

const TECH = [
  { name: 'React', icon: '⚛️' },
  { name: 'AWS S3', icon: '☁️' },
  { name: 'AWS Lambda', icon: 'λ' },
  { name: 'n8n', icon: '⚙️' },
  { name: 'Gemini AI', icon: '✦' },
];

const AVATARS = [
  { label: 'KS', bg: 'linear-gradient(135deg,#667eea,#764ba2)' },
  { label: 'AR', bg: 'linear-gradient(135deg,#f093fb,#f5576c)' },
  { label: 'PD', bg: 'linear-gradient(135deg,#4facfe,#00f2fe)' },
  { label: 'MN', bg: 'linear-gradient(135deg,#43e97b,#38f9d7)' },
];

export default function App() {
  useEffect(() => {
    const getFCM = async () => {
      try {
        const token = await requestNotificationPermission();
        console.log("FCM Token:", token);
      } catch (e) {
        console.error(e);
      }
    };

    getFCM();
  }, []);

  return (
    <div className="app-shell">
      {/* Decorations */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      {/* Header */}
      <header className="app-header">
        <div className="logo">
          <div className="logo-mark"><FiShield size={15} /></div>
          <div>
            <div className="logo-name">AI MediCare</div>
            <div className="logo-sub">Your Health, Our Priority</div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="app-main">
        <div className="main-grid">
          {/* ── Left: Hero ── */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="hero-section"
          >
            <div className="pill-badge">
              <HiOutlineSparkles size={12} />
              AI Powered <span className="sep" /> Smart <span className="sep" /> Secure
            </div>

            <h1 className="hero-title">
              AI Prescription<br />
              <span className="accent">Reminder</span>
            </h1>

            <p className="hero-desc">
              Upload your doctor's prescription and let AI automatically extract medicines, schedule reminders and never miss a dose.
            </p>

            <div className="features-grid">
              {FEATURES.map((f) => (
                <div className="feat-card" key={f.title}>
                  <div className={`feat-dot ${f.color}`}>{f.icon}</div>
                  <div>
                    <div className="feat-label">{f.title}</div>
                    <div className="feat-sub">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="trust-row">
              <div className="trust-check"><FiCheck size={11} /></div>
              <div>
                <div className="trust-label">Trusted by 1000+ users</div>
                <div className="avatar-row">
                  {AVATARS.map((a, i) => (
                    <div className="avatar-circle" key={i} style={{ background: a.bg }}>{a.label}</div>
                  ))}
                  <div className="avatar-circle count-badge">1K+</div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* ── Right: Dashboard (Upload + Results) ── */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
          >
            <Dashboard />
          </motion.section>
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-text">Built with ❤️ using</div>
        <div className="tech-row">
          {TECH.map((t) => (
            <span className="tech-chip" key={t.name}>
              <span className="tech-chip-icon">{t.icon}</span>
              {t.name}
            </span>
          ))}
        </div>
      </footer>
    </div>
  );
}
