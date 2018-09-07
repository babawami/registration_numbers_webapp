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

    async function returnAllReg () {
        let disaplyReg = await pool.query('select regNumber from reg_data');
        // console.log(disaplyReg.rows);
        return disaplyReg.rows;
    }

    async function filterReg (value) {
        let filterd = await pool.query('SELECT * FROM reg_data WHERE regnumber LIKE $1% ', [value]);
        return filterd;
    }

    //   var filteredList = reg.filter(function("regMap"){
    //       return regMap.startsWith(town);
    //   });
    //
    //   return filteredList;
    //
    // }

    // function regArray () {
    //     return Object.keys(regMap);
    // }

    // function resetStorage () {
    //     return regMap = {};
    // }

    return {
        storeRegNum: storeRegNum,
        filterReg: filterReg,
        returnAllReg: returnAllReg

        // resetStorage: resetStorage,
        // regArray: regArray
    };
};
