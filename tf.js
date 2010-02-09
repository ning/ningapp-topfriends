/*global $: false, opensocial: false, console: false, gadgets: false, NING: true */

var TopFriends = {
    isOwner: false,
    updatedActivity: false,

    init: function () {
        TopFriends.Tabs.init();
        TopFriends.Dialog.init();
        TopFriends.Friends.init();
    },

    /* Log a message using function passed or default to console.log  */
    log: function (args, fn) {
        if (typeof fn === "function") {
            fn.apply(console, args);
        } else {
            if (typeof console === 'object' && typeof console.log !== "undefined") {
                console.log.apply(console, arguments);
            }
        }
    },

    info: function () {
        if (typeof console === 'object' && typeof console.info !== "undefined") {
            TopFriends.log(arguments, console.info);
        } else {
            TopFriends.log(arguments);
        }
    },

    warn: function () {
        if (typeof console === 'object' && typeof console.warn !== "undefined") {
            TopFriends.log(arguments, console.warn);
        } else {
            TopFriends.log(arguments);
        }
    },

    error: function () {
        if (typeof console === 'object' && typeof console.error !== "undefined") {
            TopFriends.log(arguments, console.error);
        } else {
            TopFriends.log(arguments);
        }
    }
};

TopFriends.Common = {
    /* generate a new button with jQuery UI state */
    generateButton: function(name, fn) {
        var button = $('<button type="button"></button>');
        button.addClass('ui-state-default ui-corner-all');
        button.text(name)
        .click(function () {
            $(this).removeClass('ui-state-focus');
            fn.apply(this, arguments);
        });
        button.hover(
            function() {
                $(this).addClass('ui-state-hover');
            },
            function() {
                $(this).removeClass('ui-state-hover');
            }
        );
        button.focus(function() {
            $(this).addClass('ui-state-focus');
        });
        button.blur(function() {
            $(this).removeClass('ui-state-focus');
        });
        return button;
    }
};

