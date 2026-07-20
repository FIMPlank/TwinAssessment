// Short join codes read aloud in a room — avoid visually ambiguous characters.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

export function generateCode(len = 6) {
  let out = ''
  for (let i = 0; i < len; i++) out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
  return out
}

export function generatePin(len = 4) {
  let out = ''
  for (let i = 0; i < len; i++) out += Math.floor(Math.random() * 10)
  return out
}
