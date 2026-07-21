import mammoth from 'mammoth'
import { extractPdfText } from './pdfText'

const SUPPORTED_EXTENSIONS = ['pdf', 'docx', 'txt']
const SUPPORTED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]

function extensionOf(file) {
  const match = /\.([a-z0-9]+)$/i.exec(file?.name || '')
  return match ? match[1].toLowerCase() : ''
}

export function isSupportedDocument(file) {
  if (!file) return false
  return SUPPORTED_EXTENSIONS.includes(extensionOf(file)) || SUPPORTED_MIME_TYPES.includes(file.type)
}

// Client-side only — the file itself never leaves the browser, only the
// extracted text is sent (to the Edge Function, then the model).
export async function extractDocumentText(file) {
  const ext = extensionOf(file)

  if (ext === 'docx' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const arrayBuffer = await file.arrayBuffer()
    const { value } = await mammoth.extractRawText({ arrayBuffer })
    return { text: value }
  }

  if (ext === 'txt' || file.type === 'text/plain') {
    return { text: await file.text() }
  }

  return extractPdfText(file)
}
