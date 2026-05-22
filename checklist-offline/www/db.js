const DB_NAME = 'checklistOfflineDB'
const DB_VERSION = 1

let db

const request = indexedDB.open(DB_NAME, DB_VERSION)

request.onupgradeneeded = function (event) {
  db = event.target.result

  if (!db.objectStoreNames.contains('usuarios')) {
    const usuarios = db.createObjectStore('usuarios', {
      keyPath: 'matricula'
    })

    usuarios.add({
      matricula: 'admin',
      senha: '123456',
      nome: 'Administrador'
    })
  }

  if (!db.objectStoreNames.contains('checklists')) {
    db.createObjectStore('checklists', {
      keyPath: 'id'
    })
  }
}

request.onsuccess = function (event) {
  db = event.target.result
  console.log('Banco offline iniciado')
}

request.onerror = function () {
  console.log('Erro ao abrir banco offline')
}

function salvarChecklistDB(checklist) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['checklists'], 'readwrite')

    const store = transaction.objectStore('checklists')

    const request = store.add(checklist)

    request.onsuccess = () => resolve(true)

    request.onerror = () => reject(false)
  })
}

function listarChecklistsDB() {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['checklists'], 'readonly')

    const store = transaction.objectStore('checklists')

    const request = store.getAll()

    request.onsuccess = () => resolve(request.result)

    request.onerror = () => reject([])
  })
}

function buscarUltimoChecklistEquipamento(equipamento, tipoChecklist) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['checklists'], 'readonly')

    const store = transaction.objectStore('checklists')

    const request = store.getAll()

    request.onsuccess = () => {
      const dados = request.result

      const filtrados = dados
        .filter(
          (c) =>
            c.equipamento === equipamento &&
            c.tipoChecklist === tipoChecklist
        )
        .sort((a, b) => new Date(b.data) - new Date(a.data))

      resolve(filtrados[0] || null)
    }

    request.onerror = () => reject(null)
  })
}

function validarLogin(matricula, senha) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['usuarios'], 'readonly')

    const store = transaction.objectStore('usuarios')

    const request = store.get(matricula)

    request.onsuccess = () => {
      const usuario = request.result

      if (usuario && usuario.senha === senha) {
        resolve(usuario)
      } else {
        resolve(null)
      }
    }

    request.onerror = () => reject(null)
  })
}