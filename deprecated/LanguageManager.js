"use strict";
let SystemManager = require("./../manager/SystemManager");
let path = require('path');
let __ = require("../libs/global_function");

class LanguageManager extends SystemManager {
    constructor(app){
        super(app);
        let data = {};

        __.getGlobbedFiles(__base + '/lang/*.js').forEach(function (file) {
            data[path.basename(file, '.js')] = require(file);
        });

        this._langs = data;
    }
}

module.exports = LanguageManager;


