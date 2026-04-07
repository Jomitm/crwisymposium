const xlsx = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, 'website_data.xlsx');
const workbook = xlsx.readFile(filePath);

// Get the Global_Settings sheet
if (workbook.Sheets['Global_Settings']) {
    const sheet = workbook.Sheets['Global_Settings'];
    const data = xlsx.utils.sheet_to_json(sheet);

    // Add the Council Section Title option
    let foundTitle = false;
    let foundSize = false;
    data.forEach(row => {
        if (row.Setting_Key === 'Council_Title') foundTitle = true;
        if (row.Setting_Key === 'Council_Photo_Size') foundSize = true;
    });

    if (!foundTitle) {
        data.push({ Setting_Key: 'Council_Title', Setting_Value: 'Trustees and Executive Council', Description: 'Title for the bottom scrolling council section' });
    }
    if (!foundSize) {
        data.push({ Setting_Key: 'Council_Photo_Size', Setting_Value: '150', Description: 'Height in pixels for council member photos (e.g., 150)' });
    }

    const newSheet = xlsx.utils.json_to_sheet(data);
    workbook.Sheets['Global_Settings'] = newSheet;
    xlsx.writeFile(workbook, filePath);
    console.log('Updated Excel file with new options.');
} else {
    console.error('Global_Settings sheet not found!');
}
