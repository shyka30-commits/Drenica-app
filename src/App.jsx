import { useEffect, useState } from 'react'
import './App.css'
import logo from './assets/logo.png'

import { supabase } from './utils/supabase'

import Login from './Login'
import Members from './Members'
import Payments from './Payments'
import Certificates from './Certificates'
import Invoices from './Invoices'
import Reports from './Reports'
import Competitions from './Competitions'
import Documents from './Documents'
import Settings from './Settings'

/* =====================================================
   MENAXHIMI I SHOQATAVE
   ===================================================== */

function OrganizationsManagement() {
  const [organizations, setOrganizations] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    username: '',
    password: '',
  })

  const loadOrganizations = async () => {
    setLoading(true)
    setError('')

    try {
      const {
        data,
        error: organizationsError,
      } = await supabase
        .from('organizations')
        .select('id, name, slug, created_at')
        .order('created_at', {
          ascending: true,
        })

      if (organizationsError) {
        throw organizationsError
      }

      setOrganizations(data || [])
    } catch (error) {
      console.error(
        'Gabim gjatë marrjes së shoqatave:',
        error
      )

      setError(
        'Nuk u arritën të ngarkohen shoqatat.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrganizations()
  }, [])

  const createSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))

    setSaved(false)
    setError('')
  }

  const handleCreateOrganization = async (e) => {
    e.preventDefault()

    setSaved(false)
    setError('')

    const name = form.name.trim()
    const username = form.username.trim()
    const password = form.password

    if (!name) {
      setError(
        'Shkruaj emrin e shoqatës.'
      )
      return
    }

    if (!username) {
      setError(
        'Shkruaj username-in e administratorit.'
      )
      return
    }

    if (!password) {
      setError(
        'Shkruaj password-in e administratorit.'
      )
      return
    }

    if (password.length < 4) {
      setError(
        'Password-i duhet të ketë të paktën 4 karaktere.'
      )
      return
    }

    const slug = createSlug(name)

    if (!slug) {
      setError(
        'Emri i shoqatës nuk është i vlefshëm.'
      )
      return
    }

    setSaving(true)

    let createdOrganization = null

    try {
      /* ================================================
         KONTROLLO NËSE SLUG EKZISTON
         ================================================ */

      const {
        data: existingSlug,
        error: slugError,
      } = await supabase
        .from('organizations')
        .select('id')
        .eq('slug', slug)
        .limit(1)

      if (slugError) {
        throw slugError
      }

      if (
        existingSlug &&
        existingSlug.length > 0
      ) {
        throw new Error(
          'Ekziston tashmë një shoqatë me këtë emër.'
        )
      }

      /* ================================================
         KONTROLLO USERNAME
         ================================================ */

      const {
        data: existingUsername,
        error: usernameError,
      } = await supabase
        .from('app_settings')
        .select('id')
        .eq('username', username)
        .limit(1)

      if (usernameError) {
        throw usernameError
      }

      if (
        existingUsername &&
        existingUsername.length > 0
      ) {
        throw new Error(
          'Ky username ekziston tashmë. Zgjidh një username tjetër.'
        )
      }

      /* ================================================
         KRIJO SHOQATËN
         ================================================ */

      const {
        data: organizationData,
        error: organizationError,
      } = await supabase
        .from('organizations')
        .insert({
          name,
          slug,
        })
        .select('id, name, slug, created_at')
        .single()

      if (organizationError) {
        throw organizationError
      }

      createdOrganization =
        organizationData

      /* ================================================
         KRIJO LOGIN-IN E ADMINISTRATORIT
         ================================================ */

      const {
        error: accountError,
      } = await supabase
        .from('app_settings')
        .insert({
          username,
          password,
          organization_id:
            organizationData.id,
          role: 'admin',
        })

      if (accountError) {
        /* ----------------------------------------------
           Nëse login-i nuk krijohet, provo ta heqësh
           shoqatën e sapokrijuar që të mos mbetet
           shoqatë pa administrator.
           ---------------------------------------------- */

        try {
          await supabase
            .from('organizations')
            .delete()
            .eq(
              'id',
              organizationData.id
            )
        } catch (cleanupError) {
          console.error(
            'Gabim gjatë pastrimit:',
            cleanupError
          )
        }

        throw accountError
      }

      /* ================================================
         SUKSES
         ================================================ */

      setForm({
        name: '',
        username: '',
        password: '',
      })

      setSaved(true)

      await loadOrganizations()

      setTimeout(() => {
        setSaved(false)
      }, 4000)
    } catch (error) {
      console.error(
        'Gabim gjatë krijimit të shoqatës:',
        error
      )

      setError(
        error?.message ||
          'Shoqata nuk u krijua.'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="members-page">

      {/* HEADER */}

      <div className="members-header">

        <div>
          <h2>
            Menaxhimi i Shoqatave
          </h2>

          <p>
            Krijo dhe menaxho shoqatat
            nga paneli i Super Admin-it.
          </p>
        </div>

      </div>

      {/* SUCCESS */}

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
          ✅ Shoqata dhe llogaria e
          administratorit u krijuan me
          sukses.
        </div>
      )}

      {/* ERROR */}

      {error && (
        <div
          style={{
            marginBottom: '20px',
            padding: '12px 16px',
            borderRadius: '8px',
            background: '#fff1f1',
            color: '#d92d20',
            fontWeight: '600',
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* ADD ORGANIZATION */}

      <div className="member-form">

        <h3>
          ➕ Shto Shoqatë
        </h3>

        <p
          style={{
            marginTop: '5px',
            marginBottom: '20px',
            color: '#667085',
          }}
        >
          Krijo një shoqatë të re dhe
          administratorin e saj.
        </p>

        <form
          onSubmit={
            handleCreateOrganization
          }
        >

          <div className="form-grid">

            {/* EMRI */}

            <div className="form-group">

              <label>
                Emri i shoqatës
              </label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="p.sh. Shoqata e Peshkatarëve..."
                disabled={saving}
              />

            </div>

            {/* USERNAME */}

            <div className="form-group">

              <label>
                Username i administratorit
              </label>

              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="p.sh. admin2"
                autoComplete="off"
                disabled={saving}
              />

            </div>

            {/* PASSWORD */}

            <div className="form-group">

              <label>
                Password i administratorit
              </label>

              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Password"
                autoComplete="new-password"
                disabled={saving}
              />

            </div>

          </div>

          <div className="form-actions">

            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              {saving
                ? '⏳ Duke krijuar...'
                : '🏢 Krijo Shoqatën'}
            </button>

          </div>

        </form>

      </div>

      {/* ORGANIZATIONS LIST */}

      <div className="members-list">

        <div className="members-list-header">

          <div>
            <h3>
              🏢 Shoqatat
            </h3>

            <p>
              Lista e shoqatave të
              regjistruara në sistem.
            </p>
          </div>

        </div>

        {loading ? (

          <div
            style={{
              padding: '25px',
              textAlign: 'center',
              color: '#667085',
            }}
          >
            ⏳ Duke ngarkuar...
          </div>

        ) : organizations.length === 0 ? (

          <div
            style={{
              padding: '25px',
              textAlign: 'center',
              color: '#667085',
            }}
          >
            Nuk ka shoqata.
          </div>

        ) : (

          <div
            style={{
              padding: '10px 20px 20px',
            }}
          >

            {organizations.map(
              (organization) => (
                <div
                  key={
                    organization.id
                  }
                  style={{
                    display: 'flex',
                    alignItems:
                      'center',
                    justifyContent:
                      'space-between',
                    gap: '20px',
                    padding:
                      '16px 0',
                    borderBottom:
                      '1px solid #eaecf0',
                  }}
                >

                  <div>

                    <strong
                      style={{
                        display:
                          'block',
                        marginBottom:
                          '4px',
                      }}
                    >
                      {organization.name}
                    </strong>

                    <span
                      style={{
                        color:
                          '#667085',
                        fontSize:
                          '13px',
                      }}
                    >
                      Slug: {organization.slug}
                    </span>

                  </div>

                  <span
                    style={{
                      padding:
                        '6px 10px',
                      borderRadius:
                        '20px',
                      background:
                        '#eef4ff',
                      color:
                        '#344054',
                      fontSize:
                        '12px',
                      fontWeight:
                        '600',
                    }}
                  >
                    {organization.slug ===
                    'drenica'
                      ? 'DRENICA'
                      : 'Shoqatë'}
                  </span>

                </div>
              )
            )}

          </div>

        )}

      </div>

    </div>
  )
}

/* =====================================================
   APP
   ===================================================== */

function App() {
  const [loggedIn, setLoggedIn] = useState(() => {
    return (
      localStorage.getItem(
        'drenica_logged_in'
      ) === 'true'
    )
  })

  /* =====================================================
     USER / ROLE
     ===================================================== */

  const [currentUser, setCurrentUser] =
    useState(() => {
      const savedUser =
        localStorage.getItem(
          'drenica_user'
        )

      if (!savedUser) {
        return null
      }

      try {
        return JSON.parse(savedUser)
      } catch (error) {
        console.error(
          'Gabim gjatë leximit të përdoruesit:',
          error
        )

        return null
      }
    })

  const isSuperAdmin =
    currentUser?.role ===
    'super_admin'

  const [page, setPage] =
    useState('dashboard')

  const [memberCount, setMemberCount] =
    useState(0)

  const [paymentTotal, setPaymentTotal] =
    useState(0)

  const [certificateCount, setCertificateCount] =
    useState(0)

  const [competitionCount, setCompetitionCount] =
    useState(0)

  const [loadingStats, setLoadingStats] =
    useState(true)

  /* =====================================================
     LOAD DASHBOARD DATA
     ===================================================== */

  const loadDashboardData = async () => {
    setLoadingStats(true)

    try {
      /*
       * =================================================
       * ANËTARËT
       * =================================================
       */

      const {
        count: membersCount,
        error: membersError,
      } = await supabase
        .from('members')
        .select('*', {
          count: 'exact',
          head: true,
        })

      if (membersError) {
        console.error(
          'Gabim te anëtarët:',
          membersError
        )
      } else {
        setMemberCount(
          membersCount || 0
        )
      }

      /*
       * =================================================
       * PAGESAT
       * =================================================
       */

      const {
        data: payments,
        error: paymentsError,
      } = await supabase
        .from('payments')
        .select('shuma')

      if (paymentsError) {
        console.error(
          'Gabim te pagesat:',
          paymentsError
        )
      } else {
        const total =
          (payments || []).reduce(
            (sum, payment) =>
              sum +
              Number(
                payment.shuma || 0
              ),
            0
          )

        setPaymentTotal(total)
      }

      /*
       * =================================================
       * CERTIFIKATAT
       * =================================================
       */

      const {
        count: certificatesCount,
        error: certificatesError,
      } = await supabase
        .from('certificates')
        .select('*', {
          count: 'exact',
          head: true,
        })

      if (certificatesError) {
        console.error(
          'Gabim te certifikatat:',
          certificatesError
        )

        setCertificateCount(0)
      } else {
        setCertificateCount(
          certificatesCount || 0
        )
      }

      /*
       * =================================================
       * GARAT
       * =================================================
       */

      const {
        count: competitionsCount,
        error: competitionsError,
      } = await supabase
        .from('competitions')
        .select('*', {
          count: 'exact',
          head: true,
        })

      if (competitionsError) {
        console.error(
          'Gabim te garat:',
          competitionsError
        )

        setCompetitionCount(0)
      } else {
        setCompetitionCount(
          competitionsCount || 0
        )
      }
    } catch (error) {
      console.error(
        'Gabim gjatë ngarkimit të dashboard-it:',
        error
      )
    } finally {
      setLoadingStats(false)
    }
  }

  /* =====================================================
     LOAD DATA
     ===================================================== */

  useEffect(() => {
    if (loggedIn) {
      loadDashboardData()
    }
  }, [loggedIn])

  /* =====================================================
     LOGIN
     ===================================================== */

  const handleLogin = (user) => {
    localStorage.setItem(
      'drenica_logged_in',
      'true'
    )

    if (user) {
      localStorage.setItem(
        'drenica_user',
        JSON.stringify(user)
      )

      setCurrentUser(user)
    }

    setLoggedIn(true)
  }

  /* =====================================================
     LOGOUT
     ===================================================== */

  const handleLogout = () => {
    const confirmed =
      window.confirm(
        'A dëshironi të dilni nga administrimi?'
      )

    if (!confirmed) {
      return
    }

    localStorage.removeItem(
      'drenica_logged_in'
    )

    localStorage.removeItem(
      'drenica_user'
    )

    setCurrentUser(null)
    setLoggedIn(false)
    setPage('dashboard')
  }

  /* =====================================================
     NOT LOGGED IN
     ===================================================== */

  if (!loggedIn) {
    return (
      <Login
        onLogin={handleLogin}
      />
    )
  }

  /* =====================================================
     APP
     ===================================================== */

  return (
    <div className="app">

      {/* =================================================
          SIDEBAR
          ================================================= */}

      <aside className="sidebar">

        {/* BRAND */}

        <div className="brand">

          <div
            className="brand-logo"
            style={{
              width: '52px',
              height: '52px',
              minWidth: '52px',
              borderRadius: '12px',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#fff',
              padding: '4px',
            }}
          >

            <img
              src={logo}
              alt="DRENICA Logo"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block',
              }}
            />

          </div>

          <div>

            <h1>
              {currentUser
                ?.organization
                ?.name
                ? currentUser
                    .organization
                    .name
                : 'DRENICA'}
            </h1>

            <span>
              {isSuperAdmin
                ? 'Super Admin'
                : 'Administrimi'}
            </span>

          </div>

        </div>

        {/* MENU */}

        <nav className="menu">

          {/* KRYEFAQJA */}

          <button
            className={`menu-item ${
              page === 'dashboard'
                ? 'active'
                : ''
            }`}
            onClick={() => {
              setPage('dashboard')
              loadDashboardData()
            }}
          >
            🏠 Kryefaqja
          </button>

          {/* ANËTARËT */}

          <button
            className={`menu-item ${
              page === 'members'
                ? 'active'
                : ''
            }`}
            onClick={() =>
              setPage('members')
            }
          >
            👥 Anëtarët
          </button>

          {/* PAGESAT */}

          <button
            className={`menu-item ${
              page === 'payments'
                ? 'active'
                : ''
            }`}
            onClick={() =>
              setPage('payments')
            }
          >
            💳 Pagesat
          </button>

          {/* CERTIFIKATAT */}

          <button
            className={`menu-item ${
              page === 'certificates'
                ? 'active'
                : ''
            }`}
            onClick={() =>
              setPage('certificates')
            }
          >
            📜 Certifikatat
          </button>

          {/* FATURAT */}

          <button
            className={`menu-item ${
              page === 'invoices'
                ? 'active'
                : ''
            }`}
            onClick={() =>
              setPage('invoices')
            }
          >
            🧾 Faturat
          </button>

          {/* RAPORTET */}

          <button
            className={`menu-item ${
              page === 'reports'
                ? 'active'
                : ''
            }`}
            onClick={() =>
              setPage('reports')
            }
          >
            📊 Raportet
          </button>

          {/* GARAT */}

          <button
            className={`menu-item ${
              page === 'competitions'
                ? 'active'
                : ''
            }`}
            onClick={() =>
              setPage('competitions')
            }
          >
            🎣 Garat & Aktivitetet
          </button>

          {/* DOKUMENTET */}

          <button
            className={`menu-item ${
              page === 'documents'
                ? 'active'
                : ''
            }`}
            onClick={() =>
              setPage('documents')
            }
          >
            📁 Dokumentet
          </button>

          {/* =============================================
              MENAXHIMI I SHOQATAVE
              VETËM SUPER ADMIN
              ============================================= */}

          {isSuperAdmin && (
            <button
              className={`menu-item ${
                page === 'organizations'
                  ? 'active'
                  : ''
              }`}
              onClick={() =>
                setPage(
                  'organizations'
                )
              }
            >
              🏢 Menaxhimi i shoqatave
            </button>
          )}

        </nav>

        {/* SIDEBAR BOTTOM */}

        <div className="sidebar-bottom">

          {/* CILËSIMET */}

          <button
            className={`menu-item ${
              page === 'settings'
                ? 'active'
                : ''
            }`}
            onClick={() =>
              setPage('settings')
            }
          >
            ⚙️ Cilësimet
          </button>

          {/* DIL */}

          <button
            className="menu-item"
            onClick={
              handleLogout
            }
          >
            🚪 Dil
          </button>

        </div>

      </aside>

      {/* =================================================
          MAIN
          ================================================= */}

      <main className="main">

        {/* =================================================
            MENAXHIMI I SHOQATAVE
            ================================================= */}

        {page === 'organizations' &&
        isSuperAdmin ? (

          <OrganizationsManagement />

        ) : page === 'members' ? (

          <Members />

        ) : page === 'payments' ? (

          <Payments />

        ) : page === 'certificates' ? (

          <Certificates />

        ) : page === 'invoices' ? (

          <Invoices />

        ) : page === 'reports' ? (

          <Reports />

        ) : page === 'competitions' ? (

          <Competitions />

        ) : page === 'documents' ? (

          <Documents />

        ) : page === 'settings' ? (

          <Settings />

        ) : (

          /* =================================================
             DASHBOARD
             ================================================= */

          <>

            {/* HEADER */}

            <header className="header">

              <div>

                <h2>
                  Kryefaqja
                </h2>

                <p>
                  Mirë se vini në sistemin
                  e Shoqatës{' '}
                  {currentUser
                    ?.organization
                    ?.name ||
                    'DRENICA'}
                  .
                </p>

              </div>

              <div className="user">

                <div className="avatar">
                  {isSuperAdmin
                    ? 'S'
                    : 'A'}
                </div>

                <div>

                  <strong>
                    {currentUser
                      ?.username ||
                      'Administrator'}
                  </strong>

                  <span>
                    {isSuperAdmin
                      ? 'Super Admin'
                      : 'Administrator'}
                  </span>

                </div>

              </div>

            </header>

            {/* CONTENT */}

            <section className="content">

              {/* WELCOME */}

              <div className="welcome">

                <div>

                  <h3>
                    {currentUser
                      ?.organization
                      ?.name ||
                      'Shoqata e Peshkatarëve Sportiv Rekreativ "DRENICA"'}
                  </h3>

                  <p>
                    Menaxho anëtarët,
                    pagesat, certifikatat,
                    raportet dhe aktivitetet
                    e shoqatës nga një vend.
                  </p>

                </div>

                <button
                  className="primary-button"
                  onClick={() =>
                    setPage('members')
                  }
                >
                  + Regjistro anëtar
                </button>

              </div>

              {/* STATS */}

              <div className="stats">

                {/* ANËTARËT */}

                <div className="stat-card">

                  <span>
                    Anëtarë aktivë
                  </span>

                  <strong>
                    {loadingStats
                      ? '...'
                      : memberCount}
                  </strong>

                  <small>
                    Total në sistem
                  </small>

                </div>

                {/* PAGESAT */}

                <div className="stat-card">

                  <span>
                    Pagesa
                  </span>

                  <strong>
                    {loadingStats
                      ? '...'
                      : `${paymentTotal.toFixed(
                          2
                        )} €`}
                  </strong>

                  <small>
                    Të hyra nga pagesat
                  </small>

                </div>

                {/* CERTIFIKATAT */}

                <div className="stat-card">

                  <span>
                    Certifikata
                  </span>

                  <strong>
                    {loadingStats
                      ? '...'
                      : certificateCount}
                  </strong>

                  <small>
                    Certifikata të
                    regjistruara
                  </small>

                </div>

                {/* TË HYRAT */}

                <div className="stat-card">

                  <span>
                    Të hyra totale
                  </span>

                  <strong>
                    {loadingStats
                      ? '...'
                      : `${paymentTotal.toFixed(
                          2
                        )} €`}
                  </strong>

                  <small>
                    Të hyra nga
                    anëtarësimet
                  </small>

                </div>

              </div>

              {/* DASHBOARD GRID */}

              <div className="dashboard-grid">

                {/* AKTIVITETET */}

                <section className="panel">

                  <div className="panel-header">

                    <div>

                      <h3>
                        Aktivitetet e fundit
                      </h3>

                      <p>
                        Veprimet e fundit
                        në sistem
                      </p>

                    </div>

                  </div>

                  <div className="empty-state">

                    <div className="empty-icon">
                      📋
                    </div>

                    <strong>
                      Sistemi është aktiv
                    </strong>

                    <span>
                      Të dhënat e sistemit
                      ruhen në databazën
                      Supabase.
                    </span>

                  </div>

                </section>

                {/* PËRMBLEDHJE */}

                <section className="panel">

                  <div className="panel-header">

                    <div>

                      <h3>
                        Përmbledhje
                      </h3>

                      <p>
                        Gjendja e shoqatës
                      </p>

                    </div>

                  </div>

                  <div className="summary">

                    <div>

                      <span>
                        Certifikata
                        këtë vit
                      </span>

                      <strong>
                        {loadingStats
                          ? '...'
                          : certificateCount}
                      </strong>

                    </div>

                    <div>

                      <span>
                        Pagesa
                      </span>

                      <strong>
                        {loadingStats
                          ? '...'
                          : `${paymentTotal.toFixed(
                              2
                            )} €`}
                      </strong>

                    </div>

                    <div>

                      <span>
                        Gara /
                        aktivitete
                      </span>

                      <strong>
                        {loadingStats
                          ? '...'
                          : competitionCount}
                      </strong>

                    </div>

                  </div>

                </section>

              </div>

            </section>

          </>

        )}

      </main>

    </div>
  )
}

export default App