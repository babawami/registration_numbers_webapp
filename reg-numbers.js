'use strict';
module.exports = function (pool) {
    // check the first lettes matches the Towncode of the database
    async function storeRegNum (numbersReg) {
        numbersReg = numbersReg.toUpperCase();
        if (numbersReg !== '') {
            let townCode = numbersReg.substring(0, 3).trim();
            let matchedTown = await pool.query('SELECT * FROM towns WHERE  townCode = $1', [townCode]);
            let foundTag = matchedTown.rows[0].id;
            if (matchedTown.rows.length === 1) {
                let checkReg = await pool.query('SELECT 1 FROM reg_data WHERE regnumber =$1', [numbersReg]);
                if (checkReg.rows.length === 0) {
                    await pool.query('INSERT INTO reg_data(regNumber,town_id)  VALUES ($1,$2)', [numbersReg, foundTag]);
                } else {
                    return 'matched';
                }
            }
        }
    }

    async function getTownCode () {
        let townTags = await pool.query('SELECT towncode,townName FROM towns');
        return townTags.rows;
    }

    async function returnAllReg () {
        let disaplyReg = await pool.query('select regNumber from reg_data');
        return disaplyReg.rows;
    }

    async function filterReg (townSelected) {
        if (townSelected === 'All') {
            return returnAllReg();
        } else if (townSelected !== 'All') {
            let filterd = await pool.query('SELECT towns.towncode, reg_data.regnumber FROM reg_data INNER JOIN towns on reg_data.town_id = towns.id WHERE towncode = $1', [townSelected]);
            return filterd.rows;
        }
    }

    return {
        storeRegNum: storeRegNum,
        filterReg: filterReg,
        returnAllReg: returnAllReg,
        getTownCode: getTownCode
    };
};
