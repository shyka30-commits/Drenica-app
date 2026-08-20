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

function App() {
  const [loggedIn, setLoggedIn] = useState(() => {
    return (
      localStorage.getItem(
        'drenica_logged_in'
      ) === 'true'
    )
  })

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
     LOAD DASHBOARD DATA FROM SUPABASE
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

  const handleLogin = () => {
    localStorage.setItem(
      'drenica_logged_in',
      'true'
    )

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
              DRENICA
            </h1>

            <span>
              Administrimi
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

        {page === 'members' ? (

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
                  e Shoqatës DRENICA.
                </p>

              </div>

              <div className="user">

                <div className="avatar">
                  A
                </div>

                <div>

                  <strong>
                    Administrator
                  </strong>

                  <span>
                    Administrator
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
                    Shoqata e Peshkatarëve
                    Sportiv Rekreativ
                    "DRENICA"
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