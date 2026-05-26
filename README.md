
# Sistema de Gestão de Leads — MongoDB

Projeto desenvolvido para a disciplina de **Banco de Dados Não Relacional**, com o objetivo de modelar, popular e consultar um sistema de gestão de leads utilizando MongoDB. O projeto cobre desde a definição das coleções e relacionamentos até consultas analíticas com o Aggregation Pipeline.

---

## Tecnologias Utilizadas

- **MongoDB** — banco de dados NoSQL orientado a documentos
- **mongosh** — shell interativo do MongoDB para execução de scripts
- **JavaScript / TypeScript** — linguagens utilizadas nos scripts de seed e aggregations

---

## Estrutura de Arquivos

```
├── coleções.js       # Criação das coleções com validação e índices
├── seed.js           # Inserção de dados de exemplo (população do banco)
├── consultas.js      # Consultas simples com find() e filtros
├── aggregations.ts   # Consultas analíticas com o Aggregation Pipeline
└── README.md
```

---

## Estrutura do Banco de Dados

**Banco:** `leads_db`

| Coleção        | Descrição                                              |
|----------------|--------------------------------------------------------|
| `users`        | Usuários do sistema: admin, gerente e atendente        |
| `stores`       | Lojas ou unidades de atendimento                       |
| `customers`    | Clientes cadastrados no sistema                        |
| `leads`        | Oportunidades de contato com clientes                  |
| `negotiations` | Negociações associadas a cada lead                     |
| `logs`         | Registro de ações realizadas no sistema                |

---

## Modelagem: Referencing vs Embedding

### Referencing (Referência por ObjectId)

Adotado para conectar entidades que existem de forma independente e são reutilizadas em múltiplos contextos:

| Campo                    | Referencia          |
|--------------------------|---------------------|
| `leads.customerId`       | → `customers`       |
| `leads.storeId`          | → `stores`          |
| `leads.attendantId`      | → `users`           |
| `customers.createdBy`    | → `users`           |
| `negotiations.leadId`    | → `leads`           |
| `logs.userId`            | → `users`           |

**Por que Referencing?**

Entidades como `users`, `customers` e `stores` são acessadas e atualizadas de forma independente. Duplicar esses dados dentro de cada documento de lead ou negociação geraria inconsistências — por exemplo, uma mudança no nome do atendente exigiria atualizar todos os documentos onde ele aparece. Com referencing, a atualização ocorre em um único lugar, mantendo a integridade dos dados. Essa abordagem também é indicada quando os dados relacionados crescem com frequência ou possuem ciclo de vida próprio.

---

### Embedding (Documento Embutido)

Adotado na coleção `negotiations` para armazenar o histórico de estágios da negociação:

```js
history: [
  {
    stage: "contato_inicial",
    status: "aberta",
    changedAt: ISODate("2024-01-10"),
    changedBy: ObjectId("...")
  },
  {
    stage: "proposta_enviada",
    status: "em_andamento",
    changedAt: ISODate("2024-01-15"),
    changedBy: ObjectId("...")
  }
]
```

**Por que Embedding?**

O histórico de uma negociação pertence exclusivamente àquela negociação — ele nunca será acessado de forma independente, e sempre é lido junto com o documento pai. Embutir esse array elimina a necessidade de uma coleção separada (`negotiation_history`) e evita joins extras. Como o histórico tem crescimento limitado e previsível (uma negociação não tem milhares de estágios), não há risco de ultrapassar o limite de 16MB do documento MongoDB.

---

## Consultas — `consultas.js`

O arquivo `consultas.js` implementa buscas diretas com `find()`, voltadas para recuperação pontual de registros. Exemplos de consultas realizadas:

- Buscar leads por canal de origem (`channel`)
- Filtrar clientes criados por um determinado usuário
- Listar negociações abertas ou por status específico
- Recuperar logs de ações de um usuário

**Por que `find()`?**

O `find()` é ideal quando o objetivo é recuperar documentos com base em critérios simples, sem necessidade de cálculos, agrupamentos ou junções. É mais eficiente para leituras diretas e se beneficia de índices criados nas coleções.

---

