"use strict";
window.subscribe("/sector/change", function (id, name) {
    ;
    var rowTemplate = function (employee) { return "\n    <tr>\n        <th scope=\"row\">\n            <div class=\"loading spinner-grow text-secondary\" role=\"status\" style=\"display: none\">\n              <span class=\"sr-only\">Loading...</span>\n            </div>\n            <div class=\"row-id\">\n                " + (employee.id ? employee.id : "new") + "\n            </div>\n        </th>\n        <td>\n            <input type=\"text\" class=\"form-control\" value=\"" + employee.firstName + "\" placeholder=\"employee first name\" spellcheck=\"false\" autocomplete=\"on\" />\n        </td>\n        <td>\n            <input type=\"text\" class=\"form-control\" value=\"" + employee.lastName + "\" placeholder=\"employee last name\" spellcheck=\"false\" autocomplete=\"on\" />\n        </td>\n        <td>\n            <input type=\"text\" class=\"form-control email\" value=\"" + employee.email + "\" placeholder=\"employee email\" spellcheck=\"false\" autocomplete=\"on\" />\n        </td>\n    </tr>"; };
    var validateEmail = function (email) {
        var re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        return re.test(String(email).toLowerCase());
    };
    var post = function (url, request, success) { return $.ajax({
        url: url,
        type: "POST",
        data: JSON.stringify(request),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: success
    }); };
    var wrap = $("#table-wrap"), loader = wrap.find("div"), table = wrap.find("table"), tbody = table.find("tbody");
    var inputTimeout;
    loader.show();
    table.hide();
    if (id == null) {
        loader.hide();
        return;
    }
    var toggleLoadingRow = function (row, state) {
        if (state) {
            row.find("th > div.loading").show();
            row.find("th > div.row-id").hide();
        }
        else {
            row.find("th > div.loading").hide();
            row.find("th > div.row-id").show();
        }
    };
    var addRow = function (employee) {
        var row = $(rowTemplate(employee)).data("id", employee.id);
        row.find("input").on("input", function () { return inputChanged(row); });
        tbody.append(row);
    };
    var tooltip = function (e, msg) {
        return e.tooltip("dispose").attr("title", msg).tooltip({ trigger: "manual" }).tooltip("show");
    };
    var handleTableInputChange = function (row, done) {
        var inputs = row.find("input");
        var rowEl = row.find("th>div.row-id");
        var employee = {
            id: row.data("id"),
            firstName: $(inputs[0]).val(),
            lastName: $(inputs[1]).val(),
            email: $(inputs[2]).val()
        };
        if (!employee.firstName) {
            return done();
        }
        if (!employee.lastName) {
            return done();
        }
        if (!employee.email) {
            return done();
        }
        if (!validateEmail(employee.email)) {
            tooltip($(inputs[2]), "Email is not valid.");
            return done();
        }
        $(inputs[2]).tooltip("dispose");
        employee.attributes = { location: document.location.href };
        employee.sectorId = id;
        post("api/update-employee", employee, function (response) {
            rowEl.css("color", "").html(response.id);
            if (employee.id == null) {
                addRow({ id: null, firstName: "", lastName: "", email: "" });
            }
            row.data("id", response.id);
        }).always(done).fail(function (response) {
            console.warn(response.responseJSON);
            tooltip(rowEl.css("color", "red"), "Couldn't update this row. There is something wrong with database.");
        });
    };
    var inputChanged = function (row) {
        row.find("input, div").tooltip("dispose");
        toggleLoadingRow(row, true);
        if (inputTimeout) {
            clearTimeout(inputTimeout);
        }
        inputTimeout = setTimeout(function () {
            handleTableInputChange(row, function () { return toggleLoadingRow(row, false); });
        }, 250);
    };
    $.getJSON("api/employees-by-sector?sectorId=" + id, function (response) {
        tbody.empty();
        for (var _i = 0, response_1 = response; _i < response_1.length; _i++) {
            var employee = response_1[_i];
            addRow(employee);
        }
        addRow({ id: null, firstName: "", lastName: "", email: "" });
        loader.hide();
        table.show();
    });
});
