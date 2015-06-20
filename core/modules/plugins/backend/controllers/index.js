'use strict';

let util = require('util'),
    _ = require('lodash');
let redis = require('redis').createClient();
let fs = require('fs');
let route = 'modules';
let Promise = require('bluebird');

let formidable = require('formidable');
Promise.promisifyAll(formidable);
let renameAsync = Promise.promisify(require('fs').rename);

function PluginsModule() {
    BaseModuleBackend.call(this);
    this.path = "/plugins";
}
let _module = new PluginsModule();

function renderView(req, res, env, plugin){
    env.render('setting.html', {
        title: "Setting Plugins",
        plugin: plugin
    }, function (err, re) {
        if (err) {
            res.send(err);
        } else {
            _module.render(req, res, 'setting.html', {
                setting_form: re,
                plugin: plugin,
                title: 'Chi tiết plugin'
            });
        }
    });
}

_module.index = function (req, res) {
    _module.render(req, res, 'index', {
        title: "All Plugins",
        plugins: __pluginManager.plugins
    });
};

_module.setting = function (req, res) {
    let plugin = __pluginManager.getPlugin(req.params.alias);

    if (fs.existsSync(__base + 'app/plugins/' + req.params.alias + '/setting.html')) {
        let env = __.createNewEnv([__base + 'app/plugins/' + req.params.alias]);
        renderView(req, res, env, plugin);
    } else {
        if (fs.existsSync(__base + 'core/plugins/' + req.params.alias + '/setting.html')) {
            let env = __.createNewEnv([__base + 'core/plugins/' + req.params.alias]);
            renderView(req, res, env, plugin);
        } else {
            _module.render(req, res, 'setting.html', {
                plugin: plugin,
                title: 'Chi tiết plugin'
            });
        }
    }
};

_module.save_setting = function (req, res, next) {
    let folder_to_upload = __base + '__config/env/';
    let plg = __pluginManager.getPlugin(req.params.alias);
    let form = new formidable.IncomingForm();
    form.parseAsync(req).then(function (result) {
        return new Promise(function (fullfil, reject) {
            let data = result[0];
            let files = result[1];
            // Check if key file was uploaded and file type is '.pem'
            if (files.serviceAKeyFile && files.serviceAKeyFile.name != '' && files.serviceAKeyFile.type == 'application/x-x509-ca-cert') {
                renameAsync(files.serviceAKeyFile.path, folder_to_upload + files.serviceAKeyFile.name)
                    .then(function () {
                        data.serviceAKeyFile = folder_to_upload + files.serviceAKeyFile.name;
                        fullfil(data);
                    }).catch(function (err) {
                        reject(err);
                    });
            } else fullfil(data);
        });
    }).then(function (data) {
        plg.options = data;
        redis.set(__config.redis_prefix + 'all_plugins', JSON.stringify(__pluginManager.plugins), redis.print);
        req.flash.success("Saved success");
        next();
    }).catch(function (err) {
        req.flash.error(err.name + ': ' + err.message);
        next();
    });
};

_module.active = function (req, res, next) {
    let plg = __pluginManager.getPlugin(req.params.alias);
    plg.active = !plg.active;
    redis.set(__config.redis_prefix + 'all_plugins', JSON.stringify(__pluginManager.plugins), redis.print);
    next();
};

_module.reload = function (req, res, next) {
    let md = require(__base + 'core/libs/plugins_manager.js');
    md.reloadAllPlugins();
    req.flash.success("Reload all plugins");
    next();
};

util.inherits(PluginsModule, BaseModuleBackend);
module.exports = _module;