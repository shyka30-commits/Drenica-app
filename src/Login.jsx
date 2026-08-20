import { useEffect, useState } from 'react'
import logo from './assets/logo.png'
import { supabase } from './utils/supabase'

function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadUsername = async () => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('username')
        .limit(1)

      if (error) {
        console.error(
          'Gabim gjatë marrjes së username:',
          error
        )
        return
      }

      if (data && data.length > 0) {
        setUsername(data[0].username || '')
      }
    }

    loadUsername()
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()

    setError('')
    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select(`
          id,
          username,
          password,
          organization_id,
          role
        `)
        .eq('username', username.trim())
        .limit(1)

      if (error) {
        console.error(
          'Gabim te login:',
          error
        )

        setError(
          'Gabim gjatë lidhjes me sistemin.'
        )

        return
      }

      const account =
        data && data.length > 0
          ? data[0]
          : null

      if (
        account &&
        username.trim() === account.username &&
        password === account.password
      ) {
        let organization = null

        if (account.organization_id) {
          const {
            data: organizationData,
            error: organizationError,
          } = await supabase
            .from('organizations')
            .select('id, name, slug')
            .eq(
              'id',
              account.organization_id
            )
            .limit(1)

          if (organizationError) {
            console.error(
              'Gabim te shoqata:',
              organizationError
            )
          } else if (
            organizationData &&
            organizationData.length > 0
          ) {
            organization =
              organizationData[0]
          }
        }

        const sessionUser = {
          id: account.id,
          username: account.username,
          role: account.role || 'admin',
          organization_id:
            account.organization_id || null,
          organization: organization
            ? {
                id: organization.id,
                name: organization.name,
                slug: organization.slug,
              }
            : null,
        }

        localStorage.setItem(
          'drenica_logged_in',
          'true'
        )

        localStorage.setItem(
          'drenica_user',
          JSON.stringify(sessionUser)
        )

        setError('')

        onLogin(sessionUser)
      } else {
        setError(
          'Përdoruesi ose fjalëkalimi është gabim.'
        )
      }
    } catch (error) {
      console.error(
        'Gabim gjatë login-it:',
        error
      )

      setError(
        'Ndodhi një gabim gjatë hyrjes.'
      )
    } finally {
      setLoading(false)
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

          {/* USERNAME */}

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

          {/* PASSWORD */}

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

          {/* ERROR */}

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

          {/* LOGIN BUTTON */}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              border: 'none',
              borderRadius: '10px',
              background: '#172033',
              color: '#fff',
              fontSize: '16px',
              fontWeight: '700',
              cursor: loading
                ? 'not-allowed'
                : 'pointer',
              opacity: loading
                ? 0.7
                : 1,
            }}
          >
            {loading
              ? 'Duke hyrë...'
              : 'Hyr në sistem'}
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