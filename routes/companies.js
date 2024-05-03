const express = require("express");
const router = express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

// GET all companies
router.get("/", async (req, res, next) => {
  try {
    const type = req.query.type;

    const results = await db.query(
      `SELECT *
       FROM companies`
    );
    return res.json({ companies: results.rows });
  } catch (err) {
    return next(err);
  }
});

// GET companies details
router.get("/:code", async (req, res, next) => {
  try {
    const codeP = req.params.code;

    const results = await db.query(
      `SELECT c.code, c.name, c.description, ind.iname as industry
       FROM companies AS c
       LEFT JOIN industries AS i
       ON c.code = i.comp_code
       LEFT JOIN industry AS ind
       ON i.indu_code = ind.icode
       WHERE c.code = $1`,
      [codeP]
    );

    if (results.rows.length === 0) {
      return next(new ExpressError("Company not found", 404));
    }
    let { code, name, description } = results.rows[0];
    let industry = results.rows.map((r) => {
      if (r.industry) {
        return r.industry;
      } else {
        return "no industry";
      }
    });

    return res.json({ company: { code, name, description, industry } });
  } catch (err) {
    return next(err);
  }
});

// POST adds a new company
router.post("/", async (req, res, next) => {
  try {
    const { code, name, description } = req.body;
    const results = await db.query(
      `INSERT INTO companies (code, name, description) 
       VALUES ($1, $2, $3)
       RETURNING code, name, description`,
      [code, name, description]
    );

    return res.status(201).json({ company: results.rows[0] });
  } catch (err) {
    return next(err);
  }
});

/** Update company, returning company */
router.patch("/:code", async function (req, res, next) {
  try {
    const code = req.params.code;
    const { name, description } = req.body;
    const result = await db.query(
      `UPDATE companies SET code=$1, name=$2, description=$3
      WHERE code=$1
      RETURNING code, name, description`,
      [code, name, description]
    );
    if (result.rows.length === 0) {
      return next(new ExpressError("Company not found", 404));
    }
    return res.json({ company: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

/** Delete company, returning {message: "Deleted"} */
router.delete("/:code", async function (req, res, next) {
  try {
    const code = req.params.code;
    const result = await db.query("DELETE FROM companies WHERE code = $1", [
      code,
    ]);

    return res.json({ status: "Deleted" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
