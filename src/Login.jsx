import { useState } from 'react'
import logo from './assets/logo.png'

const SETTINGS_KEY = 'drenica_settings'

function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = (e) => {
    e.preventDefault()

    const savedSettings =
      localStorage.getItem(SETTINGS_KEY)

    let settings = {
      username: 'admin',
      password: '1234',
    }

    if (savedSettings) {
      try {
        const parsedSettings =
          JSON.parse(savedSettings)

        settings = {
          ...settings,
          ...parsedSettings,
        }
      } catch (error) {
        console.error(
          'Gabim gjatë leximit të login-it:',
          error
        )
      }
    }

    if (
      username === settings.username &&
      password === settings.password
    ) {
      setError('')

      localStorage.setItem(
        'drenica_logged_in',
        'true'
      )

      onLogin()
    } else {
      setError(
        'Përdoruesi ose fjalëkalimi është gabim.'
      )
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f4f7fb',
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          background: '#fff',
          borderRadius: '20px',
          padding: '40px',
          boxShadow:
            '0 15px 40px rgba(0,0,0,0.10)',
        }}
      >

        <div
          style={{
            textAlign: 'center',
            marginBottom: '30px',
          }}
        >

          <img
            src={logo}
            alt="DRENICA Logo"
            style={{
              width: '110px',
              height: '110px',
              objectFit: 'contain',
              marginBottom: '15px',
            }}
          />

          <h1
            style={{
              margin: '0',
              fontSize: '28px',
              color: '#172033',
            }}
          >
            DRENICA
          </h1>

          <p
            style={{
              marginTop: '8px',
              color: '#667085',
            }}
          >
            Administrimi
          </p>

        </div>

        <form onSubmit={handleLogin}>

          <div
            style={{
              marginBottom: '18px',
            }}
          >

            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#344054',
              }}
            >
              Përdoruesi
            </label>

            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                setError('')
              }}
              placeholder="Shkruaj përdoruesin"
              autoComplete="username"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '13px 14px',
                border:
                  '1px solid #d0d5dd',
                borderRadius: '10px',
                fontSize: '15px',
              }}
            />

          </div>

          <div
            style={{
              marginBottom: '18px',
            }}
          >

            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#344054',
              }}
            >
              Fjalëkalimi
            </label>

            <div
              style={{
                position: 'relative',
              }}
            >

              <input
                type={
                  showPassword
                    ? 'text'
                    : 'password'
                }
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError('')
                }}
                placeholder="Shkruaj fjalëkalimin"
                autoComplete="current-password"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding:
                    '13px 45px 13px 14px',
                  border:
                    '1px solid #d0d5dd',
                  borderRadius: '10px',
                  fontSize: '15px',
                }}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform:
                    'translateY(-50%)',
                  border: 'none',
                  background:
                    'transparent',
                  cursor: 'pointer',
                  fontSize: '18px',
                }}
              >
                {showPassword
                  ? '🙈'
                  : '👁️'}
              </button>

            </div>

          </div>

          {error && (
            <div
              style={{
                marginBottom: '18px',
                padding: '12px',
                borderRadius: '10px',
                background: '#fff1f1',
                color: '#d92d20',
                fontSize: '14px',
                textAlign: 'center',
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '14px',
              border: 'none',
              borderRadius: '10px',
              background: '#172033',
              color: '#fff',
              fontSize: '16px',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            Hyr në sistem
          </button>

        </form>

        <div
          style={{
            marginTop: '25px',
            textAlign: 'center',
            fontSize: '13px',
            color: '#98a2b3',
          }}
        >
          Shoqata e Peshkatarëve Sportiv Rekreativ
          <br />
          "DRENICA"
        </div>

      </div>
    </div>
  )
}

export default Login