// =========================================
// 1. LEADS POR ORIGEM (channel)
// Conta quantos leads vieram de cada canal
// =========================================
db.leads.aggregate([
  { $match: {} }, // pode filtrar por data se quiser

  {
    $group: {
      _id: "$channel",
      total: { $sum: 1 }
    }
  },

  { $sort: { total: -1 } },

  {
    $project: {
      origem: "$_id",
      total: 1,
      _id: 0
    }
  }
])


// =========================================
// 2. LEADS POR STATUS (via negotiations)
// =========================================
db.negotiations.aggregate([
  { $match: {} },

  {
    $group: {
      _id: "$status",
      total: { $sum: 1 }
    }
  },

  { $sort: { total: -1 } },

  {
    $project: {
      status: "$_id",
      total: 1,
      _id: 0
    }
  }
])


// =========================================
// 3. TAXA DE CONVERSÃO
// % de negociações encerradas (convertidas)
// =========================================
db.negotiations.aggregate([
  { $match: {} },

  {
    $group: {
      _id: null,
      total: { $sum: 1 },
      encerradas: {
        $sum: {
          $cond: [{ $eq: ["$status", "encerrada"] }, 1, 0]
        }
      }
    }
  },

  {
    $project: {
      total: 1,
      encerradas: 1,
      taxaConversao: {
        $multiply: [
          { $divide: ["$encerradas", "$total"] },
          100
        ]
      }
    }
  }
])


// =========================================
// 4. LEADS POR ATENDENTE
// (usando $lookup para pegar nome do usuário)
// =========================================
db.leads.aggregate([
  { $match: {} },

  {
    $group: {
      _id: "$attendantId",
      total: { $sum: 1 }
    }
  },

  {
    $lookup: {
      from: "users",
      localField: "_id",
      foreignField: "_id",
      as: "user"
    }
  },

  { $unwind: "$user" },

  { $sort: { total: -1 } },

  {
    $project: {
      atendente: "$user.name",
      total: 1,
      _id: 0
    }
  }
])


// =========================================
// 5. LEADS POR IMPORTÂNCIA
// (vem da coleção negotiations)
// =========================================
db.negotiations.aggregate([
  { $match: {} },

  {
    $group: {
      _id: "$importance",
      total: { $sum: 1 }
    }
  },

  { $sort: { total: -1 } },

  {
    $project: {
      importancia: "$_id",
      total: 1,
      _id: 0
    }
  }
])
