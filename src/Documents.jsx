import { useEffect, useState } from 'react'

const DB_NAME = 'drenica_documents_db'
const STORE_NAME = 'documents'

const categories = [
  'Dokumente të shoqatës',
  'Dokumente të anëtarëve',
  'Dokumente të garave',
  'Dokumente financiare',
  'Të tjera',
]

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)

    request.onupgradeneeded = () => {
      const db = request.result

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
        })
      }
    }

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onerror = () => {
      reject(request.error)
    }
  })
}

async function getDocuments() {
  const db = await openDatabase()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      STORE_NAME,
      'readonly'
    )

    const store = transaction.objectStore(STORE_NAME)
    const request = store.getAll()

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onerror = () => {
      reject(request.error)
    }
  })
}

async function saveDocument(document) {
  const db = await openDatabase()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      STORE_NAME,
      'readwrite'
    )

    const store = transaction.objectStore(STORE_NAME)

    store.put(document)

    transaction.oncomplete = () => {
      resolve()
    }

    transaction.onerror = () => {
      reject(transaction.error)
    }
  })
}

async function deleteDocument(id) {
  const db = await openDatabase()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      STORE_NAME,
      'readwrite'
    )

    const store = transaction.objectStore(STORE_NAME)

    store.delete(id)

    transaction.oncomplete = () => {
      resolve()
    }

    transaction.onerror = () => {
      reject(transaction.error)
    }
  })
}

