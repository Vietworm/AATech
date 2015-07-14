"use strict";

let fs = require("fs");
let path = require("path");
let Sequelize = require("sequelize");
let sequelize;

let env = process.env.NODE_ENV || "development";
if(__config.db) {
    sequelize = new Sequelize(__config.db.database, __config.db.username, __config.db.password, __config.db);
}

let db = {};

/** Import models core */
//console.log('ashdjkasdhkjashdjkashdjkasd');
//__.getOverrideCorePath(__base + 'core/modules/*/models/*.js', __base + 'app/modules/*/models/*.js', 3).forEach(function (routePath) {
//    console.log(routePath);
//    let model = sequelize["import"](path.resolve(routePath));
//    db[model.name] = model;
//});
__.getGlobbedFiles(__base + 'core/modules/*/models/*.js').forEach(function (routePath) {
    let model = sequelize["import"](path.resolve(routePath));
    db[model.name] = model;
});

/** Import models user created */
__.getGlobbedFiles(__base + 'app/modules/*/models/*.js').forEach(function (routePath) {
    let model = sequelize["import"](path.resolve(routePath));
    db[model.name] = model;
});

Object.keys(db).forEach(function (modelName) {
    if ("associate" in db[modelName]) {
        db[modelName].associate(db);
    }
});
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;

