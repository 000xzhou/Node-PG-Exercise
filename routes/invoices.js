const express = require("express");
const router = express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

// GET all invoices
router.get("/", async (req, res, next) => {
  try {
    const results = await db.query(
      `SELECT *
       FROM invoices`
    );
    return res.json({ invoices: results.rows });
  } catch (err) {
    return next(err);
  }
});

// GET invoices details
router.get("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;

    const results = await db.query(
      `SELECT *
       FROM invoices
       WHERE id = $1`,
      [id]
    );

    if (results.rows.length === 0) {
      return next(new ExpressError("No invoice found", 404));
    }

    return res.json({ invoice: results.rows });
  } catch (err) {
    return next(err);
  }
});

// POST adds a new invoices
router.post("/", async (req, res, next) => {
  try {
    const { comp_code, amt } = req.body;

    const results = await db.query(
      `INSERT INTO invoices (comp_code, amt) 
       VALUES ($1, $2)
       RETURNING *`,
      [comp_code, amt]
    );

    return res.status(201).json({ invoice: results.rows[0] });
  } catch (err) {
    return next(err);
  }
});

/** Update invoice, returning invoice */
router.patch("/:id", async function (req, res, next) {
  try {
    const id = req.params.id;
    const { comp_code, amt, paid, paid_date } = req.body;
    const result = await db.query(
      `UPDATE invoices SET comp_code=$1, amt=$2, paid=$3, paid_date=$4
      WHERE id=$5
      RETURNING *`,
      [comp_code, amt, paid, paid_date, id]
    );
    if (result.rows.length === 0) {
      return next(new ExpressError("No invoice found", 404));
    }
    return res.json({ invoice: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

/** Delete invoice, returning {message: "Deleted"} */
router.delete("/:id", async function (req, res, next) {
  try {
    const id = req.params.id;
    const result = await db.query("DELETE FROM invoices WHERE id = $1", [id]);

    return res.json({ status: "Deleted" });
  } catch (err) {
    return next(err);
  }
});

// GET invoices details base on company code
router.get("/companies/:code", async (req, res, next) => {
  try {
    const code = req.params.code;

    const companyResult = await db.query(
      `SELECT *
       FROM companies
       WHERE code=$1`,
      [code]
    );
    // console.log(companyResult.rows);
    if (companyResult.rows.length === 0) {
      return next(new ExpressError("No company found", 404));
    }
    const invoicesResult = await db.query(
      `SELECT *
       FROM invoices
       WHERE comp_Code=$1`,
      [code]
    );
    const company = companyResult.rows[0];
    company.invoice = invoicesResult.rows;

    return res.json({ company: company });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
