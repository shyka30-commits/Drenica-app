import { useEffect, useState } from 'react'
import { supabase } from './utils/supabase'

function Payments() {
  const [showForm, setShowForm] = useState(false)
  const [members, setMembers] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  const currentYear = new Date().getFullYear()

  const [form, setForm] = useState({
    memberId: '',
    shuma: '',
    data: '',
    pershkrimi: '',
  })

  /* =====================================================
     LOAD MEMBERS
     ===================================================== */

  const loadMembers = async () => {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('emri', {
        ascending: true,
      })

    if (error) {
      console.error(
        'Gabim gjatë marrjes së anëtarëve:',
        error
      )

      alert(
        'Anëtarët nuk mund të merren nga databaza.'
      )

      return
    }

    setMembers(data || [])
  }

  /* =====================================================
     LOAD PAYMENTS
     ===================================================== */

  const loadPayments = async () => {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', {
        ascending: false,
      })

    if (error) {
      console.error(
        'Gabim gjatë marrjes së pagesave:',
        error
      )

      alert(
        'Pagesat nuk mund të merren nga databaza.'
      )

      return
    }

    setPayments(data || [])
  }

  /* =====================================================
     LOAD ALL DATA
     ===================================================== */

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)

      await Promise.all([
        loadMembers(),
        loadPayments(),
      ])

      setLoading(false)
    }

    loadData()
  }, [])

  /* =====================================================
     FORM CHANGE
     ===================================================== */

  const handleChange = (e) => {
    const { name, value } = e.target

    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }))
  }

  /* =====================================================
     SAVE PAYMENT
     ===================================================== */

  const handleSave = async (e) => {
    e.preventDefault()

    if (
      !form.memberId ||
      !form.shuma ||
      !form.data
    ) {
      alert(
        'Ju lutem plotësoni anëtarin, shumën dhe datën.'
      )

      return
    }

    const selectedMember = members.find(
      (member) =>
        Number(member.id) ===
        Number(form.memberId)
    )

    if (!selectedMember) {
      alert('Anëtari nuk u gjet.')

      return
    }

    const paymentDate = new Date(
      `${form.data}T00:00:00`
    )

    const paymentYear =
      paymentDate.getFullYear()

    const newPayment = {
      id: Date.now(),

      member_id:
        selectedMember.id,

      member_name:
        `${selectedMember.emri} ${selectedMember.mbiemri}`,

      shuma:
        Number(form.shuma),

      data:
        form.data,

      viti:
        paymentYear,

      muaji:
        null,

      pershkrimi:
        form.pershkrimi || null,
    }

    const {
      error,
    } = await supabase
      .from('payments')
      .insert([newPayment])

    if (error) {
      console.error(
        'Gabim gjatë ruajtjes së pagesës:',
        error
      )

      alert(
        'Pagesa nuk u ruajt. Kontrollo databazën.'
      )

      return
    }

    await loadPayments()

    setForm({
      memberId: '',
      shuma: '',
      data: '',
      pershkrimi: '',
    })

    setShowForm(false)

    alert(
      'Pagesa u regjistrua me sukses!'
    )
  }

  /* =====================================================
     DELETE PAYMENT
     ===================================================== */

  const handleDelete = async (id) => {
    const confirmed =
      window.confirm(
        'A jeni të sigurt që dëshironi ta fshini këtë pagesë?'
      )

    if (!confirmed) {
      return
    }

    const {
      error,
    } = await supabase
      .from('payments')
      .delete()
      .eq('id', id)

    if (error) {
      console.error(
        'Gabim gjatë fshirjes së pagesës:',
        error
      )

      alert(
        'Pagesa nuk mund të fshihet.'
      )

      return
    }

    await loadPayments()
  }

  /* =====================================================
     FORMAT DATE
     ===================================================== */

  const formatDate = (dateString) => {
    if (!dateString) {
      return '-'
    }

    const date = new Date(
      `${dateString}T00:00:00`
    )

    if (isNaN(date.getTime())) {
      return dateString
    }

    return date.toLocaleDateString(
      'sq-AL'
    )
  }

  /* =====================================================
     GET MONTH NAME
     ===================================================== */

  const getMonthName = (dateString) => {
    if (!dateString) {
      return '-'
    }

    const date = new Date(
      `${dateString}T00:00:00`
    )

    if (isNaN(date.getTime())) {
      return '-'
    }

    return date.toLocaleDateString(
      'sq-AL',
      {
        month: 'long',
      }
    )
  }

  /* =====================================================
     TOTAL PAYMENTS
     ===================================================== */

  const totalPayments =
    payments.reduce(
      (total, payment) =>
        total +
        Number(
          payment.shuma || 0
        ),
      0
    )

  /* =====================================================
     CURRENT YEAR PAYMENTS
     ===================================================== */

  const currentYearPayments =
    payments
      .filter((payment) => {
        if (payment.viti) {
          return (
            Number(payment.viti) ===
            currentYear
          )
        }

        if (payment.data) {
          const date = new Date(
            `${payment.data}T00:00:00`
          )

          return (
            date.getFullYear() ===
            currentYear
          )
        }

        return false
      })
      .reduce(
        (total, payment) =>
          total +
          Number(
            payment.shuma || 0
          ),
        0
      )

  /* =====================================================
     LOADING
     ===================================================== */

  if (loading) {
    return (
      <div className="members-page">

        <div className="members-empty">

          <div className="empty-icon">
            ⏳
          </div>

          <strong>
            Duke ngarkuar...
          </strong>

          <span>
            Duke marrë pagesat nga databaza.
          </span>

        </div>

      </div>
    )
  }

  /* =====================================================
     PAGE
     ===================================================== */

  return (
    <div className="members-page">

      {/* HEADER */}

      <div className="members-header">

        <div>

          <h2>
            Pagesat
          </h2>

          <p>
            Menaxho pagesat e anëtarëve të
            shoqatës.
          </p>

        </div>

        <button
          className="primary-button"
          onClick={() =>
            setShowForm(true)
          }
        >
          + Regjistro pagesë
        </button>

      </div>

      {/* STATS */}

      <div className="stats">

        <div className="stat-card">

          <span>
            Gjithsej pagesa
          </span>

          <strong>
            {payments.length}
          </strong>

          <small>
            Pagesa të regjistruara
          </small>

        </div>

        <div className="stat-card">

          <span>
            Të hyra totale
          </span>

          <strong>
            {totalPayments.toFixed(2)} €
          </strong>

          <small>
            Të gjitha pagesat
          </small>

        </div>

        <div className="stat-card">

          <span>
            Të hyra {currentYear}
          </span>

          <strong>
            {currentYearPayments.toFixed(2)} €
          </strong>

          <small>
            Pagesat e këtij viti
          </small>

        </div>

      </div>

      {/* FORM */}

      {showForm && (

        <div className="member-form">

          <h3>
            Regjistro pagesë të re
          </h3>

          <form
            onSubmit={handleSave}
          >

            <div className="form-grid">

              {/* MEMBER */}

              <div className="form-group">

                <label>
                  Anëtari
                </label>

                <select
                  name="memberId"
                  value={
                    form.memberId
                  }
                  onChange={
                    handleChange
                  }
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
                          member.emri
                        }{' '}
                        {
                          member.mbiemri
                        }
                      </option>

                    )
                  )}

                </select>

              </div>

              {/* AMOUNT */}

              <div className="form-group">

                <label>
                  Shuma (€)
                </label>

                <input
                  type="number"
                  name="shuma"
                  value={
                    form.shuma
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="p.sh. 50"
                  min="0"
                  step="0.01"
                />

              </div>

              {/* DATE */}

              <div className="form-group">

                <label>
                  Data e pagesës
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
                />

              </div>

              {/* DESCRIPTION */}

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
                  placeholder="p.sh. Anëtarësimi vjetor"
                />

              </div>

            </div>

            {/* ACTIONS */}

            <div className="form-actions">

              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  setShowForm(false)
                }
              >
                Mbyll
              </button>

              <button
                type="submit"
                className="primary-button"
              >
                💾 Ruaj pagesën
              </button>

            </div>

          </form>

        </div>

      )}

      {/* PAYMENT SUMMARY */}

      <div className="members-list">

        <div className="members-list-header">

          <div>

            <h3>
              Pasqyra e pagesave
            </h3>

            <p>
              Gjithsej:{' '}
              <strong>
                {payments.length}
              </strong>{' '}
              pagesa
            </p>

          </div>

          <div>

            <strong>
              Totali:{' '}
              {totalPayments.toFixed(2)} €
            </strong>

          </div>

        </div>

      </div>

      {/* PAYMENT LIST */}

      <div className="members-list">

        <div className="members-list-header">

          <div>

            <h3>
              Lista e pagesave
            </h3>

            <p>
              Të gjitha pagesat e regjistruara
              në databazë.
            </p>

          </div>

        </div>

        {payments.length === 0 ? (

          <div className="members-empty">

            <div className="empty-icon">
              💳
            </div>

            <strong>
              Nuk ka pagesa ende
            </strong>

            <span>
              Shtyp “+ Regjistro pagesë”
              për të regjistruar pagesën
              e parë.
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
                    Shuma
                  </th>

                  <th>
                    Data
                  </th>

                  <th>
                    Muaji
                  </th>

                  <th>
                    Viti
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

                {payments.map(
                  (payment) => (

                    <tr
                      key={
                        payment.id
                      }
                    >

                      <td>

                        <strong>
                          {
                            payment.member_name ||
                            '-'
                          }
                        </strong>

                      </td>

                      <td>

                        <strong>
                          {Number(
                            payment.shuma ||
                              0
                          ).toFixed(
                            2
                          )}{' '}
                          €
                        </strong>

                      </td>

                      <td>
                        {formatDate(
                          payment.data
                        )}
                      </td>

                      <td>
                        {getMonthName(
                          payment.data
                        )}
                      </td>

                      <td>
                        {
                          payment.viti ||
                          (
                            payment.data
                              ? new Date(
                                  `${payment.data}T00:00:00`
                                ).getFullYear()
                              : '-'
                          )
                        }
                      </td>

                      <td>
                        {
                          payment.pershkrimi ||
                          '-'
                        }
                      </td>

                      <td>

                        <button
                          className="delete-button"
                          onClick={() =>
                            handleDelete(
                              payment.id
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

export default Payments