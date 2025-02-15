import express from 'express';
import morgan from 'morgan';
import multer from 'multer';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { uploadedFileMetadata } from './db/index.mjs';

const app = express();

// Resolve __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure multer to store uploaded files in the '~/uploads/' directory
const uploadFolder = path.join(__dirname, '..', '..',  'uploads'); // '~/uploads/'

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadFolder);
    },
    filename: (req, file, cb) => {
        // Save file with its original name
        cb(null, file.originalname);
    },
});

// Filter to accept only jpg files
// const fileFilter = (req, file, cb) => {
//     if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
//         cb(null, true);
//     } else {
//         cb(new Error('Only .jpg files are allowed'), false);
//     }
// };

const upload = multer({ storage });

app.use(morgan("dev"));

// POST endpoint to upload a jpg file
app.post('/uploadFile', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded or invalid file type' });
    }

    await uploadedFileMetadata(req.file.filename, null, null);

    res.status(200).json({
        message: 'File uploaded successfully',
        fileName: req.file.filename,
        filePath: req.file.path,
    });
});

// test endpoint
app.get('/ping', (req, res) => {
    res.status(200).send('pong');
});

export default app;
