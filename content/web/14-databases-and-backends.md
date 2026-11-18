---
id: web-databases
title: Databases and back ends
level: advanced
minutes: 35
summary: Model data in tables, write SQL, use Postgres with an ORM, and design clean REST APIs.
---

## Why a database

`localStorage` lives in one browser. A **database** lives on a server, is shared by all users, survives crashes, and can answer questions like "the ten best-selling dresses this month" in milliseconds.

**PostgreSQL** (Postgres) is the default choice for most new projects: free, reliable, powerful. Run it locally with Docker:

```bash
docker run --name dev-postgres -e POSTGRES_PASSWORD=devpass -p 5432:5432 -d postgres:17
```

## Tables, rows and relations

A relational database stores data in **tables** (like spreadsheets) with **rows** (records) and **columns** (fields). Tables link to each other with **keys**.

```text
customers                orders                         order_items
---------                ------                         -----------
id (PK)                  id (PK)                        id (PK)
email (unique)           customer_id (FK -> customers)  order_id (FK -> orders)
name                     status                         product_id (FK -> products)
created_at               total_pence                    qty
                         created_at                     unit_price_pence
```

- **PK** (primary key): uniquely identifies a row.
- **FK** (foreign key): points to a row in another table. One customer has many orders; one order has many items.
- Notice `unit_price_pence` is copied into `order_items`. Prices change; the order must remember what was actually paid.

## SQL: the language of databases

```sql
-- read
SELECT name, email FROM customers WHERE created_at > '2026-01-01' ORDER BY name LIMIT 20;

-- join tables: each order with its customer's email
SELECT o.id, o.total_pence, c.email
FROM orders o
JOIN customers c ON c.id = o.customer_id
WHERE o.status = 'paid';

-- aggregate: revenue per month
SELECT date_trunc('month', created_at) AS month, SUM(total_pence) / 100.0 AS revenue_gbp
FROM orders
WHERE status = 'paid'
GROUP BY month
ORDER BY month;

-- write
INSERT INTO customers (email, name) VALUES ('ada@example.com', 'Ada');
UPDATE orders SET status = 'shipped' WHERE id = 42;
DELETE FROM carts WHERE updated_at < now() - interval '30 days';
```

Learn SQL properly. ORMs help, but every senior developer can read and write SQL, and debugging slow pages usually means reading it.

## Using an ORM

An ORM lets you query with typed code. With **Prisma**, you describe the schema:

```text
// prisma/schema.prisma
model Customer {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  orders    Order[]
  createdAt DateTime @default(now())
}

model Order {
  id         String   @id @default(cuid())
  customer   Customer @relation(fields: [customerId], references: [id])
  customerId String
  status     String   @default("pending")
  totalPence Int
  createdAt  DateTime @default(now())
}
```

```bash
npx prisma migrate dev --name init     # creates the tables and a migration file
```

```ts
const paid = await prisma.order.findMany({
  where: { status: 'paid' },
  include: { customer: true },
  orderBy: { createdAt: 'desc' },
  take: 20,
});
```

**Migrations** are version-controlled changes to the database structure. Commit them like code, so every environment's database matches.

## Designing a REST API

| Method and path | Does |
|---|---|
| `GET /api/products` | List products (support `?page=2&category=dresses`) |
| `GET /api/products/:id` | One product |
| `POST /api/products` | Create (admin only) |
| `PATCH /api/products/:id` | Update some fields |
| `DELETE /api/products/:id` | Delete |

Return correct status codes (201 created, 400 invalid input, 401 not logged in, 403 not allowed, 404 not found) and consistent JSON error bodies: `{ "error": "Email is required" }`.

:::warn Never build SQL by gluing strings
`"SELECT * FROM users WHERE email = '" + email + "'"` lets an attacker type SQL into your form and read or delete your data. That is **SQL injection**. ORMs and parameterised queries (`WHERE email = $1`) prevent it. Never interpolate user input into a query string.
:::

## Other back-end essentials

- **Indexes** make lookups fast: add one to columns you filter or join on often (`email`, `customer_id`).
- **Transactions** group writes so they all succeed or all fail: charge the card and create the order together.
- **Backups**: managed hosts (Neon, Supabase, Railway, RDS) back up automatically. Test restoring once.
- **Pagination**: never return 50,000 rows to a browser.

## Quiz

? What does a foreign key do?
- [ ] Encrypts a column
- [x] Links a row to a row in another table, like an order to its customer
- [ ] Makes a column unique
> Foreign keys model relationships and protect them (you cannot point to a customer that does not exist).

? Why copy unit_price_pence into order_items instead of reading it from products?
- [x] Product prices change later, but the order must record what was actually paid
- [ ] It makes the database smaller
- [ ] SQL cannot join tables
> Historical records must not change when current data changes.

? Which of these is vulnerable to SQL injection?
- [ ] prisma.user.findUnique({ where: { email } })
- [ ] A query with $1 placeholders and email passed as a parameter
- [x] "SELECT * FROM users WHERE email = '" + email + "'"
> String-built queries let attackers inject SQL. Use parameters or an ORM.

? What is a migration?
- [ ] Moving to a new hosting provider
- [x] A version-controlled change to the database structure
- [ ] A database backup
> Migrations keep every environment's schema in sync, the same way Git does for code.
