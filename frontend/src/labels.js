// Turn a database code like "public_space" into "Public space".
// Step 7 will replace this with translations (en / ru / kk).
const OVERRIDES = {
  not_sure: 'Not sure',
  drink_spiking: 'Drink spiking',
  sexual_violence: 'Sexual violence',
  school_university: 'School / university',
  leisure_nightlife: 'Leisure / nightlife',
  abuse_of_power: 'Abuse of power',
  personal_conflict: 'Personal conflict',
  none: 'None',
  unsafe: 'Online',
}

export const label = (code) => {
  if (!code) return 'Not specified'
  if (OVERRIDES[code]) return OVERRIDES[code]
  return code.charAt(0).toUpperCase() + code.slice(1).replace(/_/g, ' ')
}

export const categoryLabel = (code) => {
  const titles = {
    harassment: 'Harassment',
    stalking: 'Following',
    physical: 'Unwanted contact',
    threat: 'Threats',
    emotional: 'Emotional pressure',
    drink_spiking: 'Drink spiking',
    sexual_violence: 'Sexual violence',
    unsafe: 'Online',
    other: 'Something else',
  }
  return titles[code] ?? label(code)
}
