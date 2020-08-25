(() => {
    "use strict";

    const Promise = require("bluebird");
    const join = Promise.join;

    const getPaginatedDataList = (Model, queryOpts, pagerOpts, projectionFields, sortOpts) => {
        return join(
            Model.findAll({
                where: queryOpts,
                attributes: projectionFields,
                offset: pagerOpts.perPage * (pagerOpts.page-1), 
                limit: pagerOpts.perPage,
                order: sortOpts
            }), 
            Model.count({ where: queryOpts }), 
            (dataList, count) => {
                return {
                    dataList: dataList,
                    totalItems: count,
                    currentPage: pagerOpts.page
                };
            }
        );
    };

    const getSingleDataByQuery = (Model, queryOpts, projectionFields) => {
        return Model.findOne({ 
            where: queryOpts,
            attributes: projectionFields 
        });
    }

    module.exports = {
        getPaginatedDataList,
        getSingleDataByQuery
    }
})()