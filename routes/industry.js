const express = require("express");
const router = express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

// GET all industry
router.get("/", async (req, res, next) => {
  try {
    const results = await db.query(
      `SELECT i.icode as code, i.iname as name, c.comp_code as company_code
       FROM industry as i
       LEFT JOIN industries as c
       ON i.icode = c.indu_code`
    );

    return res.json({ industry: results.rows });
  } catch (err) {
    return next(err);
  }
});

// get industry from code
router.get("/:code", async (req, res, next) => {
  try {
    const code = req.params.code;
    const results = await db.query(
      `SELECT icode as code, iname as name
       FROM industry
       WHERE icode = $1`,
      [code]
    );
    if (results.rows.length === 0) {
      return next(new ExpressError("Company not found", 404));
    }
    return res.json({ industry: results.rows[0] });
  } catch (err) {
    return next(err);
  }
});

// - adding an industry
router.post("/", async (req, res, next) => {
  try {
    const { code, name } = req.body;
    const results = await db.query(
      `INSERT INTO industry (icode, iname) 
       VALUES ($1, $2)
       RETURNING icode, iname`,
      [code, name]
    );
    return res.json({ industry: results.rows[0] });
  } catch (err) {
    return next(err);
  }
});

// - associating an industry to a company
router.post("/industries", async (req, res, next) => {
  try {
    const { comp_code, indu_code } = req.body;
    console.log(comp_code);
    const results = await db.query(
      `INSERT INTO industries (comp_code, indu_code) 
       VALUES ($1, $2)
       RETURNING comp_code, indu_code`,
      [comp_code, indu_code]
    );
    return res.json({ industry: results.rows[0] });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
