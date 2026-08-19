import './App.css'

function App() {
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">D</div>
          <div>
            <h1>DRENICA</h1>
            <span>Administrimi</span>
          </div>
        </div>

        <nav className="menu">
          <button className="menu-item active">🏠 Dashboard</button>
          <button className="menu-item">👥 Anëtarët</button>
          <button className="menu-item">💳 Pagesat</button>
          <button className="menu-item">📜 Certifikatat</button>
          <button className="menu-item">🧾 Faturat</button>
          <button className="menu-item">📊 Raportet</button>
          <button className="menu-item">🎣 Garat & Aktivitetet</button>
          <button className="menu-item">📁 Dokumentet</button>
        </nav>

        <div className="sidebar-bottom">
          <button className="menu-item">⚙️ Cilësimet</button>
          <button className="menu-item">🚪 Dil</button>
        </div>
      </aside>

      <main className="main">
        <header className="header">
          <div>
            <h2>Dashboard</h2>
            <p>Mirë se vini në sistemin e Shoqatës DRENICA.</p>
          </div>

          <div className="user">
            <div className="avatar">A</div>
            <div>
              <strong>Administrator</strong>
              <span>Administrator</span>
            </div>
          </div>
        </header>

        <section className="content">
          <div className="welcome">
            <div>
              <h3>Shoqata e Peshkatarëve Sportiv Rekreativ "DRENICA"</h3>
              <p>
                Menaxho anëtarët, pagesat, certifikatat, raportet dhe
                aktivitetet e shoqatës nga një vend.
              </p>
            </div>

            <button className="primary-button">+ Regjistro anëtar</button>
          </div>

          <div className="stats">
            <div className="stat-card">
              <span>Anëtarë aktivë</span>
              <strong>0</strong>
              <small>Total në sistem</small>
            </div>

            <div className="stat-card">
              <span>Pagesa</span>
              <strong>0 €</strong>
              <small>Të hyra nga anëtarësimet</small>
            </div>

            <div className="stat-card">
              <span>Certifikata</span>
              <strong>0</strong>
              <small>20 € për certifikatë</small>
            </div>

            <div className="stat-card">
              <span>Të hyra totale</span>
              <strong>0 €</strong>
              <small>Anëtarësime + certifikata</small>
            </div>
          </div>

          <div className="dashboard-grid">
            <section className="panel">
              <div className="panel-header">
                <div>
                  <h3>Aktivitetet e fundit</h3>
                  <p>Veprimet e fundit në sistem</p>
                </div>
              </div>

              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <strong>Nuk ka aktivitete ende</strong>
                <span>Aktivitetet e administratorëve do të shfaqen këtu.</span>
              </div>
            </section>

            <section className="panel">
              <div className="panel-header">
                <div>
                  <h3>Përmbledhje</h3>
                  <p>Gjendja e shoqatës</p>
                </div>
              </div>

              <div className="summary">
                <div>
                  <span>Certifikata këtë vit</span>
                  <strong>0</strong>
                </div>

                <div>
                  <span>Pagesa këtë vit</span>
                  <strong>0 €</strong>
                </div>

                <div>
                  <span>Gara / aktivitete</span>
                  <strong>0</strong>
                </div>
              </div>
            </section>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App