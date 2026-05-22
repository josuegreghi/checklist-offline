let usuarioAtual = null
let tipoChecklist = ''
let passoAtual = 0
let respostas = {}
let observacoes = {}
let fotos = {}
let ultimoChecklist = null

const gruposCaminhao = [
  {
    titulo: '🚛 Cabine, Painel e Documentos',
    descricao: 'Condições internas, painel, segurança e documentação.',
    itens: [
      'Limpeza interna do veículo',
      'Luz do painel',
      'Cinto de segurança',
      'Documentação',
      'Extintor'
    ]
  },
  {
    titulo: '⚙️ Motor e Vazamentos',
    descricao: 'Motor, níveis e possíveis vazamentos.',
    itens: [
      'Nível de água do radiador',
      'Nível de óleo do motor',
      'Ruídos anormais',
      'Vazamentos'
    ]
  },
  {
    titulo: '🛞 Rodas, Pneus e Fixação',
    descricao: 'Pneus, calibragem e fixação.',
    itens: [
      'Calibragem dos pneus',
      'Estado dos pneus',
      'Aperto das porcas de rodas'
    ]
  },
  {
    titulo: '💡 Luzes e Sinalização',
    descricao: 'Sistema de iluminação.',
    itens: [
      'Faróis',
      'Lanternas e luz de freio',
      'Setas',
      'Alarme de ré'
    ]
  },
  {
    titulo: '🛑 Freios e Segurança',
    descricao: 'Itens críticos de segurança.',
    itens: [
      'Funcionamento do freio'
    ]
  }
]

const gruposEmpilhadeira = [
  {
    titulo: '🏗️ Estrutura e Garfos',
    descricao: 'Condição estrutural da empilhadeira.',
    itens: [
      'Estado dos garfos',
      'Torre de elevação',
      'Correntes de elevação',
      'Protetor de carga'
    ]
  },
  {
    titulo: '⚙️ Sistema Hidráulico e Motor',
    descricao: 'Verificação de funcionamento.',
    itens: [
      'Vazamento hidráulico',
      'Nível de óleo hidráulico',
      'Ruídos anormais',
      'Funcionamento geral'
    ]
  },
  {
    titulo: '🛑 Freios e Segurança',
    descricao: 'Itens de segurança.',
    itens: [
      'Freio',
      'Freio de estacionamento',
      'Buzina',
      'Cinto de segurança',
      'Assento'
    ]
  },
  {
    titulo: '💡 Luzes, Painel e Bateria',
    descricao: 'Sistema elétrico.',
    itens: [
      'Luzes',
      'Painel',
      'Bateria',
      'Alarme de ré'
    ]
  },
  {
    titulo: '🛞 Rodas e Pneus',
    descricao: 'Condição das rodas.',
    itens: [
      'Pneus',
      'Rodas'
    ]
  }
]

function getGrupos() {
  return tipoChecklist === 'EMPILHADEIRA'
    ? gruposEmpilhadeira
    : gruposCaminhao
}

function getTodosItens() {
  return getGrupos().flatMap((grupo) =>
    grupo.itens.map((item) => ({
      item,
      grupo: grupo.titulo,
      descricao: grupo.descricao
    }))
  )
}

async function login() {
  const matricula = document.getElementById('matricula').value.trim()
  const senha = document.getElementById('senha').value.trim()

  if (!matricula) {
    alert('Digite sua matrícula')
    return
  }

  if (senha !== '123456') {
    alert('Senha inválida')
    return
  }

  usuarioAtual = {
    nome: `Operador ${matricula}`,
    matricula
  }

  document.getElementById('loginScreen').classList.add('hidden')
  document.getElementById('appScreen').classList.remove('hidden')
  document.getElementById('usuarioLogado').innerText =
    `Matrícula: ${matricula}`

  abrirTela('checklist')
}

function sair() {
  usuarioAtual = null

  document.getElementById('loginScreen').classList.remove('hidden')
  document.getElementById('appScreen').classList.add('hidden')
}

