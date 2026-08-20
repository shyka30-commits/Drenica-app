import { useEffect, useState } from 'react'
import { supabase } from './utils/supabase'

function Members() {
  const [showForm, setShowForm] = useState(false)
  const [members, setMembers] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [organizationId, setOrganizationId] = useState(null)
  const [organizationName, setOrganizationName] = useState('')

  const currentYear = new Date().getFullYear()

  const [selectedYear, setSelectedYear] = useState(
    currentYear
  )

  const [form, setForm] = useState({
    emri: '',
    mbiemri: '',
    nrPersonal: '',
    nrLibrezes: '',
    telefoni: '',
    adresa: '',
    kategoria: '',
    kaPaguar: false,
  })

  const categories = [
    { name: 'Senior', price: 50 },
    { name: 'Junior', price: 25 },
    { name: 'Pioner', price: 0 },
    { name: 'Femra', price: 0 },
    { name: 'Veteran i luftës', price: 25 },
    { name: 'Invalid i luftës', price: 0 },
    { name: 'Pensioner', price: 25 },
    {
      name: 'Veteran peshkimi mbi 70 vjeç',
      price: 0,
    },
    { name: 'Polic', price: 0 },
    {
      name: 'Persona me aftësi të kufizuara',
      price: 0,
    },
    { name: 'FSK', price: 0 },
  ]

  // =====================================================
  // LOAD ORGANIZATION FROM LOGGED-IN USER
  // =====================================================

  const loadOrganization = async () => {
    try {
      const savedUser = localStorage.getItem(
        'drenica_user'
      )

      if (!savedUser) {
        console.error(
          'Nuk u gjet përdoruesi i kyçur.'
        )

        alert(
          'Sesioni i përdoruesit nuk u gjet. Ju lutem hyni përsëri.'
        )

        return null
      }

      const currentUser =
        JSON.parse(savedUser)

      const orgId =
        currentUser?.organization_id

      if (!orgId) {
        console.error(
          'Përdoruesi nuk ka organization_id.'
        )

        alert(
          'Llogaria nuk është e lidhur me asnjë shoqatë.'
        )

        return null
      }

      setOrganizationId(orgId)

      // Merr emrin e shoqatës
      const {
        data: organization,
        error: organizationError,
      } = await supabase
        .from('organizations')
        .select('id, name, slug')
        .eq('id', orgId)
        .single()

      if (organizationError) {
        console.error(
          'Gabim gjatë marrjes së shoqatës:',
          organizationError
        )

        alert(
          'Shoqata e llogarisë nuk u gjet.\n\n' +
            organizationError.message
        )

        return null
      }

      setOrganizationName(
        organization?.name || ''
      )

      return orgId
    } catch (error) {
      console.error(
        'Gabim gjatë marrjes së shoqatës:',
        error
      )

      alert(
        'Gabim gjatë marrjes së shoqatës.'
      )

      return null
    }
  }

  // =====================================================
  // LOAD MEMBERS
  // =====================================================

  const loadMembers = async (orgId) => {
    if (!orgId) {
      return
    }

    const {
      data,
      error,
    } = await supabase
      .from('members')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', {
        ascending: false,
      })

    if (error) {
      console.error(
        'Gabim gjatë marrjes së anëtarëve:',
        error
      )

      alert(
        'Nuk u arritën të merren anëtarët nga databaza.\n\n' +
          error.message
      )

      return
    }

    setMembers(data || [])
  }

  // =====================================================
  // LOAD PAYMENTS
  // =====================================================

  const loadPayments = async (orgId) => {
    if (!orgId) {
      return
    }

    const {
      data,
      error,
    } = await supabase
      .from('payments')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', {
        ascending: false,
      })

    if (error) {
      console.error(
        'Gabim gjatë marrjes së pagesave:',
        error
      )

      return
    }

    setPayments(data || [])
  }

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)

      const orgId =
        await loadOrganization()

      if (orgId) {
        await Promise.all([
          loadMembers(orgId),
          loadPayments(orgId),
        ])
      }

      setLoading(false)
    }

    loadData()
  }, [])

  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target

    setForm((prevForm) => ({
      ...prevForm,
      [name]:
        type === 'checkbox'
          ? checked
          : value,
    }))
  }

  // =====================================================
  // CATEGORY PRICE
  // =====================================================

  const getCategoryPrice = (
    categoryName
  ) => {
    const category = categories.find(
      (item) =>
        item.name === categoryName
    )

    return category
      ? category.price
      : 0
  }

  // =====================================================
  // SAVE MEMBER
  // =====================================================

  const handleSave = async (e) => {
    e.preventDefault()

    if (!organizationId) {
      alert(
        'Shoqata nuk u gjet. Ju lutem provoni përsëri.'
      )

      return
    }

    if (
      !form.emri.trim() ||
      !form.mbiemri.trim() ||
      !form.nrPersonal.trim() ||
      !form.nrLibrezes.trim()
    ) {
      alert(
        'Ju lutem plotësoni Emrin, Mbiemrin, Nr. personal dhe Nr. e librezës.'
      )

      return
    }

    if (!form.kategoria) {
      alert(
        'Ju lutem zgjidhni kategorinë.'
      )

      return
    }

    const categoryPrice =
      getCategoryPrice(
        form.kategoria
      )

    const newMember = {
      organization_id:
        organizationId,
      emri: form.emri.trim(),
      mbiemri:
        form.mbiemri.trim(),
      nr_personal:
        form.nrPersonal.trim(),
      nr_librezes:
        form.nrLibrezes.trim(),
      telefoni:
        form.telefoni.trim() || null,
      adresa:
        form.adresa.trim() || null,
      kategoria:
        form.kategoria,
      cmimi: categoryPrice,
    }

    console.log(
      'Duke ruajtur anëtarin:',
      newMember
    )

    // ===================================================
    // SAVE MEMBER
    // ===================================================

    const {
      data: savedMember,
      error: memberError,
    } = await supabase
      .from('members')
      .insert([newMember])
      .select()
      .single()

    if (memberError) {
      console.error(
        'Gabim gjatë ruajtjes së anëtarit:',
        memberError
      )

      alert(
        'Anëtari nuk u ruajt.\n\n' +
          'Gabimi nga Supabase:\n' +
          memberError.message
      )

      return
    }

    console.log(
      'Anëtari u ruajt:',
      savedMember
    )

    // ===================================================
    // CREATE PAYMENT AUTOMATICALLY
    // ===================================================

    if (form.kaPaguar) {
      const today = new Date()

      const newPayment = {
        organization_id:
          organizationId,
        member_id:
          savedMember.id,
        member_name:
          form.emri.trim() +
          ' ' +
          form.mbiemri.trim(),
        shuma:
          categoryPrice,
        data: today
          .toISOString()
          .split('T')[0],
        viti:
          currentYear,
        muaji: null,
        pershkrimi:
          'Pagesa vjetore e anëtarësimit - ' +
          currentYear,
      }

      const {
        error: paymentError,
      } = await supabase
        .from('payments')
        .insert([newPayment])

      if (paymentError) {
        console.error(
          'Gabim gjatë ruajtjes së pagesës:',
          paymentError
        )

        alert(
          'Anëtari u ruajt me sukses, por pagesa nuk u ruajt.\n\n' +
            'Gabimi:\n' +
            paymentError.message
        )
      }
    }

    // ===================================================
    // RELOAD
    // ===================================================

    await loadMembers(
      organizationId
    )

    await loadPayments(
      organizationId
    )

    // ===================================================
    // RESET
    // ===================================================

    setForm({
      emri: '',
      mbiemri: '',
      nrPersonal: '',
      nrLibrezes: '',
      telefoni: '',
      adresa: '',
      kategoria: '',
      kaPaguar: false,
    })

    setShowForm(false)

    // ===================================================
    // SUCCESS
    // ===================================================

    if (form.kaPaguar) {
      alert(
        'Anëtari u regjistrua me sukses!\n\n' +
          'Pagesa prej ' +
          categoryPrice.toFixed(2) +
          ' € u regjistrua automatikisht.'
      )
    } else {
      alert(
        'Anëtari u regjistrua me sukses!'
      )
    }
  }

  // =====================================================
  // DELETE MEMBER
  // =====================================================

  const handleDelete = async (id) => {
    const confirmed =
      window.confirm(
        'A jeni të sigurt që dëshironi ta fshini këtë anëtar?'
      )

    if (!confirmed) {
      return
    }

    // DELETE PAYMENTS

    const {
      error: paymentDeleteError,
    } = await supabase
      .from('payments')
      .delete()
      .eq(
        'member_id',
        id
      )
      .eq(
        'organization_id',
        organizationId
      )

    if (paymentDeleteError) {
      console.error(
        'Gabim gjatë fshirjes së pagesave:',
        paymentDeleteError
      )
    }

    // DELETE MEMBER

    const {
      error: memberDeleteError,
    } = await supabase
      .from('members')
      .delete()
      .eq(
        'id',
        id
      )
      .eq(
        'organization_id',
        organizationId
      )

    if (memberDeleteError) {
      console.error(
        'Gabim gjatë fshirjes së anëtarit:',
        memberDeleteError
      )

      alert(
        'Anëtari nuk u fshi.\n\n' +
          memberDeleteError.message
      )

      return
    }

    await loadMembers(
      organizationId
    )

    await loadPayments(
      organizationId
    )
  }

  // =====================================================
  // FIND PAYMENT FOR YEAR
  // =====================================================

  const getPaymentForYear = (
    member
  ) => {
    return payments.find(
      (payment) => {
        const sameId =
          String(
            payment.member_id
          ) ===
          String(member.id)

        const paymentName =
          String(
            payment.member_name ||
              ''
          )
            .trim()
            .toLowerCase()

        const memberName =
          (
            String(
              member.emri || ''
            ) +
            ' ' +
            String(
              member.mbiemri ||
                ''
            )
          )
            .trim()
            .toLowerCase()

        const sameName =
          paymentName ===
          memberName

        if (
          !sameId &&
          !sameName
        ) {
          return false
        }

        if (
          payment.viti !==
            null &&
          payment.viti !==
            undefined
        ) {
          return (
            Number(
              payment.viti
            ) ===
            Number(
              selectedYear
            )
          )
        }

        if (payment.data) {
          const paymentDate =
            new Date(
              payment.data +
                'T00:00:00'
            )

          if (
            isNaN(
              paymentDate.getTime()
            )
          ) {
            return false
          }

          return (
            paymentDate.getFullYear() ===
            Number(
              selectedYear
            )
          )
        }

        return false
      }
    )
  }

  // =====================================================
  // LOADING
  // =====================================================

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
            Duke marrë të dhënat nga
            databaza.
          </span>

        </div>

      </div>
    )
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="members-page">

      {/* HEADER */}

      <div className="members-header">

        <div>

          <h2>
            Anëtarët
          </h2>

          <p>
            Menaxho të gjithë
            anëtarët e{' '}
            {organizationName ||
              'shoqatës'}.
          </p>

        </div>

        <button
          className="primary-button"
          onClick={() =>
            setShowForm(true)
          }
        >
          + Regjistro anëtar
        </button>

      </div>

      {/* FORM */}

      {showForm && (
        <div className="member-form">

          <h3>
            Regjistro anëtar të ri
          </h3>

          <form
            onSubmit={handleSave}
          >

            <div className="form-grid">

              {/* EMRI */}

              <div className="form-group">

                <label>
                  Emri *
                </label>

                <input
                  type="text"
                  name="emri"
                  value={form.emri}
                  onChange={
                    handleChange
                  }
                  placeholder="Shkruaj emrin"
                />

              </div>

              {/* MBIEMRI */}

              <div className="form-group">

                <label>
                  Mbiemri *
                </label>

                <input
                  type="text"
                  name="mbiemri"
                  value={
                    form.mbiemri
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Shkruaj mbiemrin"
                />

              </div>

              {/* NR PERSONAL */}

              <div className="form-group">

                <label>
                  Nr. personal *
                </label>

                <input
                  type="text"
                  name="nrPersonal"
                  value={
                    form.nrPersonal
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Shkruaj nr. personal"
                />

              </div>

              {/* NR LIBREZES */}

              <div className="form-group">

                <label>
                  Nr. i librezës *
                </label>

                <input
                  type="text"
                  name="nrLibrezes"
                  value={
                    form.nrLibrezes
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Shkruaj nr. e librezës"
                  required
                />

              </div>

              {/* TELEFONI */}

              <div className="form-group">

                <label>
                  Telefoni
                </label>

                <input
                  type="tel"
                  name="telefoni"
                  value={
                    form.telefoni
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Shkruaj numrin e telefonit"
                />

              </div>

              {/* ADRESA */}

              <div className="form-group">

                <label>
                  Adresa
                </label>

                <input
                  type="text"
                  name="adresa"
                  value={
                    form.adresa
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Shkruaj adresën"
                />

              </div>

              {/* KATEGORIA */}

              <div className="form-group">

                <label>
                  Kategoria *
                </label>

                <select
                  name="kategoria"
                  value={
                    form.kategoria
                  }
                  onChange={
                    handleChange
                  }
                >

                  <option value="">
                    Zgjedh kategorinë
                  </option>

                  {categories.map(
                    (
                      category
                    ) => (
                      <option
                        key={
                          category.name
                        }
                        value={
                          category.name
                        }
                      >
                        {
                          category.name
                        }{' '}
                        —{' '}
                        {
                          category.price
                        }{' '}
                        €
                      </option>
                    )
                  )}

                </select>

              </div>

            </div>

            {/* PAYMENT */}

            {form.kategoria && (
              <div
                style={{
                  marginTop:
                    '18px',
                  padding:
                    '15px',
                  borderRadius:
                    '10px',
                  background:
                    '#f5f7fa',
                }}
              >

                <strong>
                  Pagesa vjetore:{' '}
                  {getCategoryPrice(
                    form.kategoria
                  ).toFixed(
                    2
                  )}{' '}
                  €
                </strong>

                <div
                  style={{
                    marginTop:
                      '12px',
                  }}
                >

                  <label
                    style={{
                      display:
                        'flex',
                      alignItems:
                        'center',
                      gap: '10px',
                      cursor:
                        'pointer',
                    }}
                  >

                    <input
                      type="checkbox"
                      name="kaPaguar"
                      checked={
                        form.kaPaguar
                      }
                      onChange={
                        handleChange
                      }
                    />

                    <span>
                      Anëtari ka paguar
                      pagesën vjetore (
                      {
                        currentYear
                      }
                      )
                    </span>

                  </label>

                </div>

              </div>
            )}

            {/* ACTIONS */}

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
                type="submit"
                className="primary-button"
              >
                💾 Ruaj anëtarin
              </button>

            </div>

          </form>

        </div>
      )}

      {/* MEMBERS LIST */}

      <div className="members-list">

        <div className="members-list-header">

          <div>

            <h3>
              Lista e anëtarëve
            </h3>

            <p>
              Gjithsej:{' '}
              <strong>
                {
                  members.length
                }
              </strong>{' '}
              anëtarë
            </p>

          </div>

          <div className="form-group">

            <label>
              Kontrollo vitin
            </label>

            <select
              value={
                selectedYear
              }
              onChange={(e) =>
                setSelectedYear(
                  Number(
                    e.target.value
                  )
                )
              }
            >

              {[
                currentYear,
                currentYear - 1,
              ].map(
                (year) => (
                  <option
                    key={year}
                    value={year}
                  >
                    {year}
                  </option>
                )
              )}

            </select>

          </div>

        </div>

        {members.length ===
        0 ? (

          <div className="members-empty">

            <div className="empty-icon">
              👥
            </div>

            <strong>
              Nuk ka anëtarë ende
            </strong>

            <span>
              Shtyp “+ Regjistro
              anëtar” për të shtuar
              anëtarin e parë.
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
                    Nr. i librezës
                  </th>

                  <th>
                    Telefoni
                  </th>

                  <th>
                    Adresa
                  </th>

                  <th>
                    Kategoria
                  </th>

                  <th>
                    Çmimi vjetor
                  </th>

                  <th>
                    Pagesa -{' '}
                    {
                      selectedYear
                    }
                  </th>

                  <th>
                    Veprim
                  </th>

                </tr>

              </thead>

              <tbody>

                {members.map(
                  (member) => {

                    const payment =
                      getPaymentForYear(
                        member
                      )

                    return (
                      <tr
                        key={
                          member.id
                        }
                      >

                        <td>
                          <strong>
                            {
                              member.emri
                            }{' '}
                            {
                              member.mbiemri
                            }
                          </strong>
                        </td>

                        <td>
                          {
                            member.nr_personal ||
                              member.nrPersonal ||
                              '-'
                          }
                        </td>

                        <td>
                          {
                            member.nr_librezes ||
                              member.nrLibrezes ||
                              '-'
                          }
                        </td>

                        <td>
                          {
                            member.telefoni ||
                              '-'
                          }
                        </td>

                        <td>
                          {
                            member.adresa ||
                              '-'
                          }
                        </td>

                        <td>
                          {
                            member.kategoria ||
                              '-'
                          }
                        </td>

                        <td>
                          {getCategoryPrice(
                            member.kategoria
                          ).toFixed(
                            2
                          )}{' '}
                          €
                        </td>

                        <td>

                          {payment ? (

                            <span className="payment-paid">
                              ✅ Paguar{' '}
                              {Number(
                                payment.shuma ||
                                  0
                              ).toFixed(
                                2
                              )}{' '}
                              €
                            </span>

                          ) : (

                            <span className="payment-unpaid">
                              ❌{' '}
                              {
                                selectedYear
                              }{' '}
                              – Pa paguar
                            </span>

                          )}

                        </td>

                        <td>

                          <button
                            className="delete-button"
                            onClick={() =>
                              handleDelete(
                                member.id
                              )
                            }
                          >
                            Fshi
                          </button>

                        </td>

                      </tr>
                    )
                  }
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  )
}

export default Members