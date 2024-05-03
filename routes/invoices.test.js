// connect to right DB --- set before loading db.js
process.env.NODE_ENV = "test";

// npm packages
const request = require("supertest");

// app imports
const app = require("../app");
const db = require("../db");

let invoicesData;
let companyData;

beforeEach(async function () {
  let company = await db.query(`
    INSERT INTO companies (code, name, description) VALUES ('apple', 'apple', 'apple') RETURNING *`);
  companyData = company.rows[0];
  let result = await db.query(`
    INSERT INTO
      invoices (comp_code, amt) VALUES ('${company.code}', 100)
      RETURNING *`);
  invoicesData = result.rows[0];
});

afterEach(async function () {
  // delete any data created by test
  await db.query("DELETE FROM companies");
  await db.query("DELETE FROM invoices");
});

afterAll(async function () {
  // close db connection
  await db.end();
});

/** GET /invoices */
describe("GET /invoices", function () {
  test("Gets a list ofinvoices", async function () {
    const response = await request(app).get(`/invoices`);
    // because dates are serialized and represented in JavaScript objects compared to PostgreSQL.
    const expectedAddDate = new Date(invoicesData.add_date).toISOString();
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({
      invoices: [
        {
          id: invoicesData.id,
          comp_code: invoicesData.comp_code,
          amt: invoicesData.amt,
          paid: invoicesData.paid,
          add_date: expectedAddDate,
          paid_date: invoicesData.paid_date,
        },
      ],
    });
  });
  test("Gets a invoice", async function () {
    const response = await request(app).get(`/invoices/${invoicesData.id}`);
    const expectedAddDate = new Date(invoicesData.add_date).toISOString();
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({
      invoice: [
        {
          id: invoicesData.id,
          comp_code: invoicesData.comp_code,
          amt: invoicesData.amt,
          paid: invoicesData.paid,
          add_date: expectedAddDate,
          paid_date: invoicesData.paid_date,
        },
      ],
    });
  });
  test("Responds for 404 for invalid id", async function () {
    const response = await request(app).get(`/invoices/999`);
    expect(response.statusCode).toEqual(404);
  });
  test("Gets a invoice base on company", async function () {
    const response = await request(app).get(
      `/invoices/companies/${companyData.code}`
    );
    const expectedAddDate = new Date(invoicesData.add_date).toISOString();
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({
      company: {
        code: companyData.code,
        name: companyData.name,
        description: companyData.description,
        invoice: [
          {
            id: invoicesData.id,
            comp_code: invoicesData.comp_code,
            amt: invoicesData.amt,
            paid: invoicesData.paid,
            add_date: expectedAddDate,
            paid_date: invoicesData.paid_date,
          },
        ],
      },
    });
  });
  test("Responds for 404 for invalid code", async function () {
    const response = await request(app).get(`/invoices/companies/nothing`);
    expect(response.statusCode).toEqual(404);
  });
});

/** POST /invoices */
describe("POST /invoices", function () {
  test("Creates a new invoice", async function () {
    const response = await request(app).post(`/invoices`).send({
      comp_code: "ibm",
      amt: 1000,
    });
    // !unsure why I received error 500 when my server runs it at 201
    expect(response.statusCode).toEqual(201);
    // expect(response.body).toEqual({
    //   invoice: {
    //     comp_code: "ibm",
    //     amt: 1000,
    //     paid: false,
    //     paid_date: null,
    //   },
    // });
  });
});

/** PATCH /invoices */
describe("PATCH /invoices", function () {
  test("edit invoice", async function () {
    const response = await request(app)
      .patch(`/invoices/${invoicesData.id}`)
      .send({
        comp_code: "ibm",
        amt: 1000,
        paid: true,
        paid_date: "2024-01-01",
      });
    // !unsure why I received error 500 when my server runs it at 200
    expect(response.statusCode).toEqual(200);
    // expect(response.body).toEqual({
    //   invoice: {
    //     comp_code: "ibm",
    //     amt: 1000,
    //     paid: true,
    //     paid_date: "2024-01-01",
    //   },
    // });
  });
  test("Responds for 404 for invalid id", async function () {
    const response = await request(app).patch(`/invoices/999`).send({
      comp_code: "ibm",
      amt: 1000,
      paid: true,
      paid_date: "2024-01-01",
    });
    expect(response.statusCode).toEqual(404);
  });
});

/** DELTE /invoices */
describe("DELTE /invoices", function () {
  test("delte a invoice", async function () {
    const response = await request(app).delete(`/invoices/${invoicesData.id}`);
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({ status: "Deleted" });
  });
});
