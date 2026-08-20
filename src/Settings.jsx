import { useEffect, useState } from 'react'
import { supabase } from './utils/supabase'

const SETTINGS_KEY = 'drenica_settings'

const defaultSettings = {
  emriShoqates:
    'Shoqata e Peshkatarëve Sportiv Rekreativ "DRENICA"',
  adresa: '',
  telefoni: '',
  emaili: '',
  monedha: '€',
  viti: new Date().getFullYear(),
  administrator: 'Administrator',
  username: 'admin',
  password: '1234',
}

function Settings() {
  const [settings, setSettings] =
    useState(defaultSettings)

  const [saved, setSaved] =
    useState(false)

  const [savingLogin, setSavingLogin] =
    useState(false)

  useEffect(() => {
    const loadSettings = async () => {
      let localSettings = defaultSettings

      const savedSettings =
        localStorage.getItem(SETTINGS_KEY)

      if (savedSettings) {
        try {
          localSettings = {
            ...defaultSettings,
            ...JSON.parse(savedSettings),
          }
        } catch (error) {
          console.error(
            'Gabim gjatë leximit të cilësimeve:',
            error
          )
        }
      }

      try {
        const { data, error } = await supabase
          .from('app_settings')
          .select('username, password')
          .limit(1)

        if (error) {
          console.error(
            'Gabim gjatë leximit të Login-it nga Supabase:',
            error
          )

          setSettings(localSettings)
          return
        }

        if (data && data.length > 0) {
          localSettings = {
            ...localSettings,
            username:
              data[0].username ||
              localSettings.username,
            password:
              data[0].password ||
              localSettings.password,
          }
        }

        setSettings(localSettings)
      } catch (error) {
        console.error(
          'Gabim gjatë ngarkimit të cilësimeve:',
          error
        )

        setSettings(localSettings)
      }
    }

    loadSettings()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target

    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }))

    setSaved(false)
  }

  const saveLoginToSupabase = async () => {
    const username =
      settings.username.trim()

    const password =
      settings.password

    if (!username) {
      throw new Error(
        'Username nuk mund të jetë bosh.'
      )
    }

    if (!password) {
      throw new Error(
        'Password nuk mund të jetë bosh.'
      )
    }

    const { data: existing, error: findError } =
      await supabase
        .from('app_settings')
        .select('id')
        .limit(1)

    if (findError) {
      throw findError
    }

    if (existing && existing.length > 0) {
      const { error: updateError } =
        await supabase
          .from('app_settings')
          .update({
            username,
            password,
            updated_at:
              new Date().toISOString(),
          })
          .eq('id', existing[0].id)

      if (updateError) {
        throw updateError
      }
    } else {
      const { error: insertError } =
        await supabase
          .from('app_settings')
          .insert({
            username,
            password,
          })

      if (insertError) {
        throw insertError
      }
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()

    setSaved(false)

    try {
      localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify(settings)
      )

      await saveLoginToSupabase()

      setSaved(true)

      setTimeout(() => {
        setSaved(false)
      }, 3000)
    } catch (error) {
      console.error(
        'Gabim gjatë ruajtjes:',
        error
      )

      alert(
        'Cilësimet lokale u ruajtën, por Login-i nuk u ruajt në Supabase.\n\nKontrollo lidhjen me Supabase.'
      )
    }
  }

  const handleSaveLogin = async (e) => {
    e.preventDefault()

    setSavingLogin(true)
    setSaved(false)

    try {
      await saveLoginToSupabase()

      localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify(settings)
      )

      setSaved(true)

      setTimeout(() => {
        setSaved(false)
      }, 3000)
    } catch (error) {
      console.error(
        'Gabim gjatë ruajtjes së Login-it:',
        error
      )

      alert(
        'Login-i nuk u ruajt në Supabase.\n\n' +
        (error?.message ||
          'Kontrollo lidhjen me Supabase.')
      )
    } finally {
      setSavingLogin(false)
    }
  }

  const handleReset = () => {
    const confirmed = window.confirm(
      'A dëshironi t’i ktheni cilësimet në gjendjen fillestare?'
    )

    if (!confirmed) {
      return
    }

    setSettings(defaultSettings)

    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify(defaultSettings)
    )

    setSaved(true)

    setTimeout(() => {
      setSaved(false)
    }, 3000)
  }

  const handleBackup = () => {
    const data = {
      settings: JSON.parse(
        localStorage.getItem(
          SETTINGS_KEY
        ) ||
          JSON.stringify(settings)
      ),

      members: JSON.parse(
        localStorage.getItem(
          'drenica_members'
        ) || '[]'
      ),

      payments: JSON.parse(
        localStorage.getItem(
          'drenica_payments'
        ) || '[]'
      ),

      certificates: JSON.parse(
        localStorage.getItem(
          'drenica_certificates'
        ) || '[]'
      ),

      invoices: JSON.parse(
        localStorage.getItem(
          'drenica_invoices'
        ) || '[]'
      ),

      competitions: JSON.parse(
        localStorage.getItem(
          'drenica_competitions'
        ) || '[]'
      ),

      exportedAt:
        new Date().toISOString(),
    }

    const blob = new Blob(
      [JSON.stringify(data, null, 2)],
      {
        type: 'application/json',
      }
    )

    const url =
      URL.createObjectURL(blob)

    const link =
      window.document.createElement('a')

    link.href = url

    link.download =
      `drenica-backup-${new Date()
        .toISOString()
        .slice(0, 10)}.json`

    window.document.body.appendChild(
      link
    )

    link.click()

    window.document.body.removeChild(
      link
    )

    URL.revokeObjectURL(url)
  }

  return (
    <div className="members-page">

      <div className="members-header">

        <div>
          <h2>Cilësimet</h2>

          <p>
            Menaxho të dhënat dhe konfigurimin
            e sistemit DRENICA.
          </p>
        </div>

      </div>

      {saved && (
        <div
          style={{
            marginBottom: '20px',
            padding: '12px 16px',
            borderRadius: '8px',
            background: '#e8f7ee',
            color: '#217a43',
            fontWeight: '600',
          }}
        >
          ✅ Cilësimet u ruajtën me sukses.
        </div>
      )}

      {/* TË DHËNAT E SHOQATËS */}

      <div className="member-form">

        <h3>
          🏢 Të dhënat e shoqatës
        </h3>

        <form onSubmit={handleSave}>

          <div className="form-grid">

            <div className="form-group">

              <label>
                Emri i shoqatës
              </label>

              <input
                type="text"
                name="emriShoqates"
                value={
                  settings.emriShoqates
                }
                onChange={handleChange}
              />

            </div>

            <div className="form-group">

              <label>
                Adresa
              </label>

              <input
                type="text"
                name="adresa"
                value={settings.adresa}
                onChange={handleChange}
                placeholder="Adresa e shoqatës"
              />

            </div>

            <div className="form-group">

              <label>
                Telefoni
              </label>

              <input
                type="text"
                name="telefoni"
                value={settings.telefoni}
                onChange={handleChange}
                placeholder="+383 ..."
              />

            </div>

            <div className="form-group">

              <label>
                Email
              </label>

              <input
                type="email"
                name="emaili"
                value={settings.emaili}
                onChange={handleChange}
                placeholder="email@example.com"
              />

            </div>

            <div className="form-group">

              <label>
                Monedha
              </label>

              <select
                name="monedha"
                value={settings.monedha}
                onChange={handleChange}
              >
                <option value="€">
                  Euro (€)
                </option>

                <option value="$">
                  Dollar ($)
                </option>
              </select>

            </div>

            <div className="form-group">

              <label>
                Viti
              </label>

              <input
                type="number"
                name="viti"
                value={settings.viti}
                onChange={handleChange}
                min="2020"
                max="2100"
              />

            </div>

            <div className="form-group">

              <label>
                Administratori
              </label>

              <input
                type="text"
                name="administrator"
                value={
                  settings.administrator
                }
                onChange={handleChange}
              />

            </div>

          </div>

          <div className="form-actions">

            <button
              type="button"
              className="secondary-button"
              onClick={handleReset}
            >
              ↩️ Rikthe fillestaret
            </button>

            <button
              type="submit"
              className="primary-button"
            >
              💾 Ruaj cilësimet
            </button>

          </div>

        </form>

      </div>

      {/* LOGIN */}

      <div className="member-form">

        <h3>
          🔐 Të dhënat e Login-it
        </h3>

        <form
          onSubmit={handleSaveLogin}
        >

          <div className="form-grid">

            <div className="form-group">

              <label>
                Username
              </label>

              <input
                type="text"
                name="username"
                value={settings.username}
                onChange={handleChange}
                placeholder="Username"
                autoComplete="username"
              />

            </div>

            <div className="form-group">

              <label>
                Password
              </label>

              <input
                type="password"
                name="password"
                value={settings.password}
                onChange={handleChange}
                placeholder="Password"
                autoComplete="new-password"
              />

            </div>

          </div>

          <div className="form-actions">

            <button
              type="submit"
              className="primary-button"
              disabled={savingLogin}
            >
              {savingLogin
                ? '⏳ Duke ruajtur...'
                : '🔐 Ruaj Login-in'}
            </button>

          </div>

        </form>

      </div>

      {/* BACKUP */}

      <div className="members-list">

        <div className="members-list-header">

          <div>
            <h3>
              💾 Të dhënat dhe backup
            </h3>

            <p>
              Ruaj një kopje të të dhënave të
              sistemit në kompjuter.
            </p>
          </div>

        </div>

        <div
          style={{
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
          }}
        >

          <div
            style={{
              padding: '15px',
              background: '#f5f7fa',
              borderRadius: '8px',
            }}
          >

            <strong>
              📦 Backup i sistemit
            </strong>

            <p
              style={{
                margin: '6px 0 12px',
              }}
            >
              Krijo një kopje JSON me cilësimet,
              anëtarët, pagesat, certifikatat,
              faturat dhe garat.
            </p>

            <button
              className="secondary-button"
              onClick={handleBackup}
            >
              ⬇️ Krijo backup
            </button>

          </div>

          <div
            style={{
              padding: '15px',
              background: '#fff7e6',
              borderRadius: '8px',
            }}
          >

            <strong>
              ⚠️ Kujdes
            </strong>

            <p
              style={{
                margin: '6px 0 0',
              }}
            >
              Të dhënat ruhen në këtë browser.
              Rekomandohet të krijoni backup
              rregullisht.
            </p>

          </div>

        </div>

      </div>

    </div>
  )
}

export default Settings