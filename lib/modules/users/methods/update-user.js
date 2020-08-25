(() => {
    "use strict";

    const { updateUserSchema } = require('../validation');
    const model = require('../../../db/models');
    const commonHelper = require('../../../common/common-helper-function');
    const moduleConfig = require('../config');

    module.exports = async (req, res, next) => {
        try {
            const result = await updateUserSchema(req, res, next);
            const dataRes = await model.User.update(result.body, { where: { id: result.params.userId }});
            return commonHelper.sendUpdateResponseMessage(res, dataRes, { 
                ...result.body, 
                id: result.params.userId 
            }, moduleConfig.message.userUpdated, moduleConfig.message.userNotFound);
        } catch(err) {
            return commonHelper.sendCaughtError(res, err, next);
        }
    }
})()