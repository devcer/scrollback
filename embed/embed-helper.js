/* jshint browser: true */
/* global $, libsb */

$(function() {
    // Handle fullview button click
    $(".embed-action-fullview").on("click", function() {
        window.open((window.location.href).replace(/[&,?]embed=[^&,?]+/g, "").replace(/[&,?]theme=[^&,?]+/g, "").replace(/[&,?]minimize=[^&,?]+/g, ""), "_blank");
    });

    // Handle minimize
    $(".embed-action-minimize").on("click", function(e) {
        libsb.emit("navigate", { minimize: true });
    });

    $(".title-bar").on("click", function(e) {
        if (e.target === e.currentTarget) {
            libsb.emit("navigate", { minimize: true });
        }
    });

    $(".minimize-bar").on("click", function() {
        libsb.emit("navigate", { minimize: false });
    });

    if (window.parent.postMessage) {
        libsb.on("navigate", function(state, next) {
            if (state.embed === "toast" && state.old && state.minimize !== state.old.minimize) {
                if (state.minimize) {
                    window.parent.postMessage("minimize", "*");
                } else {
                    window.parent.postMessage("maximize", "*");
                }
            }

            next();
        }, 500);
    }
});
