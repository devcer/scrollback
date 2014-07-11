/* jshint browser: true */
/* global $, libsb */

$(function() {
    var $body = $("body"),
        $searchButton = $(".search-button"),
        $searchEntry = $(".search-entry");

    // Show and hide search bar
    function showSearchBar() {
        $body.addClass("search-focus");
        // Use a timeout to add focus to avoid double animation in firefox
        setTimeout(function() {
            $searchEntry.focus().data("search-ready", true);
        }, 300);
    }

    function hideSearchBar() {
        $body.removeClass("search-focus");
        $searchEntry.data("search-ready", false);
    }

    $searchButton.on("click", showSearchBar);

    $(document).on("click", function(e) {
        if (!$(e.target).closest(".search-entry").length && $searchEntry.data("search-ready")) {
            hideSearchBar();
        }
    });

    $searchEntry.keypress(function(e) {
        if (e.which === 13) {
            hideSearchBar();
            e.preventDefault();
            libsb.emit('navigate', {view: "meta", mode: "search", tab: "search-local", query: $searchEntry.val()});
        }
    });
});
