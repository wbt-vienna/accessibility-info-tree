import {pouchDbService} from "./pouchDbService";
import $ from "jquery";
import {constants} from "../../util/constants";
import Vue from 'vue'

let databaseService = {};
let _loggedInUser = null;
let _successfulUser = null;
let _successfulPassword = null;
let _timeoutHandler = null;

/**
 * logs in read-only user
 * @return {Promise<void>}
 */
databaseService.loginReadonly = function () {
    if (_loggedInUser) {
        return Promise.resolve();
    }
    return login('accessibility-info-tree-user-readonly', 'plaintext_password');
};

/**
 * logs in read-write user with given password
 * @param password
 * @return {Promise<void>}
 */
databaseService.loginReadWrite = function (password) {
    return login('accessibility-info-tree-user', password);
};

/**
 * returns true if any user is logged in
 * @return {boolean}
 */
databaseService.isLoggedIn = function () {
    return !!_loggedInUser;
};

/**
 * returns true if the read-write user is logged in
 * @return {boolean}
 */
databaseService.isLoggedInReadWrite = function () {
    return _loggedInUser === 'accessibility-info-tree-user';
};

/**
 * queries for objects in database and resolves promise with result.
 * If no elements are found 'null' is resolved, if exactly one element was found, this element is resolved,
 * otherwise an array of the found elements is resolved.
 *
 * @param objectType the objectType to find, e.g. GridData, given as real object, not as string
 * @param id the id of the object to find (optional)
 * @param onlyShortVersion if true only the short version (with stripped binary data) is returned (optional)
 * @return {Promise}
 */
databaseService.getObject = function (objectType, id, onlyShortVersion) {
    checkIfLoggedIn();
    return new Promise((resolve, reject) => {
        pouchDbService.query(objectType.getModelName(), id).then(result => {
            resolve(result);
        }).catch(reason => {
            reject(reason);
        });
    });
};

/**
 * same as databaseService.getObject(), but the result is returned as single object or null, if no object was found.
 * @param objectType
 * @param id
 * @param onlyShortVersion
 */
databaseService.getSingleObject = function (objectType, id, onlyShortVersion) {
    checkIfLoggedIn();
    return databaseService.getObject(objectType, id, onlyShortVersion).then(result => {
        return Promise.resolve(result instanceof Array ? result[0] : result);
    });
};

/**
 * Saves an object to database.
 *
 * @param objectType the objectType to save, e.g. "GridData"
 * @param data the data object to save, must be valid object, not only single properties to update
 * @param onlyUpdate if true no new object is created but only an existing updated. If onlyUpdate==true and there is no
 *        existing object with the same ID, nothing is done. If onlyUpdate==false a new object is created if no object
 *        with the same ID exists.
 * @return {Promise} promise that resolves if operation finished, rejects on a failure
 */
databaseService.saveObject = function (objectType, data, onlyUpdate) {
    checkIfLoggedIn();
    return Promise.resolve().then(() => {
        if (!data || !objectType || !objectType.getModelName) {
            log.error('did not specify needed parameter "objectType"!');
            return Promise.reject();
        }
        if (data.isShortVersion) {
            log.warn('short versions of objects cannot be saved/updated! aborting.');
            return Promise.reject();
        }
        log.debug('saving ' + objectType.getModelName() + '...');
        return databaseService.getObject(objectType, data.id);
    }).then(existingObject => {
        if (existingObject) {
            log.debug(objectType.getModelName() + ' already existing, doing update. id: ' + existingObject.id);
            let newObject = new objectType(data, existingObject);
            let saveData = JSON.parse(JSON.stringify(newObject));
            saveData._id = existingObject._id;
            saveData._rev = existingObject._rev;
            return pouchDbService.save(objectType.getModelName(), saveData);
        } else if (!onlyUpdate) {
            let saveData = JSON.parse(JSON.stringify(data));
            saveData._id = saveData.id;
            return pouchDbService.save(objectType.getModelName(), saveData);
        } else {
            log.warn('no existing ' + objectType.getModelName() + ' found to update, aborting.');
            return Promise.reject();
        }
    });
};

/**
 * removes an object from database.
 *
 * @param id ID of the object to delete.
 * @return {Promise} promise that resolves if operation finished
 */
databaseService.removeObject = function (id) {
    checkIfLoggedIn();
    return pouchDbService.remove(id);
};

function checkIfLoggedIn() {
    if (!pouchDbService.isLoggedIn()) {
        log.warn('not logged in! redirecting to login...');
        Vue.$router.push('/login');
    }
}

function login (user, password) {
    clearTimeout(_timeoutHandler);
    if (_loggedInUser === user) {
        return Promise.resolve();
    }
    _loggedInUser = null;
    let promise = pouchDbService.initDatabase(user, password, "https://couchdb.asterics-foundation.org:6984/accessibility-info-tree");
    //let promise = pouchDbService.initDatabase(user, password, "http://localhost:5984/accessibility-info-tree");
    promise.then(() => {
        _loggedInUser = user;
        _successfulUser = user;
        _successfulPassword = password;
    });
    return promise;
};

$(document).on(constants.EVENT_DB_UNAUTHORIZED, () => {
    if (_successfulUser && _successfulPassword) {
        log.warn('re-logging in after disconnect!');
        _timeoutHandler = setTimeout(() => {
            _loggedInUser = null;
            login(_successfulUser, _successfulPassword);
        }, 5000);
    }
});

export {databaseService};