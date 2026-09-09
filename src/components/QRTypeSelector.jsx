import { QR_TYPES } from '../utils/qrPayload'

/**
 * Phase 1 placeholder: Website selected; other types listed but inactive.
 */
export default function QRTypeSelector({ value = 'website', onChange }) {
  return (
    <div className="space-y-2">
      <label htmlFor="qr-type" className="block text-sm font-medium text-ink">
        QR Type
      </label>
      <select
        id="qr-type"
        name="qr-type"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full rounded-xl border border-line bg-panel px-3 py-2.5 text-sm text-ink shadow-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
      >
        {QR_TYPES.map((type) => (
          <option
            key={type.id}
            value={type.id}
            disabled={type.id !== 'website'}
          >
            {type.label}
            {type.id !== 'website' ? ' (soon)' : ''}
          </option>
        ))}
      </select>
    </div>
  )
}
