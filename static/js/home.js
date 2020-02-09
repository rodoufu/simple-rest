/*
 * JavaScript file for the application to demonstrate
 * using the API
 */

// Create the namespace instance
let ns = {};

const attachAjax = function (eventPump, ajaxOtions, succesName, errorName) {
    $.ajax(ajaxOtions)
        .done(function (data) {
            eventPump.trigger(succesName, [data]);
        })
        .fail(function (xhr, textStatus, errorThrown) {
            eventPump.trigger(errorName, [xhr, textStatus, errorThrown]);
        })
};

// Create the model instance
ns.model = (function () {
    'use strict';

    let $event_pump = $('body');

    // Return the API
    return {
        read: function () {
            let ajax_options = {
                type: 'GET',
                url: 'api/people',
                accepts: 'application/json',
                dataType: 'json'
            };
            attachAjax($event_pump, ajax_options, 'model_read_success', 'model_error');
        },
        create: function (fname, lname) {
            let ajax_options = {
                type: 'POST',
                url: 'api/people',
                accepts: 'application/json',
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify({
                    'fname': fname,
                    'lname': lname
                })
            };
            attachAjax($event_pump, ajax_options, 'model_create_success', 'model_error');
        },
        update: function (fname, lname) {
            let ajax_options = {
                type: 'PUT',
                url: 'api/people/' + lname,
                accepts: 'application/json',
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify({
                    'fname': fname,
                    'lname': lname
                })
            };
            attachAjax($event_pump, ajax_options, 'model_update_success', 'model_error');
        },
        delete: function (lname) {
            let ajax_options = {
                type: 'DELETE',
                url: 'api/people/' + lname,
                accepts: 'application/json',
                contentType: 'plain/text'
            };
            attachAjax($event_pump, ajax_options, 'model_delete_success', 'model_error');
        }
    };
}());

// Create the view instance
ns.view = (function () {
    'use strict';

    let $fname = $('#fname'),
        $lname = $('#lname');

    // return the API
    return {
        reset: function () {
            $lname.val('');
            $fname.val('').focus();
        },
        updateEditor: function (fname, lname) {
            $lname.val(lname);
            $fname.val(fname).focus();
        },
        buildTable: function (people) {
            let rows = '';

            // clear the table
            $('.people table > tbody').empty();

            // did we get a people array?
            if (people) {
                people.forEach(person => {
                    rows +=
                        `<tr>
                            <td class="fname">${person.fname}</td>
                            <td class="lname">${person.lname}</td>
                            <td>${person.timestamp}</td>
                        </tr>`;
                });
                $('table > tbody').append(rows);
            }
        },
        error: function (error_msg) {
            $('.error')
                .text(error_msg)
                .css('visibility', 'visible');
            setTimeout(function () {
                $('.error').css('visibility', 'hidden');
            }, 3000)
        }
    };
}());

// Create the controller
ns.controller = (function (m, v) {
    'use strict';

    let model = m,
        view = v,
        $event_pump = $('body'),
        $fname = $('#fname'),
        $lname = $('#lname');

    // Get the data from the model after the controller is done initializing
    setTimeout(function () {
        model.read();
    }, 100);

    // Validate input
    function validate(fname, lname) {
        return fname !== "" && lname !== "";
    }

    // Create our event handlers
    $('#create').click(function (e) {
        let fname = $fname.val(),
            lname = $lname.val();

        e.preventDefault();

        if (validate(fname, lname)) {
            model.create(fname, lname)
        } else {
            alert('Problem with first or last name input');
        }
    });

    $('#update').click(function (e) {
        let fname = $fname.val(),
            lname = $lname.val();

        e.preventDefault();

        if (validate(fname, lname)) {
            model.update(fname, lname)
        } else {
            alert('Problem with first or last name input');
        }
        e.preventDefault();
    });

    $('#delete').click(function (e) {
        let lname = $lname.val();

        e.preventDefault();

        if (validate('placeholder', lname)) {
            model.delete(lname)
        } else {
            alert('Problem with first or last name input');
        }
        e.preventDefault();
    });

    $('#reset').click(function () {
        view.reset();
    });

    $('table > tbody').on('dblclick', 'tr', function (e) {
        let $target = $(e.target),
            fname,
            lname;

        fname = $target
            .parent()
            .find('td.fname')
            .text();

        lname = $target
            .parent()
            .find('td.lname')
            .text();

        view.updateEditor(fname, lname);
    });

    // Handle the model events
    $event_pump.on('model_read_success', function (e, data) {
        view.buildTable(data);
        view.reset();
    });

    $event_pump.on('model_create_success', function (e, data) {
        model.read();
    });

    $event_pump.on('model_update_success', function (e, data) {
        model.read();
    });

    $event_pump.on('model_delete_success', function (e, data) {
        model.read();
    });

    $event_pump.on('model_error', function (e, xhr, textStatus, errorThrown) {
        if (xhr.responseJSON === undefined) {
            xhr.responseJSON = 'undefined';
        }
        let error_msg = `${textStatus}: ${errorThrown} - ${xhr.responseJSON.detail}`;
        view.error(error_msg);
        console.log(error_msg);
    })
}(ns.model, ns.view));