function Documents() {
  const [documents, setDocuments] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)

  const [form, setForm] = useState({
    emri: '',
    kategoria: '',
    data: '',
    pershkrimi: '',
    file: null,
  })

  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    try {
      const savedDocuments = await getDocuments()

      savedDocuments.sort(
        (a, b) => b.id - a.id
      )

      setDocuments(savedDocuments)
    } catch (error) {
      console.error(
        'Gabim gjatë leximit të dokumenteve:',
        error
      )

      alert(
        'Dokumentet nuk mund të lexohen.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]

    if (!file) {
      return
    }

    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
    ]

    if (!allowedTypes.includes(file.type)) {
      alert(
        'Lejohen vetëm PDF, JPG, PNG ose WEBP.'
      )

      e.target.value = ''
      return
    }

    setForm((prev) => ({
      ...prev,
      file,
    }))
  }

  const handleSave = async (e) => {
    e.preventDefault()

    if (
      !form.emri ||
      !form.kategoria ||
      !form.data
    ) {
      alert(
        'Ju lutem plotësoni emrin, kategorinë dhe datën.'
      )
      return
    }

    if (!form.file) {
      alert(
        'Ju lutem zgjidhni dokumentin e skanuar.'
      )
      return
    }

    const newDocument = {
      id: Date.now(),

      emri: form.emri,

      kategoria: form.kategoria,

      data: form.data,

      pershkrimi: form.pershkrimi,

      fileName: form.file.name,

      fileType: form.file.type,

      fileSize: form.file.size,

      file: form.file,
    }

    try {
      await saveDocument(newDocument)

      await loadDocuments()

      setForm({
        emri: '',
        kategoria: '',
        data: '',
        pershkrimi: '',
        file: null,
      })

      setShowForm(false)

      alert(
        'Dokumenti u ruajt me sukses.'
      )
    } catch (error) {
      console.error(
        'Gabim gjatë ruajtjes:',
        error
      )

      alert(
        'Dokumenti nuk u ruajt. Mund të jetë shumë i madh.'
      )
    }
  }

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      'A jeni të sigurt që dëshironi ta fshini këtë dokument?'
    )

    if (!confirmed) {
      return
    }

    try {
      await deleteDocument(id)

      await loadDocuments()
    } catch (error) {
      console.error(
        'Gabim gjatë fshirjes:',
        error
      )

      alert(
        'Dokumenti nuk mund të fshihet.'
      )
    }
  }

  const openDocument = (document) => {
    if (!document.file) {
      alert(
        'Skedari i këtij dokumenti nuk u gjet.'
      )
      return
    }

    const url = URL.createObjectURL(
      document.file
    )

    window.open(url, '_blank')

    setTimeout(() => {
      URL.revokeObjectURL(url)
    }, 60000)
  }

  const downloadDocument = (document) => {
    if (!document.file) {
      alert(
        'Skedari i këtij dokumenti nuk u gjet.'
      )
      return
    }

    const url = URL.createObjectURL(
      document.file
    )

    const link =
      window.document.createElement('a')

    link.href = url

    link.download =
      document.fileName ||
      document.emri

    document.body.appendChild(link)

    link.click()

    document.body.removeChild(link)

    setTimeout(() => {
      URL.revokeObjectURL(url)
    }, 1000)
  }

  const formatFileSize = (bytes) => {
    if (!bytes) {
      return '0 KB'
    }

    const mb =
      bytes / (1024 * 1024)

    if (mb >= 1) {
      return `${mb.toFixed(2)} MB`
    }

    return `${(
      bytes / 1024
    ).toFixed(0)} KB`
  }

  return (
    <div className="members-page">

      <div className="members-header">

        <div>
          <h2>Dokumentet</h2>

          <p>
            Ruaj dhe menaxho dokumentet e
            skanuara të shoqatës.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() =>
            setShowForm(true)
          }
        >
          + Shto dokument
        </button>

      </div>

      <div className="stats">

        <div className="stat-card">
          <span>
            Gjithsej dokumente
          </span>

          <strong>
            {documents.length}
          </strong>

          <small>
            Dokumente të ruajtura
          </small>
        </div>

        <div className="stat-card">
          <span>
            Të shoqatës
          </span>

          <strong>
            {
              documents.filter(
                (document) =>
                  document.kategoria ===
                  'Dokumente të shoqatës'
              ).length
            }
          </strong>

          <small>
            Dokumente zyrtare
          </small>
        </div>

        <div className="stat-card">
          <span>
            Të garave
          </span>

          <strong>
            {
              documents.filter(
                (document) =>
                  document.kategoria ===
                  'Dokumente të garave'
              ).length
            }
          </strong>

          <small>
            Gara dhe aktivitete
          </small>
        </div>

        <div className="stat-card">
          <span>
            Financiare
          </span>

          <strong>
            {
              documents.filter(
                (document) =>
                  document.kategoria ===
                  'Dokumente financiare'
              ).length
            }
          </strong>

          <small>
            Dokumente financiare
          </small>
        </div>

      </div>

      {showForm && (

        <div className="member-form">

          <h3>
            Shto dokument të ri
          </h3>

          <form onSubmit={handleSave}>

            <div className="form-grid">

              <div className="form-group">

                <label>
                  Emri i dokumentit
                </label>

                <input
                  type="text"
                  name="emri"
                  value={form.emri}
                  onChange={handleChange}
                  placeholder="p.sh. Statuti i shoqatës"
                />

              </div>

              <div className="form-group">

                <label>
                  Kategoria
                </label>

                <select
                  name="kategoria"
                  value={form.kategoria}
                  onChange={handleChange}
                >

                  <option value="">
                    Zgjedh kategorinë
                  </option>

                  {categories.map(
                    (category) => (
                      <option
                        key={category}
                        value={category}
                      >
                        {category}
                      </option>
                    )
                  )}

                </select>

              </div>

              <div className="form-group">

                <label>
                  Data
                </label>

                <input
                  type="date"
                  name="data"
                  value={form.data}
                  onChange={handleChange}
                />

              </div>

              <div className="form-group">

                <label>
                  Përshkrimi
                </label>

                <input
                  type="text"
                  name="pershkrimi"
                  value={form.pershkrimi}
                  onChange={handleChange}
                  placeholder="Përshkrim i dokumentit"
                />

              </div>

              <div className="form-group">

                <label>
                  Dokumenti i skanuar
                </label>

                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  onChange={handleFileChange}
                />

                {form.file && (
                  <small
                    style={{
                      display: 'block',
                      marginTop: '8px',
                    }}
                  >
                    📎 {form.file.name}
                    {' '}
                    (
                    {formatFileSize(
                      form.file.size
                    )}
                    )
                  </small>
                )}

              </div>

            </div>

            <div
              style={{
                marginTop: '15px',
                padding: '14px',
                background: '#f5f7fa',
                borderRadius: '8px',
              }}
            >
              <strong>
                📄 Si ta ruash dokumentin:
              </strong>

              <p
                style={{
                  margin: '6px 0 0',
                }}
              >
                Skano dokumentin me scanner,
                ruaje si PDF ose fotografi në
                kompjuter dhe pastaj zgjidhe me
                butonin e skedarit më lart.
              </p>
            </div>

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
                💾 Ruaj dokumentin
              </button>

            </div>

          </form>

        </div>
      )}

      <div className="members-list">

        <div className="members-list-header">

          <div>

            <h3>
              Arkiva e dokumenteve
            </h3>

            <p>
              Dokumentet e skanuara të
              regjistruara në sistem.
            </p>

          </div>

        </div>

        {loading ? (

          <div className="members-empty">

            <strong>
              Duke ngarkuar dokumentet...
            </strong>

          </div>

        ) : documents.length === 0 ? (

          <div className="members-empty">

            <div className="empty-icon">
              📁
            </div>

            <strong>
              Nuk ka dokumente ende
            </strong>

            <span>
              Shtyp “+ Shto dokument” për të
              ruajtur dokumentin e parë.
            </span>

          </div>

        ) : (

          <div className="members-table-wrapper">

            <table className="members-table">

              <thead>

                <tr>
                  <th>Dokumenti</th>
                  <th>Kategoria</th>
                  <th>Data</th>
                  <th>Skedari</th>
                  <th>Përshkrimi</th>
                  <th>Veprim</th>
                </tr>

              </thead>

              <tbody>

                {documents.map(
                  (document) => (

                    <tr
                      key={document.id}
                    >

                      <td>
                        <strong>
                          📄 {document.emri}
                        </strong>
                      </td>

                      <td>
                        {document.kategoria}
                      </td>

                      <td>
                        {document.data}
                      </td>

                      <td>
                        {document.fileName}

                        <br />

                        <small>
                          {formatFileSize(
                            document.fileSize
                          )}
                        </small>
                      </td>

                      <td>
                        {document.pershkrimi ||
                          '-'}
                      </td>

                      <td>

                        <button
                          className="secondary-button"
                          onClick={() =>
                            openDocument(
                              document
                            )
                          }
                        >
                          👁️ Shiko
                        </button>

                        <button
                          className="secondary-button"
                          onClick={() =>
                            downloadDocument(
                              document
                            )
                          }
                        >
                          ⬇️ Shkarko
                        </button>

                        <button
                          className="delete-button"
                          onClick={() =>
                            handleDelete(
                              document.id
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

export default Documents