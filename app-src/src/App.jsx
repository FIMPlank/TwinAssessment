import { DIMENSIONS } from './ttcmm'
import { STRINGS } from './i18n'
import { useAssessment } from './useAssessment'
import Header from './components/Header'
import Footer from './components/Footer'
import Intro from './components/Intro'
import DimensionView from './components/DimensionView'
import ResultsView from './components/ResultsView'
import SubmissionPanel from './components/SubmissionPanel'
import AdminLink from './components/AdminLink'
import LangToggle from './components/LangToggle'

export default function App({ lang }) {
  const strings = STRINGS[lang]
  const { state, deepOpen, derived, go, selectStage, setCap, toggleDeep, restart, setClientName } = useAssessment()

  const step = state.step
  const isIntro = step === 0
  const isResults = step === 7
  const isDimension = step >= 1 && step <= 6
  const clientSuffix = state.clientName ? `  ·  ${state.clientName}` : ''

  return (
    <div style={{ minHeight: '100vh', background: '#F2F4F3', color: '#17191C', fontFamily: "'IBM Plex Sans',sans-serif", WebkitFontSmoothing: 'antialiased' }}>
      <Header
        strings={strings} lang={lang} dims={DIMENSIONS} step={step} answers={state.answers}
        showStepper={!isIntro} onGoHome={() => go(0)} onGoStep={(s) => go(s)}
      />

      {isIntro && (
        <Intro
          strings={strings} lang={lang} dims={DIMENSIONS}
          clientName={state.clientName} onClientNameChange={setClientName} onStart={() => go(1)}
        />
      )}

      {isDimension && (() => {
        const idx = step - 1
        const dim = DIMENSIONS[idx]
        const sel = state.answers[dim.id] ?? 0
        return (
          <DimensionView
            strings={strings} lang={lang} dim={dim} idx={idx} sel={sel}
            caps={state.caps} deepOpen={!!deepOpen[dim.id]} isDeep={derived.deepList.includes(dim.id)}
            derivedStage={derived.effByDim[dim.id]}
            onSelectStage={selectStage} onSetCap={setCap} onToggleDeep={toggleDeep}
            onBack={() => (idx === 0 ? go(0) : go(step - 1))}
            onNext={() => (idx === 5 ? go(7) : go(step + 1))}
            clientSuffix={clientSuffix}
          />
        )
      })()}

      {isResults && (
        <ResultsView
          strings={strings} lang={lang} dims={DIMENSIONS}
          vals={DIMENSIONS.map((d) => derived.effByDim[d.id])}
          isDeepList={derived.deepList} capsByCapId={state.caps} pathway={derived.pathway}
          onEditAnswers={() => go(1)} onPrint={() => window.print()} onRestart={restart}
        />
      )}

      <Footer strings={strings} />

      <SubmissionPanel
        strings={strings} clientName={state.clientName} answers={state.answers}
        caps={state.caps} effByDim={derived.effByDim} deepList={derived.deepList}
      />
      <AdminLink strings={strings} />
      <LangToggle lang={lang} />
    </div>
  )
}
