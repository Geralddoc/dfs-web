const XLSX = require('xlsx');
const { ConvexHttpClient } = require('convex/browser');
const fs = require('fs');

// Read .env.local manually
let convexUrl = process.env.CONVEX_URL || process.env.PROCESS_CONVEX_URL || '';
if (!convexUrl) {
    try {
        const envFile = fs.readFileSync('.env.local', 'utf8');
        const match = envFile.match(/NEXT_PUBLIC_CONVEX_URL=(.+)/);
        if (match) convexUrl = match[1].trim();
    } catch (e) {
        console.warn('Could not read .env.local', e.message);
    }
}

if (!convexUrl) {
    console.error('NEXT_PUBLIC_CONVEX_URL not found');
    process.exit(1);
}
const client = new ConvexHttpClient(convexUrl);

async function importFarmers() {
    const filename = process.argv[2] || 'database for antigravity farmers.xlsx';

    console.log(`Reading file: ${filename}`);

    try {
        // Read the Excel file
        const workbook = XLSX.readFile(filename);

        console.log('Available sheets:', workbook.SheetNames);

        // Find a sheet with "farm" in the name, or use the first sheet
        let sheetName = workbook.SheetNames.find(name =>
            name.trim().toLowerCase().includes('farm')
        );

        if (!sheetName) {
            sheetName = workbook.SheetNames[0];
            console.log(`No 'farmer' sheet found, using first sheet: ${sheetName}`);
        } else {
            console.log(`Using sheet: ${sheetName}`);
        }

        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        console.log(`Total rows in sheet: ${data.length}`);

        if (data.length === 0) {
            console.log('No data found in sheet');
            return;
        }

        // Clear existing data
        console.log('Clearing existing farmers...');
        const deletedCount = await client.mutation('farmers:deleteAll', {});
        console.log(`Cleared ${deletedCount} existing records.`);

        // Show first row headers
        console.log('Headers:', Object.keys(data[0]));

        // Helper function to convert Excel serial dates
        const excelDateToJSDate = (serial) => {
            if (!serial) return '';
            if (typeof serial === 'string') return serial;
            const utc_days = Math.floor(serial - 25569);
            const utc_value = utc_days * 86400;
            const date_info = new Date(utc_value * 1000);
            return date_info.toLocaleDateString();
        };

        // Process and import data
        let imported = 0;
        let skipped = 0;

        for (const row of data) {
            // Normalize column names to lowercase and trim
            const normalizedRow = {};
            Object.keys(row).forEach(key => {
                normalizedRow[key.trim().toLowerCase()] = row[key];
            });

            // Extract farmer data
            const farmer = {
                name: normalizedRow['name'] || '',
                address: normalizedRow['address'] || '',
                contact: (normalizedRow['phone #'] || normalizedRow['phone'] || normalizedRow['contact'] || '').toString(),
                district: normalizedRow['district'] || '',
                commodities: (normalizedRow['commodities'] || '').toString().split(',').map(c => c.trim()).filter(c => c),
                ref: (normalizedRow['ref#'] || normalizedRow['ref'] || '').toString(),
                quantities: (normalizedRow['quantities'] || '').toString(),
                email: (normalizedRow['email'] || '').toString(),
                dateOfVisit: excelDateToJSDate(normalizedRow['date of visit']),
                status: normalizedRow['current status'] || normalizedRow['status'] || '',
            };

            // Skip if name is empty or looks like a header
            const nameStr = farmer.name.toString().trim();
            const isInvalidName = !farmer.name ||
                nameStr === '' ||
                nameStr.toLowerCase() === 'name' ||
                nameStr.toLowerCase() === 'no.';

            if (isInvalidName) {
                skipped++;
                continue;
            }

            // Log first few for debugging
            if (imported < 3) {
                console.log(`\nProcessing record #${imported + 1}:`);
                console.log(`  Name: ${farmer.name}`);
                console.log(`  REF: ${farmer.ref}`);
                console.log(`  District: ${farmer.district}`);
            }

            // Import to Convex
            try {
                await client.mutation('farmers:addFarmer', farmer);
                imported++;

                if (imported % 25 === 0) {
                    console.log(`Imported ${imported} farmers...`);
                }
            } catch (error) {
                console.error(`Error importing ${farmer.name}:`, error.message);
                skipped++;
            }
        }

        console.log('\n--- Import Complete ---');
        console.log(`Successfully imported: ${imported}`);
        console.log(`Skipped: ${skipped}`);
        console.log(`Total processed: ${imported + skipped}`);

    } catch (error) {
        console.error('Error during import:', error);
        process.exit(1);
    }
}

// Run the import
importFarmers()
    .then(() => {
        console.log('Import finished successfully');
        process.exit(0);
    })
    .catch(error => {
        console.error('Import failed:', error);
        process.exit(1);
    });
