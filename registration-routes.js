'use strict';
module.exports = function RegistrationRoutes (RegNumbers) {
    async function regNumbersStored (req, res, next) {
        try {
            let regID = await RegNumbers.getTownCode();
            let regNumber = req.body.regNum;
            let regex = /^[a-zA-Z]{2,3}(\s)[0-9]{3}(\s)[0-9]{3}$/;
            if (regNumber.match(regex)) {
                let storeRegNum = await RegNumbers.storeRegNum(regNumber);
                let displayRegNum = await RegNumbers.returnAllReg();
                if (storeRegNum === 'matched') {
                    req.flash('error', 'Registration already exits');
                } else if (storeRegNum === 'not valid') {
                    req.flash('error', 'Registation Entered Not Part Of Towns Allowed ');
                }
                res.render('home', { displayRegNum, regID });
            } else {
                let displayRegNum = await RegNumbers.returnAllReg();
                req.flash('error', 'Entered Registatration Has Invalid Pattern!!');
                res.render('home', { displayRegNum, regID });
            }
        } catch (err) {
            next(err.stack);
        }
    }

    async function filterRegNumbers (req, res, next) {
        try {
            let townReg = req.body.town;
            let regID = await RegNumbers.getTownCode();
            let displayRegNum = await RegNumbers.filterReg(townReg);
            // loop through the regID list
            // check if the current entry match townReg
            // if it does add a selected property selected = 'selected'
            for (let index = 0; index < regID.length; index++) {
                const currentTown = regID[index];
                if (currentTown.towncode === townReg) {
                    currentTown.selected = 'selected';
                    break;
                }
            }
            if (displayRegNum.length === 0) {
                req.flash('error', 'No resgistrations where entred');
            }
    
            res.render('home', { displayRegNum, regID });
        } catch (err) {
            next(err.stack);
        }
    }

    async function showRegNumbers (req, res, next) {
        try {
            let regID = await RegNumbers.getTownCode();
            let displayRegNum = await RegNumbers.returnAllReg();
            res.render('home', { displayRegNum, regID });
        } catch (err) {
            next(err.stack);
        }
    }

    return {
        regNumbersStored,
        filterRegNumbers,
        showRegNumbers

    };
};
