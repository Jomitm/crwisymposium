const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

try {
    // Read the Excel workbook
    const excelFilePath = path.join(__dirname, 'website_data.xlsx');

    if (!fs.existsSync(excelFilePath)) {
        console.error(`Error: Excel file not found at ${excelFilePath}`);
        process.exit(1);
    }

    const workbook = xlsx.readFile(excelFilePath);
    const data = {};

    // Process each sheet and convert to JSON
    workbook.SheetNames.forEach(sheetName => {
        const sheet = workbook.Sheets[sheetName];
        // Convert to an array of objects
        data[sheetName] = xlsx.utils.sheet_to_json(sheet);
    });

    // Write the output to a JSON file in the same directory (or a public/assets folder if one exists)
    const outputFilePath = path.join(__dirname, 'data.json');
    fs.writeFileSync(outputFilePath, JSON.stringify(data, null, 2));

    console.log(`Successfully converted ${excelFilePath} to ${outputFilePath}`);
} catch (error) {
    console.error('Error processing Excel file:', error);
    process.exit(1);
}
