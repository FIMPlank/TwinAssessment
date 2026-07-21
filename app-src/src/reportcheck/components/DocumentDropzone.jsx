import { useRef, useState } from 'react'
import { isSupportedDocument } from '../documentText'

const ACCEPT = '.pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain'

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function DocIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <path d="M10 4h14l6 6v24a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" stroke="var(--rc-brand-deep)" strokeWidth="1.6" />
      <path d="M24 4v6h6" stroke="var(--rc-brand-deep)" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M13 22h14M13 27h10" stroke="var(--rc-brand-deep)" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <circle cx="9" cy="9" r="9" fill="var(--rc-brand)" />
      <path d="M5 9.5 7.5 12 13 6" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// Drag-and-drop document upload card (PDF, Word .docx, or plain text). File
// selection is a distinct step from starting analysis — this component only
// ever reports "here is a valid file" or "here is a validation problem";
// ReportCheckApp decides when to actually process it.
export default function DocumentDropzone({ strings, file, onFileSelected, onRemove, error, disabled }) {
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef(null)

  function validateAndEmit(f) {
    if (!f) return
    onFileSelected(f, isSupportedDocument(f))
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragActive(false)
    if (disabled) return
    const f = e.dataTransfer.files?.[0]
    validateAndEmit(f)
  }

  function handleDragOver(e) {
    e.preventDefault()
    if (!disabled) setDragActive(true)
  }

  function handleKeyDown(e) {
    if (disabled) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      inputRef.current?.click()
    }
  }

  if (file) {
    return (
      <div
        className="rc-animate-in"
        style={{
          border: '1.5px solid var(--rc-border)', borderRadius: 'var(--rc-radius-md)', background: 'var(--rc-surface)',
          padding: 'var(--rc-space-4)', display: 'flex', alignItems: 'center', gap: 'var(--rc-space-3)',
        }}
      >
        <span style={{ flex: 'none', width: 40, height: 40, borderRadius: 10, background: 'var(--rc-surface-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <DocIcon />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--rc-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</span>
            <CheckIcon />
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--rc-text-muted)', marginTop: 2 }}>{formatBytes(file.size)}</div>
        </div>
        <div style={{ flex: 'none', display: 'flex', gap: 8 }}>
          <button
            type="button" onClick={() => inputRef.current?.click()} disabled={disabled}
            style={{ padding: '8px 12px', border: '1px solid var(--rc-border)', borderRadius: 'var(--rc-radius-sm)', background: 'var(--rc-surface)', color: 'var(--rc-text-primary)', fontSize: 12.5, fontWeight: 600 }}
          >
            {strings.rcChangeFile}
          </button>
          <button
            type="button" onClick={onRemove} disabled={disabled} aria-label={strings.rcRemoveFile}
            style={{ padding: '8px 10px', border: '1px solid var(--rc-border)', borderRadius: 'var(--rc-radius-sm)', background: 'var(--rc-surface)', color: 'var(--rc-negative)', fontSize: 12.5, fontWeight: 600 }}
          >
            ✕
          </button>
        </div>
        <input ref={inputRef} type="file" accept={ACCEPT} onChange={(e) => validateAndEmit(e.target.files?.[0])} style={{ display: 'none' }} />
      </div>
    )
  }

  return (
    <div>
      <div
        className={`rc-dropzone${dragActive ? ' rc-drag-active' : ''}`}
        role="button" tabIndex={disabled ? -1 : 0} aria-disabled={disabled}
        aria-label={strings.rcUploadLabel}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={handleKeyDown}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={() => setDragActive(false)}
        style={{
          border: `1.5px dashed ${error ? 'var(--rc-negative)' : 'var(--rc-border)'}`, borderRadius: 'var(--rc-radius-md)',
          background: 'var(--rc-surface)', padding: 'var(--rc-space-6) var(--rc-space-4)', textAlign: 'center',
          cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.6 : 1,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}><DocIcon /></div>
        <div style={{ fontFamily: 'var(--ws-font-head)', fontWeight: 600, fontSize: 16, color: 'var(--rc-text-primary)' }}>{strings.rcDropTitle}</div>
        <p style={{ fontSize: 13.5, color: 'var(--rc-text-muted)', margin: '6px 0 4px' }}>{strings.rcDropSubtitle}</p>
        <span style={{ display: 'inline-block', fontSize: 11.5, letterSpacing: '0.04em', color: 'var(--rc-text-muted)', textTransform: 'uppercase' }}>{strings.rcDropMeta}</span>
        <div style={{ marginTop: 14 }}>
          <span style={{ display: 'inline-block', padding: '9px 16px', borderRadius: 'var(--rc-radius-sm)', border: `1.5px solid var(--rc-brand)`, color: 'var(--rc-brand-deep)', fontSize: 13, fontWeight: 600 }}>
            {strings.rcBrowseFiles}
          </span>
        </div>
      </div>
      <input ref={inputRef} type="file" accept={ACCEPT} onChange={(e) => validateAndEmit(e.target.files?.[0])} style={{ display: 'none' }} />
      {error && <p role="alert" style={{ color: 'var(--rc-negative)', fontSize: 13, marginTop: 10 }}>{error}</p>}
    </div>
  )
}
