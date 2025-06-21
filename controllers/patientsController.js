const db = require("../db");

const getPadients = (req, res) => {
  const query = `
    SELECT id, name
    FROM users
    WHERE role = 'patient'
    ORDER BY name ASC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("DB ERROR:", err.message);
      return res.status(500).json({ error: "Failed to fetch patients" });
    }

    res.json({
      result: "success",
      data: rows, // Array of { id, name }
    });
  });
}

module.exports = {getPadients}