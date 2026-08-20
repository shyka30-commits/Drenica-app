import { useEffect, useState } from 'react'
import { supabase } from './utils/supabase'

function Certificates() {
  const [showForm, setShowForm] = useState(false)
  const [members, setMembers] = useState([])
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)

  const [form, setForm] = useState({
    memberId: '',
    nrCertifikates: '',
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
      .order('created_at', {
        ascending: false,
      })

    if (error) {
      console.error(
        'Gabim gjatë marrjes së anëtarëve:',
        error
      )

      alert(
        `Nuk u arritën të merren anëtarët.\n\n${error.message}`
      )

      return
    }

    setMembers(data || [])
  }

  /* =====================================================
     LOAD CERTIFICATES
  ===================================================== */

  const loadCertificates = async () => {
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .order('created_at', {
        ascending: false,
      })

    if (error) {
      console.error(
        'Gabim gjatë marrjes së certifikatave:',
        error
      )

      alert(
        `Nuk u arritën të merren certifikatat.\n\n${error.message}`
      )

      return
    }

    setCertificates(data || [])
  }

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)

      await Promise.all([
        loadMembers(),
        loadCertificates(),
      ])

      setLoading(false)
    }

    loadData()
  }, [])

  /* =====================================================
     FORM CHANGE
  ===================================================== */

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target

    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }))
  }

  /* =====================================================
     SAVE CERTIFICATE
  ===================================================== */

  const handleSave = async (e) => {
    e.preventDefault()

    if (
      !form.memberId ||
      !form.nrCertifikates.trim() ||
      !form.shuma ||
      !form.data
    ) {
      alert(
        'Ju lutem plotësoni anëtarin, nr. e certifikatës, shumën dhe datën.'
      )

      return
    }

    const selectedMember = members.find(
      (member) =>
        String(member.id) ===
        String(form.memberId)
    )

    if (!selectedMember) {
      alert('Anëtari nuk u gjet.')

      return
    }

    const newCertificate = {
      member_id:
        selectedMember.id,

      member_name:
        `${selectedMember.emri || ''} ${
          selectedMember.mbiemri || ''
        }`.trim(),

      nr_certifikates:
        form.nrCertifikates.trim(),

      shuma:
        Number(form.shuma),

      data:
        form.data,

      viti:
        new Date(
          `${form.data}T00:00:00`
        ).getFullYear(),

      pershkrimi:
        form.pershkrimi.trim() || null,
    }

    console.log(
      'Duke ruajtur certifikatën:',
      newCertificate
    )

    const {
      data,
      error,
    } = await supabase
      .from('certificates')
      .insert([newCertificate])
      .select()
      .single()

    if (error) {
      console.error(
        'Gabim gjatë ruajtjes së certifikatës:',
        error
      )

      alert(
        `Certifikata nuk u ruajt.\n\nGabimi nga Supabase:\n${error.message}`
      )

      return
    }

    console.log(
      'Certifikata u ruajt:',
      data
    )

    await loadCertificates()

    setForm({
      memberId: '',
      nrCertifikates: '',
      shuma: '',
      data: '',
      pershkrimi: '',
    })

    setShowForm(false)

    alert(
      'Certifikata u regjistrua me sukses!'
    )
  }

  /* =====================================================
     DELETE CERTIFICATE
  ===================================================== */

  const handleDelete = async (id) => {
    const confirmed =
      window.confirm(
        'A jeni të sigurt që dëshironi ta fshini këtë certifikatë?'
      )

    if (!confirmed) {
      return
    }

    const {
      error,
    } = await supabase
      .from('certificates')
      .delete()
      .eq('id', id)

    if (error) {
      console.error(
        'Gabim gjatë fshirjes së certifikatës:',
        error
      )

      alert(
        `Certifikata nuk u fshi.\n\n${error.message}`
      )

      return
    }

    await loadCertificates()
  }

  /* =====================================================
     TOTAL
  ===================================================== */

  const totalPayments =
    certificates.reduce(
      (total, certificate) =>
        total +
        Number(
          certificate.shuma || 0
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
            Duke marrë certifikatat
            dhe anëtarët nga databaza.
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
            Certifikatat
          </h2>

          <p>
            Regjistro certifikatat e
            lëshuara për anëtarët.
          </p>

        </div>

        <button
          className="primary-button"
          onClick={() =>
            setShowForm(true)
          }
        >
          + Regjistro certifikatë
        </button>

      </div>

      {/* SUMMARY */}

      <div className="members-list">

        <div className="members-list-header">

          <div>

            <h3>
              Pasqyra e certifikatave
            </h3>

            <p>
              Gjithsej:{' '}
              <strong>
                {certificates.length}
              </strong>{' '}
              certifikata
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

      {/* FORM */}

      {showForm && (

        <div className="member-form">

          <h3>
            Regjistro certifikatë të re
          </h3>

          <form
            onSubmit={handleSave}
          >

            <div className="form-grid">

              {/* ANËTARI */}

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

                        {member.nr_librezes
                          ? ` — Librezë: ${member.nr_librezes}`
                          : ''}

                      </option>

                    )
                  )}

                </select>

                {members.length === 0 && (

                  <small
                    style={{
                      display:
                        'block',
                      marginTop:
                        '8px',
                    }}
                  >
                    Nuk ka anëtarë të
                    regjistruar ende.
                  </small>

                )}

              </div>

              {/* NR CERTIFIKATËS */}

              <div className="form-group">

                <label>
                  Nr. i certifikatës
                </label>

                <input
                  type="text"
                  name="nrCertifikates"
                  value={
                    form.nrCertifikates
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="p.sh. 00000002"
                />

              </div>

              {/* PAGESA */}

              <div className="form-group">

                <label>
                  Pagesa (€)
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

              {/* DATA */}

              <div className="form-group">

                <label>
                  Data
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
                  placeholder="p.sh. Certifikatë"
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
                💾 Ruaj certifikatën
              </button>

            </div>

          </form>

        </div>

      )}

      {/* CERTIFICATES LIST */}

      <div className="members-list">

        <div className="members-list-header">

          <div>

            <h3>
              Lista e certifikatave
            </h3>

            <p>
              Certifikatat e
              regjistruara në sistem.
            </p>

          </div>

        </div>

        {certificates.length === 0 ? (

          <div className="members-empty">

            <div className="empty-icon">
              📜
            </div>

            <strong>
              Nuk ka certifikata ende
            </strong>

            <span>
              Shtyp “+ Regjistro
              certifikatë” për të
              regjistruar të parën.
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
                    Pagesa
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

                {certificates.map(
                  (certificate) => (

                    <tr
                      key={
                        certificate.id
                      }
                    >

                      <td>

                        <strong>
                          {
                            certificate.member_name ||
                            '-'
                          }
                        </strong>

                      </td>

                      <td>

                        <strong>
                          {
                            certificate.nr_certifikates ||
                            '-'
                          }
                        </strong>

                      </td>

                      <td>

                        <strong>
                          {Number(
                            certificate.shuma ||
                              0
                          ).toFixed(2)}{' '}
                          €
                        </strong>

                      </td>

                      <td>
                        {
                          certificate.data ||
                          '-'
                        }
                      </td>

                      <td>
                        {
                          certificate.pershkrimi ||
                          '-'
                        }
                      </td>

                      <td>

                        <button
                          className="delete-button"
                          onClick={() =>
                            handleDelete(
                              certificate.id
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

export default Certificates