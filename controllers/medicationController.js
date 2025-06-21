
const db = require("../db");

const markMedicationAsTaken = (req, res) => {
  const { userId, date } = req.body;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

  if (!userId || !date) {
    return res.status(400).json({ error: "userId and date are required" });
  }

  const query = `
    INSERT INTO medications (user_id, name, date_taken, image)
    VALUES (?, ?, ?, ?)
  `;
  db.run(query, [userId, "default", date, imagePath], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ result: "success", id: this.lastID });
  });
};

const addMedication = (req, res) => {
  const { userId, addMedication } = req.body;
  const { medicationName, dosage, frequency } = addMedication;
  if (!userId || !medicationName || !dosage || !frequency) {
    return res.status(400).json({ result: "error", message: "Missing fields" });
  }
  db.run(
    `INSERT INTO medication_list (userId, medicationName, dosage, frequency) VALUES (?, ?, ?, ?)`,
    [userId, medicationName, dosage, frequency],
    function (err) {
      if (err) {
        console.error("Insert Error:", err);
        return res.status(500).json({ result: "error", message: err.message });
      }
      res.json({ result: "success", id: this.lastID });
    }
  );
};

const getMedication = (req, res) => {
  const { userId } = req.params;
  
  
  db.all(
    `SELECT * FROM medication_list WHERE userId = ? ORDER BY createdAt DESC`,
    [userId],
    (err, rows) => {
      if (err) {
        console.error("Select Error:", err);
        return res.status(500).json({ result: "error", message: err.message });
      }
      res.json({ result: "success", medications: rows });
    }
  );
};

const getHistory =  (req, res) => {
  const { userId } = req.params;
 
  const query = `SELECT * FROM medications WHERE user_id = ? ORDER BY date_taken DESC`;

  db.all(query, [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ result: "success", data: rows });
  });
}; 

const getSummery = (req, res) => {
  const userId = req.params.userId;

  const summaryQuery = `
    WITH RECURSIVE current_month_days(date) AS (
      SELECT date('now', 'start of month')
      UNION ALL
      SELECT date(date, '+1 day')
      FROM current_month_days
      WHERE date < date('now')
    ),
    taken_dates AS (
      SELECT DISTINCT date(date_taken) AS date_taken
      FROM medications
      WHERE user_id = ?
        AND date(date_taken) BETWEEN date('now', 'start of month') AND date('now')
    ),
    streak_days AS (
      SELECT cmd.date,
             td.date_taken
      FROM current_month_days cmd
      LEFT JOIN taken_dates td ON cmd.date = td.date_taken
      ORDER BY cmd.date DESC
    )
    SELECT 
      u.name AS patientName,
      (SELECT COUNT(*) FROM current_month_days) AS totalDays,
      (SELECT COUNT(*) FROM taken_dates) AS totalTaken,
      (SELECT COUNT(*) FROM current_month_days
        WHERE date NOT IN (SELECT date_taken FROM taken_dates)
      ) AS missedDoses,
      (
        SELECT COUNT(*) FROM (
          SELECT * FROM streak_days
          LIMIT (
            SELECT COUNT(*) FROM streak_days
            WHERE date_taken IS NOT NULL
              AND NOT EXISTS (
                SELECT 1 FROM medications
                WHERE user_id = ?
                  AND date(date_taken) = date(streak_days.date, '+1 day')
              )
          )
        )
      ) AS currentStreak
    FROM users u
    WHERE u.id = ?
  `;

  const statusQuery = `
    WITH RECURSIVE current_month_days(date) AS (
      SELECT date('now', 'start of month')
      UNION ALL
      SELECT date(date, '+1 day')
      FROM current_month_days
      WHERE date < date('now')
    )
    SELECT 
      cmd.date,
      CASE 
        WHEN EXISTS (
          SELECT 1 FROM medications 
          WHERE user_id = ? 
            AND date(date_taken) = cmd.date
        ) THEN 'taken'
        ELSE 'missed'
      END AS status
    FROM current_month_days cmd
    ORDER BY cmd.date ASC
  `;

  db.get(summaryQuery, [userId, userId, userId], (err, row) => {
    if (err) {
      console.error("Summary Query Error:", err.message);
      return res.status(500).json({ error: "Failed to fetch summary" });
    }

    const adherenceRate = row.totalDays
      ? Math.round((row.totalTaken / row.totalDays) * 100)
      : 0;

    db.all(statusQuery, [userId], (err2, days) => {
      if (err2) {
        console.error("Status Query Error:", err2.message);
        return res.status(500).json({ error: "Failed to fetch daily statuses" });
      }
      res.json({
        result: "success",
        data: {
          patientName: row.patientName,
          adherenceRate,
          totalTaken: row.totalTaken,
          missedDoses: row.missedDoses,
          currentStreak: row.currentStreak,
          dailyStatuses: days, 
        },
      });
    });
  });
}




module.exports = {
  markMedicationAsTaken,
  addMedication,getMedication,getHistory,getSummery
};
