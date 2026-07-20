import WorkshopHeader from './WorkshopHeader'

// Scoped root (.ws-root carries all design tokens — see styles.css) so this
// visual system never leaks into the self-assessment app, which shares the
// same bundle chunk but uses no classNames at all.
export default function WorkshopShell({ strings, lang, title, children }) {
  return (
    <div className="ws-root">
      <WorkshopHeader strings={strings} lang={lang} title={title} />
      {children}
    </div>
  )
}
