/* jshint browser: true */
/* global $, libsb */

$(function() {
    // Show and hide search bar
    function showSearchBar() {
        $("body").addClass("search-focus");
        // Use a timeout to add focus to avoid double animation in firefox
        setTimeout(function() {
            $(".search-entry").focus().data("search-ready", true);
        }, 300);
    }

    function hideSearchBar() {
        $("body").removeClass("search-focus");
        $(".search-entry").data("search-ready", false);
    }

    $(".search-button").on("click", showSearchBar);

    $(document).on("click", function(e) {
        if (!$(e.target).closest(".search-entry").length && $(".search-entry").data("search-ready")) {
            hideSearchBar();
        }
    });

    $(".search-entry").keypress(function(e) {
        if (e.which === 13) {
            hideSearchBar();
            e.preventDefault();
            libsb.emit('navigate', {view: "meta", mode: "search", tab: "search-local", query: $(".search-entry").val()});
        }
    });
});
