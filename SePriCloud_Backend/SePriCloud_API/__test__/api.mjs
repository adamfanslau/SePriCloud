import app from '../src/app/api.mjs';
import { describe, it, beforeEach, afterEach } from 'mocha';
import request from 'supertest';
import { expect } from 'chai';
import sinon from 'sinon';
import path from 'path';
import db from '../src/app/db/index.mjs';
import auth from '../src/app/verifyApiKey.mjs';

const mockApiKey = 'valid-api-key';
const mockUser = { api_key: mockApiKey, username: 'testuser' };

describe('API Routes', () => {
    // Mock DB and verification functions
    let verifyStub;
    let uploadStub;
    let getAllFilesStub;
    let updateTagsStub;

  beforeEach(() => {
    verifyStub = sinon.stub(auth, 'verifyApiKey').resolves(mockUser);
    uploadStub = sinon.stub(db, 'uploadedFileMetadata').resolves();
    getAllFilesStub = sinon.stub(db, 'getAllFilesMetadata').resolves([
      { id: '1', added_by: 'User1', filename: 'test.jpg', tags: 'tag1,tag2,tag3' }
    ]);
    updateTagsStub = sinon.stub(db, 'updateFileTags').resolves();
  });

  afterEach(() => {
    sinon.restore();
  });

  // Test 1: /ping
  describe('GET /ping', () => {
    it('should return 200 and "pong"', async () => {
      const response = await request(app).get('/ping');
      expect(response.status).to.equal(200);
      expect(response.text).to.equal('pong');
    });
  });

  // Test 2: POST /uploadFile
  describe('POST /uploadFile', () => {
    it('should upload a file and return success message', async () => {
      const response = await request(app)
        .post('/uploadFile')
        .set('sepricloud-api-key', mockApiKey)
        .attach('file', path.join(import.meta.dirname, 'assets', 'test.jpg'));

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('message', 'File uploaded successfully');
      expect(response.body).to.have.property('fileName');
      expect(response.body).to.have.property('filePath');
    });

    it('should return 401 if API key is missing or invalid', async () => {
      verifyStub.resolves(null);

      const response = await request(app)
        .post('/uploadFile')
        .attach('file', path.join(import.meta.dirname, 'assets', 'test.jpg'));

      expect(response.status).to.equal(401);
      expect(response.body).to.have.property('error');
    });

    it('should return 400 if file is missing', async () => {
      const response = await request(app)
        .post('/uploadFile')
        .set('sepricloud-api-key', mockApiKey);

      expect(response.status).to.equal(400);
      expect(response.body).to.have.property('error');
    });
  });

  // Test 3: POST /updateTags
  describe('POST /updateTags', () => {
    it('should update file tags', async () => {
      const response = await request(app)
        .post('/updateTags')
        .set('sepricloud-api-key', mockApiKey)
        .send({ id: '1', tags: 'newTag1,newTag2,newTag3' });

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('message', 'Tags updated successfully');
    });

    it('should return 400 if missing id or tags', async () => {
      const response = await request(app)
        .post('/updateTags')
        .set('sepricloud-api-key', mockApiKey)
        .send({ id: '1' }); // Missing tags

      expect(response.status).to.equal(400);
      expect(response.body).to.have.property('error');
    });

    it('should return 401 if API key is invalid', async () => {
      verifyStub.resolves(null);

      const response = await request(app)
        .post('/updateTags')
        .send({ id: '1', tags: 'newTag1,newTag2,newTag3' });

      expect(response.status).to.equal(401);
    });
  });

  // Test 4: GET /getAllFiles
  describe('GET /getAllFiles', () => {
    it('should return all file metadata for authorized users', async () => {
      const response = await request(app)
        .get('/getAllFiles')
        .set('sepricloud-api-key', mockApiKey);

      expect(response.status).to.equal(200);
      expect(response.body).to.be.an('array');
    });

    it('should return 401 for unauthorized users', async () => {
      verifyStub.resolves(null);

      const response = await request(app).get('/getAllFiles');
      expect(response.status).to.equal(401);
    });
  });
});
