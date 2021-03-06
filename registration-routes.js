'use strict';
module.exports = function RegistrationRoutes (regnumbers) {
    async function regNumbersStored (req, res, next) {
        try {
            let regID = await regnumbers.getTownCode();
            let regNumber = req.body.regNum;
            let regex = /^[a-zA-Z]{2,3}(\s)(?:([0-9]{3}[-][0-9]{2,3})|([0-9]{3,5}))$/;
            if (regNumber.match(regex)) {
                let storeRegNum = await regnumbers.storeRegNum(regNumber);
                let displayRegNum = await regnumbers.returnAllReg();
                if (storeRegNum === 'matched') {
                    req.flash('error', 'Registration already exits');
                } else if (storeRegNum === 'not valid') {
                    req.flash('error', 'Registation Entered Not Part Of Towns Allowed ');
                }
                res.render('home', { displayRegNum, regID });
            } else {
                let displayRegNum = await regnumbers.returnAllReg();
                req.flash('error', 'Entered Registatration Has Invalid Pattern !!');
                res.render('home', { displayRegNum, regID });
            }
        } catch (err) {
            next(err.stack);
        }
    }

    async function filterRegNumbers (req, res, next) {
        try {
            let townReg = req.body.town;
            let regID = await regnumbers.getTownCode();
            let displayRegNum = await regnumbers.filterReg(townReg);
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
                req.flash('error', 'No Resgistrations Entered For Town Selected');
            }
    
            res.render('home', { displayRegNum, regID });
        } catch (err) {
            next(err.stack);
        }
    }

    async function showRegNumbers (req, res, next) {
        try {
            let regID = await regnumbers.getTownCode();
            let displayRegNum = await regnumbers.returnAllReg();
            res.render('home', { displayRegNum, regID });
        } catch (err) {
            next(err.stack);
        }
    }

    async function clearAll (req, res, next) {
        try {
            let allDeleted = await regnumbers.clearRegNUmbers();
            if (allDeleted.length === 0) {
                req.flash('clear', 'All Registrations Deleted');
            }
            res.redirect('/');
        } catch (err) {
            next(err.stack);
        }
    }

    return {
        regNumbersStored,
        filterRegNumbers,
        showRegNumbers,
        clearAll

    };
};
