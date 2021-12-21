
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
    hideAlerts();

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

    window.addEventListener('hashchange', highlightChosenAddon)
});

function getAddonList() {
    $.getJSON(apiUrl, function (data) {
        addons = data.data.sort(sortByName);
        resortAddons(data.data);
        rerenderAddons();
        $('#loading-indicator').hide();
        $('#accordion').show();
        highlightChosenAddon();
    });
}

function copyUrl(addonId) {
    document.getElementById(addonId).getElementsByClassName('clickable-header')[0].classList.add('clicked-header')
    setTimeout(() => {
        document.getElementById(addonId).getElementsByClassName('clickable-header')[0].classList.remove('clicked-header')
    }, 500)
    var urlToCopy = window.location.href.split('#')[0] + '#' + encodeURI(addonId);
    navigator.clipboard.writeText(urlToCopy);
    window.location = urlToCopy
}

function triggerSearch(elementId, addonId) {
    $("#searchBox").val(addonId);
    $("#searchBox").keyup();
    $(elementId).collapse('show');
}

function highlightChosenAddon() {
    if (window.location.hash !== undefined) {
        let addonId = window.location.hash.substring(1);
        if (addonId !== undefined) {
            addonId = decodeURI(addonId)
        }
        choosenAddons = addons.filter(addon => addon.addonId === addonId);
        if (choosenAddons.length > 0) {
            var addon = choosenAddons[0];
            switch (addon.type) {
                case 1:
                    triggerSearch('#collapseTwo', addonId);
                    break;
                case 2:
                    triggerSearch('#collapseThree', addonId);
                    break;
                case 3:
                    triggerSearch('#collapseFour', addonId);
                    break;
                case 4:
                    triggerSearch('#collapseFive', addonId);
                    break;
                case undefined:
                    triggerSearch('#collapseOne', addonId);
                    break;
                default:
            }
        } else {
            $('#collapseOne').collapse('show')
        }
    } else {
        $('#collapseOne').collapse('show')
    }
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

    $('[data-toggle="tooltip"]').tooltip();
}

function sanitize(input) {
    return input.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function renderAddonsSection(data, type, name) {
    var htmlItems = [];
    if (data.length > 0) {
        $.each(data, function (_key, val) {
            htmlItems.push(' \
            <li class="list-group-item" id="' + sanitize(val.addonId) + '"> \
                <div class="row"> \
                    <div class="col-sm-2"> \
                        ' + (val.iconUrl != undefined ? '<img src="' + encodeURI(val.iconUrl) + '" width=120 loading="lazy"></img>' : "") + '\
                    </div> \
                    <div class="col-sm-9"> \
                        <h4 class="clickable-header" onclick="copyUrl(\'' + sanitize(val.addonId) + '\');">' + sanitize(val.name) + " <span class='glyphicon glyphicon-link' aria-hidden='true'></span></h4> \
                        <p class='addon-description'>" + sanitize(val.description == undefined ? val.shortDescription : val.description) + "</p> \
                " + (val.screenshots != undefined ? "<p> \
                " + renderScreenshots(val).join('') + "</p>" : '') + ' \
                <p> \
                <a href="' + encodeURI(val.sourceUrl) + '" target="_blank">Source code</a> \
                ' + ((val.links != undefined && renderLinks(val).length > 0) ? " | \
                " + renderLinks(val).join(' | ') : '') + " \
                </p > \
                <p> \
                Author: " + sanitize(val.author) + ' \
                </p> \
                </div> \
                <div class="col-sm-1"> \
                <p class="pull-right"> \
                <a href="playnite://playnite/installaddon/' + encodeURI(val.addonId) + '" class="btn btn-default" data-toggle="tooltip" data-placement="bottom" title="Requires Playnite to be installed.">Download</a> \
                </p> \
                    </div > \
                </div > \
            </li > '
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

function renderScreenshots(val) {
    return $.map(val.screenshots,
        function (link_key, _val) {
            return '<a href="' + encodeURI(link_key.image) + '" target="_blank"><img class="addon-screenshot" src="' + encodeURI(link_key.thumbnail) + '" loading="lazy"></img></a>';
        });
}

function renderLinks(val) {
    return $.map(val.links,
        function (link_key, link_val) {
            if (link_key !== val.sourceUrl) {
                return '<a href="' + encodeURI(link_key) + '" target="_blank">' + sanitize(link_val) + '</a>';
            }
            else {
                return null;
            }
        });
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
        threshold: 0.1,
        // distance: 100,
        // useExtendedSearch: false,
        ignoreLocation: true,
        // ignoreFieldNorm: false,
        keys: [
            "addonId",
            "name",
            "description"
        ]
    };

    const fuse = new Fuse(addons, options);

    return fuse.search(pattern)
}

function hideAlerts() {
    const showInfoAlert = localStorage.getItem("info-alert") === null;
    $("#info-alert").toggleClass("d-none", !showInfoAlert);

    const showWarningAlert = localStorage.getItem("warning-alert") === null;
    $("#warning-alert").toggleClass("d-none", !showWarningAlert);

    $(".close").on("click", function () {
        localStorage.setItem($(this).closest(".alert").attr('id'), "seen");
        $(this).closest(".alert").addClass("d-none")
    });
};