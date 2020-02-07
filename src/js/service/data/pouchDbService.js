import $ from 'jquery';
import PouchDB from 'pouchdb';
import PouchAuth from 'pouchdb-authentication';
import PouchFind from 'pouchdb-find';
import {constants} from "../../util/constants";
PouchDB.plugin(PouchAuth);
PouchDB.plugin(PouchFind);

let pouchDbService = {};
let _pouchDb = null;
let _knownRevs = [];

pouchDbService.initDatabase = function (username, password, remoteCouchDbAddress) {
    if (_pouchDb) {
        _pouchDb.close();
    }
    _pouchDb = new PouchDB(remoteCouchDbAddress, {skip_setup: true});
    _pouchDb.changes({
        since: 'now',
        live: true,
        include_docs: true
    }).on('change', function (change) {
        changeHandler(change);
    }).on('error', function (err) {
        log.warn('pouchdb changes error: ');
        log.warn(err);
        $(document).trigger(constants.EVENT_DB_UNAUTHORIZED);
    });
    let promise = _pouchDb.logIn(username, password);
    promise.catch(() => {
        _pouchDb = null;
    });
    return promise;

};

pouchDbService.isLoggedIn = function() {
    return _pouchDb !== null;
};

/**
 * queries for encrypted objects in the local database and resolves promise with result.
 * If no elements are found 'null' is resolved, if exactly one element was found, this element is resolved,
 * otherwise an array of the found elements is resolved.
 *
 * @param modelName the modelName to find, e.g. "GridData"
 * @param id the id of the object to find (optional)
 * @return {Promise}
 */
pouchDbService.query = function (modelName, id) {
    return queryInternal(modelName, id);
};

/**
 * saves an object to database that is already encrypted
 *
 * @param modelName the modelName to save, e.g. "GridData"
 * @param data the encrypted data object to save
 * @return {Promise} promise that resolves if operation finished, rejects on a failure
 */
pouchDbService.save = function (modelName, data) {
    log.debug('saving ' + modelName + '...');
    return new Promise((resolve, reject) => {
        if (!data || !data.id || !modelName) {
            log.error('did not specify needed parameter "modelName" or "_id" or data is not encrypted! aborting.');
            return reject();
        }
        data._id = data.id;
        _pouchDb.put(data).then((response) => {
            data._rev = response.rev;
            _knownRevs.push(response.rev);
            log.debug('updated ' + modelName + ', id: ' + data._id);
            resolve();
        }).catch(function (err) {
            if (err.error === 'conflict') {
                log.warn('conflict with remote version updating document with id: ' + data.id);
                resolve();
            } else if(err.error === "unauthorized") {
                log.warn('unauthorized detected');
                $(document).trigger(constants.EVENT_DB_UNAUTHORIZED);
            } else {
                log.error(err);
                reject(err);
            }
            reject();
        });
    });
};

/**
 * Deletes an object from database by ID.
 *
 * @param id ID of the object to delete.
 * @return {Promise} promise that resolves if operation finished
 */
pouchDbService.remove = function (id) {
    return queryInternal(null, id).then(object => {
        log.debug('deleted object from db! id: ' + object.id);
        let promise = _pouchDb.remove(object);
        promise.then(result => {
            _knownRevs.push(result.rev);
        });
        return promise;
    });
};

function queryInternal(modelName, id) {
    if (!modelName && !id) {
        log.error('did not specify modelName or id!');
        return Promise.reject();
    }

    return new Promise((resolve, reject) => {
        log.debug('getting ' + modelName + '(id: ' + id + ')...');
        let query = {
            selector: {},
            limit: 100000
        };
        if (id) {
            query.selector.id = id;
        }
        if (modelName) {
            query.selector.modelName = modelName;
        }
        _pouchDb.find(query).then(function (res) {
            let objects = dbResToResolveObject(res);
            let length = objects && objects.length ? objects.length : objects ? 1 : 0;
            log.debug('found ' + modelName + ": " + length + ' elements');
            resolve(objects);
        }).catch(function (err) {
            log.error(err);
            if (err.error === "unauthorized") {
                $(document).trigger(constants.EVENT_DB_UNAUTHORIZED);
                log.warn('unauthorized detected');
            }
            reject();
        });
    });
}

/**
 * converts a native result object of pouchDB queries to a list of documents or single document used in the app
 * @param res
 * @return {*}
 */
function dbResToResolveObject(res) {
    let objects = [];
    if (res.docs && res.docs.length > 0) { //convert result of .query()
        res.docs.forEach(doc => {
            objects.push(doc);
        });
    } else if (res.rows && res.rows.length > 0) { //convert result of .allDocs()
        res.rows.forEach(row => {
            if (row.doc && row.doc.modelName) {
                objects.push(row.doc);
            }
        });
    }
    objects.forEach(object => {
        let rev = object._rev;
        if (_knownRevs.indexOf(rev) === -1) {
            _knownRevs.push(rev);
        }
    });
    if (objects.length === 0) {
        return null;
    } else if (objects.length === 1) {
        return objects[0];
    } else {
        return objects;
    }
}

function changeHandler(change) {
    let rev = change.doc._rev;
    if (_knownRevs.indexOf(rev) === -1) {
        _knownRevs.push(rev);
        $(document).trigger(constants.EVENT_DB_PULL_UPDATED, [change.doc]);
    }
}

export {pouchDbService};