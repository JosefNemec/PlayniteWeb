
// For local development use thing-proxy with URL below or turn off CORS in browser
// To use thing-proxy 'cd source/js/thing-proxy && npm i && node server.js'
// REMEMBER to change it back before commit!
// var apiUrl = "http://localhost:3000/fetch/https://api.playnite.link/api/addons"
var apiUrl = "https://api.playnite.link/api/addons";

var addons = [];
var addonsGameLibrary = [];
var addonsMetadataProvider = [];
var addonsGeneric = [];
var addonsThemeDesktop = [];
var addonsThemeFullscreen = [];

function sortByName(a, b) {
    var aName = a.name.toLowerCase();
    var bName = b.name.toLowerCase();
    return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
}

$(document).ready(function () {
    getAddonList();

    $("#searchBox").keyup(function (data) {
        if (data.target.value.length > 0) {
            var searchResult = search(data.target.value);
            resortAddons(searchResult.map(function (val) { return val.item }));
            rerenderAddons();
        }
        else {
            resortAddons(addons);
            rerenderAddons();
        }
    });
});

function getAddonList() {
    $.getJSON(apiUrl, function (data) {
        addons = data.data.sort(sortByName);
        resortAddons(data.data);
        rerenderAddons();
    });
}

function resortAddons(data) {
    addonsGameLibrary = [];
    addonsMetadataProvider = [];
    addonsGeneric = [];
    addonsThemeDesktop = [];
    addonsThemeFullscreen = [];
    $.each(data, function (_key, val) {
        switch (val.type) {
            case 1:
                addonsMetadataProvider.push(val);
                break;
            case 2:
                addonsGeneric.push(val);
                break;
            case 3:
                addonsThemeDesktop.push(val);
                break;
            case 4:
                addonsThemeFullscreen.push(val);
                break;
            case undefined:
                addonsGameLibrary.push(val);
                break;
            default:
        }
    });
}

function rerenderAddons() {
    renderAddonsSection(addonsMetadataProvider, "addonsMetadataProvider", "Metadata Sources");
    renderAddonsSection(addonsGeneric, "addonsGeneric", "Generic");
    renderAddonsSection(addonsThemeDesktop, "addonsThemeDesktop", "Themes Desktop");
    renderAddonsSection(addonsThemeFullscreen, "addonsThemeFullscreen", "Themes Fullscreen");
    renderAddonsSection(addonsGameLibrary, "addonsGameLibrary", "Libraries");
}

function sanitize(input) {
    var output = input.replace(/<script[^>]*?>.*?<\/script>/gi, '').
        replace(/<[\/\!]*?[^<>]*?>/gi, '').
        replace(/<style[^>]*?>.*?<\/style>/gi, '').
        replace(/<![\s\S]*?--[ \t\n\r]*>/gi, '').
        replace(/&nbsp;/g, '');
    return output;
}

function renderAddonsSection(data, type, name) {
    var htmlItems = [];
    if (data.length > 0) {
        $.each(data, function (_key, val) {
            htmlItems.push(" \
            <li class='list-group-item'> \
                <div class='row'> \
                    <div class='col-sm-2'> \
                        " + (val.iconUrl != undefined ? "<img src=" + encodeURI(val.iconUrl) + " width=120 loading='lazy'></img>" : "") + "\
                    </div> \
                    <div class='col-sm-9'> \
                        <h4>" + sanitize(val.name) + "</h4> \
                        <p class='addon-description'>" + sanitize(val.description == undefined ? val.shortDescription : val.description) + "</p> \
                " + (val.screenshots != undefined ? "<p> \
                " + $.map(val.screenshots,
                function (key, _val) {
                    return '<a href="' + encodeURI(key.image) + '" target="_blank"><img class="addon-screenshot" src="' + encodeURI(key.thumbnail) + '" loading="lazy"></img></a>';
                }).join('') + "</p>" : '') + " \
                <p> \
                <a href=" + encodeURI(val.sourceUrl) + " target='_blank'>Source code</a> \
                " + (val.links != undefined ? " | \
                " + $.map(val.links,
                    function (link_key, link_val) {
                        if (link_key !== val.sourceUrl) {
                            return '<a href="' + encodeURI(link_key) + '" target="_blank">' + sanitize(link_val) + '</a>';
                        }
                        else {
                            return null;
                        }
                    }).join(' | ') : '') + " \
                </p > \
                <p> \
                Author: " + sanitize(val.author) + " \
                </p > \
                </div > \
                <div class='col-sm-1'> \
                <p class='pull-right'> \
                <a href='playnite://playnite/installaddon/" + encodeURI(val.addonId) + "' class='btn btn-default'>Download</a> \
                </p> \
                    </div > \
                </div > \
            </li > "
            );
        });
        $('#' + type).html('');
        $("<ul/>", {
            "class": "list-group",
            html: htmlItems.join("")
        }).appendTo("#" + type);
    }
    else {
        $('#' + type).html('None');
    }
    $('#' + type + 'Header').children('h4').children('a').text(name + ' (' + data.length + ')');
}

function search(pattern) {
    const options = {
        // isCaseSensitive: false,
        // includeScore: false,
        // shouldSort: true,
        // includeMatches: false,
        // findAllMatches: false,
        // minMatchCharLength: 1,
        // location: 0,
        // threshold: 0.6,
        // distance: 100,
        // useExtendedSearch: false,
        // ignoreLocation: false,
        // ignoreFieldNorm: false,
        keys: [
            "name",
            "description"
        ]
    };

    const fuse = new Fuse(addons, options);

    return fuse.search(pattern)
}