function abrirTela(tela) {
  document.getElementById('telaChecklist').classList.add('hidden')
  document.getElementById('telaRelatorios').classList.add('hidden')

  if (tela === 'checklist') {
    document.getElementById('telaChecklist').classList.remove('hidden')
  }

  if (tela === 'relatorios') {
    document.getElementById('telaRelatorios').classList.remove('hidden')
    gerarRelatorio()
  }
}

function selecionarTipo(tipo) {
  tipoChecklist = tipo

  passoAtual = 0
  respostas = {}
  observacoes = {}
  fotos = {}

  document.getElementById('btnCaminhao').classList.remove('ativo')
  document.getElementById('btnEmpilhadeira').classList.remove('ativo')

  if (tipo === 'CAMINHAO') {
    document.getElementById('btnCaminhao').classList.add('ativo')
  } else {
    document.getElementById('btnEmpilhadeira').classList.add('ativo')
  }

  document.getElementById('checklistArea').classList.remove('hidden')

  renderItem()
  buscarHistorico()
}

async function buscarHistorico() {
  const equipamento = document
    .getElementById('equipamento')
    .value
    .trim()

  if (!equipamento || !tipoChecklist) return

  ultimoChecklist = await buscarUltimoChecklistEquipamento(
    equipamento,
    tipoChecklist
  )

  renderItem()
}

function marcarStatus(status) {
  const atual = getTodosItens()[passoAtual]

  respostas[atual.item] = status

  renderItem()
}

function renderItem() {
  if (!tipoChecklist) return

  const todosItens = getTodosItens()

  const atual = todosItens[passoAtual]

  const total = todosItens.length

  const progresso = Math.round(
    ((passoAtual + 1) / total) * 100
  )

  document.getElementById('contadorItem').innerText =
    `Item ${passoAtual + 1} de ${total}`

  document.getElementById('percentual').innerText =
    `${progresso}% concluído`

  document.getElementById('barraProgresso').style.width =
    `${progresso}%`

  document.getElementById('grupoTitulo').innerText =
    atual.grupo

  document.getElementById('grupoDescricao').innerText =
    atual.descricao

  document.getElementById('itemTitulo').innerText =
    atual.item

  const itemBox = document.getElementById('itemAtualBox')

  itemBox.className = 'item'

  if (respostas[atual.item] === 'OK') {
    itemBox.classList.add('ok')
  }

  if (respostas[atual.item] === 'NÃO OK') {
    itemBox.classList.add('nao-ok')
  }

  if (respostas[atual.item] === 'NÃO SE APLICA') {
    itemBox.classList.add('na')
  }

  document.getElementById('statusOK')
    .classList.toggle(
      'ativo',
      respostas[atual.item] === 'OK'
    )

  document.getElementById('statusNaoOK')
    .classList.toggle(
      'ativo',
      respostas[atual.item] === 'NÃO OK'
    )

  document.getElementById('statusNA')
    .classList.toggle(
      'ativo',
      respostas[atual.item] === 'NÃO SE APLICA'
    )

  document.getElementById('observacaoItem').value =
    observacoes[atual.item] || ''

  document.getElementById('fotoSelecionada').innerText =
    fotos[atual.item]
      ? `📷 Foto selecionada: ${fotos[atual.item].name}`
      : ''

  document.getElementById('btnProximo')
    .classList.toggle(
      'hidden',
      passoAtual === total - 1
    )

  document.getElementById('btnFinalizar')
    .classList.toggle(
      'hidden',
      passoAtual !== total - 1
    )

  mostrarUltimoApontamento(atual.item)
}

