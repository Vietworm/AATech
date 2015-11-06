"use strict";

let redis = require('redis');
let bluebird = require('bluebird');
let __ = require('./global_function');
let fakeRedis = require("fakeredis");

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

bluebird.promisifyAll(fakeRedis.RedisClient.prototype);
bluebird.promisifyAll(fakeRedis.Multi.prototype);

/**
 * If Redis server presents then create client to connect to it else create fakeRedis
 * @param config
 * @returns {Promise}
 */
module.exports = function (config) {
    return new Promise(function (fulfill, reject) {
        let client = redis.createClient(config);
        client.on('error', function (err) {
            fulfill(fakeRedis.createClient)
        });
        client.on("ready", function () {
            fulfill(redis.createClient)
        })
    })
};