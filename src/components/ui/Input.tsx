import { C } from '../../lib/theme'
import { useState } from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'

interface InputProps {
  label?: string
  placeholder?: string
  type?: string
  error?: string
  register?: UseFormRegisterReturn
  style?: React.CSSProperties
  rightEl?: React.ReactNode
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
  required?: boolean
  disabled?: boolean
  as?: 'input' | 'select' | 'textarea'
  children?: React.ReactNode
  rows?: number
}

export function Input({ label, placeholder, type = 'text', error, register, style, rightEl, value, onChange, required, disabled, as: Tag = 'input', children, rows }: InputProps) {
  const [focused, setFocused] = useState(false)

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    paddingRight: rightEl ? 44 : 16,
    background: disabled ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)',
    border: `1px solid ${error ? C.danger : focused ? 'rgba(225,6,0,0.5)' : C.borderSubtle}`,
    borderRadius: 10,
    color: disabled ? C.textMuted : C.text,
    fontSize: 14,
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxShadow: focused ? `0 0 0 3px rgba(225,6,0,0.08)` : 'none',
    cursor: disabled ? 'not-allowed' : 'auto',
    resize: Tag === 'textarea' ? 'vertical' : undefined,
    minHeight: Tag === 'textarea' ? 80 : undefined,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
      {label && (
        <label style={{ fontSize: 13, color: C.textMuted, fontWeight: 500 }}>{label}</label>
      )}
      <div style={{ position: 'relative' }}>
        {Tag === 'select' ? (
          <select
            {...(register as object | undefined)}
            {...(value !== undefined ? { value } : {})}
            {...(onChange !== undefined ? { onChange: onChange as React.ChangeEventHandler<HTMLSelectElement> } : {})}
            required={required}
            disabled={disabled}
            onFocus={() => setFocused(true)}
            onBlur={(e) => { setFocused(false); register?.onBlur(e as unknown as React.FocusEvent<HTMLInputElement>) }}
            style={inputStyle}
          >
            {children}
          </select>
        ) : Tag === 'textarea' ? (
          <textarea
            {...(register as object | undefined)}
            {...(value !== undefined ? { value } : {})}
            {...(onChange !== undefined ? { onChange: onChange as React.ChangeEventHandler<HTMLTextAreaElement> } : {})}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            rows={rows}
            onFocus={() => setFocused(true)}
            onBlur={(e) => { setFocused(false); register?.onBlur(e as unknown as React.FocusEvent<HTMLInputElement>) }}
            style={inputStyle}
          />
        ) : (
          <input
            {...register}
            type={type}
            placeholder={placeholder}
            {...(value !== undefined ? { value } : {})}
            {...(onChange !== undefined ? { onChange: onChange as React.ChangeEventHandler<HTMLInputElement> } : {})}
            required={required}
            disabled={disabled}
            onFocus={() => setFocused(true)}
            onBlur={(e) => { setFocused(false); register?.onBlur(e) }}
            style={inputStyle}
          />
        )}
        {rightEl && (
          <div style={{
            position: 'absolute', right: 12, top: '50%',
            transform: 'translateY(-50%)', color: C.textMuted,
            cursor: 'pointer', display: 'flex', alignItems: 'center',
          }}>
            {rightEl}
          </div>
        )}
      </div>
      {error && <span style={{ fontSize: 12, color: C.danger }}>{error}</span>}
    </div>
  )
}