function mostrarUltimoApontamento(itemNome) {
  const box = document.getElementById('ultimoApontamento')

  box.innerHTML = ''

  box.className = 'ultimo hidden'

  if (!ultimoChecklist) return

  const itemAnterior =
    ultimoChecklist.itens.find(
      (i) => i.item === itemNome
    )

  if (!itemAnterior) return

  box.classList.remove('hidden')

  if (itemAnterior.status === 'NÃO OK') {
    box.classList.add('nao-ok')
  }

  const fotoHtml = itemAnterior.foto
    ? `<img src="${itemAnterior.foto}" alt="Foto anterior" />`
    : ''

  box.innerHTML = `
    <h3>Último apontamento deste item</h3>

    <p><b>Status:</b> ${itemAnterior.status}</p>

    <p><b>Observação:</b>
      ${itemAnterior.observacao || 'Sem observação'}
    </p>

    <p><b>Operador:</b>
      ${ultimoChecklist.operador}
    </p>

    <p><b>Data:</b>
      ${new Date(ultimoChecklist.data)
        .toLocaleString('pt-BR')}
    </p>

    ${fotoHtml}
  `
}

document.addEventListener('input', function (event) {
  if (event.target.id === 'observacaoItem') {
    const atual = getTodosItens()[passoAtual]

    observacoes[atual.item] = event.target.value
  }
})

document.addEventListener('change', function (event) {
  if (event.target.id === 'fotoItem') {
    const atual = getTodosItens()[passoAtual]

    const arquivo = event.target.files[0]

    if (arquivo) {
      fotos[atual.item] = arquivo

      document.getElementById('fotoSelecionada').innerText =
        `📷 Foto selecionada: ${arquivo.name}`
    }
  }
})

function validarItemAtual() {
  const atual = getTodosItens()[passoAtual]

  const status = respostas[atual.item]

  if (!status) {
    alert(`Selecione o status do item: ${atual.item}`)
    return false
  }

  if (
    status === 'NÃO OK' &&
    !observacoes[atual.item]
  ) {
    alert(
      `Digite a observação do item NÃO OK: ${atual.item}`
    )

    return false
  }

  return true
}

function manterPosicao(callback) {
  const posicaoAtual = window.scrollY

  callback()

  setTimeout(() => {
    window.scrollTo(0, posicaoAtual)
  }, 0)
}

function proximoItem() {
  if (!validarItemAtual()) return

  const total = getTodosItens().length

  if (passoAtual < total - 1) {
    manterPosicao(() => {
      passoAtual++
      renderItem()
    })
  }
}

function voltarItem() {
  if (passoAtual > 0) {
    manterPosicao(() => {
      passoAtual--
      renderItem()
    })
  }
}

function converterFotoParaBase64(file) {
  return new Promise((resolve) => {
    if (!file) {
      resolve('')
      return
    }

    const reader = new FileReader()

    reader.onload = () => resolve(reader.result)

    reader.readAsDataURL(file)
  })
}

async function salvarChecklist() {
  const equipamento = document
    .getElementById('equipamento')
    .value
    .trim()

  const observacaoGeral = document
    .getElementById('observacaoGeral')
    .value
    .trim()

  if (!usuarioAtual) {
    alert('Faça login novamente')
    return
  }

  if (!tipoChecklist) {
    alert('Selecione o tipo de checklist')
    return
  }

  if (!equipamento) {
    alert('Digite o equipamento')
    return
  }

  if (!validarItemAtual()) return

  const todosItens = getTodosItens()

  const itensSalvos = []

  for (const obj of todosItens) {
    const item = obj.item

    if (!respostas[item]) {
      alert(`Falta preencher o item: ${item}`)
      return
    }

    if (
      respostas[item] === 'NÃO OK' &&
      !observacoes[item]
    ) {
      alert(
        `Digite a observação do item NÃO OK: ${item}`
      )

      return
    }

    const fotoBase64 =
      await converterFotoParaBase64(fotos[item])

    itensSalvos.push({
      item,
      status: respostas[item],
      observacao: observacoes[item] || '',
      foto: fotoBase64
    })
  }

  const checklist = {
    id: crypto.randomUUID(),
    operador: usuarioAtual.nome,
    matricula: usuarioAtual.matricula,
    tipoChecklist,
    equipamento,
    observacaoGeral,
    data: new Date().toISOString(),
    itens: itensSalvos
  }

  await salvarChecklistDB(checklist)

  alert('Checklist salvo offline!')

  respostas = {}
  observacoes = {}
  fotos = {}
  passoAtual = 0

  document.getElementById('observacaoGeral').value = ''
  document.getElementById('fotoItem').value = ''

  ultimoChecklist = checklist

  renderItem()
}

