/**
 * Normalizes an Indian phone number and converts it to international format (e.g., 91xxxxxxxxxx).
 * 
 * @param phone The raw phone number string
 * @returns The normalized 12-digit number (starting with 91) or null if invalid
 */
export function normalizeIndianPhoneNumber(phone: string | null | undefined): string | null {
  if (!phone) return null

  // 1. Remove all spaces, dashes, brackets, plus signs, and any other non-digit characters
  const digitsOnly = phone.replace(/\D/g, '')

  // 2. Extract the base 10-digit number
  let baseNumber = ''

  if (digitsOnly.length === 10) {
    baseNumber = digitsOnly
  } else if (digitsOnly.length === 11 && digitsOnly.startsWith('0')) {
    baseNumber = digitsOnly.substring(1)
  } else if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
    baseNumber = digitsOnly.substring(2)
  } else if (digitsOnly.length > 12 && digitsOnly.startsWith('91')) {
    // Some formats might have country code + 0 + number, e.g. 9109876543210
    // Unlikely, but fallback to rejecting invalid lengths
    return null
  } else {
    return null
  }

  // 3. Validate that the base number is exactly 10 digits
  // and starts with a valid Indian mobile prefix (6, 7, 8, 9)
  if (!/^[6-9]\d{9}$/.test(baseNumber)) {
    return null
  }

  // 4. Return formatted number
  return `91${baseNumber}`
}

/**
 * Renders the personalized message template safely.
 *
 * Variables supported:
 *   {{full_name}}  – replaced with the contact's name (fallback: '(name missing)')
 *   {{category}}   – replaced with the contact's category (fallback: '')
 *
 * @param message The message template string
 * @param contact The contact object containing replacement values
 * @returns The rendered plain-text message — never executes template content as code
 */
export function renderMessage(
  message: string,
  contact: { full_name?: string | null; category?: string | null }
): string {
  if (!message) return ''

  // Safe literal string replacement — no eval, no Function constructor
  return message
    .replace(/\{\{full_name\}\}/gi, contact.full_name?.trim() || '(name missing)')
    .replace(/\{\{category\}\}/gi, contact.category?.trim() || '')
}

/**
 * Generates a secure click-to-chat WhatsApp URL.
 * 
 * @param phone The contact's raw phone number
 * @param message The message template
 * @param contact The contact object for personalization
 * @returns The wa.me URL, or null if the phone number is invalid
 */
export function generateWhatsAppLink(
  phone: string | null | undefined,
  message: string,
  contact: { full_name?: string | null; category?: string | null }
): string | null {
  const normalizedPhone = normalizeIndianPhoneNumber(phone)
  
  if (!normalizedPhone) {
    return null
  }

  const personalizedMessage = renderMessage(message, contact)
  const encodedMessage = encodeURIComponent(personalizedMessage)

  return `https://wa.me/${normalizedPhone}?text=${encodedMessage}`
}
