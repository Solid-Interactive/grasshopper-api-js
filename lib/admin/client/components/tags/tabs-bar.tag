tabs-bar
    a.brand(name='brandElement' href='/items')
    .collapsed-menu-toggle(onclick='{ toggleCollaseMenu }')
        .bars(class='{ active : isShowingCollapseMenu }')
    .nav-items(name='navItemsElement' class='{ open : isShowingCollapseMenu }')
        virtual(each='{ menuItem in menuItems }')
            a.nav-item.no-sub-items(if='{ menuItem.fields.active && !menuItem.childTabs.length }' href='{ menuItem.fields.href }' class='{ active : menuItem.active }')
                i(class='{ menuItem.fields.iconclasses }')
                span { menuItem.fields.title }
            .nav-item.has-sub-items(if='{ menuItem.fields.active && menuItem.childTabs.length }' class='{ active : menuItem.active, expanded : menuItem.active }' onclick='{ toggleThisTabsDropdown }')
                i(class='{ menuItem.fields.iconclasses }')
                span { menuItem.fields.title }
                i.fa.fa-caret-down.expand-icon
                .nav-item-dropdown
                    a.sub-item(each='{ childTab in menuItem.childTabs }' if='{ childTab.fields.active }' href='{ childTab.fields.href }' class='{ active : childTab.active }')
                        i(class='{ childTab.fields.iconclasses }')
                        span { childTab.fields.title }
        .user-information-section(name='userInformationSection' onclick='{ toggleUserInformationDropdown }' class='{ active : userInformationDropdownIsOpen }')
            img.gravatar-img(src='{ user.gravatarUrl }')
            i.fa.fa-caret-down.expand-icon
            .user-information-dropdown
                .logged-in-as-text Logged in as { user.displayName }
                a.profile(href='/admin/user/{ user._id }') Profile
                a.logout(href='/admin/logout') Log Out
    script.
        var crypto = require('crypto'),
            listenOnce = require('listen-once'),
            throttle = require('lodash/throttle');

        this.menuItems = markActiveItems(this.opts.appState('configs.menuItems'));
        this.user = this.opts.appState('user');
        this.userInformationDropdownIsOpen = false;

        this.opts.appState.subscribe('user', function(user) {
            this.user = user;
            this.user.gravatarUrl = gravatarUrl(this.user.email, 24);
            this.update();
        }.bind(this));

        this.opts.appState.subscribe('configs.menuItems', function (menuItems) {
            this.hydrateMenuItemsWithBaseHref(menuItems);
            this.menuItems = markActiveItems(menuItems);
            this.update();
        }.bind(this));

        this.toggleThisTabsDropdown = function(event) {
            if(event.item.menuItem.active) {
                this.closeThisTabsDropdown(event.item.menuItem);
            } else {
                this.openThisTabsDropdown(event.item.menuItem);
                listenOnce(document.body, 'click', this.closeThisTabsDropdown.bind(this, event.item.menuItem), true);
            }
            return true; // RIOT will prevent default by default.
        };

        this.closeThisTabsDropdown = function(tab) {
            tab.active = false;
            this.update();
        };

        this.openThisTabsDropdown = function(tab) {
            tab.active = true;
            this.update();
        };

        this.toggleUserInformationDropdown = function() {
            if(this.userInformationDropdownIsOpen) {
                this.closeUserInformationDropdown();
            } else {
                this.openUserInformationDropdown();
                listenOnce(document.body, 'click', this.closeUserInformationDropdown.bind(this), true);
            }
        };

        this.openUserInformationDropdown = function() {
            this.userInformationDropdownIsOpen = true;
            this.update();
        };

        this.closeUserInformationDropdown = function() {
            this.userInformationDropdownIsOpen = false;
            this.update();
        };

        this.toggleCollaseMenu = function() {
            this.isShowingCollapseMenu = !this.isShowingCollapseMenu;
        };

        this.hydrateMenuItemsWithBaseHref = function(menuItems) {
            function _fixMenuItemHref(menuItem) {
                menuItem.childTabs && menuItem.childTabs.forEach(_fixMenuItemHref);
                return menuItem.fields.href = window.gh.configs.base + menuItem.fields.href;
            }
            menuItems.forEach(_fixMenuItemHref);
        };

        function gravatarUrl(email, args) {
            var md5value = email ? crypto.createHash('md5').update(email.toLowerCase()).digest("hex") : '';
            return 'http://www.gravatar.com/avatar/' + md5value + '?s=' + args + '&d=mm';
        }

        function markActiveItems(menuItems) {
            function _routeMatchesPath(route, path) {
                // NOTE Will only match Backbone Router Style Routes.
                // From Backbone Source: http://backbonejs.org/docs/backbone.html#section-195
                var optionalParam = /\((.*?)\)/g,
                    namedParam    = /(\(\?)?:\w+/g,
                    splatParam    = /\*\w+/g,
                    escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g,
                    route;

                route = route.replace(escapeRegExp, '\\$&')
                    .replace(optionalParam, '(?:$1)?')
                    .replace(namedParam, function(match, optional) {
                        return optional ? match : '([^/?]+)';
                    })
                    .replace(splatParam, '([^?]*?)');

               return new RegExp('^' + route + '(?:\\?([\\s\\S]*))?$').test(path);
            }

            function _markActiveItem(menuItem) {
                var found;

                menuItem.childTabs && menuItem.childTabs.forEach(_markActiveItem);

                found = menuItem.fields.highlightedWhenRouteMatches.find(function(route) {
                    return _routeMatchesPath(window.gh.configs.base + route, window.location.pathname)
                });

                if(found) {
                    menuItem.active = true;
                }
            }

            return menuItems.map(function(item) {
                _markActiveItem(item);
                return item;
            });
        }