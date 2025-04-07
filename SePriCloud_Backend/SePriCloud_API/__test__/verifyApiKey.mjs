import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import db from '../src/app/db/index.mjs';
import auth from '../src/app/verifyApiKey.mjs';

describe('Test verifyApiKey method', () => {
  let getAllApiKeysStub;

  beforeEach(() => {
    getAllApiKeysStub = sinon.stub(db, 'getAllApiKeys').resolves([
      { api_key: 'api_key-1', username: 'User1' }
    ]);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('Check verifyApiKey return value', () => {
    it('should return null if argument is null', async () => {
      const returnValue = await auth.verifyApiKey(null);
      expect(returnValue).to.equal(null);
    });

    it('should return null if argument doesn\'t match any api keys from getAllApiKeys', async () => {
        const returnValue = await auth.verifyApiKey('wrong-api-key');
        expect(returnValue).to.equal(null);
    });

    it('should return { api_key: \'api_key-1\', username: \'User1\' } if argument is \'api_key-1\'', async () => {
        const returnValue = await auth.verifyApiKey('api_key-1');
        expect(returnValue.api_key).to.equal('api_key-1');
        expect(returnValue.username).to.equal('User1');
    });
  });
});
