/**
 * Created by vhchung on 6/24/15.
 */
'use strict';
let md = require('../libs/modules_manager');

module.exports = function (req, res, next) {
    __cache.get(__config.redis_prefix + 'all_modules').then(function (results) {

        if (results != null) {
            global.__modules = JSON.parse(results);
        } else {
            md.loadAllModules();
            md.makeMenu(__modules);
        }
        __cache.get(__config.redis_prefix + 'backend_menus')
            .then(function (menus) {
                if (menus != null) global.__menus = JSON.parse(menus);
                else console.log('Backend menus is not defined!!!');
            })
            .catch(function (err) {
                console.log('***********', err.stack);
            });
        __cache.get(__config.redis_prefix + __config.key).then(function (config) {
            if(config != null) global.__config = JSON.parse(config);
            else console.log('Config is not defined!!!')
        })

    });
    next();
};
