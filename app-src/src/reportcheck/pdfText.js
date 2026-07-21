import * as pdfjsLib from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

const MAX_PAGES = 60 // bounds extraction time + the text sent to the model

// Client-side only — the file itself never leaves the browser, only the
// extracted text is sent (to the Edge Function, then the model).
export async function extractPdfText(file) {
  const buf = await file.arrayBuffer()
  const doc = await pdfjsLib.getDocument({ data: buf }).promise
  const pageCount = Math.min(doc.numPages, MAX_PAGES)
  const pages = []
  for (let i = 1; i <= pageCount; i++) {
    const page = await doc.getPage(i)
    const content = await page.getTextContent()
    const text = content.items.map((it) => it.str).join(' ')
    pages.push(`[p.${i}] ${text}`)
  }
  return { text: pages.join('\n\n'), totalPages: doc.numPages, extractedPages: pageCount }
}
