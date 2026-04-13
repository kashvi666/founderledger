import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Zap } from 'lucide-react'
import Card from '../components/Card'
import { api } from '../lib/api'
import { formatCurrency } from '../lib/format'

const GROQ_MODEL = 'llama3-8b-8192'

const STARTERS = [
  'What are my top expense categories this month?',
  'Summarize my burn rate and runway.',
  'Where am I overspending compared to income?',
  'Give me a financial health check.',
]

export default function AIPage() {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: "Hey! I'm your AI financial analyst. I have access to your transaction data. Ask me anything about your startup's finances. 👋",
  }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [apiKey, setApiKey] = useState(localStorage.getItem('groq_key') || '')
  const [showKeyInput, setShowKeyInput] = useState(!localStorage.getItem('groq_key'))
  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const saveKey = () => {
    localStorage.setItem('groq_key', apiKey)
    setShowKeyInput(false)
  }

  const send = async (text) => {
    const userText = text || input.trim()
    if (!userText || loading) return
    if (!apiKey) { setShowKeyInput(true); return }

    setInput('')
    const newMessages = [...messages, { role: 'user', content: userText }]
    setMessages(newMessages)
    setLoading(true)

    try {
      // Fetch financial context from our own backend
      const [summary, txns] = await Promise.all([
        api.dashboard.summary({ date_from: '', date_to: '' }),
        api.transactions.list({ limit: 50 }),
      ])

      const context = `
Current financial summary:
- Total Income: ${formatCurrency(summary.total_income)}
- Total Expenses: ${formatCurrency(summary.total_expenses)}
- Net Balance: ${formatCurrency(summary.net_balance)}
- Monthly Burn Rate: ${formatCurrency(summary.burn_rate?.monthly_burn)}
- Runway: ${summary.burn_rate?.runway_months ?? 'N/A'} months

Top expense categories:
${summary.category_breakdown?.slice(0, 5).map(c => `  - ${c.category}: ${formatCurrency(c.total)}`).join('\n')}

Recent transactions (last 50):
${txns.items?.slice(0, 20).map(t => `  - [${t.date}] ${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)} | ${t.category.name} | ${t.note || 'no note'}`).join('\n')}
`.trim()

      const systemPrompt = `You are a sharp, concise financial analyst for a startup. You have access to their real transaction data below. Give direct, actionable insights. Use numbers. Be specific. No fluff.

FINANCIAL DATA:
${context}`

      // Call Groq (OpenAI-compatible)
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            ...newMessages.map(m => ({ role: m.role, content: m.content })),
          ],
          max_tokens: 600,
          temperature: 0.4,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error?.message || 'Groq API error')
      }

      const data = await res.json()
      const reply = data.choices?.[0]?.message?.content || 'No response.'
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ Error: ${e.message}` }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, height: 'calc(100vh - 80px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px' }}>AI Analyst</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>Powered by Groq · Llama 3</p>
        </div>
        <button onClick={() => setShowKeyInput(v => !v)} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
          background: 'var(--bg-elevated)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', fontSize: 13,
        }}>
          <Zap size={14} /> {apiKey ? 'Change API Key' : 'Set API Key'}
        </button>
      </div>

      {/* API Key setup */}
      {showKeyInput && (
        <Card className="fade-up" style={{ padding: 20 }}>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
            Enter your free <strong style={{ color: 'var(--text-primary)' }}>Groq API key</strong> from{' '}
            <a href="https://console.groq.com" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>console.groq.com</a>.
            It's stored only in your browser.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <input value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="gsk_..."
              type="password" style={{
                flex: 1, padding: '9px 14px', background: 'var(--bg-base)',
                border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)', fontSize: 14,
              }} />
            <button onClick={saveKey} style={{
              padding: '9px 18px', background: 'var(--accent)', color: '#000',
              borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: 14,
            }}>Save</button>
          </div>
        </Card>
      )}

      {/* Chat area */}
      <Card style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', minHeight: 0 }}>
        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {messages.map((m, i) => (
            <div key={i} className="fade-up" style={{
              display: 'flex', gap: 12, alignItems: 'flex-start',
              flexDirection: m.role === 'user' ? 'row-reverse' : 'row',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                background: m.role === 'user' ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                border: `1px solid ${m.role === 'user' ? 'var(--accent)' : 'var(--border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {m.role === 'user' ? <User size={15} color="var(--accent)" /> : <Bot size={15} color="var(--text-secondary)" />}
              </div>
              <div style={{
                maxWidth: '75%', padding: '12px 16px',
                background: m.role === 'user' ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                border: `1px solid ${m.role === 'user' ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: m.role === 'user' ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
                fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap',
                color: 'var(--text-primary)',
              }}>
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-elevated)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={15} color="var(--text-secondary)" />
              </div>
              <div style={{ padding: '12px 16px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '4px 12px 12px 12px' }}>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{
                      width: 6, height: 6, borderRadius: '50%', background: 'var(--text-muted)',
                      animation: 'fadeUp 0.6s ease infinite alternate',
                      animationDelay: `${i * 0.2}s`,
                    }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Starters */}
        {messages.length === 1 && (
          <div style={{ padding: '0 24px 16px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {STARTERS.map(s => (
              <button key={s} onClick={() => send(s)} style={{
                padding: '7px 12px', borderRadius: 99, fontSize: 12, fontWeight: 500,
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Ask about your finances…"
            style={{
              flex: 1, padding: '11px 16px', background: 'var(--bg-elevated)',
              border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)', fontSize: 14,
            }} />
          <button onClick={() => send()} disabled={loading || !input.trim()} style={{
            padding: '11px 18px', background: 'var(--accent)', color: '#000',
            borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: 6,
            fontWeight: 700, fontSize: 14, opacity: loading || !input.trim() ? 0.5 : 1,
            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
          }}>
            <Send size={15} />
          </button>
        </div>
      </Card>
    </div>
  )
}
