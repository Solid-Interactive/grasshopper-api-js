'use strict';

var rivets = require('rivets'),
    queryString = require('query-string'),
    domReady = require('domready'),
    view = {
        plugins : window.plugins,
        activeTab : 'general',

        tabs : {
            general : 'general',
            plugins : 'plugins'
        },

        handlePluginCheck : handlePluginCheck,
        handleTabClicked : handleTabClicked
    };

function init() {
    view.activeTab = queryString.parse(window.location.hash).tab;

    bindView();
}

function bindView() {
    rivets.formatters.equals = function(comparator, comparatee) {
        return comparator === comparatee;
    };

    rivets.bind(document.querySelector('#settings'), { view : view });
}

function handleTabClicked(event) {
    window.location.hash = queryString.stringify({ tab : event.currentTarget.getAttribute('tab-name') });
    view.activeTab = event.currentTarget.getAttribute('tab-name');
}

function handlePluginCheck() {
    window.gh.appState
        .transform('configs.menuItems')
        .with(function(menuItems, item) {
            menuItems.push(item);
            return menuItems;
        })
        .using({
            'showWhenUserRoleIncludes' : 'admin',
            'name' : 'Dawg',
            'href' : '/admin/content-types',
            'iconClasses' : 'fa fa-refresh fa-spin'
        });
}

domReady(init);
