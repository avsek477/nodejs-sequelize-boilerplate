(() => {
    "use strict";
    
    const model = require('../../../db/models');
    const { getUserByIdSchema } = require('../validation');
    const commonProvider = require("../../../common/common-provider-function");
    const commonHelper = require("../../../common/common-helper-function");
    const moduleConfig = require("../config");

    const projectionFields = ['id', 'firstName', 'lastName', 'email', 'createdAt', 'updatedAt'];

    module.exports = async(req, res, next) => {
        try {
            const result = await getUserByIdSchema(req, res, next);
            const queryOpts = {
                id: result.userId,
                deleted: false
            };
            const userDetail = await commonProvider.getSingleDataByQuery(model.User, queryOpts, projectionFields);
            return commonHelper.sendJsonResponseMessage(res, userDetail, moduleConfig.message.userFetched, moduleConfig.message.userNotFound);
        } catch(err) {
            return commonHelper.sendCaughtError(res, err, next);
        }
    }
})()