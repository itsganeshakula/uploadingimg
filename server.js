const express = require('express');
const multer = require('multer');
const admin = require('firebase-admin');
const ejs = require('ejs');
const serviceAccount = require('./serviceAccountKey.json');

const app = express();
const port = process.env.PORT || 3005;

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'gs://photoupload-924f1.appspot.com',
});

// Set up multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', 'public');

// Serve static files from the 'public' directory
app.use(express.static('public'));

// File upload route
app.post('/upload', upload.single('photo'), (req, res) => {
    const bucket = admin.storage().bucket();
    const photoFile = req.file;

    if (photoFile) {
        const blob = bucket.file(photoFile.originalname);
        const blobStream = blob.createWriteStream();

        blobStream.on('error', (error) => {
            console.error(error);
            res.status(500).send('Error uploading photo.');
        });

        blobStream.on('finish', () => {
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
            res.send(`Photo uploaded with URL: ${publicUrl}`);
        });

        blobStream.end(photoFile.buffer);
    } else {
        res.status(400).send('Please choose a photo to upload.');
    }
});

// Website route
app.get('/', (req, res) => {
    const bucket = admin.storage().bucket();
    const photos = [];

    bucket.getFiles()
        .then((results) => {
            const files = results[0];
            files.forEach((file) => {
                photos.push({
                    name: file.name,
                    imageUrl: `https://storage.googleapis.com/${bucket.name}/${file.name}`,
                });
            });

            res.render('index', { photos });
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send('Error fetching photo data.');
        });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
