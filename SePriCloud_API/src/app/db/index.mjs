import sql from './connect.mjs';
import prexit from 'prexit';
import { v4 as uuidv4 } from 'uuid';

prexit(async () => {
    await sql.end({ timeout: 5 });
});

export const uploadedFileMetadata = async (fileName, tags, description) => {
    await sql`INSERT INTO file_metadata(id, datetime_added, filename, tags, description)
                VALUES (${uuidv4()}, ${new Date().toISOString()}, ${fileName}, ${tags}, ${description});`;
};
