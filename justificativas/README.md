# Justificativa — Consultas e Aggregations (MongoDB)

## Consultas (`find`)

Usadas para buscas diretas e listagens simples nas coleções (`leads`, `customers`, `users`, etc.). São suficientes quando não há necessidade de transformar ou cruzar dados, e aproveitam os índices do MongoDB de forma eficiente.

Como o projeto usa **referencing** entre coleções, o `find` permite buscar um documento e resolver referências pontualmente, sem duplicar dados.

## Aggregations (`aggregate`)

Usadas para análises que vão além do `find`, processando os dados diretamente no banco — sem precisar trazer tudo para a aplicação.

| Aggregation | Motivo |
|---|---|
| Leads por canal | Identifica quais canais geram mais oportunidades (`$group` + `$sort`) |
| Leads por status | Mostra o funil de vendas atual via `negotiations` |
| Taxa de conversão | Calcula o % de negociações encerradas com `$cond` + `$divide` |
| Leads por atendente | Cruza `leads` com `users` via `$lookup`, substituindo múltiplas queries |
| Leads por importância | Segmenta negociações para priorização de atendimento |

## Conclusão

O `find` cobre operações do dia a dia; o `aggregate` assume as análises. Processar no banco reduz tráfego de dados, melhora performance e mantém a lógica centralizada onde os dados estão.
