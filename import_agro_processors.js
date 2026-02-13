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

async function importAgroProcessors() {
    const filename = process.argv[2] || 'agro for antigravity.xlsx';

    console.log(`Reading file: ${filename}`);

    try {
        // Read the Excel file
        const workbook = XLSX.readFile(filename);

        console.log('Available sheets:', workbook.SheetNames);

        // Find a sheet with "agro" in the name, or use the first sheet
        let sheetName = workbook.SheetNames.find(name =>
            name.trim().toLowerCase().includes('agro')
        );

        if (!sheetName) {
            sheetName = workbook.SheetNames[0];
            console.log(`No 'agro' sheet found, using first sheet: ${sheetName}`);
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
        console.log('Clearing existing agro-processors...');
        const deletedCount = await client.mutation('agroProcessors:deleteAll', {});
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
            // Normalize column names to lowercase
            const normalizedRow = {};
            Object.keys(row).forEach(key => {
                normalizedRow[key.trim().toLowerCase()] = row[key];
            });

            // Extract processor data
            const processor = {
                name: normalizedRow['business name'] || normalizedRow['businessname'] || normalizedRow['name'] || '',
                businessName: normalizedRow['business name'] || normalizedRow['businessname'] || normalizedRow['name'] || '',
                address: normalizedRow['address'] || normalizedRow['business address'] || '',
                contact: (normalizedRow['contact'] || normalizedRow['phone#'] || normalizedRow['phone #'] || '').toString(),
                district: normalizedRow['district'] || '',
                commodities: (normalizedRow['commodities'] || '').toString().split(',').map(c => c.trim()).filter(c => c),
                ref: (normalizedRow['ref#'] || normalizedRow['ref'] || '').toString(),
                quantities: (normalizedRow['quantities'] || '').toString(),
                email: (normalizedRow['email'] || '').toString(),
                dateOfVisit: excelDateToJSDate(normalizedRow['date of visit']),
                status: normalizedRow['current status'] || normalizedRow['status'] || '',
                remarks: normalizedRow['remarks'] || '',
            };

            // Only skip if truly empty or a header row
            const nameStr = processor.name.toString().trim();
            const isInvalidName = !processor.name ||
                nameStr === '' ||
                nameStr.toLowerCase() === 'name' ||
                nameStr.toLowerCase() === 'no.' ||
                nameStr.toLowerCase() === 'business name';

            if (isInvalidName) {
                skipped++;
                continue;
            }

            // Log first few for debugging
            if (imported < 3) {
                console.log(`\nProcessing record #${imported + 1}:`);
                console.log(`  Name: ${processor.name}`);
                console.log(`  Business Name: ${processor.businessName}`);
                console.log(`  REF: ${processor.ref}`);
                console.log(`  District: ${processor.district}`);
            }

            // Import to Convex
            try {
                await client.mutation('agroProcessors:addAgroProcessor', processor);
                imported++;

                if (imported % 10 === 0) {
                    console.log(`Imported ${imported} processors...`);
                }
            } catch (error) {
                console.error(`Error importing ${processor.name}:`, error.message);
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
importAgroProcessors()
    .then(() => {
        console.log('Import finished successfully');
        process.exit(0);
    })
    .catch(error => {
        console.error('Import failed:', error);
        process.exit(1);
    });
