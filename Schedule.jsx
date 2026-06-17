import { useState, useEffect } from 'react'
import { getEvents, createEvent, deleteEvent } from './services/client.js'
import { StatCard, SectionLabel, FormGroup, Field, DeleteBtn, AddPanel, PageHeader, EmptyState, Spinner } from './components/UI.jsx'
import { useToast } from './hooks/useToast'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const DAYS_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const TODAY_IDX = (new Date().getDay() + 6) % 7

const CAT_META = {
  work:     { color: 'var(--pur)',  bg: 'var(--purbg)',  label: 'Work' },
  health:   { color: 'var(--lime)', bg: 'var(--limebg)', label: 'Health' },
  personal: { color: 'var(--cya)', bg: 'var(--cyabg)',  label: 'Personal' },
  social:   { color: 'var(--ora)', bg: 'var(--orabg)',  label: 'Social' },
}

function getWeekDates() {
  const now = new Date(), mon = new Date(now)
  mon.setDate(now.getDate() - ((now.getDay() + 6) % 7))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mon); d.setDate(mon.getDate() + i); return d
  })
}

export default function SchedulePage() {
  const toast = useToast()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selDay, setSelDay] = useState(TODAY_IDX)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', day: TODAY_IDX, time: '09:00', cat: 'work' })
  const [saving, setSaving] = useState(false)

  const dates = getWeekDates()

  useEffect(() => {
    getEvents().then(setEvents).catch(() => toast('Failed to load events')).finally(() => setLoading(false))
  }, [])

  const todayEvts = events.filter(e => e.day === TODAY_IDX)
  const focusHrs  = events.filter(e => e.cat === 'work').length

  const handleAdd = async () => {
    if (!form.name.trim()) { toast('Enter an event name'); return }
    setSaving(true)
    try {
      const ev = await createEvent({ ...form, day: Number(form.day) })
      setEvents(prev => [...prev, ev])
      setForm({ name: '', day: TODAY_IDX, time: '09:00', cat: 'work' })
      setShowForm(false)
      toast('Event added ✓')
    } catch { toast('Failed to add event') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    await deleteEvent(id)
    setEvents(prev => prev.filter(e => e.id !== id))
    toast('Deleted')
  }

  const dayEvents = events.filter(e => e.day === selDay).sort((a, b) => a.time.localeCompare(b.time))

  if (loading) return <div className="view-pad"><Spinner /></div>

  return (
    <div className="view-pad">
      <PageHeader eyebrow="/ week overview" title="Schedule." />

      <div className="stats-row">
        <StatCard value={todayEvts.length} label="Today" color="var(--lime)" />
        <StatCard value={events.length}    label="This week" color="var(--pur)" />
        <StatCard value={`${focusHrs}h`}  label="Focus" color="var(--cya)" />
      </div>

      {/* Week grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '.3rem', marginBottom: '.875rem' }}>
        {DAYS.map((d, i) => {
          const dayEvts = events.filter(e => e.day === i)
          const isToday = i === TODAY_IDX, isSel = i === selDay
          return (
            <div key={i}
              onClick={() => setSelDay(i)}
              style={{
                background: isToday ? 'var(--limebg)' : isSel ? 'var(--purbg)' : 'var(--s2)',
                border: `1px solid ${isToday ? 'var(--lime)' : isSel ? 'var(--pur)' : 'var(--b1)'}`,
                borderRadius: 'var(--r)', padding: '.45rem .15rem', textAlign: 'center',
                cursor: 'pointer', userSelect: 'none', transition: 'all .15s',
              }}
            >
              <div style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', color: isToday ? 'var(--lime)' : isSel ? 'var(--pur)' : 'var(--t3)', letterSpacing: '.04em' }}>{d}</div>
              <div style={{ fontSize: 15, fontWeight: 800, fontFamily: 'var(--mono)', margin: '2px 0', color: isToday ? 'var(--lime)' : isSel ? 'var(--pur)' : 'var(--t1)' }}>{dates[i].getDate()}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2, marginTop: 3, minHeight: 7 }}>
                {dayEvts.slice(0, 4).map((e, j) => (
                  <div key={j} style={{ width: 4, height: 4, borderRadius: '50%', background: CAT_META[e.cat]?.color || 'var(--pur)' }} />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Agenda */}
      <SectionLabel>
        {DAYS_FULL[selDay]}'s agenda
        {selDay === TODAY_IDX && <span style={{ color: 'var(--lime)', fontSize: 10 }}>TODAY</span>}
      </SectionLabel>
      <div className="card">
        {dayEvents.length === 0
          ? <EmptyState icon="ti-confetti">Nothing planned — free day!</EmptyState>
          : dayEvents.map(e => {
              const c = CAT_META[e.cat] || CAT_META.work
              return (
                <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: '.625rem', padding: '.7rem .875rem', borderBottom: '1px solid var(--b1)' }}>
                  <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--t3)', minWidth: 36, flexShrink: 0 }}>{e.time}</span>
                  <div style={{ width: 3, height: 28, borderRadius: 2, background: c.color, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.name}</span>
                  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', padding: '3px 7px', borderRadius: 5, background: c.bg, color: c.color, flexShrink: 0 }}>{c.label}</span>
                  <DeleteBtn onClick={() => handleDelete(e.id)} label={`Delete ${e.name}`} />
                </div>
              )
            })
        }
      </div>

      {/* Add event */}
      <SectionLabel>Add event</SectionLabel>
      <button className="btn-add" onClick={() => setShowForm(v => !v)}>
        <i className="ti ti-plus" /> New event
      </button>
      <AddPanel open={showForm}>
        <div className="form-row" style={{ marginBottom: '.625rem' }}>
          <FormGroup label="Name">
            <Field placeholder="Team standup" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          </FormGroup>
          <FormGroup label="Day">
            <Field as="select" value={form.day} onChange={e => setForm(p => ({ ...p, day: e.target.value }))}>
              {DAYS_FULL.map((d, i) => <option key={i} value={i}>{d}</option>)}
            </Field>
          </FormGroup>
        </div>
        <div className="form-row" style={{ marginBottom: '.875rem' }}>
          <FormGroup label="Time">
            <Field type="time" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} />
          </FormGroup>
          <FormGroup label="Category">
            <Field as="select" value={form.cat} onChange={e => setForm(p => ({ ...p, cat: e.target.value }))}>
              {Object.entries(CAT_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </Field>
          </FormGroup>
        </div>
        <button className="btn-primary" onClick={handleAdd} disabled={saving}>
          {saving ? 'Saving…' : '+ Add event'}
        </button>
      </AddPanel>
    </div>
  )
}