\c biztime

DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS industries;
DROP TABLE IF EXISTS industry;

CREATE TABLE companies (
    code text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text
);

CREATE TABLE invoices (
    id serial PRIMARY KEY,
    comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
    amt float NOT NULL,
    paid boolean DEFAULT false NOT NULL,
    add_date date DEFAULT CURRENT_DATE NOT NULL,
    paid_date date,
    CONSTRAINT invoices_amt_check CHECK ((amt > (0)::double precision))
);

CREATE TABLE industry (
    icode text PRIMARY KEY,
    iname text NOT NULL UNIQUE
);

CREATE TABLE industries (
    comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
    indu_code text NOT NULL REFERENCES industry ON DELETE CASCADE,
    PRIMARY KEY(comp_code, indu_code)
);

INSERT INTO companies
  VALUES ('apple', 'Apple Computer', 'Maker of OSX.'),
         ('ibm', 'IBM', 'Big blue.'),
         ('glass', 'GLASS', 'Big glass.');

INSERT INTO invoices (comp_Code, amt, paid, paid_date)
  VALUES ('apple', 100, false, null),
         ('apple', 200, false, null),
         ('apple', 300, true, '2018-01-01'),
         ('ibm', 400, false, null);

INSERT INTO industry
  VALUES ('acc', 'Accounting'),
         ('cash', 'Cashew'),
         ('peanut', 'Peanut');

INSERT INTO industries
  VALUES ('apple', 'acc'),
         ('ibm', 'acc'),
         ('apple', 'peanut'),
         ('ibm', 'cash');