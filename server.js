const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Serve static files from the current directory
app.use(express.static(path.join(__dirname)));

// Endpoint to get the data
app.get('/api/data', (req, res) => {
    const dataPath = path.join(__dirname, 'data.json');
    if (fs.existsSync(dataPath)) {
        try {
            const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
            res.json(data);
        } catch (error) {
            console.error('Error parsing data.json:', error);
            res.status(500).json({ error: 'Failed to parse data' });
        }
    } else {
        res.status(404).json({ error: 'data.json not found. Make sure to run the parser first.' });
    }
});

// Endpoint to proxy the visitor counter (Local storage for reliability)
app.get('/api/counter', (req, res) => {
    const counterPath = path.join(__dirname, 'visitor_count.json');
    let countData = { count: 35 }; // Default starting count if no file exists
    
    try {
        if (fs.existsSync(counterPath)) {
            countData = JSON.parse(fs.readFileSync(counterPath, 'utf8'));
            countData.count += 1;
        }
        fs.writeFileSync(counterPath, JSON.stringify(countData));
        res.json(countData);
    } catch (error) {
        console.error('Local Counter Error:', error);
        res.status(500).json({ error: 'Failed to update counter' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`To view the website, open http://localhost:${PORT} in your browser.`);
});
