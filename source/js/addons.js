
// For local development use cors-anywhere with URL below or turn off CORS in browser
// To use cors-anywhere run 'npm i' and then 'node ./source/js/cors-anywhere.js'
// REMEMBER to change it back before commit!
// var apiUrl = "http://localhost:8080/http://api.playnite.link/api/addons"
var apiUrl = "http://api.playnite.link/api/addons";

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

function renderAddonsSection(data, type, name) {
    var htmlItems = [];
    if (data.length > 0) {
        $.each(data, function (_key, val) {
            htmlItems.push(" \
            <li class='list-group-item'> \
                <div class='row'> \
                    <div class='col-sm-2'> \
                        " + (val.iconUrl != undefined ? "<img src=" + val.iconUrl + " width=120></img>" : "") + "\
                    </div> \
                    <div class='col-sm-9'> \
                        <h4>" + val.name + "</h4> \
                        <p>" + (val.description == undefined ? val.shortDescription : val.description) + "</p> \
                " + (val.screenshots != undefined ? "<p> \
                " + $.map(val.screenshots,
                function (key, _val) {
                    return '<a href="' + key.image + '" target="_blank"><img class="addon-screenshot" src="' + key.thumbnail + '" title></img></a>';
                }).join('') : '') + " \
                </p > \
                " + (val.links != undefined ? "<p> \
                " + $.map(val.links,
                    function (key, val) {
                        return '<a href="' + key + '" target="_blank">' + val + '</a>';
                    }).join(' | ') : '')  + " \
                </p > \
                <p> \
                Author: " + val.author + " \
                </p > \
                </div > \
                <div class='col-sm-1'> \
                <p class='pull-right'> \
                <a href='playnite://playnite/installaddon/" + val.addonId + "' class='btn btn-default'>Download</a> \
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