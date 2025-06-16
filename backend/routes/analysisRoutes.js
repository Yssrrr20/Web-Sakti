// routes/analysisRoutes.js
const express = require('express');
const router = express.Router();
const path = require('path');
const { kirimCsvKeApi } = require('../services/apiAnalysisService');

// Endpoint untuk testing manual
router.post('/trigger/:namafile', async (req, res) => {
    const { namafile } = req.params;
    const filePath = path.join(__dirname, '..', 'data_csv', 'raw', namafile);

    const hasil = await kirimCsvKeApi(filePath);
    if (hasil) {
        res.status(200).json({ message: "Trigger berhasil", response: hasil });
    } else {
        res.status(500).json({ message: "Trigger gagal, cek log." });
    }
});

module.exports = router;