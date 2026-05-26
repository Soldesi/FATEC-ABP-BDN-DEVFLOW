
// =========================================
// CONSULTA 1 - $and
// Leads do canal whatsapp DO atendente Ana (users[2])
// =========================================
db.leads.find({
  $and: [
    { channel: "whatsapp" },
    { attendantId: users[2] }
  ]
})


// =========================================
// CONSULTA 2 - $or
// Leads de instagram OU whatsapp
// =========================================
db.leads.find({
  $or: [
    { channel: "instagram" },
    { channel: "whatsapp" }
  ]
})


// =========================================
// CONSULTA 3 - $gt e $lt
// Leads criados em um intervalo de datas

// =========================================
db.leads.find({
  createdAt: {
    $gt: new Date("2020-01-01"),
    $lt: new Date("2030-01-01")
  }
})


// =========================================
// CONSULTA 4 - $exists

// =========================================
db.negotiations.find({
  history: { $exists: true }
})


// =========================================
// CONSULTA 5 - PROJEÇÃO
// Mostra apenas nome e telefone dos clientes
// =========================================
db.customers.find(
  {},
  { name: 1, phone: 1, _id: 0 }
)


// =========================================
// CONSULTA 6 - SORT (ORDENAÇÃO)
// Leads mais recentes primeiro
// =========================================
db.leads.find().sort({ createdAt: -1 })


// =========================================
// CONSULTA 7 - PAGINAÇÃO
// Página 2 (5 registros por página)
// =========================================
db.leads.find()
  .skip(5)
  .limit(5)
