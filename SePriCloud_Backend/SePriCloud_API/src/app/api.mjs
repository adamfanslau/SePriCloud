import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import multer from 'multer';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { uploadedFileMetadata, getAllFilesMetadata } from './db/index.mjs';
import { v4 as uuidv4 } from 'uuid';
import { verifyApiKey } from './verifyApiKey.mjs';

const app = express();

// Resolve current directory
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

// set cors policy
app.use(cors({
    origin: '*',
}));

// api logging:
app.use(morgan("dev"));
// serving uploaded files:
app.use('/files', express.static(uploadFolder));

// POST endpoint to upload a jpg file
app.post('/uploadFile', upload.single('file'), async (req, res) => {
    console.log(req.headers['sepricloud-api-key']);
    const apiKey = req.headers['sepricloud-api-key'];
    let authorizedUser =null;

    if (apiKey) {
        authorizedUser = await verifyApiKey(apiKey);
    }

    if (!authorizedUser) {
        return res.status(401).json({ error: '401 - ACCESS DENIED' });
    }

    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded or invalid file type' });
    }

    // save metadata to db:
    await uploadedFileMetadata(req.file.filename, authorizedUser.username, null, null);

    res.status(200).json({
        message: 'File uploaded successfully',
        fileName: req.file.filename,
        filePath: req.file.path,
    });
});

app.get('/getAllFiles', async (req, res) => {
    console.log(req.headers['sepricloud-api-key']);
    const apiKey = req.headers['sepricloud-api-key'];
    if (apiKey && await verifyApiKey(apiKey)) {
        const filesMetadata = await getAllFilesMetadata();
        res.status(200).json(filesMetadata);
    } else {
        res.status(401).json({error: '401 - ACCESS DENIED'});
    }
});

// test endpoint
app.get('/ping', (req, res) => {
    res.status(200).send('pong');
});

export default app;
