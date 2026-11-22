// Turn a code like "public_space" into "Public space"
// In step 7 this will be replaced by translations (en / ru / kk)
export const label = (code) =>
  code ? code.charAt(0).toUpperCase() + code.slice(1).replace(/_/g, ' ') : '-'
