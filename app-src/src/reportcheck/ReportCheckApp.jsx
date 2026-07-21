import { useEffect, useState } from 'react'
import { DIMENSIONS, deriveForDim, pathwayFor } from '../ttcmm'
import { STRINGS } from '../i18n'
import { extractPdfText } from './pdfText'
import { assessReport, saveReportCheck, fetchReportCheck } from './api'
import ReportCheckHeader from './components/ReportCheckHeader'
import EarlyAccessNotice from './components/EarlyAccessNotice'
import PdfDropzone from './components/PdfDropzone'
import CapabilityReview from './components/CapabilityReview'
import ReportResultsView from './components/ReportResultsView'

const DOC_TYPES = ['sustainability', 'digital', 'roadmap', 'general']

// upload (select file) -> extracting -> analyzing -> review (edit AI draft) -> results
export default function ReportCheckApp({ lang }) {
  const strings = STRINGS[lang]
  const [step, setStep] = useState('upload')
  const [companyName, setCompanyName] = useState('')
  const [docType, setDocType] = useState('general')
  const [pendingFile, setPendingFile] = useState(null)
  const [fileError, setFileError] = useState('')
  const [fileName, setFileName] = useState('')
  const [caps, setCaps] = useState({})
  const [evidence, setEvidence] = useState({})
  const [truncated, setTruncated] = useState(false)
  const [aiModel, setAiModel] = useState('')
  const [error, setError] = useState('')
  const [savedRecord, setSavedRecord] = useState(null)
  const [saving, setSaving] = useState(false)

  const code = new URLSearchParams(window.location.search).get('code')

  useEffect(() => {
    if (!code) return
    setStep('loading')
    fetchReportCheck(code)
      .then((row) => {
        if (!row) { setError(strings.rcInvalidCode); setStep('upload'); return }
        setCaps(row.caps || {})
        setEvidence(row.evidence || {})
        setCompanyName(row.company_name || '')
        setSavedRecord(row)
        setStep('results')
      })
      .catch((e) => { setError(String(e.message || e)); setStep('upload') })
  }, [code]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleFileSelected(file, isPdf) {
    if (!isPdf) { setFileError(strings.rcInvalidFileType); return }
    setFileError('')
    setPendingFile(file)
  }

  function handleRemoveFile() {
    setPendingFile(null)
    setFileError('')
  }

  async function runAnalysis() {
    if (!pendingFile) return
    setError('')
    setFileName(pendingFile.name)
    setStep('extracting')
    try {
      const { text } = await extractPdfText(pendingFile)
      setStep('analyzing')
      const result = await assessReport(text, lang, docType)
      setCaps(result.caps || {})
      setEvidence(result.evidence || {})
      setAiModel(result.model || '')
      setTruncated(!!result.truncated)
      setStep('review')
    } catch (e) {
      setError(String(e.message || e))
      setStep('upload')
    }
  }

  function setCap(id, v) {
    setCaps((c) => ({ ...c, [id]: v }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      const row = await saveReportCheck({ lang, companyName, sourceFilename: fileName, docType, caps, evidence, aiModel })
      setSavedRecord(row)
      const url = new URL(window.location.href)
      url.searchParams.set('code', row.code)
      window.history.replaceState({}, '', url)
    } catch (e) {
      setError(String(e.message || e))
    } finally {
      setSaving(false)
    }
  }

  function restart() {
    setStep('upload')
    setCaps({})
    setEvidence({})
    setPendingFile(null)
    setFileError('')
    setFileName('')
    setDocType('general')
    setSavedRecord(null)
    const url = new URL(window.location.href)
    url.searchParams.delete('code')
    window.history.replaceState({}, '', url)
  }

  const effByDim = {}
  const deepList = []
  DIMENSIONS.forEach((d) => {
    const { stage, complete } = deriveForDim(d, caps)
    effByDim[d.id] = stage
    if (complete) deepList.push(d.id)
  })
  const pathway = pathwayFor(caps, {})

  const labelStyle = {
    display: 'block', fontFamily: 'var(--ws-font-mono)', fontSize: 11, letterSpacing: '0.1em', color: 'var(--rc-text-muted)',
    textTransform: 'uppercase', marginBottom: 8,
  }

  return (
    <div className="ws-root rc-root">
      <ReportCheckHeader strings={strings} lang={lang} />

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '36px 20px 90px' }}>
        <EarlyAccessNotice strings={strings} />

        {(step === 'upload' || step === 'loading') && (
          <div className="rc-animate-in" style={{ textAlign: 'center' }}>
            <h1 style={{ fontFamily: 'var(--ws-font-head)', fontWeight: 700, fontSize: 'clamp(28px,4vw,38px)', letterSpacing: '-0.01em', margin: '0 0 12px', color: 'var(--rc-text-primary)' }}>{strings.rcHeroTitle}</h1>
            <p style={{ fontSize: 15.5, lineHeight: 1.6, color: 'var(--rc-text-muted)', maxWidth: '62ch', margin: '0 auto 28px' }}>{strings.rcHeroIntro}</p>

            <div style={{ background: 'var(--rc-surface)', border: '1px solid var(--rc-border)', borderRadius: 'var(--rc-radius-lg)', padding: 28, boxShadow: 'var(--rc-shadow-soft)', textAlign: 'left', maxWidth: 520, margin: '0 auto' }}>
              <label style={{ ...labelStyle, marginTop: 0 }}>{strings.rcCompanyNameLabel}</label>
              <input
                value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder={strings.rcCompanyNamePlaceholder}
                style={{ width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: 'var(--rc-radius-sm)', border: '1.5px solid var(--rc-border)', fontSize: 15, fontFamily: 'inherit', marginBottom: 18 }}
              />

              <label style={labelStyle}>{strings.rcDocTypeLabel}</label>
              <div role="radiogroup" aria-label={strings.rcDocTypeLabel} style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                {DOC_TYPES.map((t) => (
                  <label
                    key={t}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 20, cursor: 'pointer', fontSize: 12.5,
                      border: `1.5px solid ${docType === t ? 'var(--rc-brand)' : 'var(--rc-border)'}`,
                      color: docType === t ? 'var(--rc-brand-deep)' : 'var(--rc-text-muted)', fontWeight: docType === t ? 600 : 400,
                      background: docType === t ? 'var(--rc-brand-tint)' : 'var(--rc-surface)',
                    }}
                  >
                    <input type="radio" name="rc-doc-type" checked={docType === t} onChange={() => setDocType(t)} style={{ margin: 0, cursor: 'pointer' }} />
                    {strings[`rcDocType${t[0].toUpperCase()}${t.slice(1)}`]}
                  </label>
                ))}
              </div>

              <label style={labelStyle}>{strings.rcUploadLabel}</label>
              <PdfDropzone
                strings={strings} file={pendingFile} onFileSelected={handleFileSelected} onRemove={handleRemoveFile}
                error={fileError} disabled={step === 'loading'}
              />

              {error && <p role="alert" style={{ color: 'var(--rc-negative)', fontSize: 13, marginTop: 14 }}>{error}</p>}

              <button
                onClick={runAnalysis} disabled={!pendingFile || step === 'loading'}
                style={{
                  marginTop: 20, width: '100%', padding: '14px 22px', border: 'none', borderRadius: 'var(--rc-radius-sm)',
                  background: pendingFile ? 'var(--rc-brand)' : 'var(--rc-surface-muted)', color: pendingFile ? '#fff' : 'var(--rc-text-muted)',
                  fontFamily: 'var(--ws-font-head)', fontWeight: 600, fontSize: 15, cursor: pendingFile ? 'pointer' : 'not-allowed', transition: 'background 140ms',
                }}
              >
                {strings.rcAnalyzeStart}
              </button>
            </div>
          </div>
        )}

        {(step === 'extracting' || step === 'analyzing') && (
          <div className="rc-animate-in" style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ fontSize: 15, color: 'var(--rc-text-muted)' }}>
              {step === 'extracting' ? strings.rcExtracting : strings.rcAnalyzing}
            </p>
          </div>
        )}

        {step === 'review' && (
          <div className="rc-animate-in">
            <h2 style={{ fontFamily: 'var(--ws-font-head)', fontWeight: 700, fontSize: 'clamp(22px,3.4vw,28px)', margin: '0 0 8px', color: 'var(--rc-text-primary)' }}>{strings.rcReviewTitle}</h2>
            <p style={{ fontSize: 14.5, lineHeight: 1.6, color: 'var(--rc-text-muted)', maxWidth: '70ch', margin: '0 0 8px' }}>{strings.rcReviewIntro}</p>
            {fileName && <p style={{ fontSize: 12.5, color: 'var(--rc-text-muted)', margin: '0 0 4px' }}>{strings.rcSourceLabel}: {fileName}</p>}
            {truncated && <p style={{ fontSize: 12.5, color: 'var(--rc-negative)', margin: '0 0 20px' }}>{strings.rcTruncatedNote}</p>}

            <CapabilityReview strings={strings} lang={lang} caps={caps} evidence={evidence} onSetCap={setCap} />

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
              <button
                onClick={() => setStep('results')}
                style={{ padding: '13px 26px', border: 'none', borderRadius: 'var(--rc-radius-sm)', background: 'var(--rc-brand)', color: '#fff', fontFamily: 'var(--ws-font-head)', fontWeight: 600, fontSize: 14.5 }}
              >
                {strings.rcConfirmButton}
              </button>
              <button
                onClick={restart}
                style={{ padding: '13px 22px', border: '1px solid var(--rc-border)', borderRadius: 'var(--rc-radius-sm)', background: '#fff', color: 'var(--rc-text-primary)', fontFamily: 'var(--ws-font-head)', fontWeight: 600, fontSize: 14 }}
              >
                {strings.rcStartOver}
              </button>
            </div>
          </div>
        )}

        {step === 'results' && (
          <div className="rc-animate-in">
            <ReportResultsView
              strings={strings} lang={lang} dims={DIMENSIONS} vals={DIMENSIONS.map((d) => effByDim[d.id])}
              isDeepList={deepList} capsByCapId={caps} evidence={evidence} pathway={pathway}
              companyName={companyName} aiModel={aiModel} truncated={truncated}
              savedRecord={savedRecord} saving={saving} onSave={handleSave}
              onEditAnswers={() => setStep('review')} onPrint={() => window.print()} onRestart={restart}
            />
          </div>
        )}
      </div>
    </div>
  )
}
