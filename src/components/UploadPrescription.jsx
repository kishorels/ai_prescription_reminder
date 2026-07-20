import { useState, useRef, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUploadCloud, FiFile, FiCheck, FiCheckCircle, FiShield, FiX } from 'react-icons/fi';
import { HiOutlineCpuChip } from 'react-icons/hi2';
import { uploadPrescription, pollForResult } from '../api';

export default function UploadPrescription({ onResult }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const inputRef = useRef(null);
  const abortRef = useRef(null);    // AbortController for polling cleanup
  const pollingRef = useRef(false); // Prevent multiple polling loops

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  const fmtSize = (b) => b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(1) + ' MB';

  const selectFile = (f) => {
    setFile(f); setProgress(0); setStatus('idle'); setErrorMsg('');
    if (f && f.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(f);
    } else { setPreview(null); }
  };

  const onFileInput = (e) => { const f = e.target.files?.[0]; if (f) selectFile(f); };
  const onDrop = (e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files?.[0]; if (f) selectFile(f); };

  const clearFile = () => {
    setFile(null); setPreview(null); setProgress(0); setStatus('idle'); setErrorMsg('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleUpload = useCallback(async () => {
    if (!file || pollingRef.current) return;

    // Cancel any previous polling
    if (abortRef.current) abortRef.current.abort();

    setStatus('uploading'); setProgress(0); setErrorMsg('');

    try {
      // Generate a unique ID for this upload
      const uploadId = uuidv4();
      console.log('🆔 Upload ID:', uploadId);

      const uploadData = await uploadPrescription(file, uploadId, (pct) => setProgress(pct));
      setProgress(100); setStatus('analyzing');

      // Construct jsonKey directly from our uploadId
      const jsonKey = `results/${uploadId}.json`;

      // Start polling with AbortController for cleanup
      const controller = new AbortController();
      abortRef.current = controller;
      pollingRef.current = true;

      console.log('🔍 Starting poll for:', jsonKey);
      const result = await pollForResult(jsonKey, controller.signal);

      pollingRef.current = false;
      setStatus('done');
      onResult({ jsonKey, data: result });
    } catch (err) {
      pollingRef.current = false;
      // Don't show error if polling was cancelled (e.g. unmount)
      if (err.message === 'Polling cancelled') return;
      console.error('Upload/analysis error:', err);
      setStatus('error');
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    }
  }, [file, onResult]);

  const isProcessing = status === 'uploading' || status === 'analyzing';

  return (
    <div className="upload-card" id="upload-prescription">
      <div className="uc-icon"><FiUploadCloud size={22} /></div>
      <div className="uc-title">Upload Prescription</div>
      <div className="uc-sub">Image or PDF &bull; AI-powered analysis</div>

      {status === 'done' ? (
        <motion.div className="success-state" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="success-icon-wrap"><FiCheckCircle size={40} /></div>
          <div className="success-title">Analysis Complete!</div>
          <div className="success-sub"><strong>{file?.name}</strong> has been processed by AI</div>
          <button className="upload-cta outline" type="button" onClick={clearFile}>Upload Another Prescription</button>
        </motion.div>
      ) : (
        <>
          <div className={`drop-area ${dragging ? 'dragging' : ''} ${isProcessing ? 'disabled-zone' : ''}`}
            onDrop={onDrop} onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)}
            onClick={() => !isProcessing && inputRef.current?.click()} id="drop-zone">
            {preview ? <div className="preview-thumb"><img src={preview} alt="Preview" /></div> : <FiUploadCloud size={26} className="drop-icon" />}
            <div className="drop-text">Drag & Drop your prescription</div>
            <div className="drop-hint">Supports JPG, PNG, PDF</div>
            <button type="button" className="choose-btn" onClick={(e) => { e.stopPropagation(); if (!isProcessing) inputRef.current?.click(); }} disabled={isProcessing}>Choose File</button>
            <input ref={inputRef} type="file" accept=".pdf,image/*" hidden onChange={onFileInput} />
          </div>

          <AnimatePresence>
            {file && (
              <motion.div className="file-row" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                <div className="file-thumb"><FiFile /></div>
                <div className="file-info"><div className="file-info-name">{file.name}</div><div className="file-info-size">{fmtSize(file.size)}</div></div>
                {!isProcessing && <button className="file-remove" onClick={clearFile} title="Remove"><FiX size={14} /></button>}
                {status === 'uploading' && progress === 100 && <motion.div className="file-done" initial={{ scale: 0 }} animate={{ scale: 1 }}><FiCheck /></motion.div>}
              </motion.div>
            )}
          </AnimatePresence>

          {status === 'uploading' && (
            <div className="prog-wrap">
              <div className="prog-head"><span className="prog-label">Uploading to S3...</span><span className="prog-pct">{progress}%</span></div>
              <div className="prog-track"><motion.div className="prog-fill" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.25 }} /></div>
            </div>
          )}

          {status === 'analyzing' && (
            <motion.div className="analyzing-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="analyzing-icon"><HiOutlineCpuChip size={20} /><div className="analyzing-pulse" /></div>
              <div className="analyzing-text"><strong>Gemini AI</strong> is analyzing your prescription...</div>
              <div className="analyzing-sub">This may take a few seconds</div>
              <div className="analyzing-dots"><span /><span /><span /></div>
            </motion.div>
          )}

          {status === 'error' && <motion.div className="error-msg" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>⚠️ {errorMsg}</motion.div>}

          {status !== 'analyzing' && (
            <button className={`upload-cta ${!file || isProcessing ? 'disabled' : ''}`} type="button" onClick={handleUpload} disabled={!file || isProcessing} id="upload-btn">
              <FiUploadCloud size={16} /> {status === 'uploading' ? 'Uploading...' : 'Upload & Analyze'}
            </button>
          )}
        </>
      )}

      <div className="secure-msg"><FiShield size={11} /> Your data is encrypted and secure</div>
    </div>
  );
}
