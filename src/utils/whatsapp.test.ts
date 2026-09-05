import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizeIndianPhoneNumber, generateWhatsAppLink } from './whatsapp'

test('normalizeIndianPhoneNumber', async (t) => {
  await t.test('handles valid 10-digit numbers', () => {
    assert.equal(normalizeIndianPhoneNumber('9876543210'), '919876543210')
    assert.equal(normalizeIndianPhoneNumber('6876543210'), '916876543210')
  })

  await t.test('handles numbers with spaces, dashes, brackets, and plus signs', () => {
    assert.equal(normalizeIndianPhoneNumber('+91 98765-43210'), '919876543210')
    assert.equal(normalizeIndianPhoneNumber('(098) 765-43210'), '919876543210')
    assert.equal(normalizeIndianPhoneNumber('+919876543210'), '919876543210')
  })

  await t.test('handles 11-digit numbers starting with 0', () => {
    assert.equal(normalizeIndianPhoneNumber('09876543210'), '919876543210')
  })

  await t.test('rejects invalid numbers', () => {
    // Starts with 5 (invalid mobile code in India)
    assert.equal(normalizeIndianPhoneNumber('5876543210'), null)
    // Too short
    assert.equal(normalizeIndianPhoneNumber('987654321'), null)
    // Too long
    assert.equal(normalizeIndianPhoneNumber('9198765432100'), null)
    // Null/undefined/empty
    assert.equal(normalizeIndianPhoneNumber(null), null)
    assert.equal(normalizeIndianPhoneNumber(''), null)
  })
})

test('generateWhatsAppLink and renderMessage', async (t) => {
  await t.test('generates correct link with personalization and encoding', () => {
    const link = generateWhatsAppLink(
      '9876543210',
      'Hello {{full_name}} ({{category}}), we have a new opportunity for you! 100% genuine.',
      { full_name: 'John Doe', category: 'Advocate' }
    )

    // Check base URL and phone
    assert.ok(link?.startsWith('https://wa.me/919876543210?text='))

    // Check that {{full_name}} and {{category}} were replaced
    const encodedText = link?.split('text=')[1]
    const decodedText = decodeURIComponent(encodedText!)

    assert.equal(decodedText, 'Hello John Doe (Advocate), we have a new opportunity for you! 100% genuine.')
  })

  await t.test('handles missing category gracefully', () => {
    const link = generateWhatsAppLink(
      '9876543210',
      'Hello {{full_name}} {{category}}',
      { full_name: 'John Doe' } // missing category
    )

    const encodedText = link?.split('text=')[1]
    const decodedText = decodeURIComponent(encodedText!)

    assert.equal(decodedText, 'Hello John Doe ')
  })

  await t.test('returns null for invalid phone', () => {
    const link = generateWhatsAppLink('invalid', 'Hello', { full_name: 'John' })
    assert.equal(link, null)
  })

  await t.test('returns null for null/empty phone', () => {
    assert.equal(generateWhatsAppLink(null, 'Hello', { full_name: 'X' }), null)
    assert.equal(generateWhatsAppLink('', 'Hello', { full_name: 'X' }), null)
    assert.equal(generateWhatsAppLink(undefined, 'Hello', { full_name: 'X' }), null)
  })
})

test('renderMessage edge cases', async (t) => {
  const { renderMessage } = await import('./whatsapp')

  await t.test('falls back to (name missing) when full_name is null', () => {
    const result = renderMessage('Hello {{full_name}}', { full_name: null })
    assert.equal(result, 'Hello (name missing)')
  })

  await t.test('falls back to (name missing) when full_name is empty string', () => {
    const result = renderMessage('Hello {{full_name}}', { full_name: '   ' })
    assert.equal(result, 'Hello (name missing)')
  })

  await t.test('handles emojis in message template', () => {
    const result = renderMessage('Hello {{full_name}} 🎉🏠 Great opportunity!', {
      full_name: 'Priya Sharma',
    })
    assert.equal(result, 'Hello Priya Sharma 🎉🏠 Great opportunity!')
  })

  await t.test('handles special characters (ampersand, percent, slash) in message', () => {
    const result = renderMessage('50% off & free delivery at https://example.com/a?b=c', {
      full_name: 'Raj',
    })
    assert.equal(result, '50% off & free delivery at https://example.com/a?b=c')
  })

  await t.test('encodes a long message (2000 chars) without crashing', () => {
    const longMsg = 'A'.repeat(2000)
    const link = generateWhatsAppLink('9876543210', longMsg, { full_name: 'Test' })
    assert.ok(link !== null)
    assert.ok(link!.startsWith('https://wa.me/919876543210?text='))
  })

  await t.test('does not execute template content as code (injection safety)', () => {
    // If {{full_name}} were evaluated as JS, this would throw/execute
    const maliciousName = 'x; process.exit(1)'
    const result = renderMessage('Hello {{full_name}}', { full_name: maliciousName })
    // It must be returned as a plain string — no evaluation
    assert.equal(result, 'Hello x; process.exit(1)')
  })

  await t.test('case-insensitive replacement of {{FULL_NAME}}', () => {
    const result = renderMessage('Hi {{FULL_NAME}} and {{Full_Name}}', {
      full_name: 'Anand',
    })
    assert.equal(result, 'Hi Anand and Anand')
  })
})
