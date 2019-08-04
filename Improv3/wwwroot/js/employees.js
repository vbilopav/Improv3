"use strict";
window.subscribe("/sector/change", function (id, name) {
    var wrap = $("#table-wrap"), loader = wrap.find("div"), table = wrap.find("table");
    loader.show();
    table.hide();
    if (id == null) {
        loader.hide();
        return;
    }
    $.getJSON("api/company-and-sectors", function (response) {
        loader.hide();
        table.show();
    });
});
