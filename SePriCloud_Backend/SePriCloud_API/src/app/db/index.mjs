import sql from './connect.mjs';
import prexit from 'prexit';
import { v4 as uuidv4 } from 'uuid';

prexit(async () => {
    await sql.end({ timeout: 5 });
});

export const uploadedFileMetadata = async (fileName, username, tags, description) => {
    await sql`INSERT INTO file_metadata(id, added_by, datetime_added, filename, tags, description)
                VALUES (${uuidv4()}, ${username}, ${new Date().toISOString()}, ${fileName}, ${tags}, ${description});`;
};

export const getAllFilesMetadata = async () => {
    return await sql`SELECT * FROM file_metadata ORDER BY datetime_added DESC; `;
};

export const updateFileTags = async (id, tags) => {
    await sql`UPDATE file_metadata SET tags=${tags} WHERE id=${id};`;
};

export const getAllApiKeys = async () => {
    return await sql`SELECT * FROM api_keys;`;
};