async function gerarRelatorio() {
  const dados = await listarChecklistsDB()

  const filtroMatricula =
    document.getElementById('filtroMatricula')
      .value
      .trim()
      .toLowerCase()

  const filtroEquipamento =
    document.getElementById('filtroEquipamento')
      .value
      .trim()
      .toLowerCase()

  const filtroData =
    document.getElementById('filtroData').value

  const filtroTipo =
    document.getElementById('filtroTipo').value

  const filtroNaoOk =
    document.getElementById('filtroNaoOk').value

  let filtrados = dados

  if (filtroMatricula) {
    filtrados = filtrados.filter((c) =>
      String(c.matricula)
        .toLowerCase()
        .includes(filtroMatricula)
    )
  }

  if (filtroEquipamento) {
    filtrados = filtrados.filter((c) =>
      String(c.equipamento)
        .toLowerCase()
        .includes(filtroEquipamento)
    )
  }

  if (filtroData) {
    filtrados = filtrados.filter(
      (c) => c.data.slice(0, 10) === filtroData
    )
  }

  if (filtroTipo) {
    filtrados = filtrados.filter(
      (c) => c.tipoChecklist === filtroTipo
    )
  }

  if (filtroNaoOk === 'SIM') {
    filtrados = filtrados.filter((c) =>
      c.itens.some(
        (item) => item.status === 'NÃO OK'
      )
    )
  }

  let totalNaoOk = 0

  filtrados.forEach((c) => {
    c.itens.forEach((item) => {
      if (item.status === 'NÃO OK') {
        totalNaoOk++
      }
    })
  })

  document.getElementById('totalChecklists')
    .innerText = filtrados.length

  document.getElementById('totalNaoOk')
    .innerText = totalNaoOk

  const lista =
    document.getElementById('relatorioLista')

  lista.innerHTML = ''

  if (filtrados.length === 0) {
    lista.innerHTML =
      '<p>Nenhum registro encontrado.</p>'

    return
  }

  filtrados
    .sort((a, b) =>
      new Date(b.data) - new Date(a.data)
    )

    .forEach((c) => {
      const itensNaoOk =
        c.itens.filter(
          (item) => item.status === 'NÃO OK'
        )

      const detalhesNaoOk =
        itensNaoOk.map((item) => `
          <div class="relatorio-itens">

            <strong>${item.item}</strong>

            <p>Status: ${item.status}</p>

            <p>
              Observação:
              ${item.observacao || 'Sem observação'}
            </p>

            ${
              item.foto
                ? `<button class="link-foto" onclick="abrirFoto('${item.foto}')">📷 Abrir foto</button>`
                : ''
            }

          </div>
        `).join('')

      lista.innerHTML += `
        <div class="relatorio-item
          ${itensNaoOk.length > 0 ? 'nao-ok' : ''}
        ">

          <strong>
            Equipamento: ${c.equipamento}
          </strong>

          <p><b>Tipo:</b>
            ${c.tipoChecklist}
          </p>

          <p><b>Operador:</b>
            ${c.operador}
          </p>

          <p><b>Matrícula:</b>
            ${c.matricula}
          </p>

          <p><b>Data:</b>
            ${new Date(c.data)
              .toLocaleString('pt-BR')}
          </p>

          <p><b>Observação geral:</b>
            ${c.observacaoGeral || 'Sem observação'}
          </p>

          <p>
            <b>Total NÃO OK:</b>
            ${itensNaoOk.length}
          </p>

          ${
            itensNaoOk.length > 0
              ? `
                <h4>Itens NÃO OK</h4>
                ${detalhesNaoOk}
              `
              : '<p>Sem itens NÃO OK.</p>'
          }

        </div>
      `
    })
}
async function exportarCSV() {
  const dados = await listarChecklistsDB()

  if (!dados || dados.length === 0) {
    alert('Nenhum dado para exportar')
    return
  }

  const linhas = []

  linhas.push([
    'ID',
    'Data',
    'Matricula',
    'Operador',
    'Tipo Checklist',
    'Equipamento',
    'Observacao Geral',
    'Item',
    'Status',
    'Observacao Item',
    'Tem Foto'
  ])

  dados.forEach((checklist) => {
    checklist.itens.forEach((item) => {
      linhas.push([
        checklist.id,
        new Date(checklist.data).toLocaleString('pt-BR'),
        checklist.matricula,
        checklist.operador,
        checklist.tipoChecklist,
        checklist.equipamento,
        checklist.observacaoGeral || '',
        item.item,
        item.status,
        item.observacao || '',
        item.foto ? 'SIM' : 'NAO'
      ])
    })
  })

  const csv = linhas
    .map((linha) =>
      linha
        .map((campo) => `"${String(campo).replace(/"/g, '""')}"`)
        .join(';')
    )
    .join('\n')

  const blob = new Blob(['\uFEFF' + csv], {
    type: 'text/csv;charset=utf-8;'
  })

  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `backup-checklist-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}
async function exportarBackupCompleto() {
  const dados = await listarChecklistsDB()

  if (!dados || dados.length === 0) {
    alert('Nenhum dado para exportar')
    return
  }

  const backup = {
    sistema: 'checklist-offline',
    dataExportacao: new Date().toISOString(),
    totalRegistros: dados.length,
    dados: dados
  }

  const json = JSON.stringify(backup, null, 2)

  const blob = new Blob([json], {
    type: 'application/json;charset=utf-8'
  })

  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `backup-completo-checklist-${new Date()
    .toISOString()
    .slice(0, 10)}.json`

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

async function exportarZipComFotos() {
  const dados = await listarChecklistsDB()

  if (!dados || dados.length === 0) {
    alert('Nenhum dado para exportar')
    return
  }

  const zip = new JSZip()
  const pastaFotos = zip.folder('fotos')

  const linhas = []

  linhas.push([
    'ID',
    'Data',
    'Matricula',
    'Operador',
    'Tipo Checklist',
    'Equipamento',
    'Observacao Geral',
    'Item',
    'Status',
    'Observacao Item',
    'Foto Arquivo'
  ])

  for (const checklist of dados) {
    for (let i = 0; i < checklist.itens.length; i++) {
      const item = checklist.itens[i]
      let nomeFoto = ''

      if (item.foto) {
        const extensao = item.foto.includes('image/png') ? 'png' : 'jpg'

        const itemLimpo = item.item
  		.normalize('NFD')
 		.replace(/[\u0300-\u036f]/g, '')
  		.replace(/[^a-zA-Z0-9]/g, '-')
  		.toLowerCase()

	nomeFoto =
  		`fotos/${checklist.equipamento}-${itemLimpo}-${i + 1}.${extensao}`

        const base64 = item.foto.split(',')[1]

        pastaFotos.file(
          `${checklist.equipamento}-${itemLimpo}-${i + 1}.${extensao}`,
          base64,
          { base64: true }
        )
      }

      linhas.push([
        checklist.id,
        new Date(checklist.data).toLocaleString('pt-BR'),
        checklist.matricula,
        checklist.operador,
        checklist.tipoChecklist,
        checklist.equipamento,
        checklist.observacaoGeral || '',
        item.item,
        item.status,
        item.observacao || '',
        nomeFoto
      ])
    }
  }

  const csv = linhas
    .map((linha) =>
      linha
        .map((campo) => `"${String(campo).replace(/"/g, '""')}"`)
        .join(';')
    )
    .join('\n')

  zip.file('dados.csv', '\uFEFF' + csv)

  const conteudo = await zip.generateAsync({ type: 'blob' })

  const url = URL.createObjectURL(conteudo)

  const link = document.createElement('a')
  link.href = url
  link.download = `backup-checklist-com-fotos-${new Date()
    .toISOString()
    .slice(0, 10)}.zip`

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