## Consultas Analíticas — `aggregations.ts`

O arquivo `aggregations.ts` utiliza o **Aggregation Pipeline** do MongoDB para responder perguntas de negócio que exigem agrupamento, cálculo e junção de dados entre coleções. São 5 agregações implementadas:

---

### 1. Leads por Canal de Origem

```js
db.leads.aggregate([
  { $group: { _id: "$channel", total: { $sum: 1 } } },
  { $sort: { total: -1 } },
  { $project: { origem: "$_id", total: 1, _id: 0 } }
])
```

**O que faz:** Conta quantos leads vieram de cada canal (ex: WhatsApp, site, indicação).

**Por que Aggregation?** O `find()` não consegue agrupar e contar — é necessário `$group` com `$sum`. O `$sort` garante que os canais mais expressivos apareçam primeiro, e o `$project` deixa o resultado limpo, renomeando `_id` para `origem`.

---

### 2. Leads por Status (via Negotiations)

```js
db.negotiations.aggregate([
  { $group: { _id: "$status", total: { $sum: 1 } } },
  { $sort: { total: -1 } },
  { $project: { status: "$_id", total: 1, _id: 0 } }
])
```

**O que faz:** Agrupa todas as negociações por status (aberta, em andamento, encerrada) e conta quantas existem em cada um.

**Por que na coleção `negotiations` e não em `leads`?** O status da negociação vive em `negotiations`, não em `leads`. Consultar a coleção correta evita lookups desnecessários e retorna dados mais precisos.

---

### 3. Taxa de Conversão

```js
db.negotiations.aggregate([
  {
    $group: {
      _id: null,
      total: { $sum: 1 },
      encerradas: { $sum: { $cond: [{ $eq: ["$status", "encerrada"] }, 1, 0] } }
    }
  },
  {
    $project: {
      total: 1,
      encerradas: 1,
      taxaConversao: { $multiply: [{ $divide: ["$encerradas", "$total"] }, 100] }
    }
  }
])
```

**O que faz:** Calcula a porcentagem de negociações que foram encerradas (convertidas) em relação ao total.

**Por que `$cond` dentro do `$group`?** Permite contar seletivamente apenas os documentos que satisfazem uma condição (`status == "encerrada"`) sem precisar de um segundo `$match`. O cálculo da taxa acontece no `$project` aproveitando os dois valores já agrupados, tudo em uma única passagem pelo pipeline.

---

### 4. Leads por Atendente (com `$lookup`)

```js
db.leads.aggregate([
  { $group: { _id: "$attendantId", total: { $sum: 1 } } },
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
  { $project: { atendente: "$user.name", total: 1, _id: 0 } }
])
```

**O que faz:** Conta quantos leads cada atendente possui e exibe o nome do atendente no resultado (não apenas o ObjectId).

**Por que `$lookup`?** Como o modelo usa referencing, `leads` armazena apenas o `attendantId`. Para exibir o nome do atendente, é necessário um join com a coleção `users`. O `$lookup` faz exatamente isso dentro do pipeline, e o `$unwind` "desaninha" o array resultante para facilitar o `$project` final.

---

### 5. Leads por Importância

```js
db.negotiations.aggregate([
  { $group: { _id: "$importance", total: { $sum: 1 } } },
  { $sort: { total: -1 } },
  { $project: { importancia: "$_id", total: 1, _id: 0 } }
])
```

**O que faz:** Agrupa negociações pelo campo `importance` (ex: alta, média, baixa) para identificar a distribuição de prioridade dos leads.

**Por que Aggregation?** Mesmo sendo uma consulta simples de agrupamento, o `find()` não consegue realizar o `$group` + `$sort` em uma só operação. O pipeline é a escolha natural e mais eficiente.

---

## Como Executar

**Pré-requisito:** ter o MongoDB e mongosh instalados.

```bash
# 1. Criar as coleções
mongosh leads_db coleções.js

# 2. Popular o banco com dados de exemplo
mongosh leads_db seed.js

# 3. Executar as consultas simples
mongosh leads_db consultas.js

# 4. Executar as aggregations
mongosh leads_db aggregations.ts
```

---
