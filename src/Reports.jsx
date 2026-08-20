import { useEffect, useState } from 'react'
import { supabase } from './utils/supabase'

function Reports() {
  const [members, setMembers] = useState([])
  const [payments, setPayments] = useState([])
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)

  const currentYear = new Date().getFullYear()

  const [selectedYear, setSelectedYear] = useState(currentYear)

  const categories = [
    { name: 'Senior', price: 50 },
    { name: 'Junior', price: 25 },
    { name: 'Pioner', price: 0 },
    { name: 'Femra', price: 0 },
    { name: 'Veteran i luftës', price: 25 },
    { name: 'Invalid i luftës', price: 0 },
    { name: 'Pensioner', price: 25 },
    { name: 'Veteran peshkimi mbi 70 vjeç', price: 0 },
    { name: 'Polic', price: 0 },
    { name: 'Persona me aftësi të kufizuara', price: 0 },
    { name: 'FSK', price: 0 },
  ]

  const months = [
    'Janar',
    'Shkurt',
    'Mars',
    'Prill',
    'Maj',
    'Qershor',
    'Korrik',
    'Gusht',
    'Shtator',
    'Tetor',
    'Nëntor',
    'Dhjetor',
  ]

  const loadMembers = async () => {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Gabim anëtarët:', error)
      return []
    }

    return data || []
  }

  const loadPayments = async () => {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Gabim pagesat:', error)
      return []
    }

    return data || []
  }

  const loadCertificates = async () => {
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Gabim certifikatat:', error)
      return []
    }

    return data || []
  }

  const loadData = async () => {
    setLoading(true)

    const [membersData, paymentsData, certificatesData] =
      await Promise.all([
        loadMembers(),
        loadPayments(),
        loadCertificates(),
      ])

    setMembers(membersData)
    setPayments(paymentsData)
    setCertificates(certificatesData)

    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const getMemberId = (payment) => {
    return payment.member_id ?? payment.memberId ?? null
  }

  const getPaymentName = (payment) => {
    return payment.member_name ?? payment.memberName ?? ''
  }

  const getPaymentAmount = (payment) => {
    return Number(payment.shuma ?? payment.amount ?? 0)
  }

  const getPaymentDate = (payment) => {
    return payment.data ?? payment.created_at ?? null
  }

  const getPaymentYear = (payment) => {
    if (
      payment.viti !== null &&
      payment.viti !== undefined &&
      payment.viti !== ''
    ) {
      return Number(payment.viti)
    }

    const dateValue = getPaymentDate(payment)

    if (!dateValue) return null

    const date = new Date(
      `${String(dateValue).slice(0, 10)}T00:00:00`
    )

    if (isNaN(date.getTime())) return null

    return date.getFullYear()
  }

  const getMemberPayments = (memberId) => {
    return payments.filter((payment) => {
      const paymentMemberId = getMemberId(payment)

      if (
        paymentMemberId !== null &&
        paymentMemberId !== undefined
      ) {
        return (
          String(paymentMemberId) === String(memberId)
        )
      }

      const paymentName = String(getPaymentName(payment))
        .trim()
        .toLowerCase()

      const member = members.find(
        (item) => String(item.id) === String(memberId)
      )

      if (!member) return false

      const memberName =
        `${member.emri || ''} ${member.mbiemri || ''}`
          .trim()
          .toLowerCase()

      return paymentName === memberName
    })
  }

  const getMemberPaymentsForYear = (memberId) => {
    return getMemberPayments(memberId).filter(
      (payment) =>
        getPaymentYear(payment) === Number(selectedYear)
    )
  }

  const getMemberTotalPayments = (memberId) => {
    return getMemberPaymentsForYear(memberId).reduce(
      (total, payment) =>
        total + getPaymentAmount(payment),
      0
    )
  }

  const getCategoryMembers = (categoryName) => {
    return members.filter(
      (member) =>
        String(member.kategoria || '').trim() ===
        categoryName
    )
  }

  const getCategoryTotalPayments = (categoryName) => {
    return getCategoryMembers(categoryName).reduce(
      (total, member) =>
        total + getMemberTotalPayments(member.id),
      0
    )
  }

  const formatPaymentDate = (payment) => {
    const dateValue = getPaymentDate(payment)

    if (!dateValue) return '-'

    const cleanDate = String(dateValue).slice(0, 10)

    const date = new Date(`${cleanDate}T00:00:00`)

    if (isNaN(date.getTime())) return cleanDate

    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()

    return `${day}/${month}/${year} — ${months[date.getMonth()]} ${year}`
  }

  const yearPayments = payments.filter(
    (payment) =>
      getPaymentYear(payment) === Number(selectedYear)
  )

  const totalPayments = yearPayments.reduce(
    (total, payment) =>
      total + getPaymentAmount(payment),
    0
  )

  const getCertificateYear = (certificate) => {
    if (
      certificate.viti !== null &&
      certificate.viti !== undefined &&
      certificate.viti !== ''
    ) {
      return Number(certificate.viti)
    }

    const dateValue =
      certificate.data ??
      certificate.created_at ??
      null

    if (!dateValue) return null

    const date = new Date(
      `${String(dateValue).slice(0, 10)}T00:00:00`
    )

    if (isNaN(date.getTime())) return null

    return date.getFullYear()
  }

  const getCertificateAmount = (certificate) => {
    return Number(
      certificate.shuma ??
        certificate.amount ??
        0
    )
  }

  const selectedYearCertificates = certificates.filter(
    (certificate) =>
      getCertificateYear(certificate) ===
      Number(selectedYear)
  )

  const totalCertificatePayments =
    selectedYearCertificates.reduce(
      (total, certificate) =>
        total + getCertificateAmount(certificate),
      0
    )

  const printReport = () => {
    const printWindow = window.open(
      '',
      '_blank',
      'width=1200,height=900'
    )

    if (!printWindow) {
      alert('Lejo popup-et në shfletues për printim.')
      return
    }

    const safe = (value) =>
      String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')

    let categoryHtml = ''

    categories.forEach((category) => {
      const categoryMembers =
        getCategoryMembers(category.name)

      const categoryTotal =
        getCategoryTotalPayments(category.name)

      categoryHtml += `
        <section class="category">
          <div class="category-header">
            <div>
              <h2>${safe(category.name)}</h2>
              <p>
                Gjithsej anëtarë:
                <strong>${categoryMembers.length}</strong>
              </p>
            </div>

            <div class="category-money">
              <strong>
                Pagesa:
                ${categoryTotal.toFixed(2)} €
              </strong>

              <span>
                Çmimi:
                ${category.price.toFixed(2)} €
              </span>
            </div>
          </div>
      `

      if (categoryMembers.length === 0) {
        categoryHtml += `
          <div class="empty">
            Nuk ka anëtarë në këtë kategori.
          </div>
        `
      } else {
        categoryHtml += `
          <table>
            <thead>
              <tr>
                <th>Emri dhe mbiemri</th>
                <th>Nr. personal</th>
                <th>Nr. librezës</th>
                <th>Telefoni</th>
                <th>Adresa</th>
                <th>Pagesa ${selectedYear}</th>
                <th>Gjithsej</th>
              </tr>
            </thead>

            <tbody>
        `

        categoryMembers.forEach((member) => {
          const memberPayments =
            getMemberPaymentsForYear(member.id)

          const memberTotal =
            getMemberTotalPayments(member.id)

          let paymentHtml = ''

          if (memberPayments.length === 0) {
            paymentHtml = `
              <span class="unpaid">
                Pa paguar
              </span>
            `
          } else {
            memberPayments.forEach((payment) => {
              paymentHtml += `
                <div class="payment">
                  <strong>
                    ${getPaymentAmount(payment).toFixed(2)} €
                  </strong>

                  <br />

                  <span>
                    ${safe(formatPaymentDate(payment))}
                  </span>

                  ${
                    payment.pershkrimi
                      ? `<br /><small>${safe(payment.pershkrimi)}</small>`
                      : ''
                  }
                </div>
              `
            })
          }

          categoryHtml += `
            <tr>
              <td>
                <strong>
                  ${safe(member.emri || '')}
                  ${safe(member.mbiemri || '')}
                </strong>
              </td>

              <td>
                ${safe(
                  member.nr_personal ||
                    member.nrPersonal ||
                    '-'
                )}
              </td>

              <td>
                ${safe(
                  member.nr_librezes ||
                    member.nrLibrezes ||
                    '-'
                )}
              </td>

              <td>
                ${safe(
                  member.telefoni ||
                    member.phone ||
                    '-'
                )}
              </td>

              <td>
                ${safe(member.adresa || '-')}
              </td>

              <td>
                ${paymentHtml}
              </td>

              <td>
                <strong>
                  ${memberTotal.toFixed(2)} €
                </strong>
              </td>
            </tr>
          `
        })

        categoryHtml += `
            </tbody>
          </table>
        `
      }

      categoryHtml += `
          <div class="category-footer">
            <span>
              ${safe(category.name)}:
              <strong>${categoryMembers.length}</strong>
              anëtarë
            </span>

            <span>
              Çmimi:
              <strong>${category.price.toFixed(2)} €</strong>
            </span>

            <strong>
              Gjithsej:
              ${categoryTotal.toFixed(2)} €
            </strong>
          </div>
        </section>
      `
    })

    let certificatesHtml = ''

    if (selectedYearCertificates.length === 0) {
      certificatesHtml = `
        <div class="empty">
          Nuk ka certifikata për këtë vit.
        </div>
      `
    } else {
      selectedYearCertificates.forEach(
        (certificate) => {
          certificatesHtml += `
            <tr>
              <td>
                <strong>
                  ${safe(
                    certificate.member_name ||
                      certificate.memberName ||
                      '-'
                  )}
                </strong>
              </td>

              <td>
                ${safe(
                  certificate.nr_certifikates ||
                    certificate.nrCertifikates ||
                    '-'
                )}
              </td>

              <td>
                ${safe(certificate.data || '-')}
              </td>

              <td>
                ${getCertificateAmount(
                  certificate
                ).toFixed(2)} €
              </td>

              <td>
                ${safe(
                  certificate.pershkrimi || '-'
                )}
              </td>
            </tr>
          `
        }
      )

      certificatesHtml = `
        <table>
          <thead>
            <tr>
              <th>Anëtari</th>
              <th>Nr. certifikatës</th>
              <th>Data</th>
              <th>Pagesa</th>
              <th>Përshkrimi</th>
            </tr>
          </thead>

          <tbody>
            ${certificatesHtml}
          </tbody>
        </table>
      `
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="sq">
      <head>
        <meta charset="UTF-8" />

        <title>
          Raporti ${selectedYear} - DRENICA
        </title>

        <style>
          * {
            box-sizing: border-box;
          }

          @page {
            size: A4 landscape;
            margin: 12mm;
          }

          body {
            margin: 0;
            background: white;
            color: #111;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 11px;
          }

          .page {
            width: 100%;
          }

          .header {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 25px;
            border-bottom: 3px solid #111;
            padding-bottom: 18px;
            margin-bottom: 20px;
          }

          .logo {
            width: 100px;
            height: 100px;
            object-fit: contain;
          }

          .header-text {
            text-align: center;
          }

          .header-text h1 {
            margin: 0;
            font-size: 23px;
            line-height: 1.3;
          }

          .header-text h2 {
            margin: 10px 0 0;
            font-size: 19px;
          }

          .header-text p {
            margin: 7px 0 0;
            font-size: 14px;
          }

          .stats {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            margin-bottom: 20px;
          }

          .stat {
            border: 1px solid #bbb;
            padding: 12px;
            text-align: center;
          }

          .stat span {
            display: block;
            font-size: 11px;
            margin-bottom: 7px;
          }

          .stat strong {
            display: block;
            font-size: 18px;
          }

          .section-title {
            margin: 25px 0 12px;
            font-size: 18px;
            border-bottom: 2px solid #111;
            padding-bottom: 6px;
          }

          .category {
            page-break-inside: avoid;
            margin-bottom: 22px;
            border: 1px solid #aaa;
          }

          .category-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px;
            background: #f1f1f1;
          }

          .category-header h2 {
            margin: 0;
            font-size: 16px;
          }

          .category-header p {
            margin: 5px 0 0;
          }

          .category-money {
            text-align: right;
          }

          .category-money strong,
          .category-money span {
            display: block;
          }

          table {
            width: 100%;
            border-collapse: collapse;
          }

          th {
            background: #e8e8e8;
            font-weight: bold;
          }

          th,
          td {
            border: 1px solid #aaa;
            padding: 7px;
            text-align: left;
            vertical-align: top;
          }

          .payment {
            margin-bottom: 5px;
          }

          .unpaid {
            font-weight: bold;
          }

          .category-footer {
            display: flex;
            justify-content: space-between;
            gap: 20px;
            padding: 10px 12px;
            border-top: 1px solid #aaa;
            background: #f7f7f7;
          }

          .empty {
            padding: 15px;
            text-align: center;
          }

          .summary {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            margin-top: 15px;
          }

          .summary-box {
            border: 1px solid #aaa;
            padding: 15px;
            text-align: center;
          }

          .summary-box span {
            display: block;
            margin-bottom: 8px;
          }

          .summary-box strong {
            font-size: 18px;
          }

          .print-footer {
            margin-top: 35px;
            padding-top: 15px;
            border-top: 2px solid #111;
            display: flex;
            justify-content: space-between;
          }

          .signature-area {
            margin-top: 55px;
            display: grid;
            grid-template-columns: 1fr 170px 1fr;
            gap: 40px;
            align-items: end;
            page-break-inside: avoid;
          }

          .signature {
            border-top: 1px solid #111;
            text-align: center;
            padding-top: 8px;
          }

          .stamp {
            width: 130px;
            height: 130px;
            border: 2px dashed #777;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            margin: auto;
            font-weight: bold;
          }
        </style>
      </head>

      <body>
        <div class="page">

          <div class="header">
            <img
              src="/logo.png"
              class="logo"
              alt="Logo DRENICA"
            />

            <div class="header-text">
              <h1>
                SHOQATA E PESHKATARËVE SPORTIV REKREATIV
                ''DRENICA''
              </h1>

              <h2>
                RAPORTI VJETOR
              </h2>

              <p>
                Viti ${safe(selectedYear)}
              </p>
            </div>
          </div>

          <div class="stats">

            <div class="stat">
              <span>
                Gjithsej anëtarë
              </span>

              <strong>
                ${members.length}
              </strong>
            </div>

            <div class="stat">
              <span>
                Të hyra nga librezat
              </span>

              <strong>
                ${totalPayments.toFixed(2)} €
              </strong>
            </div>

            <div class="stat">
              <span>
                Certifikata ${safe(selectedYear)}
              </span>

              <strong>
                ${selectedYearCertificates.length}
              </strong>
            </div>

            <div class="stat">
              <span>
                Të hyra nga certifikatat
              </span>

              <strong>
                ${totalCertificatePayments.toFixed(2)} €
              </strong>
            </div>

          </div>

          <h2 class="section-title">
            Raporti sipas kategorive
          </h2>

          ${categoryHtml}

          <h2 class="section-title">
            Raporti i certifikatave
          </h2>

          ${certificatesHtml}

          <h2 class="section-title">
            Përmbledhja e të hyrave
          </h2>

          <div class="summary">

            <div class="summary-box">
              <span>
                Të hyra nga librezat
              </span>

              <strong>
                ${totalPayments.toFixed(2)} €
              </strong>
            </div>

            <div class="summary-box">
              <span>
                Të hyra nga certifikatat
              </span>

              <strong>
                ${totalCertificatePayments.toFixed(2)} €
              </strong>
            </div>

            <div class="summary-box">
              <span>
                Numri i pagesave
              </span>

              <strong>
                ${yearPayments.length}
              </strong>
            </div>

            <div class="summary-box">
              <span>
                Numri i certifikatave
              </span>

              <strong>
                ${selectedYearCertificates.length}
              </strong>
            </div>

          </div>

          <div class="signature-area">

            <div class="signature">
              Nënshkrimi i arkëtarit
            </div>

            <div class="stamp">
              VULË<br />
              DRENICA
            </div>

            <div class="signature">
              Nënshkrimi i kryetarit
            </div>

          </div>

          <div class="print-footer">

            <div>
              <strong>
                Shoqata e Peshkatarëve Sportiv Rekreativ
                ''DRENICA''
              </strong>
              <br />
              Raport vjetor për vitin ${safe(selectedYear)}
            </div>

            <div>
              Data e printimit:
              ${new Date().toLocaleDateString('sq-AL')}
            </div>

          </div>

        </div>
      </body>
      </html>
    `)

    printWindow.document.close()
    printWindow.focus()

    setTimeout(() => {
      printWindow.print()
    }, 1000)
  }

  if (loading) {
    return (
      <div className="members-page">
        <div className="members-empty">
          <div className="empty-icon">
            ⏳
          </div>

          <strong>
            Duke ngarkuar raportet...
          </strong>

          <span>
            Duke marrë të dhënat nga databaza.
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="members-page">

      <div className="members-header report-header">

        <div>
          <h2>
            Raportet
          </h2>

          <p>
            Pasqyra e anëtarëve, pagesave
            dhe certifikatave.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'end',
            gap: '12px',
          }}
        >

          <div className="form-group">
            <label>
              Viti
            </label>

            <select
              value={selectedYear}
              onChange={(e) =>
                setSelectedYear(
                  Number(e.target.value)
                )
              }
            >
              <option value={currentYear}>
                {currentYear}
              </option>

              <option value={currentYear - 1}>
                {currentYear - 1}
              </option>

              <option value={currentYear - 2}>
                {currentYear - 2}
              </option>

              <option value={currentYear - 3}>
                {currentYear - 3}
              </option>

              <option value={currentYear - 4}>
                {currentYear - 4}
              </option>
            </select>
          </div>

          <button
            className="primary-button"
            onClick={printReport}
          >
            🖨️ Printo raportin
          </button>

        </div>

      </div>

      <div className="stats">

        <div className="stat-card">
          <span>
            Gjithsej anëtarë
          </span>

          <strong>
            {members.length}
          </strong>

          <small>
            Të regjistruar në sistem
          </small>
        </div>

        <div className="stat-card">
          <span>
            Të hyra nga librezat
          </span>

          <strong>
            {totalPayments.toFixed(2)} €
          </strong>

          <small>
            Pagesat e anëtarësimit
          </small>
        </div>

        <div className="stat-card">
          <span>
            Certifikata {selectedYear}
          </span>

          <strong>
            {selectedYearCertificates.length}
          </strong>

          <small>
            Certifikata të regjistruara
          </small>
        </div>

        <div className="stat-card">
          <span>
            Të hyra nga certifikatat
          </span>

          <strong>
            {totalCertificatePayments.toFixed(2)} €
          </strong>

          <small>
            Pagesat e certifikatave
          </small>
        </div>

      </div>

      <div className="members-list">

        <div className="members-list-header">

          <div>
            <h3>
              Raporti sipas kategorive
            </h3>

            <p>
              Gjendja e anëtarëve dhe pagesave
              për vitin {selectedYear}.
            </p>
          </div>

        </div>

        {categories.map((category) => {

          const categoryMembers =
            getCategoryMembers(category.name)

          const categoryTotal =
            getCategoryTotalPayments(category.name)

          return (
            <div
              key={category.name}
              className="report-category"
            >

              <div className="report-category-header">

                <div>
                  <h3>
                    {category.name}
                  </h3>

                  <p>
                    Gjithsej anëtarë:{' '}
                    <strong>
                      {categoryMembers.length}
                    </strong>
                  </p>
                </div>

                <div>
                  <strong>
                    Gjithsej pagesa:{' '}
                    {categoryTotal.toFixed(2)} €
                  </strong>

                  <br />

                  <small>
                    Çmimi:{' '}
                    {category.price.toFixed(2)} €
                  </small>
                </div>

              </div>

              {categoryMembers.length === 0 ? (
                <div className="members-empty">
                  <span>
                    Nuk ka anëtarë në këtë kategori.
                  </span>
                </div>
              ) : (
                <div className="members-table-wrapper">

                  <table className="members-table">

                    <thead>
                      <tr>
                        <th>
                          Emri dhe mbiemri
                        </th>

                        <th>
                          Nr. personal
                        </th>

                        <th>
                          Nr. librezës
                        </th>

                        <th>
                          Telefoni
                        </th>

                        <th>
                          Adresa
                        </th>

                        <th>
                          Pagesa {selectedYear}
                        </th>

                        <th>
                          Gjithsej
                        </th>
                      </tr>
                    </thead>

                    <tbody>

                      {categoryMembers.map(
                        (member) => {

                          const memberPayments =
                            getMemberPaymentsForYear(
                              member.id
                            )

                          const memberTotal =
                            getMemberTotalPayments(
                              member.id
                            )

                          return (
                            <tr
                              key={member.id}
                            >

                              <td>
                                <strong>
                                  {member.emri || ''}{' '}
                                  {member.mbiemri || ''}
                                </strong>
                              </td>

                              <td>
                                {member.nr_personal ||
                                  member.nrPersonal ||
                                  '-'}
                              </td>

                              <td>
                                {member.nr_librezes ||
                                  member.nrLibrezes ||
                                  '-'}
                              </td>

                              <td>
                                {member.telefoni ||
                                  member.phone ||
                                  '-'}
                              </td>

                              <td>
                                {member.adresa || '-'}
                              </td>

                              <td>

                                {memberPayments.length ===
                                0 ? (
                                  <span className="payment-unpaid">
                                    ❌ Pa paguar
                                  </span>
                                ) : (
                                  memberPayments.map(
                                    (payment) => (
                                      <div
                                        key={payment.id}
                                        style={{
                                          marginBottom:
                                            '8px',
                                        }}
                                      >

                                        <strong>
                                          {getPaymentAmount(
                                            payment
                                          ).toFixed(2)}{' '}
                                          €
                                        </strong>

                                        <br />

                                        <span>
                                          {formatPaymentDate(
                                            payment
                                          )}
                                        </span>

                                        {payment.pershkrimi && (
                                          <>
                                            <br />

                                            <small>
                                              {
                                                payment.pershkrimi
                                              }
                                            </small>
                                          </>
                                        )}

                                      </div>
                                    )
                                  )
                                )}

                              </td>

                              <td>
                                <strong>
                                  {memberTotal.toFixed(2)} €
                                </strong>
                              </td>

                            </tr>
                          )
                        }
                      )}

                    </tbody>

                  </table>

                </div>
              )}

              <div className="report-category-footer">

                <span>
                  {category.name}:{' '}
                  <strong>
                    {categoryMembers.length}
                  </strong>{' '}
                  anëtarë
                </span>

                <span>
                  Çmimi:{' '}
                  <strong>
                    {category.price.toFixed(2)} €
                  </strong>
                </span>

                <strong>
                  Gjithsej të paguara:{' '}
                  {categoryTotal.toFixed(2)} €
                </strong>

              </div>

            </div>
          )
        })}

      </div>

      <div className="members-list">

        <div className="members-list-header">

          <div>
            <h3>
              Raporti i certifikatave
            </h3>

            <p>
              Certifikatat për vitin{' '}
              {selectedYear}.
            </p>
          </div>

          <strong>
            Gjithsej:{' '}
            {selectedYearCertificates.length}
          </strong>

        </div>

        {selectedYearCertificates.length === 0 ? (

          <div className="members-empty">
            <span>
              Nuk ka certifikata për këtë vit.
            </span>
          </div>

        ) : (

          <div className="members-table-wrapper">

            <table className="members-table">

              <thead>
                <tr>
                  <th>
                    Anëtari
                  </th>

                  <th>
                    Nr. certifikatës
                  </th>

                  <th>
                    Data
                  </th>

                  <th>
                    Pagesa
                  </th>

                  <th>
                    Përshkrimi
                  </th>
                </tr>
              </thead>

              <tbody>

                {selectedYearCertificates.map(
                  (certificate) => (
                    <tr
                      key={certificate.id}
                    >

                      <td>
                        <strong>
                          {certificate.member_name ||
                            certificate.memberName ||
                            '-'}
                        </strong>
                      </td>

                      <td>
                        <strong>
                          {certificate.nr_certifikates ||
                            certificate.nrCertifikates ||
                            '-'}
                        </strong>
                      </td>

                      <td>
                        {certificate.data || '-'}
                      </td>

                      <td>
                        {getCertificateAmount(
                          certificate
                        ).toFixed(2)}{' '}
                        €
                      </td>

                      <td>
                        {certificate.pershkrimi || '-'}
                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>
        )}

      </div>

      <div className="members-list">

        <div className="members-list-header">

          <div>
            <h3>
              Përmbledhja e të hyrave
            </h3>

            <p>
              Të hyrat për vitin {selectedYear}.
            </p>
          </div>

        </div>

        <div className="summary">

          <div>
            <span>
              Të hyra nga librezat
            </span>

            <strong>
              {totalPayments.toFixed(2)} €
            </strong>
          </div>

          <div>
            <span>
              Të hyra nga certifikatat
            </span>

            <strong>
              {totalCertificatePayments.toFixed(2)} €
            </strong>
          </div>

          <div>
            <span>
              Numri i pagesave
            </span>

            <strong>
              {yearPayments.length}
            </strong>
          </div>

          <div>
            <span>
              Numri i certifikatave
            </span>

            <strong>
              {selectedYearCertificates.length}
            </strong>
          </div>

        </div>

      </div>

    </div>
  )
}

export default Reports