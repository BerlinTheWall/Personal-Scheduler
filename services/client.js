import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api'
})
const unwrap = (promise) => promise.then(r => r.data.data)

// Events
export const getEvents      = ()        => unwrap(api.get('/events'))
export const createEvent    = (data)    => unwrap(api.post('/events', data))
export const updateEvent    = (id, d)   => unwrap(api.put(`/events/${id}`, d))
export const deleteEvent    = (id)      => api.delete(`/events/${id}`)

// Workouts
export const getWorkouts    = ()        => unwrap(api.get('/workouts'))
export const createWorkout  = (data)    => unwrap(api.post('/workouts', data))
export const addExercise    = (wid, d)  => unwrap(api.post(`/workouts/${wid}/exercises`, d))
export const deleteWorkout  = (id)      => api.delete(`/workouts/${id}`)

// Transactions
export const getTransactions  = ()      => unwrap(api.get('/transactions'))
export const createTransaction= (data)  => unwrap(api.post('/transactions', data))
export const updateTransaction= (id,d)  => unwrap(api.put(`/transactions/${id}`, d))
export const deleteTransaction= (id)    => api.delete(`/transactions/${id}`)

// Groceries
export const getGroceries   = ()        => unwrap(api.get('/groceries'))
export const createGrocery  = (data)    => unwrap(api.post('/groceries', data))
export const patchGrocery   = (id, d)   => unwrap(api.patch(`/groceries/${id}`, d))
export const deleteGrocery  = (id)      => api.delete(`/groceries/${id}`)

// Habits
export const getHabits      = ()        => unwrap(api.get('/habits'))
export const createHabit    = (data)    => unwrap(api.post('/habits', data))
export const deleteHabit    = (id)      => api.delete(`/habits/${id}`)
export const toggleHabitLog = (id, date) => unwrap(api.post(`/habits/${id}/log`, { date }))

// Settings
export const getSettings    = ()        => unwrap(api.get('/settings'))
export const updateSetting  = (key, value) => unwrap(api.put(`/settings/${key}`, { value }))

// Import / Export
export const importExcel    = (file)    => {
  const fd = new FormData(); fd.append('file', file)
  return api.post('/import/excel', fd)
}
export const exportExcel    = ()        => {
  window.open('/api/export/excel', '_blank')
}