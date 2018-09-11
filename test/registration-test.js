'use strict';
let assert = require('assert');
let RegistrationFactory = require('../reg-numbers');
const pg = require('pg');
const Pool = pg.Pool;

// we are using a special test database for the tests
const connectionString = process.env.DATABASE_URL || 'postgresql://coder:pg123@localhost:5432/wc_reg_numbers';

const pool = new Pool({
    connectionString
});

describe('Registration Numbers Displayed According To Area  ', function () {
    beforeEach(async function () {
        await pool.query('DELETE FROM reg_data');
    });

    it('Enter Registration from CA,CAW,CL,CJ only ', async function () {
        let RegNumbersFactory = RegistrationFactory(pool);
        await RegNumbersFactory.storeRegNum('CA 123 456');
        await RegNumbersFactory.storeRegNum('CAW 123 456');
        await RegNumbersFactory.storeRegNum('CL 123 456');
        await RegNumbersFactory.storeRegNum('CJ 123 456');
        await RegNumbersFactory.storeRegNum('CG 123 456');
        let result = await RegNumbersFactory.returnAllReg();
        assert.equal(result[0].regnumber, 'CA 123 456');
        assert.equal(result[1].regnumber, 'CAW 123 456');
        assert.equal(result[2].regnumber, 'CL 123 456');
        assert.equal(result[3].regnumber, 'CJ 123 456');
        assert.deepEqual(result, [
            { 'regnumber': 'CA 123 456' },
            { 'regnumber': 'CAW 123 456' },
            { 'regnumber': 'CL 123 456' },
            { 'regnumber': 'CJ 123 456' }]);
    });
    it('Return not valid if Registration does not start with CA,CAW,CL,CJ', async function () {
        let RegNumbersFactory = RegistrationFactory(pool);
        let result = await RegNumbersFactory.storeRegNum('CG 123 456');
        assert.equal(result, 'not valid');
    });
    it('Return match if Registration already exists', async function () {
        let RegNumbersFactory = RegistrationFactory(pool);
        await RegNumbersFactory.storeRegNum('CA 123 456');
        let result2 = await RegNumbersFactory.storeRegNum('CA 123 456');
        assert.equal(result2, 'matched');
    });
    it('Return no data when cleared', async function () {
        let RegNumbersFactory = RegistrationFactory(pool);
        await RegNumbersFactory.storeRegNum('CA 123 456');
        await RegNumbersFactory.storeRegNum('CAW 123 456');
        await RegNumbersFactory.storeRegNum('CL 123 456');
        await RegNumbersFactory.storeRegNum('CJ 123 456');
        await RegNumbersFactory.storeRegNum('CG 123 456');
        let result = await RegNumbersFactory.clearRegNUmbers();
        assert.equal(result.length, 0);
    });
    after(function () {
        pool.end();
    });
});
