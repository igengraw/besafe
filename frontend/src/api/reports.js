import { supabase } from './supabaseClient'


export async function getApprovedReports() {
  const { data, error } = await supabase
    .from('reports')
    .select('id, lat, lng, category, who, context, time_of_day, incident_date')
    .eq('status', 'approved')
    .order('incident_date', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export async function createReport(report) {
  const { error } = await supabase.from('reports').insert(report)
  if (error) throw new Error(error.message)
}
