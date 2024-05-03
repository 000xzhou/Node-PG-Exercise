// connect to right DB --- set before loading db.js
process.env.NODE_ENV = "test";

// npm packages
const request = require("supertest");

// app imports
const app = require("../app");
const db = require("../db");

let companiesData;

beforeEach(async function () {
  let result = await db.query(`
    INSERT INTO companies (code, name, description) VALUES ('apple', 'apple', 'apple') RETURNING *`);
  companiesData = result.rows[0];
});

afterEach(async function () {
  // delete any data created by test
  await db.query("DELETE FROM companies");
});

afterAll(async function () {
  // close db connection
  await db.end();
});

/** GET /companies */
describe("GET /companies", function () {
  test("Gets a list ofcompanies", async function () {
    const response = await request(app).get(`/companies`);
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({
      companies: [companiesData],
    });
  });
  test("Gets a company", async function () {
    const response = await request(app).get(`/companies/${companiesData.code}`);
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({
      company: [companiesData],
    });
  });
  test("Responds for 404 for invalid code", async function () {
    const response = await request(app).get(`/companies/monkey`);
    expect(response.statusCode).toEqual(404);
  });
});

/** POST /companies */
describe("POST /companies", function () {
  test("Creates a new company", async function () {
    const response = await request(app).post(`/companies`).send({
      code: "pizza",
      name: "pizza",
      description: "a big piazza",
    });
    expect(response.statusCode).toEqual(201);
    expect(response.body).toEqual({
      company: { code: "pizza", name: "pizza", description: "a big piazza" },
    });
  });
});

/** PATCH /companies */
describe("PATCH /companies", function () {
  test("edit company", async function () {
    const response = await request(app)
      .patch(`/companies/${companiesData.code}`)
      .send({
        name: "pizza",
        description: "a big piazza",
      });
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({
      company: {
        code: companiesData.code,
        name: "pizza",
        description: "a big piazza",
      },
    });
  });
  test("Responds for 404 for invalid code", async function () {
    const response = await request(app).patch(`/companies/monkey`).send({
      name: "pizza",
      description: "a big piazza",
    });
    expect(response.statusCode).toEqual(404);
  });
});

/** DELTE /companies */
describe("DELTE /companies", function () {
  test("delte a company", async function () {
    const response = await request(app).delete(
      `/companies/${companiesData.code}`
    );
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({ status: "Deleted" });
  });
});