function abrirFoto(fotoBase64) {
  const novaJanela = window.open()
  novaJanela.document.write(`
    <html>
      <head>
        <title>Foto do apontamento</title>
        <style>
          body {
            margin: 0;
            background: #111;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
          }
          img {
            max-width: 100%;
            max-height: 100vh;
          }
        </style>
      </head>
      <body>
        <img src="${fotoBase64}" />
      </body>
    </html>
  `)
}

async function enviarRelatorioWhatsApp() {
  const dados = await listarChecklistsDB()

  const filtroMatricula = document.getElementById('filtroMatricula').value.trim().toLowerCase()
  const filtroEquipamento = document.getElementById('filtroEquipamento').value.trim().toLowerCase()
  const filtroData = document.getElementById('filtroData').value
  const filtroTipo = document.getElementById('filtroTipo').value
  const filtroNaoOk = document.getElementById('filtroNaoOk').value

  let filtrados = dados

  if (filtroMatricula) {
    filtrados = filtrados.filter((c) =>
      String(c.matricula).toLowerCase().includes(filtroMatricula)
    )
  }

  if (filtroEquipamento) {
    filtrados = filtrados.filter((c) =>
      String(c.equipamento).toLowerCase().includes(filtroEquipamento)
    )
  }

  if (filtroData) {
    filtrados = filtrados.filter((c) => c.data.slice(0, 10) === filtroData)
  }

  if (filtroTipo) {
    filtrados = filtrados.filter((c) => c.tipoChecklist === filtroTipo)
  }

  if (filtroNaoOk === 'SIM') {
    filtrados = filtrados.filter((c) =>
      c.itens.some((item) => item.status === 'NÃO OK')
    )
  }

  if (filtrados.length === 0) {
    alert('Nenhum registro filtrado para enviar.')
    return
  }

  let mensagem = '📋 *RELATÓRIO DE CHECK-LIST*%0A%0A'

  filtrados
    .sort((a, b) => new Date(b.data) - new Date(a.data))
    .slice(0, 10)
    .forEach((c, index) => {
      const itensNaoOk = c.itens.filter((item) => item.status === 'NÃO OK')

      mensagem += `*Registro ${index + 1}*%0A`
      mensagem += `🚜 Equipamento: ${c.equipamento}%0A`
      mensagem += `📌 Tipo: ${c.tipoChecklist}%0A`
      mensagem += `👤 Operador: ${c.operador}%0A`
      mensagem += `🆔 Matrícula: ${c.matricula}%0A`
      mensagem += `🕒 Data: ${new Date(c.data).toLocaleString('pt-BR')}%0A`
      mensagem += `📝 Obs geral: ${c.observacaoGeral || 'Sem observação'}%0A`
      mensagem += `❌ Itens NÃO OK: ${itensNaoOk.length}%0A`

      itensNaoOk.forEach((item) => {
        mensagem += `   • ${item.item}: ${item.observacao || 'Sem observação'}%0A`
        mensagem += `     Foto: ${item.foto ? 'SIM' : 'NÃO'}%0A`
      })

      mensagem += `%0A--------------------%0A%0A`
    })

  if (filtrados.length > 10) {
    mensagem += `⚠️ Mostrando apenas os 10 registros mais recentes de ${filtrados.length}.`
  }

  window.open(`https://wa.me/?text=${mensagem}`, '_blank')
}
