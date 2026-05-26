use leads_db

// ===============================
// IDS (referencing)
// ===============================
const users = Array.from({ length: 5 }, () => ObjectId())
const stores = Array.from({ length: 3 }, () => ObjectId())
const customers = Array.from({ length: 5 }, () => ObjectId())
const leads = Array.from({ length: 10 }, () => ObjectId())

// ===============================
// USERS
// ===============================
db.users.insertMany([
  { _id: users[0], name: "Admin", role: "administrador", active: true },
  { _id: users[1], name: "Gerente", role: "gerente", active: true },
  { _id: users[2], name: "Ana", role: "atendente", active: true },
  { _id: users[3], name: "Bruno", role: "atendente", active: true },
  { _id: users[4], name: "Carlos", role: "atendente", active: true }
])

// ===============================
// STORES
// ===============================
db.stores.insertMany([
  { _id: stores[0], name: "Loja Centro", city: "São Paulo", state: "SP" },
  { _id: stores[1], name: "Loja Norte", city: "Guarulhos", state: "SP" },
  { _id: stores[2], name: "Loja Sul", city: "Santo André", state: "SP" }
])

// ===============================
// CUSTOMERS
// ===============================
db.customers.insertMany([
  { _id: customers[0], name: "João", phone: "1111", createdBy: users[2] },
  { _id: customers[1], name: "Maria", phone: "2222", createdBy: users[3] },
  { _id: customers[2], name: "Pedro", phone: "3333", createdBy: users[4] },
  { _id: customers[3], name: "Lucas", phone: "4444", createdBy: users[2] },
  { _id: customers[4], name: "Ana Paula", phone: "5555", createdBy: users[3] }
])

// ===============================
// LEADS
// ===============================
db.leads.insertMany([
  { _id: leads[0], customerId: customers[0], storeId: stores[0], attendantId: users[2], channel: "whatsapp", createdAt: new Date() },
  { _id: leads[1], customerId: customers[1], storeId: stores[1], attendantId: users[3], channel: "instagram", createdAt: new Date() },
  { _id: leads[2], customerId: customers[2], storeId: stores[2], attendantId: users[4], channel: "telefone", createdAt: new Date() },
  { _id: leads[3], customerId: customers[3], storeId: stores[0], attendantId: users[2], channel: "presencial", createdAt: new Date() },
  { _id: leads[4], customerId: customers[4], storeId: stores[1], attendantId: users[3], channel: "whatsapp", createdAt: new Date() },
  { _id: leads[5], customerId: customers[0], storeId: stores[2], attendantId: users[4], channel: "instagram", createdAt: new Date() },
  { _id: leads[6], customerId: customers[1], storeId: stores[0], attendantId: users[2], channel: "telefone", createdAt: new Date() },
  { _id: leads[7], customerId: customers[2], storeId: stores[1], attendantId: users[3], channel: "presencial", createdAt: new Date() },
  { _id: leads[8], customerId: customers[3], storeId: stores[2], attendantId: users[4], channel: "whatsapp", createdAt: new Date() },
  { _id: leads[9], customerId: customers[4], storeId: stores[0], attendantId: users[2], channel: "instagram", createdAt: new Date() }
])

// ===============================
// NEGOTIATIONS (AGORA COM IMPORTANCE)
// ===============================
db.negotiations.insertMany([
  {
    leadId: leads[0],
    importance: "quente",
    status: "aberta",
    currentStage: "contato_inicial",
    history: [{ stage: "contato_inicial", status: "aberta", changedAt: new Date(), changedBy: users[2] }]
  },
  {
    leadId: leads[1],
    importance: "quente",
    status: "encerrada",
    currentStage: "fechamento",
    history: [
      { stage: "contato_inicial", status: "aberta", changedAt: new Date(), changedBy: users[3] },
      { stage: "fechamento", status: "encerrada", changedAt: new Date(), changedBy: users[3] }
    ]
  },
  {
    leadId: leads[2],
    importance: "morno",
    status: "aberta",
    currentStage: "proposta",
    history: [{ stage: "proposta", status: "aberta", changedAt: new Date(), changedBy: users[4] }]
  },
  {
    leadId: leads[3],
    importance: "frio",
    status: "aberta",
    currentStage: "negociacao",
    history: [{ stage: "negociacao", status: "aberta", changedAt: new Date(), changedBy: users[2] }]
  },
  {
    leadId: leads[4],
    importance: "quente",
    status: "encerrada",
    currentStage: "fechamento",
    history: [{ stage: "fechamento", status: "encerrada", changedAt: new Date(), changedBy: users[3] }]
  },
  {
    leadId: leads[5],
    importance: "morno",
    status: "aberta",
    currentStage: "contato_inicial",
    history: [{ stage: "contato_inicial", status: "aberta", changedAt: new Date(), changedBy: users[4] }]
  },
  {
    leadId: leads[6],
    importance: "morno",
    status: "aberta",
    currentStage: "proposta",
    history: [{ stage: "proposta", status: "aberta", changedAt: new Date(), changedBy: users[2] }]
  },
  {
    leadId: leads[7],
    importance: "quente",
    status: "encerrada",
    currentStage: "fechamento",
    history: [{ stage: "fechamento", status: "encerrada", changedAt: new Date(), changedBy: users[3] }]
  },
  {
    leadId: leads[8],
    importance: "frio",
    status: "aberta",
    currentStage: "negociacao",
    history: [{ stage: "negociacao", status: "aberta", changedAt: new Date(), changedBy: users[4] }]
  },
  {
    leadId: leads[9],
    importance: "frio",
    status: "aberta",
    currentStage: "contato_inicial",
    history: [{ stage: "contato_inicial", status: "aberta", changedAt: new Date(), changedBy: users[2] }]
  }
])

// ===============================
// LOGS
// ===============================
db.logs.insertMany([
  { userId: users[0], action: "login", entity: "User", createdAt: new Date() },
  { userId: users[1], action: "create", entity: "Lead", createdAt: new Date() },
  { userId: users[2], action: "update", entity: "Customer", createdAt: new Date() },
  { userId: users[3], action: "delete", entity: "Lead", createdAt: new Date() },
  { userId: users[4], action: "create", entity: "Negotiation", createdAt: new Date() },
  { userId: users[2], action: "update", entity: "Lead", createdAt: new Date() },
  { userId: users[3], action: "login", entity: "User", createdAt: new Date() },
  { userId: users[4], action: "create", entity: "Customer", createdAt: new Date() },
  { userId: users[1], action: "update", entity: "Negotiation", createdAt: new Date() },
  { userId: users[0], action: "delete", entity: "Customer", createdAt: new Date() }
])
