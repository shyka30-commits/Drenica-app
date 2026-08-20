import { useEffect, useState } from 'react'
import { supabase } from './utils/supabase'

function Invoices() {
  const [showForm, setShowForm] = useState(false)
  const [members, setMembers] = useState([])
  const [invoices, setInvoices] = useState([])
  const [loadingMembers, setLoadingMembers] = useState(true)

  const today = new Date()
    .toISOString()
    .split('T')[0]

  const [form, setForm] = useState({
    memberId: '',
    shuma: '',
    data: today,
    pershkrimi: 'Pagesa e anëtarësimit',
  })

  const categories = {
    Senior: 50,
    Junior: 25,
    Pioner: 0,
    Femra: 0,
    'Veteran i luftës': 25,
    'Invalid i luftës': 0,
    Pensioner: 25,
    'Veteran peshkimi mbi 70 vjeç': 0,
    Polic: 0,
    'Persona me aftësi të kufizuara': 0,
    FSK: 0,
  }

  /* =====================================================
     NGARKO ANËTARËT NGA SUPABASE
  ===================================================== */

  const loadMembers = async () => {
    setLoadingMembers(true)

    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('created_at', {
        ascending: false,
      })

    if (error) {
      console.error(
        'Gabim gjatë marrjes së anëtarëve:',
        error
      )

      setMembers([])
      setLoadingMembers(false)

      alert(
        `Gabim gjatë marrjes së anëtarëve:\n\n${error.message}`
      )

      return
    }

    console.log('ANËTARËT NGA SUPABASE:', data)

    setMembers(data || [])
    setLoadingMembers(false)
  }

  /* =====================================================
     NGARKO FATURAT
  ===================================================== */

  const loadInvoices = () => {
    const saved =
      localStorage.getItem('drenica_invoices')

    if (!saved) {
      setInvoices([])
      return
    }

    try {
      const parsed = JSON.parse(saved)

      setInvoices(
        Array.isArray(parsed)
          ? parsed
          : []
      )
    } catch (error) {
      console.error(
        'Gabim gjatë leximit të faturave:',
        error
      )

      setInvoices([])
    }
  }

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    loadMembers()
    loadInvoices()
  }, [])

  /* =====================================================
     RUAJ FATURAT
  ===================================================== */

  useEffect(() => {
    localStorage.setItem(
      'drenica_invoices',
      JSON.stringify(invoices)
    )
  }, [invoices])

  /* =====================================================
     ÇMIMI SIPAS KATEGORISË
  ===================================================== */

  const getCategoryPrice = (
    categoryName
  ) => {
    return categories[categoryName] ?? 0
  }

  /* =====================================================
     NDRYSHIMI I FORMËS
  ===================================================== */

  const handleChange = (e) => {
    const { name, value } = e.target

    if (name === 'memberId') {
      const selected = members.find(
        (member) =>
          String(member.id) ===
          String(value)
      )

      if (selected) {
        const price =
          getCategoryPrice(
            selected.kategoria
          )

        setForm((prev) => ({
          ...prev,
          memberId: value,
          shuma: price,
        }))
      } else {
        setForm((prev) => ({
          ...prev,
          memberId: '',
          shuma: '',
        }))
      }

      return
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  /* =====================================================
     ANËTARI I ZGJEDHUR
  ===================================================== */

  const selectedMember =
    members.find(
      (member) =>
        String(member.id) ===
        String(form.memberId)
    )

  const selectedCategory =
    selectedMember
      ? selectedMember.kategoria || '-'
      : ''

  /* =====================================================
     RUAJ FATURËN
  ===================================================== */

  const handleSave = (e) => {
    e.preventDefault()

    if (!form.memberId) {
      alert(
        'Ju lutem zgjidhni anëtarin.'
      )
      return
    }

    if (!form.data) {
      alert(
        'Ju lutem zgjidhni datën.'
      )
      return
    }

    if (!selectedMember) {
      alert(
        'Anëtari nuk u gjet.'
      )
      return
    }

    const price =
      getCategoryPrice(
        selectedMember.kategoria
      )

    const newInvoice = {
      id: Date.now(),

      nrFatures:
        `F-${String(
          invoices.length + 1
        ).padStart(5, '0')}`,

      memberId:
        selectedMember.id,

      memberName:
        `${selectedMember.emri || ''} ${
          selectedMember.mbiemri || ''
        }`.trim(),

      kategoria:
        selectedMember.kategoria ||
        '-',

      shuma: price,

      data: form.data,

      pershkrimi:
        form.pershkrimi ||
        'Pagesa e anëtarësimit',

      createdAt:
        new Date().toISOString(),
    }

    setInvoices((prev) => [
      ...prev,
      newInvoice,
    ])

    setForm({
      memberId: '',
      shuma: '',
      data:
        new Date()
          .toISOString()
          .split('T')[0],
      pershkrimi:
        'Pagesa e anëtarësimit',
    })

    setShowForm(false)

    alert(
      `Fatura ${newInvoice.nrFatures} u ruajt me sukses!`
    )
  }

  /* =====================================================
     FSHI FATURËN
  ===================================================== */

  const handleDelete = (id) => {
    const confirmed =
      window.confirm(
        'A jeni të sigurt që dëshironi ta fshini këtë faturë?'
      )

    if (!confirmed) {
      return
    }

    setInvoices((prev) =>
      prev.filter(
        (invoice) =>
          invoice.id !== id
      )
    )
  }

  /* =====================================================
     PRINTIMI
  ===================================================== */

  const printInvoice = (
    invoice
  ) => {
    const printWindow =
      window.open(
        '',
        '_blank',
        'width=900,height=1000'
      )

    if (!printWindow) {
      alert(
        'Lejo popup-et në shfletues për të printuar faturën.'
      )

      return
    }

    const safe = (value) =>
      String(value ?? '')
        .replace(
          /&/g,
          '&amp;'
        )
        .replace(
          /</g,
          '&lt;'
        )
        .replace(
          />/g,
          '&gt;'
        )
        .replace(
          /"/g,
          '&quot;'
        )
        .replace(
          /'/g,
          '&#039;'
        )

    printWindow.document.write(`
      <!DOCTYPE html>

      <html lang="sq">

      <head>

        <meta charset="UTF-8">

        <title>
          Fatura ${safe(
            invoice.nrFatures
          )}
        </title>

        <style>

          * {
            box-sizing: border-box;
          }

          @page {
            size: A4;
            margin: 15mm;
          }

          body {
            margin: 0;
            padding: 0;
            background: white;
            color: #111;
            font-family:
              Arial,
              Helvetica,
              sans-serif;
          }

          .invoice {
            width: 100%;
            max-width: 760px;
            margin: 0 auto;
            padding: 35px;
            border: 1px solid #d8d8d8;
          }

          .top {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 25px;
            padding-bottom: 22px;
            border-bottom: 2px solid #222;
          }

          .logo {
            width: 115px;
            height: 115px;
            object-fit: contain;
            flex-shrink: 0;
          }

          .organization {
            text-align: center;
            flex: 1;
          }

          .organization h1 {
            margin: 0;
            font-size: 20px;
            line-height: 1.4;
            font-weight: 700;
          }

          .organization h2 {
            margin:
              12px 0 0;
            font-size: 20px;
            letter-spacing: 1px;
          }

          .organization p {
            margin:
              8px 0 0;
            font-size: 13px;
            color: #555;
          }

          .invoice-title {
            text-align: center;
            margin:
              25px 0;
          }

          .invoice-title h3 {
            margin: 0;
            font-size: 25px;
          }

          .invoice-title p {
            margin:
              7px 0 0;
            color: #666;
          }

          .invoice-number {
            text-align: right;
            margin-bottom: 20px;
            font-size: 15px;
          }

          .info {
            border:
              1px solid #ccc;
          }

          .row {
            display: flex;
            min-height: 48px;
            border-bottom:
              1px solid #ddd;
          }

          .row:last-child {
            border-bottom: none;
          }

          .label {
            width: 190px;
            padding: 14px;
            background: #f5f5f5;
            font-weight: bold;
          }

          .value {
            flex: 1;
            padding: 14px;
          }

          .total {
            margin-top: 25px;
            display: flex;
            justify-content:
              space-between;
            align-items:
              center;
            padding:
              18px 20px;
            border:
              2px solid #222;
            font-size: 22px;
            font-weight: bold;
          }

          .note {
            margin-top: 20px;
            padding: 15px;
            border:
              1px solid #ddd;
            font-size: 14px;
            line-height: 1.5;
          }

          .signatures {
            margin-top: 75px;
            display: grid;
            grid-template-columns:
              1fr 170px 1fr;
            gap: 30px;
            align-items: end;
          }

          .signature {
            text-align: center;
            padding-top: 10px;
            border-top:
              1px solid #222;
            font-size: 13px;
          }

          .stamp-area {
            display: flex;
            flex-direction:
              column;
            align-items:
              center;
            justify-content:
              center;
          }

          .stamp {
            width: 145px;
            height: 145px;
            border:
              2px dashed #777;
            border-radius: 50%;
            display: flex;
            align-items:
              center;
            justify-content:
              center;
            text-align: center;
            color: #555;
            font-size: 13px;
            line-height: 1.4;
          }

          .stamp-text {
            margin-top: 8px;
            font-size: 12px;
            color: #666;
          }

          .footer {
            margin-top: 45px;
            padding-top: 15px;
            border-top:
              1px solid #ddd;
            text-align: center;
            font-size: 12px;
            color: #666;
          }

          @media print {

            body {
              background: white;
            }

            .invoice {
              border: none;
              max-width: none;
              padding: 0;
            }

          }

        </style>

      </head>

      <body>

        <div class="invoice">

          <div class="top">

            <img
              src="/logo.png"
              class="logo"
              alt="Logo DRENICA"
            >

            <div class="organization">

              <h1>
                Shoqata e Peshkatarëve
                Sportiv Rekreativ
                ''DRENICA''
              </h1>

              <h2>
                FATURË / DËSHMI PAGESE
              </h2>

              <p>
                Dokument zyrtar i pagesës
                së anëtarësimit
              </p>

            </div>

          </div>

          <div class="invoice-title">

            <h3>
              FATURË
            </h3>

            <p>
              Dëshmi e pagesës
              së anëtarësimit
            </p>

          </div>

          <div class="invoice-number">

            <strong>
              Nr. i faturës:
            </strong>

            ${safe(
              invoice.nrFatures
            )}

          </div>

          <div class="info">

            <div class="row">

              <div class="label">
                Anëtari
              </div>

              <div class="value">
                ${safe(
                  invoice.memberName
                )}
              </div>

            </div>

            <div class="row">

              <div class="label">
                Kategoria
              </div>

              <div class="value">
                ${safe(
                  invoice.kategoria
                )}
              </div>

            </div>

            <div class="row">

              <div class="label">
                Data e faturës
              </div>

              <div class="value">
                ${safe(
                  invoice.data
                )}
              </div>

            </div>

            <div class="row">

              <div class="label">
                Përshkrimi
              </div>

              <div class="value">
                ${safe(
                  invoice.pershkrimi ||
                  '-'
                )}
              </div>

            </div>

          </div>

          <div class="total">

            <span>
              TOTALI
            </span>

            <span>
              ${Number(
                invoice.shuma || 0
              ).toFixed(2)} €
            </span>

          </div>

          <div class="note">

            <strong>
              Shënim:
            </strong>

            Kjo faturë shërben si
            dëshmi e pagesës së
            anëtarësimit në
            Shoqatën e Peshkatarëve
            Sportiv Rekreativ
            ''DRENICA''.

          </div>

          <div class="signatures">

            <div class="signature">
              Nënshkrimi i arkëtarit
            </div>

            <div class="stamp-area">

              <div class="stamp">

                VULË

                <br>

                SHOQATA

                <br>

                DRENICA

              </div>

              <div class="stamp-text">
                Vendi për vulën zyrtare
              </div>

            </div>

            <div class="signature">
              Nënshkrimi i anëtarit
            </div>

          </div>

          <div class="footer">

            Faleminderit për pagesën
            dhe për mbështetjen
            e shoqatës.

          </div>

        </div>

      </body>

      </html>
    `)

    printWindow.document.close()
    printWindow.focus()

    setTimeout(() => {
      printWindow.print()
    }, 700)
  }

  /* =====================================================
     PRINT NGA FORMA
  ===================================================== */

  const printFormInvoice = () => {
    if (!form.memberId) {
      alert(
        'Ju lutem zgjidhni anëtarin.'
      )
      return
    }

    if (!form.data) {
      alert(
        'Ju lutem zgjidhni datën.'
      )
      return
    }

    if (!selectedMember) {
      alert(
        'Anëtari nuk u gjet.'
      )
      return
    }

    const temporaryInvoice = {
      nrFatures:
        `F-${String(
          invoices.length + 1
        ).padStart(5, '0')}`,

      memberName:
        `${selectedMember.emri || ''} ${
          selectedMember.mbiemri || ''
        }`.trim(),

      kategoria:
        selectedMember.kategoria ||
        '-',

      shuma:
        getCategoryPrice(
          selectedMember.kategoria
        ),

      data:
        form.data,

      pershkrimi:
        form.pershkrimi ||
        'Pagesa e anëtarësimit',
    }

    printInvoice(
      temporaryInvoice
    )
  }

  /* =====================================================
     TOTALI
  ===================================================== */

  const totalInvoices =
    invoices.reduce(
      (total, invoice) =>
        total +
        Number(
          invoice.shuma || 0
        ),
      0
    )

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <div className="members-page">

      {/* HEADER */}

      <div className="members-header">

        <div>

          <h2>
            Faturat
          </h2>

          <p>
            Menaxho faturat dhe dëshmitë
            e pagesave të anëtarëve.
          </p>

        </div>

        <button
          className="primary-button"
          onClick={() => {
            loadMembers()
            setShowForm(true)
          }}
        >
          + Krijo faturë
        </button>

      </div>

      {/* STATS */}

      <div className="stats">

        <div className="stat-card">

          <span>
            Gjithsej fatura
          </span>

          <strong>
            {invoices.length}
          </strong>

          <small>
            Fatura të regjistruara
          </small>

        </div>

        <div className="stat-card">

          <span>
            Totali
          </span>

          <strong>
            {totalInvoices.toFixed(2)} €
          </strong>

          <small>
            Vlera e faturave
          </small>

        </div>

        <div className="stat-card">

          <span>
            Anëtarë
          </span>

          <strong>
            {members.length}
          </strong>

          <small>
            Anëtarë në databazë
          </small>

        </div>

      </div>

      {/* FORM */}

      {showForm && (

        <div className="member-form">

          <h3>
            Krijo faturë të re
          </h3>

          {loadingMembers ? (

            <div
              style={{
                padding: '20px',
                textAlign: 'center',
              }}
            >
              ⏳ Duke ngarkuar
              anëtarët...
            </div>

          ) : members.length === 0 ? (

            <div
              style={{
                padding: '20px',
                borderRadius: '10px',
                background:
                  '#fff3cd',
                color: '#664d03',
              }}
            >

              <strong>
                Nuk u gjet asnjë
                anëtar.
              </strong>

              <p>
                Kontrollo te faqja
                <strong>
                  {' '}Anëtarët{' '}
                </strong>
                nëse anëtarët janë
                ruajtur në databazën
                Supabase.
              </p>

              <button
                type="button"
                className="secondary-button"
                onClick={
                  loadMembers
                }
              >
                🔄 Rifresko anëtarët
              </button>

            </div>

          ) : (

            <form
              onSubmit={
                handleSave
              }
            >

              <div className="form-grid">

                {/* ANËTARI */}

                <div className="form-group">

                  <label>
                    Anëtari *
                  </label>

                  <select
                    name="memberId"
                    value={
                      form.memberId
                    }
                    onChange={
                      handleChange
                    }
                    required
                  >

                    <option value="">
                      Zgjedh anëtarin
                    </option>

                    {members.map(
                      (member) => (

                        <option
                          key={
                            member.id
                          }
                          value={
                            member.id
                          }
                        >

                          {
                            member.emri ||
                            ''
                          }{' '}
                          {
                            member.mbiemri ||
                            ''
                          }

                        </option>

                      )
                    )}

                  </select>

                </div>

                {/* KATEGORIA */}

                <div className="form-group">

                  <label>
                    Kategoria
                  </label>

                  <input
                    type="text"
                    value={
                      selectedCategory
                    }
                    placeholder="Zgjidhet automatikisht"
                    readOnly
                  />

                </div>

                {/* SHUMA */}

                <div className="form-group">

                  <label>
                    Shuma (€)
                  </label>

                  <input
                    type="number"
                    value={
                      form.shuma
                    }
                    readOnly
                    placeholder="Zgjidhet automatikisht"
                  />

                  <small>
                    Çmimi caktohet
                    automatikisht sipas
                    kategorisë.
                  </small>

                </div>

                {/* DATA */}

                <div className="form-group">

                  <label>
                    Data e faturës *
                  </label>

                  <input
                    type="date"
                    name="data"
                    value={
                      form.data
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />

                </div>

                {/* PËRSHKRIMI */}

                <div className="form-group">

                  <label>
                    Përshkrimi
                  </label>

                  <input
                    type="text"
                    name="pershkrimi"
                    value={
                      form.pershkrimi
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="p.sh. Pagesa e anëtarësimit"
                  />

                </div>

              </div>

              {/* PREVIEW */}

              {selectedMember && (

                <div
                  style={{
                    marginTop:
                      '18px',
                    padding:
                      '16px',
                    borderRadius:
                      '10px',
                    background:
                      '#f5f7fa',
                  }}
                >

                  <strong>
                    Fatura për:
                  </strong>{' '}

                  {
                    selectedMember.emri
                  }{' '}

                  {
                    selectedMember.mbiemri
                  }

                  <br />

                  <span>
                    Kategoria:{' '}
                    {
                      selectedMember.kategoria ||
                      '-'
                    }
                  </span>

                  <br />

                  <span>
                    Çmimi:{' '}

                    {getCategoryPrice(
                      selectedMember.kategoria
                    ).toFixed(2)}

                    {' '}€
                  </span>

                </div>

              )}

              {/* BUTTONS */}

              <div className="form-actions">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() =>
                    setShowForm(
                      false
                    )
                  }
                >
                  Mbyll
                </button>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={
                    printFormInvoice
                  }
                >
                  🖨️ Printo faturën
                </button>

                <button
                  type="submit"
                  className="primary-button"
                >
                  💾 Ruaj faturën
                </button>

              </div>

            </form>

          )}

        </div>

      )}

      {/* LISTA */}

      <div className="members-list">

        <div className="members-list-header">

          <div>

            <h3>
              Lista e faturave
            </h3>

            <p>
              Të gjitha faturat
              e regjistruara.
            </p>

          </div>

        </div>

        {invoices.length === 0 ? (

          <div className="members-empty">

            <div className="empty-icon">
              🧾
            </div>

            <strong>
              Nuk ka fatura ende
            </strong>

            <span>
              Shtyp “+ Krijo faturë”
              për të regjistruar
              faturën e parë.
            </span>

          </div>

        ) : (

          <div className="members-table-wrapper">

            <table className="members-table">

              <thead>

                <tr>

                  <th>
                    Nr. faturës
                  </th>

                  <th>
                    Anëtari
                  </th>

                  <th>
                    Kategoria
                  </th>

                  <th>
                    Shuma
                  </th>

                  <th>
                    Data
                  </th>

                  <th>
                    Përshkrimi
                  </th>

                  <th>
                    Veprim
                  </th>

                </tr>

              </thead>

              <tbody>

                {invoices.map(
                  (invoice) => (

                    <tr
                      key={
                        invoice.id
                      }
                    >

                      <td>
                        <strong>
                          {
                            invoice.nrFatures
                          }
                        </strong>
                      </td>

                      <td>
                        <strong>
                          {
                            invoice.memberName
                          }
                        </strong>
                      </td>

                      <td>
                        {
                          invoice.kategoria
                        }
                      </td>

                      <td>

                        <strong>
                          {Number(
                            invoice.shuma ||
                              0
                          ).toFixed(2)}
                          {' '}€
                        </strong>

                      </td>

                      <td>
                        {
                          invoice.data
                        }
                      </td>

                      <td>
                        {
                          invoice.pershkrimi ||
                          '-'
                        }
                      </td>

                      <td>

                        <button
                          className="secondary-button"
                          onClick={() =>
                            printInvoice(
                              invoice
                            )
                          }
                        >
                          🖨️ Printo
                        </button>

                        <button
                          className="delete-button"
                          onClick={() =>
                            handleDelete(
                              invoice.id
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

export default Invoices