(() => {
    "use strict";

    const HTTPStatus = require("http-status");
    const { Op } = require("sequelize");
    const model = require('../../../db/models');
    const commonHelper = require("../../../common/common-helper-function");
    const commonProvider = require("../../../common/common-provider-function");
    const utilityHelper = require("../../../helpers/utility");
    const moduleConfig = require("../config");

    const projectionFields = ['id', 'firstName', 'lastName', 'email', 'createdAt', 'updatedAt'];

    module.exports = async (req, res, next) => {
        try {
            const pagerOpts = utilityHelper.getPaginationOpts(req, next);
            let queryOpts = {};
            if (req.query.name && req.query.name.split(' ').length > 1) {
                queryOpts = Object.assign({}, queryOpts, {
                    [Op.and]: [
                        {
                            firstName: {[Op.iLike]: `%${req.query.name.split(' ')[0]}%`}
                        },
                        {
                            lastName: {[Op.iLike]: `%${req.query.name.split(' ')[1]}%`}
                        }
                    ]
                });
            } else if (req.query.name) {
                queryOpts = {
                    [Op.or]: [
                        {
                            firstName: {[Op.iLike]: `%${req.query.name}%`}
                        },
                        {
                            lastName: {[Op.iLike]: `%${req.query.name}%`}
                        }
                    ]
                };
            }
            if (req.query.email) {
                queryOpts.email = {[Op.iLike]: `%${req.query.email}%`};
            }
            const sortOpts = [['createdAt', 'DESC']];
            const usersList = await commonProvider.getPaginatedDataList(model.User, queryOpts, pagerOpts, projectionFields, sortOpts);
            return commonHelper.sendResponseData(res, {
                status: HTTPStatus.OK,
                message: moduleConfig.message.userFetched,
                data: usersList
            });
        } catch(err) {
            return commonHelper.sendCaughtError(res, err, next);
        }
    }
})()