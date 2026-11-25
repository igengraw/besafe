// Approximate district centres for Almaty. Reports never store an exact point:
// the matching centre is sent to the database, which shifts it by 100-300 m.
export const CITY_CENTER = [43.238, 76.945]

export const DISTRICTS = [
  { id: 'almaly', name: 'Almaly', note: 'Centre, Panfilov and Abay', center: [43.238, 76.945] },
  { id: 'bostandyk', name: 'Bostandyk', note: 'Kok-Tobe, city centre south', center: [43.220, 76.930] },
  { id: 'auezov', name: 'Auezov', note: 'West side, Tole bi', center: [43.240, 76.850] },
  { id: 'nauryzbay', name: 'Nauryzbay', note: 'North-west outskirts', center: [43.180, 76.800] },
  { id: 'medeu', name: 'Medeu', note: 'South-east, mountains', center: [43.165, 77.060] },
  { id: 'zhetysu', name: 'Zhetysu', note: 'East side, airports road', center: [43.270, 77.020] },
  { id: 'turksib', name: 'Turksib', note: 'North, railway areas', center: [43.320, 76.950] },
  { id: 'alatau', name: 'Alatau', note: 'Far north-east', center: [43.350, 77.080] },
]

export const NOT_SURE = {
  id: 'not_sure',
  name: 'Not sure',
  note: 'We will use the city centre',
  center: CITY_CENTER,
}

export const AREAS = [...DISTRICTS, NOT_SURE]

export function areaById(id) {
  return AREAS.find((area) => area.id === id) ?? null
}

// Squared distance is enough to pick the closest district. Longitude degrees
// are shorter than latitude degrees at the latitude of Almaty.
export function nearestDistrict(lat, lng) {
  let best = DISTRICTS[0]
  let bestDistance = Infinity

  for (const district of DISTRICTS) {
    const dLat = district.center[0] - lat
    const dLng = (district.center[1] - lng) * 0.73
    const distance = dLat * dLat + dLng * dLng
    if (distance < bestDistance) {
      bestDistance = distance
      best = district
    }
  }

  return best
}
