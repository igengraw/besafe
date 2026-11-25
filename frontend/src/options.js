// Labels and short explanations for the report wizard.
// `value` must match the check constraints in the reports table.

export const CATEGORY_OPTIONS = [
  { value: 'harassment', title: 'Harassment', note: 'Comments, shouting, unwanted attention' },
  { value: 'stalking', title: 'Following', note: 'On foot, by car or online' },
  { value: 'physical', title: 'Unwanted contact', note: 'Touching, blocking, physical force' },
  { value: 'threat', title: 'Threats', note: 'Intimidation or threats of harm' },
  { value: 'emotional', title: 'Emotional pressure', note: 'Control, humiliation, coercion' },
  { value: 'drink_spiking', title: 'Drink spiking', note: 'Drink spiked or you suspect it' },
  { value: 'sexual_violence', title: 'Sexual violence', note: 'Sexual violence or coercion' },
  { value: 'unsafe', title: 'Online', note: 'Messages, posts, online contact' },
  { value: 'other', title: 'Something else', note: 'Describe it in the next steps' },
]

export const CATEGORIES = CATEGORY_OPTIONS.map((option) => option.value)

// Four choices in the interface, two values in the database (plus "not set").
export const WHO_OPTIONS = [
  { id: 'stranger', value: 'unknown', title: 'Stranger', note: 'Someone you did not know' },
  { id: 'acquaintance', value: 'known', title: 'Acquaintance', note: 'Someone you know a little' },
  { id: 'classmate', value: 'known', title: 'Classmate or colleague', note: 'Study or work setting' },
  { id: 'private', value: null, title: 'Prefer not to say', note: 'You can skip this' },
]

export const TIME_OPTIONS = [
  { value: 'morning', title: 'Morning', note: '6:00 to 12:00' },
  { value: 'afternoon', title: 'Daytime', note: '12:00 to 18:00' },
  { value: 'evening', title: 'Evening', note: '18:00 to 23:00' },
  { value: 'night', title: 'Night', note: '23:00 to 6:00' },
]

export const DAY_OPTIONS = [
  { id: 'today', title: 'Today', offset: 0 },
  { id: 'yesterday', title: 'Yesterday', offset: 1 },
  { id: 'week', title: 'This week', offset: 3 },
  { id: 'earlier', title: 'Earlier', offset: 14 },
]

// Values used by the rest of the app (labels, statistics).
export const TIMES = TIME_OPTIONS.map((option) => option.value)
export const CONTEXTS = [
  'home',
  'public_space',
  'transport',
  'workplace',
  'school_university',
  'leisure_nightlife',
  'relationship',
  'online',
  'medical',
  'other',
]
export const MOTIVATIONS = [
  'misogyny',
  'queerphobia',
  'transphobia',
  'racism',
  'ableism',
  'ageism',
  'abuse_of_power',
  'personal_conflict',
  'none',
  'other',
]
export const WHO = ['known', 'unknown']
