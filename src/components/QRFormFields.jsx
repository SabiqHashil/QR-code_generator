import { WIFI_SECURITY } from '../utils/qrPayload'

const inputClass =
  'w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-slate-400 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20'
const inputErrorClass = 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
const labelClass = 'block text-sm font-medium text-ink'
const errorClass = 'text-xs text-red-600'

function FieldError({ id, message }) {
  if (!message) return null
  return (
    <p id={id} className={errorClass} role="alert">
      {message}
    </p>
  )
}

/**
 * Dynamic input fields for the selected QR type.
 */
export default function QRFormFields({ type, values, errors = {}, onChange }) {
  function setField(name, value) {
    onChange({ ...values, [name]: value })
  }

  switch (type) {
    case 'website':
      return (
        <div className="space-y-2">
          <label htmlFor="website-url" className={labelClass}>
            Website URL
          </label>
          <input
            id="website-url"
            name="url"
            type="url"
            inputMode="url"
            autoComplete="url"
            placeholder="https://example.com"
            value={values.url ?? ''}
            onChange={(e) => setField('url', e.target.value)}
            aria-invalid={Boolean(errors.url)}
            aria-describedby={errors.url ? 'website-url-error' : undefined}
            className={`${inputClass} ${errors.url ? inputErrorClass : ''}`}
          />
          <FieldError id="website-url-error" message={errors.url} />
        </div>
      )

    case 'maps':
      return (
        <div className="space-y-2">
          <label htmlFor="maps-url" className={labelClass}>
            Google Maps Link
          </label>
          <input
            id="maps-url"
            name="mapsUrl"
            type="url"
            inputMode="url"
            placeholder="https://maps.google.com/..."
            value={values.mapsUrl ?? ''}
            onChange={(e) => setField('mapsUrl', e.target.value)}
            aria-invalid={Boolean(errors.mapsUrl)}
            aria-describedby={errors.mapsUrl ? 'maps-url-error' : undefined}
            className={`${inputClass} ${errors.mapsUrl ? inputErrorClass : ''}`}
          />
          <p className="text-xs text-ink-muted">
            Paste a Google Maps sharing URL. No Maps API is used.
          </p>
          <FieldError id="maps-url-error" message={errors.mapsUrl} />
        </div>
      )

    case 'text':
      return (
        <div className="space-y-2">
          <label htmlFor="plain-text" className={labelClass}>
            Text / Message
          </label>
          <textarea
            id="plain-text"
            name="text"
            rows={5}
            placeholder={"Hello World\nمرحبا\nനമസ്കാരം\n😀"}
            value={values.text ?? ''}
            onChange={(e) => setField('text', e.target.value)}
            aria-invalid={Boolean(errors.text)}
            aria-describedby={errors.text ? 'plain-text-error' : undefined}
            className={`${inputClass} min-h-[8rem] resize-y ${errors.text ? inputErrorClass : ''}`}
          />
          <p className="text-xs text-ink-muted">
            Supports multiline text, Unicode, Arabic, Malayalam, and emoji.
          </p>
          <FieldError id="plain-text-error" message={errors.text} />
        </div>
      )

    case 'email':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email-address" className={labelClass}>
              Email
            </label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              value={values.email ?? ''}
              onChange={(e) => setField('email', e.target.value)}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'email-address-error' : undefined}
              className={`${inputClass} ${errors.email ? inputErrorClass : ''}`}
            />
            <FieldError id="email-address-error" message={errors.email} />
          </div>
          <div className="space-y-2">
            <label htmlFor="email-subject" className={labelClass}>
              Subject
            </label>
            <input
              id="email-subject"
              name="subject"
              type="text"
              placeholder="Optional subject"
              value={values.subject ?? ''}
              onChange={(e) => setField('subject', e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email-message" className={labelClass}>
              Message
            </label>
            <textarea
              id="email-message"
              name="message"
              rows={3}
              placeholder="Optional message"
              value={values.message ?? ''}
              onChange={(e) => setField('message', e.target.value)}
              className={`${inputClass} resize-y`}
            />
          </div>
        </div>
      )

    case 'phone':
      return (
        <div className="space-y-2">
          <label htmlFor="phone-number" className={labelClass}>
            Phone Number
          </label>
          <input
            id="phone-number"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+966501234567"
            value={values.phone ?? ''}
            onChange={(e) => setField('phone', e.target.value)}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? 'phone-number-error' : undefined}
            className={`${inputClass} ${errors.phone ? inputErrorClass : ''}`}
          />
          <FieldError id="phone-number-error" message={errors.phone} />
        </div>
      )

    case 'sms':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="sms-phone" className={labelClass}>
              Phone Number
            </label>
            <input
              id="sms-phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+966501234567"
              value={values.phone ?? ''}
              onChange={(e) => setField('phone', e.target.value)}
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? 'sms-phone-error' : undefined}
              className={`${inputClass} ${errors.phone ? inputErrorClass : ''}`}
            />
            <FieldError id="sms-phone-error" message={errors.phone} />
          </div>
          <div className="space-y-2">
            <label htmlFor="sms-message" className={labelClass}>
              Message
            </label>
            <textarea
              id="sms-message"
              name="message"
              rows={3}
              placeholder="Optional SMS body"
              value={values.message ?? ''}
              onChange={(e) => setField('message', e.target.value)}
              className={`${inputClass} resize-y`}
            />
          </div>
        </div>
      )

    case 'wifi':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="wifi-ssid" className={labelClass}>
              Network Name
            </label>
            <input
              id="wifi-ssid"
              name="ssid"
              type="text"
              autoComplete="off"
              placeholder="Network SSID"
              value={values.ssid ?? ''}
              onChange={(e) => setField('ssid', e.target.value)}
              aria-invalid={Boolean(errors.ssid)}
              aria-describedby={errors.ssid ? 'wifi-ssid-error' : undefined}
              className={`${inputClass} ${errors.ssid ? inputErrorClass : ''}`}
            />
            <FieldError id="wifi-ssid-error" message={errors.ssid} />
          </div>
          <div className="space-y-2">
            <label htmlFor="wifi-security" className={labelClass}>
              Security
            </label>
            <select
              id="wifi-security"
              name="security"
              value={values.security ?? 'WPA'}
              onChange={(e) => setField('security', e.target.value)}
              className={inputClass}
            >
              {WIFI_SECURITY.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {values.security !== 'nopass' && (
            <div className="space-y-2">
              <label htmlFor="wifi-password" className={labelClass}>
                Password
              </label>
              <input
                id="wifi-password"
                name="password"
                type="text"
                autoComplete="off"
                placeholder="Network password"
                value={values.password ?? ''}
                onChange={(e) => setField('password', e.target.value)}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={
                  errors.password ? 'wifi-password-error' : undefined
                }
                className={`${inputClass} ${errors.password ? inputErrorClass : ''}`}
              />
              <FieldError id="wifi-password-error" message={errors.password} />
            </div>
          )}
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              name="hidden"
              checked={Boolean(values.hidden)}
              onChange={(e) => setField('hidden', e.target.checked)}
              className="size-4 rounded border-line text-accent focus:ring-accent/30"
            />
            Hidden Network
          </label>
        </div>
      )

    case 'vcard':
      return (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="vcard-first" className={labelClass}>
                First Name
              </label>
              <input
                id="vcard-first"
                name="firstName"
                type="text"
                autoComplete="given-name"
                value={values.firstName ?? ''}
                onChange={(e) => setField('firstName', e.target.value)}
                aria-invalid={Boolean(errors.firstName)}
                aria-describedby={
                  errors.firstName ? 'vcard-first-error' : undefined
                }
                className={`${inputClass} ${errors.firstName ? inputErrorClass : ''}`}
              />
              <FieldError id="vcard-first-error" message={errors.firstName} />
            </div>
            <div className="space-y-2">
              <label htmlFor="vcard-last" className={labelClass}>
                Last Name
              </label>
              <input
                id="vcard-last"
                name="lastName"
                type="text"
                autoComplete="family-name"
                value={values.lastName ?? ''}
                onChange={(e) => setField('lastName', e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="vcard-org" className={labelClass}>
              Organization
            </label>
            <input
              id="vcard-org"
              name="organization"
              type="text"
              autoComplete="organization"
              value={values.organization ?? ''}
              onChange={(e) => setField('organization', e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="vcard-phone" className={labelClass}>
              Phone
            </label>
            <input
              id="vcard-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              value={values.phone ?? ''}
              onChange={(e) => setField('phone', e.target.value)}
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? 'vcard-phone-error' : undefined}
              className={`${inputClass} ${errors.phone ? inputErrorClass : ''}`}
            />
            <FieldError id="vcard-phone-error" message={errors.phone} />
          </div>
          <div className="space-y-2">
            <label htmlFor="vcard-email" className={labelClass}>
              Email
            </label>
            <input
              id="vcard-email"
              name="email"
              type="email"
              autoComplete="email"
              value={values.email ?? ''}
              onChange={(e) => setField('email', e.target.value)}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'vcard-email-error' : undefined}
              className={`${inputClass} ${errors.email ? inputErrorClass : ''}`}
            />
            <FieldError id="vcard-email-error" message={errors.email} />
          </div>
          <div className="space-y-2">
            <label htmlFor="vcard-website" className={labelClass}>
              Website
            </label>
            <input
              id="vcard-website"
              name="website"
              type="url"
              autoComplete="url"
              placeholder="https://example.com"
              value={values.website ?? ''}
              onChange={(e) => setField('website', e.target.value)}
              aria-invalid={Boolean(errors.website)}
              aria-describedby={
                errors.website ? 'vcard-website-error' : undefined
              }
              className={`${inputClass} ${errors.website ? inputErrorClass : ''}`}
            />
            <FieldError id="vcard-website-error" message={errors.website} />
          </div>
          <div className="space-y-2">
            <label htmlFor="vcard-address" className={labelClass}>
              Address
            </label>
            <textarea
              id="vcard-address"
              name="address"
              rows={2}
              value={values.address ?? ''}
              onChange={(e) => setField('address', e.target.value)}
              className={`${inputClass} resize-y`}
            />
          </div>
        </div>
      )

    default:
      return null
  }
}
