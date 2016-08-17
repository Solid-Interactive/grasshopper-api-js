'use strict';

var grasshopperInstance = require('../../../../grasshopper/instance'),
    Response = grasshopperInstance.bridgetown.Response,
    fs = require('fs'),
    path = require('path'),
    defaultsDeep = require('lodash/defaultsDeep'),
    getPossiblePlugins = require('../../index').getPossiblePlugins,
    getPluginsContentTypeId = require('../../index').getPluginsContentTypeId;

module.exports = [
    grasshopperInstance.bridgetown.middleware.authorization,
    grasshopperInstance.bridgetown.middleware.authToken,
    function(request, response, next) {
        if(request.bridgetown.identity.role === 'admin') {
            next();
        } else {
            new Response(response).writeUnauthorized();
        }
    },
    _handleDeactivatePlugin
];

function _handleDeactivatePlugin(request, response) {
    var pluginIdToDeactivate = request.body.id,
        thisPlugin = getPossiblePlugins().find(function(plugin) { return plugin.id === pluginIdToDeactivate; }),
        thisPluginsDeactivatePath = path.join(__dirname, '..', '..', '..', thisPlugin.directory, 'deactivate'),
        currentPluginState;

    console.log(thisPlugin);

    if(!pluginIdToDeactivate) {
        new Response(response).writeError({ message : 'You must send a plugin ID.', code : 400 });
    } else if(!_pluginExists(pluginIdToDeactivate)){
        new Response(response).writeError({ message : 'The plugin you wanted to deactivate does not exist.', code : 400 });
    } else {

        _getThisPluginFromDb(pluginIdToDeactivate)
            .then(function(thisPluginFromDb) {
                currentPluginState = thisPluginFromDb;

                if(currentPluginState && !currentPluginState.fields.active) {
                    new Response(response).writeError({ message : 'The plugin you wanted to deactivate has already been deactivated.', code : 400 });
                } else if(fs.existsSync(thisPluginsDeactivatePath)) {
                    new Response(response).writeError({ message : 'The plugin you wanted to deactivate does not have an activation script.', code : 400 });
                } else {

                    console.log('Deactivating Plugin : '+ thisPlugin.title);
                    require(thisPluginsDeactivatePath)()
                        .then(_deactivatePluginInDb(pluginIdToDeactivate))
                        .then(function(activationBody) {
                            console.log('&$&$&$&$&$&$&$&$&$&$&');

                            new Response(response).writeSuccess(activationBody);
                        })
                        .catch(function(err) {
                            new Response(response).writeError('Plugin could not be deactivated '+ err);
                        });

                }
            });
    }
}

function _pluginExists(pluginIdToDeactivate) {
    return !!getPossiblePlugins().find(function(plugin) {
        return plugin.id === pluginIdToDeactivate;
    });
}

function _getThisPluginFromDb(pluginIdToDeactivate) {
    var thisPlugin = getPossiblePlugins()
            .find(function(plugin) {
                return plugin.id === pluginIdToDeactivate;
            });

    return grasshopperInstance
            .request
            .content
            .query({
                filters :[
                    {
                        key : 'meta.type',
                        cmp : '=',
                        value : getPluginsContentTypeId()
                    }
                ]
            })
            .then(function(queryResults) {
                return queryResults.results.find(function(result) {
                    return result.fields.directory === thisPlugin.directory;
                });
            });
}

function _deactivatePluginInDb(pluginIdToDeactivate) {
    return function(activationBody) {
        var thisPlugin = getPossiblePlugins()
                .find(function(plugin) {
                    return plugin.id === pluginIdToDeactivate;
                });

        return _getThisPluginFromDb(pluginIdToDeactivate)
            .then(function(pluginStateFromDb) {

                if(pluginStateFromDb) {
                    return grasshopperInstance
                            .request
                            .content
                            .update(defaultsDeep({
                                fields : {
                                    active : false
                                }
                            }, pluginStateFromDb))
                            .then(function() {
                                return activationBody;
                            });

                } else {
                    return grasshopperInstance
                            .request
                            .content
                            .insert({
                                meta : {
                                    type : getPluginsContentTypeId(),
                                    hidden : true
                                },
                                fields : {
                                    title : thisPlugin.title,
                                    version : thisPlugin.version,
                                    description : thisPlugin.description,
                                    directory : thisPlugin.directory,
                                    active : false
                                }
                            })
                            .then(function() {
                                return activationBody;
                            });

                }
            });
    };
}