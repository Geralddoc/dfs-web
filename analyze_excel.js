const XLSX = require('xlsx');
const fs = require('fs');

const filename = process.argv[2] || "Printable districts of farmers, agro-processors final (Autosaved).xlsx";

try {
    const workbook = XLSX.readFile(filename);
    const sheetNames = workbook.SheetNames;

    console.log("--- File Analysis Report ---");
    console.log(`File: ${filename}`);
    console.log(`Total Sheets: ${sheetNames.length}\n`);

    let totalFarmers = 0;
    let totalProcessors = 0;

    sheetNames.forEach(sheetName => {
        const ws = workbook.Sheets[sheetName];
        // Get data as array of arrays to check rows
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

        if (data.length > 0) {
            let headerRowIndex = -1;
            // Look for "Name" in first 5 rows
            for (let i = 0; i < Math.min(data.length, 5); i++) {
                const row = data[i];
                if (row && row.some(cell => cell && cell.toString().trim().toLowerCase().includes("name"))) {
                    headerRowIndex = i;
                    break;
                }
            }

            if (headerRowIndex !== -1) {
                const headers = data[headerRowIndex];
                // Check for Agro Processors
                if (sheetName.trim().toUpperCase().includes("AGRO")) {
                    console.log(`[AGRO-PROCESSOR] Sheet: '${sheetName}' (Header at Row ${headerRowIndex + 1})`);
                    console.log(`   Headers: ${headers.join(", ")}`);
                    totalProcessors += (data.length - headerRowIndex - 1);
                }
                // Check for Farmers (skip statistics and summary sheets)
                else if (!sheetName.trim().toLowerCase().includes("statistic") && !sheetName.toLowerCase().includes("summary")) {
                    console.log(`[FARMER] Sheet: '${sheetName}' (Header at Row ${headerRowIndex + 1})`);
                    console.log(`   Headers: ${headers.join(", ")}`);
                    totalFarmers += (data.length - headerRowIndex - 1);
                }
            } else {
                if (!sheetName.trim().toLowerCase().includes("statistic")) {
                    console.log(`[WARNING] No 'Name' header found in first 5 rows of sheet '${sheetName}'`);
                    // console.log(`   First Row: ${JSON.stringify(data[0])}`);
                }
            }
        }
    });

    console.log("\n--- Summary ---");
    console.log(`Potential Farmers to Import: ${totalFarmers}`);
    console.log(`Potential Agro Processors to Import: ${totalProcessors}`);

} catch (error) {
    console.error("Error reading file:", error.message);
}
