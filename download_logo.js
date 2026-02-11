const fs = require('fs');
const https = require('https');
const path = require('path');

const fileUrl = "https://placehold.co/200x200.png?text=THA+Logo";
const outputLocationPath = path.resolve(__dirname, 'public', 'tha-logo.jpg');

const file = fs.createWriteStream(outputLocationPath);

const options = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
};

https.get(fileUrl, options, function (response) {
    if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', function () {
            file.close(() => {
                console.log('Download Completed');
            });
        });
    } else {
        console.error(`Download failed with status code: ${response.statusCode}`);
        response.resume(); // Consume response data to free up memory
        fs.unlink(outputLocationPath, () => { }); // Delete the partial file
    }
}).on('error', function (err) {
    fs.unlink(outputLocationPath);
    console.error('Error downloading file:', err.message);
});
