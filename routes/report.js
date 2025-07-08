const express = require('express');
const mysql = require('mysql2/promise');
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

const router = express.Router();

const dbConfig = {
    host: '10.129.10.227',
    user: 'remote_admin',
    password: 'StrongPassword123!',
    database: 'backend_db',
};

// Utility function to run a query
async function getData(query, params = []) {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(query, params);
    await connection.end();
    return rows;
}

// API: GET /api/report/:sessionId
router.get('/api/report/:sessionId', async (req, res) => {
    const sessionId = req.params.sessionId;

    try {
        // 1. Query each table
        const surveyData = await getData('SELECT * FROM survey WHERE session_id = ?', [sessionId]);
        const siteInfo = await getData('SELECT * FROM site_info WHERE session_id = ?', [sessionId]);
        const siteLocation = await getData('SELECT * FROM site_location WHERE session_id = ?', [sessionId]);
        // Add other tables similarly...

        // 2. Load the Excel Template
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(path.join(__dirname, 'template.xlsx'));

        // 3. Fill Worksheet 1: Survey
        const surveySheet = workbook.getWorksheet('Survey');
        if (surveyData.length > 0) {
            surveySheet.getCell('B2').value = surveyData[0].question_1;
            surveySheet.getCell('B3').value = surveyData[0].question_2;
            // Map your columns to the correct cells
        }

        // 4. Fill Worksheet 2: Site Info
        const siteInfoSheet = workbook.getWorksheet('Site Info');
        if (siteInfo.length > 0) {
            siteInfoSheet.getCell('B2').value = siteInfo[0].site_name;
            siteInfoSheet.getCell('B3').value = siteInfo[0].site_type;
            // Fill in other fields
        }

        // 5. Fill Worksheet 3: Site Location
        const locationSheet = workbook.getWorksheet('Site Location');
        if (siteLocation.length > 0) {
            locationSheet.getCell('B2').value = siteLocation[0].latitude;
            locationSheet.getCell('B3').value = siteLocation[0].longitude;
            locationSheet.getCell('B4').value = siteLocation[0].address;
            // Fill in other fields
        }

        // 6. Save the filled Excel to a temporary file
        const outputPath = path.join(__dirname, `Session_${sessionId}.xlsx`);
        await workbook.xlsx.writeFile(outputPath);

        // 7. Download the file
        res.download(outputPath, `Session_${sessionId}.xlsx`, (err) => {
            if (!err) {
                fs.unlinkSync(outputPath); // Delete temp file after download
            }
        });

    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).send('Error generating report');
    }
});

module.exports = router;
