import { useEffect, useState } from 'react'

function Competitions() {
  const [showForm, setShowForm] = useState(false)

  const [competitions, setCompetitions] = useState(() => {
    const savedCompetitions = localStorage.getItem(
      'drenica_competitions'
    )

    return savedCompetitions
      ? JSON.parse(savedCompetitions)
      : []
  })

  const [form, setForm] = useState({
    emri: '',
    lloji: 'Garë',
    data: '',
    vendi: '',
    pjesemarres: '',
    pershkrimi: '',
  })

  useEffect(() => {
    localStorage.setItem(
      'drenica_competitions',
      JSON.stringify(competitions)
    )
  }, [competitions])

  const handleChange = (e) => {
    const { name, value } = e.target

    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }))
  }

  const handleSave = (e) => {
    e.preventDefault()

    if (!form.emri || !form.data || !form.vendi) {
      alert(
        'Ju lutem plotësoni emrin, datën dhe vendin.'
      )
      return
    }

    const newCompetition = {
      id: Date.now(),
      emri: form.emri,
      lloji: form.lloji,
      data: form.data,
      vendi: form.vendi,
      pjesemarres: Number(form.pjesemarres || 0),
      pershkrimi: form.pershkrimi,
    }

    setCompetitions((prevCompetitions) => [
      ...prevCompetitions,
      newCompetition,
    ])

    setForm({
      emri: '',
      lloji: 'Garë',
      data: '',
      vendi: '',
      pjesemarres: '',
      pershkrimi: '',
    })

    setShowForm(false)
  }

  const handleDelete = (id) => {
    const confirmed = window.confirm(
      'A jeni të sigurt që dëshironi ta fshini këtë garë/aktivitet?'
    )

    if (confirmed) {
      setCompetitions((prevCompetitions) =>
        prevCompetitions.filter(
          (competition) => competition.id !== id
        )
      )
    }
  }

  const printCompetition = (competition) => {
    const printWindow = window.open(
      '',
      '_blank',
      'width=800,height=900'
    )

    if (!printWindow) {
      alert(
        'Lejo popup-et në shfletues për të printuar.'
      )
      return
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${competition.emri}</title>

          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 50px;
              color: #222;
            }

            .document {
              max-width: 700px;
              margin: auto;
            }

            h1 {
              margin-bottom: 5px;
            }

            .subtitle {
              color: #666;
              margin-bottom: 40px;
            }

            .line {
              border-bottom: 1px solid #ddd;
              padding: 14px 0;
            }

            .description {
              margin-top: 30px;
              padding: 20px;
              background: #f5f5f5;
              border-radius: 8px;
            }

            .footer {
              margin-top: 60px;
              color: #666;
            }
          </style>
        </head>

        <body>
          <div class="document">

            <h1>SHOQATA DRENICA</h1>

            <div class="subtitle">
              Garë / Aktivitet
            </div>

            <div class="line">
              <strong>Emri:</strong>
              ${competition.emri}
            </div>

            <div class="line">
              <strong>Lloji:</strong>
              ${competition.lloji}
            </div>

            <div class="line">
              <strong>Data:</strong>
              ${competition.data}
            </div>

            <div class="line">
              <strong>Vendi:</strong>
              ${competition.vendi}
            </div>

            <div class="line">
              <strong>Pjesëmarrës:</strong>
              ${competition.pjesemarres}
            </div>

            <div class="description">
              <strong>Përshkrimi</strong>
              <p>
                ${competition.pershkrimi || '-'}
              </p>
            </div>

            <div class="footer">
              Shoqata e Peshkatarëve Sportiv Rekreativ
              "DRENICA"
            </div>

          </div>
        </body>
      </html>
    `)

    printWindow.document.close()
    printWindow.focus()

    setTimeout(() => {
      printWindow.print()
    }, 300)
  }

  const totalParticipants = competitions.reduce(
    (total, competition) =>
      total + Number(competition.pjesemarres || 0),
    0
  )

  return (
    <div className="members-page">

      <div className="members-header">

        <div>
          <h2>Garat & Aktivitetet</h2>

          <p>
            Menaxho garat, aktivitetet dhe pjesëmarrjen
            e shoqatës.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() => setShowForm(true)}
        >
          + Regjistro garë / aktivitet
        </button>

      </div>

      {/* PËRMBLEDHJA */}

      <div className="stats">

        <div className="stat-card">
          <span>Gjithsej gara</span>

          <strong>
            {competitions.length}
          </strong>

          <small>
            Gara dhe aktivitete të regjistruara
          </small>
        </div>

        <div className="stat-card">
          <span>Pjesëmarrës</span>

          <strong>
            {totalParticipants}
          </strong>

          <small>
            Pjesëmarrës të regjistruar
          </small>
        </div>

      </div>

      {/* FORMULARI */}

      {showForm && (
        <div className="member-form">

          <h3>
            Regjistro garë / aktivitet të ri
          </h3>

          <form onSubmit={handleSave}>

            <div className="form-grid">

              <div className="form-group">
                <label>
                  Emri i garës / aktivitetit
                </label>

                <input
                  type="text"
                  name="emri"
                  value={form.emri}
                  onChange={handleChange}
                  placeholder="p.sh. Gara DRENICA 2026"
                />
              </div>

              <div className="form-group">
                <label>Lloji</label>

                <select
                  name="lloji"
                  value={form.lloji}
                  onChange={handleChange}
                >
                  <option value="Garë">
                    Garë
                  </option>

                  <option value="Aktivitet">
                    Aktivitet
                  </option>

                  <option value="Kampionat">
                    Kampionat
                  </option>

                  <option value="Turne">
                    Turne
                  </option>

                  <option value="Takim">
                    Takim
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label>Data</label>

                <input
                  type="date"
                  name="data"
                  value={form.data}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Vendi</label>

                <input
                  type="text"
                  name="vendi"
                  value={form.vendi}
                  onChange={handleChange}
                  placeholder="p.sh. Liqeni i Batllavës"
                />
              </div>

              <div className="form-group">
                <label>
                  Numri i pjesëmarrësve
                </label>

                <input
                  type="number"
                  name="pjesemarres"
                  value={form.pjesemarres}
                  onChange={handleChange}
                  placeholder="p.sh. 25"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Përshkrimi</label>

                <input
                  type="text"
                  name="pershkrimi"
                  value={form.pershkrimi}
                  onChange={handleChange}
                  placeholder="Përshkrimi i garës / aktivitetit"
                />
              </div>

            </div>

            <div className="form-actions">

              <button
                type="button"
                className="secondary-button"
                onClick={() => setShowForm(false)}
              >
                Mbyll
              </button>

              <button
                type="submit"
                className="primary-button"
              >
                Ruaj garën
              </button>

            </div>

          </form>

        </div>
      )}

      {/* LISTA */}

      <div className="members-list">

        <div className="members-list-header">

          <div>
            <h3>
              Lista e garave & aktiviteteve
            </h3>

            <p>
              Të gjitha garat dhe aktivitetet e
              regjistruara.
            </p>
          </div>

        </div>

        {competitions.length === 0 ? (

          <div className="members-empty">

            <div className="empty-icon">
              🎣
            </div>

            <strong>
              Nuk ka gara ose aktivitete ende
            </strong>

            <span>
              Shtyp “+ Regjistro garë / aktivitet”
              për të shtuar të parën.
            </span>

          </div>

        ) : (

          <div className="members-table-wrapper">

            <table className="members-table">

              <thead>
                <tr>
                  <th>Emri</th>
                  <th>Lloji</th>
                  <th>Data</th>
                  <th>Vendi</th>
                  <th>Pjesëmarrës</th>
                  <th>Përshkrimi</th>
                  <th>Veprim</th>
                </tr>
              </thead>

              <tbody>

                {competitions.map(
                  (competition) => (

                    <tr key={competition.id}>

                      <td>
                        <strong>
                          {competition.emri}
                        </strong>
                      </td>

                      <td>
                        {competition.lloji}
                      </td>

                      <td>
                        {competition.data}
                      </td>

                      <td>
                        {competition.vendi}
                      </td>

                      <td>
                        <strong>
                          {competition.pjesemarres}
                        </strong>
                      </td>

                      <td>
                        {competition.pershkrimi || '-'}
                      </td>

                      <td>

                        <button
                          className="secondary-button"
                          onClick={() =>
                            printCompetition(
                              competition
                            )
                          }
                        >
                          🖨️ Printo
                        </button>

                        <button
                          className="delete-button"
                          onClick={() =>
                            handleDelete(
                              competition.id
                            )
                          }
                        >
                          Fshi
                        </button>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  )
}

export default Competitions