TopFriends.Dialog = {
    friendTemplate: '<li><div class="bd"><div class="ib"><img src="#{imgSrc}"></div><div class="tb"><h3>#{name}</h3></div></div></li>',

    open: function () {
        TopFriends.Dialog.dialog.dialog('open');
    },

    emptyFriendList: function() {
        $(".friend-list ul li", TopFriends.Dialog.dialog).remove();
    },

    addFriend: function(name, avatarUrl, id, profileUrl) {
        avatarUrl += "&width=48";
        var newFriend = $(TopFriends.Dialog.friendTemplate.replace(/#\{imgSrc\}/g, avatarUrl).replace(/#\{name\}/g, name));

        newFriend.data('name', name)
            .data('avatarUrl', avatarUrl)
            .data('profileUrl', profileUrl)
            .data('id', id);

        $('.bd', newFriend).addClass('ui-state-default ' +
        'ui-corner-bottom'
        )
        .click(function() {
            $("#friend-dialog .bd").removeClass("ui-state-active");
            $(this).addClass('ui-state-active');
        })
        .hover(
            function() {
                $(this).addClass('ui-state-hover');
            },
            function() {
                $(this).removeClass('ui-state-hover');
            }
        )
        .focus(function() {
            $(this).addClass('ui-state-focus');
        })
        .blur(function() {
            $(this).removeClass('ui-state-focus');
        });

        $(".friend-list ul", TopFriends.Dialog.dialog).append(newFriend);
    },

    updateFriendListPagination: function(previousFn, nextFn) {
        if (typeof(nextFn) === "undefined") {
            TopFriends.Dialog.nextButton.unbind("click").addClass("ui-state-disabled");
        } else {
            TopFriends.Dialog.nextButton.unbind("click").bind("click", nextFn).removeClass("ui-state-disabled");
        }

        if (typeof(previousFn) === "undefined") {
            TopFriends.Dialog.prevButton.unbind("click").addClass("ui-state-disabled");
        } else {
            TopFriends.Dialog.prevButton.unbind("click").bind("click", previousFn).removeClass("ui-state-disabled");
        }
    },

    init: function() {

        /* setup the add friend dialog */
        TopFriends.Dialog.dialog = $("#friend-dialog").dialog({
            height: 330,
            width: 600,
            autoOpen: false,
            bgiframe: true,
            resizable: false,
            modal: true,
            buttons: {
                Ok: function() {
                    var selectedFriend = $("li:has(.ui-state-active)", this);
                    TopFriends.Tabs.addFriend(selectedFriend.data('name'), selectedFriend.data('avatarUrl'), selectedFriend.data('id'), selectedFriend.data('profileUrl'));
                    $(this).dialog('close');
                },
                Cancel: function() {
                    $(this).dialog('close');
                }
            },
            close: function() {
                $(".bd", this).removeClass("ui-state-active");
            }
        });

        TopFriends.Dialog.saveDialog = $("#save-dialog").dialog({
            height: 150,
            width: 300,
            autoOpen: false,
            bgiframe: true,
            resizable: false,
            modal: true,
            buttons: {
                Ok: function() {
                    $(this).dialog('close');
                }
            }
        });

        TopFriends.Dialog.nextButton = TopFriends.Common.generateButton("Next");
        TopFriends.Dialog.prevButton = TopFriends.Common.generateButton("Previous");

        $(".header", TopFriends.Dialog.dialog).append(TopFriends.Dialog.prevButton).append(TopFriends.Dialog.nextButton);

        $('.bd').addClass('ui-state-default ' +
        'ui-corner-bottom'
        )
        .click(function() {
            $("#friend-dialog .bd").removeClass("ui-state-active");
            $(this).addClass('ui-state-active');
        })
        .hover(
            function() {
                $(this).addClass('ui-state-hover');
            },
            function() {
                $(this).removeClass('ui-state-hover');
            }
        )
        .focus(function() {
            $(this).addClass('ui-state-focus');
        })
        .blur(function() {
            $(this).removeClass('ui-state-focus');
        });

    }
};

TopFriends.Tabs = {
    tabCounter:  0,
    tabTemplate: '<li><a href="#{href}"><span class="title">#{label}</span></a><span class="ui-tabs-nav-close ui-icon ui-icon-close owners-only">close</span></li>',
    friendTemplate: '<li><div class="bd"><div class="ib"><a target="_top" href="#{profileUrl}"><img src="#{imgSrc}"></a></div><div class="tb"><h3><a target="_top" href="#{profileUrl}">#{name}</a></h3></div></div><span class="ui-icon ui-icon-close owners-only">close</span></li>',

    /* Return the last tab */
    getLastTabIndex: function() {
        return TopFriends.Tabs.tabs.tabs('length') - 1;
    },

    /* Return the last tab */
    getFirstTabIndex: function() {
        return 0;
    },

    getSelectedPanel: function() {
        return $("div.ui-tabs-panel:not(.ui-tabs-hide)", TopFriends.Tabs.tabs);
    },

    getPanel: function(panelId) {
        return $("#" + panelId, TopFriends.Tabs.tabs);
    },

    /* Rename the selected tab */
    renameSelectedTab: function(newTitle) {
        $(".ui-tabs-selected", TopFriends.Tabs.tabs).find(".title").text(newTitle);
    },

    /* Handles a click event by renaming the selected tab */
    generateRenameSelectedTabHandler: function(inputSelector) {
        return function (event) {
            var newTitle = $(inputSelector).val();
            TopFriends.Tabs.renameSelectedTab(newTitle);
        };
    },

    /* generate the controls for a new panel */
    generatePanel: function(panel, title) {
        var panelId;
        var header;
        var textFieldId;
        var renameButton;
        var renameTextInput;
        var body;
        var foot;

        panelId = panel.attr("id");

        /* Header */
        header = $("<div>Title: </div>").addClass("ui-tabs-panel-header " + "ui-widget-header " + "ui-corner-all " + "ui-helper-clearfix " + "owners-only");
        textFieldId = "rename-text-" + panelId;
        renameButton = TopFriends.Common.generateButton("Rename",
        TopFriends.Tabs.generateRenameSelectedTabHandler("#" + textFieldId));
        renameTextInput = $("<input/>").attr({
            type: "text",
            id: textFieldId,
            value: title
        });
        header.append(renameTextInput).append(renameButton);

        panel.append(header);


        /* Body */
        body = $("<div></div>").addClass("ui-tabs-panel-body " + "ui-widget-content");
        body.append("<div class='friend-list'><ul></ul></div>");
        if (TopFriends.isOwner) {
            body.append("<div class='empty-list'><p>You have not added friends yet. Click <em>Add a Friend</em> below to get started</p></div>");
        } else {
            body.append("<div class='empty-list'><p>This application is still being set up. Check back soon!</p></div>");
        }


        panel.append(body);


        /* Footer */
        foot = $("<div></div>").addClass("ui-tabs-panel-footer " + "ui-widget-content " + "ui-helper-clearfix " + "owners-only");
        foot.append(TopFriends.Common.generateButton('Save', TopFriends.Friends.saveTabs));
        foot.append(TopFriends.Common.generateButton("Add a Friend", TopFriends.Dialog.open));
        panel.append(foot);

        if (TopFriends.isOwner) {
            $(".owners-only", panel).removeClass("owners-only");
        }

        return panel;
    },

    /* Generate a new tab */
    addTab: function(title) {
        var tabTitle;
        var tabUrl;

        TopFriends.Tabs.tabCounter += 1;

        if (typeof title === 'undefined') {
            tabTitle = "List " + TopFriends.Tabs.tabCounter;
        } else {
            tabTitle = title;
        }
        tabUrl = "#tabs-" + TopFriends.Tabs.tabCounter;

        TopFriends.Tabs.tabs.tabs('add', tabUrl, tabTitle, TopFriends.Tabs.getFirstTabIndex());

        return tabUrl;
    },

    /* Handles tabsselect event by calling addTab() if it's the add tab */
    tabsselectHandler: function(event, ui) {
        if (TopFriends.isOwner && ui.index === TopFriends.Tabs.getLastTabIndex()) {
            TopFriends.Tabs.addTab();
            return false;
        }

    },

    /* Handles a click event by removing the selected tab */
    removeSelectedTabHandler: function(event) {
        var selectedIndex = TopFriends.Tabs.tabs.tabs('option', 'selected');

        // Disable the add tab so we don't generate a new tab
        TopFriends.Tabs.tabs.tabs("disable", TopFriends.Tabs.getLastTabIndex());
        TopFriends.Tabs.tabs.tabs("remove", selectedIndex);
        TopFriends.Tabs.tabs.tabs("select", TopFriends.Tabs.getFirstTabIndex());
        TopFriends.Tabs.tabs.tabs("enable", TopFriends.Tabs.getLastTabIndex());
    },

    /* Handles tabsadd event by finding the close button and add functionality */
    tabsaddHandler: function(event, ui) {
        if (TopFriends.isOwner) {
            // enable the delete functionality
            $(".ui-tabs-nav-close", ui.tab.parent).removeClass("owners-only").click(TopFriends.Tabs.removeSelectedTabHandler);
        }

        TopFriends.Tabs.generatePanel($(ui.panel), $(".title", ui.tab).text());

        // select the newly created tab
        TopFriends.Tabs.tabs.tabs("select", ui.index);
    },

    /* Add a friend to the currently selected pannel */
    addFriend: function(name, avatarUrl, id, profileUrl, panelId) {
        avatarUrl += "&width=48";
        var newFriend = $(TopFriends.Tabs.friendTemplate.replace(/#\{imgSrc\}/g, avatarUrl).replace(/#\{name\}/g, name).replace(/#\{profileUrl\}/g, profileUrl));

        newFriend.data('name', name)
            .data('avatarUrl', avatarUrl)
            .data('profileUrl', profileUrl)
            .data('id', id);

        if (TopFriends.isOwner) {
            $('.ui-icon-close', newFriend).removeClass("owners-only").click(function() {
                newFriend.remove();
            });
        } else {
            $('.ui-icon-close', newFriend).remove();
        }

        if (typeof panelId === 'undefined') {
            $(".friend-list ul", TopFriends.Tabs.getSelectedPanel()).append(newFriend);
            $(".empty-list", TopFriends.Tabs.getSelectedPanel()).remove();
        } else {
            $(".friend-list ul", TopFriends.Tabs.getPanel(panelId)).append(newFriend);
            $(".empty-list", TopFriends.Tabs.getPanel(panelId)).remove();
        }

        gadgets.window.adjustHeight();
    },

    /* return an object that represents the current tab/firend combination */
    getStructure: function () {
        var tabs = $(".ui-tabs-nav li a[href^=#tabs]", TopFriends.Tabs.tabs);
        var tabStruct = {};

        tabs.each(function(i, tab) {
            var tabId = $(tab).attr('href') + ":has(li)";
            var tabTitle = $(tab).text();
            var panel = $(tabId, TopFriends.Tabs.tabs);

            if (panel.length > 0) {
                tabStruct[tabTitle] = [];

                $(".friend-list ul li", panel).each(function (r, li) {
                    tabStruct[tabTitle].push($(li).data('id'));
                });
            }
        });

        TopFriends.info('getStructure', tabStruct);

        return tabStruct;
    },

    /* Add a panel with set of people */
    addPanel: function(title, friends) {
        var panelId = TopFriends.Tabs.addTab(title);
        TopFriends.Friends.requestFriendList(friends, panelId);
    },

    makeSortable: function() {
        /* make tabs sortable if owner */
        if (TopFriends.isOwner) {
            TopFriends.Tabs.tabs.find(".ui-tabs-nav").sortable({
                axis: 'x',
                items: 'li:not(.disabled)'
            });
        }

    },

    init: function() {

        if (!TopFriends.isOwner) {
            $("#tabs li").addClass("owners-only");
            $("#add").addClass("owners-only");
        }

        /* setup the tabs */
        TopFriends.Tabs.tabs = $("#tabs").tabs({
            tabTemplate: TopFriends.Tabs.tabTemplate,
            add: TopFriends.Tabs.tabsaddHandler,
            select: TopFriends.Tabs.tabsselectHandler,
            show: gadgets.window.adjustHeight
        });

        // TopFriends.Tabs.tabs.change(function () {console.info("resize"); gadgets.window.adjustHeight();});


        /* load existing setup */

        TopFriends.Friends.getTabs();
    }
};

TopFriends.Friends = {
    pageSize: 4,

    handleAllFriendsRequest: function(data) {
        var ownerFriends = data.get("allFriends").getData();
        var nextFn;
        var previousFn;
        var nextPage;
        var prevPage;

        TopFriends.Dialog.emptyFriendList();

        ownerFriends.each(function(person) {
            var avatarUrl = person.getField(opensocial.Person.Field.THUMBNAIL_URL);
            var profileUrl = person.getField(opensocial.Person.Field.PROFILE_URL);
            var name = person.getDisplayName();
            var id = person.getId();
            TopFriends.Dialog.addFriend(name, avatarUrl, id, profileUrl);

            TopFriends.info("handleAllFriendsRequest:", id, name);
        });

        // generate the previous and next pages
        if (ownerFriends.getOffset() > 0) {
            prevPage = Math.floor(ownerFriends.getOffset() / TopFriends.Friends.pageSize) - 1;
            previousFn = function() {TopFriends.Friends.requestAllFriends(prevPage);};
        }

        var friendsLeft = ownerFriends.getTotalSize() - ownerFriends.getOffset() - ownerFriends.size();
        if (friendsLeft > 0) {
            nextPage = Math.floor(ownerFriends.getOffset() / TopFriends.Friends.pageSize) + 1;
            nextFn = function() {TopFriends.Friends.requestAllFriends(nextPage);};
        }

        TopFriends.Dialog.updateFriendListPagination(previousFn, nextFn);
    },

    requestAllFriends: function(page) {
        var req = opensocial.newDataRequest();
        var idspec = opensocial.newIdSpec();
        var params = {};

        if (typeof(page) === "undefined") { page = 0;}

        idspec.setField(opensocial.IdSpec.Field.USER_ID, opensocial.IdSpec.PersonId.OWNER);
        idspec.setField(opensocial.IdSpec.Field.GROUP_ID, opensocial.IdSpec.GroupId.FRIENDS);

        params[opensocial.DataRequest.PeopleRequestFields.SORT_ORDER] = opensocial.DataRequest.SortOrder.NAME;
        params[opensocial.DataRequest.PeopleRequestFields.MAX] = TopFriends.Friends.pageSize;
        params[opensocial.DataRequest.PeopleRequestFields.FIRST] = (page * TopFriends.Friends.pageSize);

        req.add(req.newFetchPeopleRequest(idspec, params), "allFriends");
        req.send(TopFriends.Friends.handleAllFriendsRequest);
    },

    handleFriendListRequest: function(panelId) {
        return function (data) {
            var ownerFriends = data.get("friendList").getData();
            ownerFriends.each(function(person) {
                var avatarUrl = person.getField(opensocial.Person.Field.THUMBNAIL_URL);
                var profileUrl = person.getField(opensocial.Person.Field.PROFILE_URL);
                var name = person.getDisplayName();
                var id = person.getId();
                TopFriends.info("handleFriendListRequest:", id, name, panelId);

                TopFriends.Tabs.addFriend(name, avatarUrl, id, profileUrl, panelId);
            });
        };
    },

    /* Request a collection of friends by an array of IDs */
    requestFriendList: function(friendList, panelId) {
        var req = opensocial.newDataRequest();
        var idspec = opensocial.newIdSpec();
        var params = {};

        idspec.setField(opensocial.IdSpec.Field.USER_ID, friendList);

        params[opensocial.DataRequest.PeopleRequestFields.SORT_ORDER] = opensocial.DataRequest.SortOrder.NAME;

        req.add(req.newFetchPeopleRequest(idspec, params), "friendList");
        req.send(TopFriends.Friends.handleFriendListRequest(panelId));
    },

    saveTabs: function() {
        var friendStruct = TopFriends.Tabs.getStructure();
        var json = gadgets.json.stringify(friendStruct);
        var updateReq = opensocial.newDataRequest();

        if (TopFriends.isOwner) {
            TopFriends.info("saveTabs:", friendStruct, json);
            updateReq.add(updateReq.newUpdatePersonAppDataRequest(opensocial.IdSpec.PersonId.OWNER, 'friendStruct', json));
            updateReq.send();
            TopFriends.Dialog.saveDialog.dialog('open');
        }
        TopFriends.Friends.updateActivity();
    },

    handleGetTabs: function(payload) {
        var dataResp = payload.get('data');
        var ownerResp = payload.get('owner');
        var owner, data, ownerData, favBook, friendStruct;

        if (!ownerResp.hadError() && !dataResp.hadError()) {
            owner = ownerResp.getData();
            data = dataResp.getData();

            ownerData = data[owner.getId()];

            if (ownerData === undefined || typeof ownerData.friendStruct === 'undefined' || ownerData.friendStruct === "{}") {
                TopFriends.info("No data, adding new tab");
                TopFriends.Tabs.addTab();

            } else {
                friendStruct = gadgets.json.parse(ownerData.friendStruct);
                TopFriends.info("handleGetTabs:", ownerData, friendStruct);

                $.each(friendStruct, function(title, friends) {
                    TopFriends.Tabs.addPanel(title, friends);
                });
            }

        } else {
            TopFriends.error(ownerResp.getErrorMessage());
            TopFriends.error(dataResp.getErrorMessage());

            return false;
        }
    },

    getTabs: function() {
        var params = {};
        var idspec = opensocial.newIdSpec();
        var fetchReq = opensocial.newDataRequest();

        params[opensocial.DataRequest.DataRequestFields.ESCAPE_TYPE] = opensocial.EscapeType.NONE;

        idspec.setField(opensocial.IdSpec.Field.USER_ID, opensocial.IdSpec.PersonId.OWNER);

        fetchReq.add(fetchReq.newFetchPersonRequest(opensocial.IdSpec.PersonId.OWNER), 'owner');
        fetchReq.add(fetchReq.newFetchPersonAppDataRequest(idspec, ['friendStruct'], params) , 'data');
        fetchReq.send(TopFriends.Friends.handleGetTabs);
    },

    verifyOwnerHandler: function(payload) {
        var viewer;
        var data = payload.get('viewer');

        if (!data.hadError()) {
            viewer = data.getData();
            if (viewer.isOwner()) {
                TopFriends.isOwner = true;
                TopFriends.Tabs.makeSortable();
                $(".owners-only").removeClass("owners-only");
            }
        }
    },

    verifyOwner: function() {
        var params = {};
        var req = opensocial.newDataRequest();
        req.add(req.newFetchPersonRequest(opensocial.IdSpec.PersonId.VIEWER, params), "viewer");
        req.send(TopFriends.Friends.verifyOwnerHandler);
    },

    postActivity: function (text) { 
        var params = {}; 
        params[opensocial.Activity.Field.TITLE] = text; 
        var activity = opensocial.newActivity(params); 
        opensocial.requestCreateActivity(activity, opensocial.CreateActivityPriority.HIGH); 
        TopFriends.info("postActivity:", text);
    },

    updateActivityHandler: function (payload) {
        var profileUrl, name, text, viewer;
        var data = payload.get('viewer');

        if (!data.hadError()) {
            viewer = data.getData();
            if (viewer.isOwner()) {
                profileUrl = viewer.getField(opensocial.Person.Field.PROFILE_URL);
                name = viewer.getDisplayName();

                text = '<a href="' + profileUrl + '">' + name + '</a> updated their Top Friends';
                TopFriends.Friends.postActivity(text);
            }
        }
    },

    updateActivity: function () {
        var params = {};
        var req = opensocial.newDataRequest();

        if (!TopFriends.updatedActivity) {
            TopFriends.updatedActivity = true;
            req.add(req.newFetchPersonRequest(opensocial.IdSpec.PersonId.VIEWER, params), 'viewer');
            req.send(TopFriends.Friends.updateActivityHandler);
        }
    },

    init: function() {
        TopFriends.Friends.requestAllFriends();
    }
};

if (!NING) {
    var NING = {};
}

if (!NING.skinning) {
    NING.skinning = {};
}

NING.skinning = (function() {
	var bgColor     = gadgets.skins.getProperty(gadgets.skins.Property.BG_COLOR);
    var fontColor   = gadgets.skins.getProperty(gadgets.skins.Property.FONT_COLOR);
    var anchorColor = gadgets.skins.getProperty(gadgets.skins.Property.ANCHOR_COLOR);

	return {
        updateCSS: function() {
            var anchorEls = 'a';
            var bgEls = 'body, .ui-widget-content';
            var borderEls = '.ui-widget-content, .ui-widget-header, li.ui-state-active, li.ui-state-default, li.ui-state-hover';
            var fontEls = 'body, div, p, .newsfeed_box .newsfeed .dateline span';

            var defaultButtonEls = '.ui-state-default, .ui-widget-content .ui-state-default, .ui-state-default span';
            var activeButtonEls = '.ui-state-active, .ui-widget-content .ui-state-active';

            var defaultDialogFriendEls = '.friend-list .ui-state-default';
            var activeDialogFriendEls = '.friend-list .ui-state-active';
            var defaultDialogFriendLink = '.friend-list .ui-state-default h3';
            var activeDialogFriendLink = '.friend-list .ui-state-active h3';

            var style  = '<style type="text/css">';
            style += anchorEls       + '{color:' + anchorColor + ' !important;}';
            style += bgEls           + '{background-color: ' + bgColor + ' !important; border-color: ' + anchorColor + ' !important;}';
            style += borderEls       + '{border-color: ' + anchorColor + ' !important;}';
            style += fontEls         + '{color: ' + fontColor + ' !important;}';

            style += defaultButtonEls + '{border-color: ' + anchorColor + ' !important; color: ' + bgColor + ' !important; background-color: ' + anchorColor + ';}';
            style += activeButtonEls  + '{color: ' + anchorColor + '; background-color: ' + bgColor + ';}';

            style += activeDialogFriendEls + '{border-color: ' + anchorColor + ' !important; color: ' + bgColor + ' !important; background-color: ' + anchorColor + ' !important;}';
            style += defaultDialogFriendEls + '{color: ' + anchorColor + '; background-color: ' + bgColor + ';}';

            style += activeDialogFriendLink + '{color: ' + bgColor + ' !important;}';
            style += defaultDialogFriendLink + '{color: ' + anchorColor + ';}';

            style +='</style>';
            $('head').append(style);		
        }
	};
}());

