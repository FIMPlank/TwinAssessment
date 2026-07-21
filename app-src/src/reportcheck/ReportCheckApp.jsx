import { useEffect, useState } from 'react'
import { DIMENSIONS, deriveForDim, pathwayFor } from '../ttcmm'
import { STRINGS } from '../i18n'
import { extractPdfText } from './pdfText'
import { assessReport, saveReportCheck, fetchReportCheck } from './api'
import ReportCheckHeader from './components/ReportCheckHeader'
import WipBanner from './components/WipBanner'
import CapabilityReview from './components/CapabilityReview'
import ResultsView from '../components/ResultsView'

// upload -> extracting -> analyzing -> review -> results
export default function ReportCheckApp({ lang }) {
  const strings = STRINGS[lang]
  const [step, setStep] = useState('upload')
  const [companyName, setCompanyName] = useState('')
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

  async function handleFile(file) {
    if (!file) return
    setError('')
    setFileName(file.name)
    setStep('extracting')
    try {
      const { text } = await extractPdfText(file)
      setStep('analyzing')
      const result = await assessReport(text, lang)
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
      const row = await saveReportCheck({ lang, companyName, sourceFilename: fileName, caps, evidence, aiModel })
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
    setFileName('')
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

  return (
    <div className="ws-root">
      <ReportCheckHeader strings={strings} lang={lang} />

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '36px 20px 90px' }}>
        {step !== 'results' && <WipBanner strings={strings} />}

        {(step === 'upload' || step === 'loading') && (
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontFamily: 'var(--ws-font-head)', fontWeight: 700, fontSize: 'clamp(26px,4vw,34px)', margin: '0 0 12px' }}>{strings.rcHeroTitle}</h1>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--ws-text-muted)', maxWidth: '62ch', margin: '0 auto 28px' }}>{strings.rcHeroIntro}</p>

            <div style={{ background: 'var(--ws-surface)', borderRadius: 'var(--ws-radius-lg)', padding: 28, boxShadow: 'var(--ws-shadow-soft)', textAlign: 'left', maxWidth: 480, margin: '0 auto' }}>
              <label style={{ display: 'block', fontFamily: 'var(--ws-font-mono)', fontSize: 11, letterSpacing: '0.1em', color: 'var(--ws-text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>
                {strings.rcCompanyNameLabel}
              </label>
              <input
                value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder={strings.rcCompanyNamePlaceholder}
                style={{ width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: 'var(--ws-radius-sm)', border: '1.5px solid var(--ws-border-soft)', fontSize: 15, fontFamily: 'inherit', marginBottom: 18 }}
              />

              <label style={{ display: 'block', fontFamily: 'var(--ws-font-mono)', fontSize: 11, letterSpacing: '0.1em', color: 'var(--ws-text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>
                {strings.rcUploadLabel}
              </label>
              <input
                type="file" accept="application/pdf" disabled={step === 'loading'}
                onChange={(e) => handleFile(e.target.files?.[0])}
                style={{ width: '100%', fontSize: 13.5 }}
              />
              <p style={{ fontSize: 12, color: 'var(--ws-text-muted)', marginTop: 10 }}>{strings.rcUploadHint}</p>

              {error && <p style={{ color: '#B3432F', fontSize: 13, marginTop: 14 }}>{error}</p>}
            </div>
          </div>
        )}

        {(step === 'extracting' || step === 'analyzing') && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ fontSize: 15, color: 'var(--ws-text-muted)' }}>
              {step === 'extracting' ? strings.rcExtracting : strings.rcAnalyzing}
            </p>
          </div>
        )}

        {step === 'review' && (
          <div>
            <h2 style={{ fontFamily: 'var(--ws-font-head)', fontWeight: 700, fontSize: 'clamp(22px,3.4vw,28px)', margin: '0 0 8px' }}>{strings.rcReviewTitle}</h2>
            <p style={{ fontSize: 14.5, lineHeight: 1.6, color: 'var(--ws-text-muted)', maxWidth: '70ch', margin: '0 0 8px' }}>{strings.rcReviewIntro}</p>
            {fileName && <p style={{ fontSize: 12.5, color: 'var(--ws-text-muted)', margin: '0 0 4px' }}>{strings.rcSourceLabel}: {fileName}</p>}
            {truncated && <p style={{ fontSize: 12.5, color: '#B3432F', margin: '0 0 20px' }}>{strings.rcTruncatedNote}</p>}

            <CapabilityReview strings={strings} lang={lang} caps={caps} evidence={evidence} onSetCap={setCap} />

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
              <button
                onClick={() => setStep('results')}
                style={{ padding: '13px 26px', border: 'none', borderRadius: 'var(--ws-radius-sm)', background: 'var(--ws-brand)', color: '#fff', fontFamily: 'var(--ws-font-head)', fontWeight: 600, fontSize: 14.5 }}
              >
                {strings.rcConfirmButton}
              </button>
              <button
                onClick={restart}
                style={{ padding: '13px 22px', border: '1px solid var(--ws-border-soft)', borderRadius: 'var(--ws-radius-sm)', background: '#fff', color: 'var(--ws-text-primary)', fontFamily: 'var(--ws-font-head)', fontWeight: 600, fontSize: 14 }}
              >
                {strings.rcStartOver}
              </button>
            </div>
          </div>
        )}

        {step === 'results' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
              <span style={{ fontFamily: 'var(--ws-font-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6B5A2A', background: '#FFF7E6', border: '1px solid #EFDDA0', borderRadius: 20, padding: '5px 12px' }}>
                {strings.rcDraftBadge}
              </span>
              {companyName && <span style={{ fontSize: 13.5, fontWeight: 600 }}>{companyName}</span>}
            </div>

            {!savedRecord && (
              <div style={{ margin: '16px 0 8px', padding: '14px 16px', border: '1px solid var(--ws-border-soft)', borderRadius: 'var(--ws-radius-sm)', background: 'var(--ws-surface)', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <p style={{ fontSize: 13, color: 'var(--ws-text-muted)', margin: 0, flex: '1 1 260px' }}>{strings.rcSavePrompt}</p>
                <button
                  onClick={handleSave} disabled={saving}
                  style={{ padding: '10px 18px', border: 'none', borderRadius: 'var(--ws-radius-sm)', background: 'var(--ws-brand)', color: '#fff', fontFamily: 'var(--ws-font-head)', fontWeight: 600, fontSize: 13.5 }}
                >
                  {saving ? strings.rcSaving : strings.rcSaveLink}
                </button>
              </div>
            )}
            {savedRecord && (
              <p style={{ fontSize: 12.5, color: 'var(--ws-text-muted)', margin: '16px 0' }}>
                {strings.rcLinkSaved}: <code>{window.location.origin}{window.location.pathname}?code={savedRecord.code}</code>
              </p>
            )}

            <ResultsView
              strings={strings} lang={lang} dims={DIMENSIONS} vals={DIMENSIONS.map((d) => effByDim[d.id])}
              isDeepList={deepList} capsByCapId={caps} pathway={pathway}
              onEditAnswers={() => setStep('review')} onPrint={() => window.print()} onRestart={restart}
            />
          </div>
        )}
      </div>
    </div>
  )
}
