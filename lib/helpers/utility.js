(() => {
    "use strict";

    const isInteger = (val) => {
        const intRegex = /^\d+$/;
        return intRegex.test(val.toString());
    };

    const getPaginationOpts = (req, next) => {
        try {
            return {
                perPage: (req.query.perpage && isInteger(req.query.perpage)) ? parseInt(req.query.perpage) : 10,
                page: (req.query.page && isInteger(req.query.page)) ? parseInt(req.query.page) : 1
            };
        } catch (err) {
            return next(err);
        }
    };

    module.exports = {
        isInteger,
        getPaginationOpts
    }
})()