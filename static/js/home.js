/**
 * This is a jQuery implementation based on MVC model
 */

// Create the namespace instance
let ns = {};

// Create the model instance
ns.model = (function () {
    'use strict';

    let $body = $('body');

    // Return the API
    return {
        'read_parts': function () {
            let ajax_options = {
                type: 'GET',
                url: 'api/parts',
                accepts: 'application/json',
                dataType: 'json'
            };
            $.ajax(ajax_options)
                .done(function (data) {
                    $body.trigger('model_read_parts_success', [data]);
                })
                .fail(function (xhr, textStatus, errorThrown) {
                    $body.trigger('model_error', [xhr, textStatus, errorThrown]);
                })
        },
        'read_constructions': function () {
            let ajax_options = {
                type: 'GET',
                url: 'api/constructions',
                accepts: 'application/json',
                dataType: 'json'
            };
            $.ajax(ajax_options)
                .done(function (data) {
                    $body.trigger('model_read_constructions_success', [data]);
                })
                .fail(function (xhr, textStatus, errorThrown) {
                    $body.trigger('model_error', [xhr, textStatus, errorThrown]);
                })
        },
        'create_construction': function (name, parts) {
            let ajax_options = {
                type: 'POST',
                url: 'api/constructions',
                accepts: 'application/json',
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify({
                    'name': name,
                    'parts': parts
                })
            };
            $.ajax(ajax_options)
                .done(function (data) {
                    $body.trigger('model_create_construction_success', [data]);
                })
                .fail(function (xhr, textStatus, errorThrown) {
                    $body.trigger('model_error', [xhr, textStatus, errorThrown]);
                })
        },
        'update_construction': function (id, name, parts) {
            let ajax_options = {
                type: 'PUT',
                url: 'api/constructions/' + id,
                accepts: 'application/json',
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify({
                    'name': name,
                    'parts': parts
                })
            };
            $.ajax(ajax_options)
                .done(function (data) {
                    $body.trigger('model_update_construction_success', [data]);
                })
                .fail(function (xhr, textStatus, errorThrown) {
                    $body.trigger('model_error', [xhr, textStatus, errorThrown]);
                })
        },
        'delete_construction': function (id) {
            let ajax_options = {
                type: 'DELETE',
                url: 'api/constructions/' + id,
                accepts: 'application/json',
                contentType: 'plain/text'
            };
            $.ajax(ajax_options)
                .done(function (data) {
                    $body.trigger('model_delete_construction_success', [data]);
                })
                .fail(function (xhr, textStatus, errorThrown) {
                    $body.trigger('model_error', [xhr, textStatus, errorThrown]);
                })
        }
    };
}());

// Create the view instance
ns.view = (function () {
    'use strict';

    let $name = $('#construction_name'),
        $parts = $('#construction_parts'),
        $totalParts = $('#construction_total_parts'),
        $totalVolume = $('#construction_total_volume'),
        $id = $('.construction_id');

    // we store parts in the local storage for fast retrieval and save the round trip
    // we also use a parts ID:Name map to provide optimal data retrieval for constructions
    let partsCache = [],
        partsIdNameMap = {},
        constructionsCache = [];

    // return the API
    return {
        fetchPartsCache: function () {
            // pass only value, not reference, this is an array of object
            return JSON.parse(JSON.stringify(partsCache));
        },
        fetchConstructionsCache: function () {
            return JSON.parse(JSON.stringify(constructionsCache));
        },
        reset: function () {
            $('.constructions table').show();
            $('.editor').hide();
            $('.showWhenInteract').hide();

            $id.text('');
            $name.val('');
            $parts.text('(click plus/minus sign in the Parts table)');
            $totalParts.text('0');
            $totalVolume.text('0');
        },
        build_parts_table: function (parts) {
            let rows = ''

            // clear the table
            $('.parts table > tbody').empty();
            // clear cache
            partsCache = [];
            partsIdNameMap = {};

            if (parts) {
                for (let i = 0; i < parts.length; i++) {
                    rows += `<tr>
                                 <td class="increment_part showWhenInteract"><button>+</button></td>
                                 <td class="decrement_part showWhenInteract"><button>-</button></td>
                                 <td class="id">${parts[i].id}</td>
                                 <td class="name">${parts[i].name}</td>
                                 <td class="volume">${parts[i].volume}</td>
                            </tr>`;
                    // e.g. {1: [name, 12]}
                    partsIdNameMap[parts[i].id] = [parts[i].name, parts[i].volume];
                }
                
                $('.parts table > tbody').append(rows);
                partsCache = parts;
            }
        },
        build_constructions_table: function (constructions) {
            let rows = ''

            // clear the table
            $('.constructions table > tbody').empty();
            constructionsCache = [];

            if (constructions) {
                for (let i = 0; i < constructions.length; i++) {

                    let construction_parts = '';
                    let partsTotal = 0;
                    let volumeTotal = 0;

                    constructions[i].parts.forEach(part => {
                        if (partsIdNameMap[part.id] != undefined) {
                            construction_parts += partsIdNameMap[part.id][0] + ':' + part.count + ', ';
                            volumeTotal += parseInt(partsIdNameMap[part.id][1]) * parseInt(part.count);
                        }
                        partsTotal += parseInt(part.count);
                    });

                    rows += `<tr>
                                 <td class="delete_construction"><button title="Delete">-</button></td>
                                 <td class="edit_construction"><button>Edit</button></td>
                                 <td hidden>${constructions[i]._id['$oid']}</td>
                                 <td class="name">${constructions[i].name}</td>
                                 <td class="part">${construction_parts}</td>
                                 <td class="partsTotal">${partsTotal}</td>
                                 <td class="volumeTotal">${volumeTotal}</td>
                                 <td>${constructions[i].creationTimeDate}</td>
                            </tr>`;
                }
                $('.constructions table > tbody').append(rows);

                constructionsCache = constructions;
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
        $body = $('body');

    let partsCacheIncludingCount;

    // Get the data from the model after the controller is done initializing
    setTimeout(function () {
        model.read_parts();
        model.read_constructions();
    }, 100)

    // Validate input
    function validate(name, parts) {
        return name !== "" && parts != undefined && parts.length != 0;
    }

    function isUndefinedOrZero(value) {
        if (value == undefined || value === 0) {
            return true;
        }
        return false;
    }

    function constructPartDisplayString(part) {
        if (!isUndefinedOrZero(part.count)) { return part.name + ':' + part.count + ', '; }
        return '';
    }

    function calculatePartTotalVolume(part) {
        return part.count * part.volume;
    }

    $('#add_construction').click(function () {
        $('.constructions table').hide();
        $('.editor').show();
        $('.showWhenInteract').show();
        $('#editor_caption').text('Create New Construction');
        $('#save').text('Create');
    });

    $('#back').click(function () {
        partsCacheIncludingCount = null;
        view.reset();
    });

    // Since the class is added dynamically, need to use event delegation to register the event handler
    $(document).on('click', '.increment_part', function () {
        let part_id = $(this).closest('tr').find('td:eq(2)').text();

        // init in local to avoid view's not been inited issue
        if (partsCacheIncludingCount == undefined) {
            partsCacheIncludingCount = view.fetchPartsCache();
        }

        // reset
        let displayParts = '',
            displayTotalParts = 0,
            displayTotalVolume = 0;

        for (let i = 0; i < partsCacheIncludingCount.length; i++) {

            // there will be only one part a time
            if (partsCacheIncludingCount[i].id == part_id) {
                if (partsCacheIncludingCount[i].count == undefined) {
                    partsCacheIncludingCount[i].count = 1;
                }
                else {
                    partsCacheIncludingCount[i].count += 1;
                }
            }

            displayTotalParts += isUndefinedOrZero(partsCacheIncludingCount[i].count) ? 0 : partsCacheIncludingCount[i].count;
            displayTotalVolume += isUndefinedOrZero(partsCacheIncludingCount[i].count) ? 0 : calculatePartTotalVolume(partsCacheIncludingCount[i]);
            displayParts += isUndefinedOrZero(partsCacheIncludingCount[i].count) ? '' : constructPartDisplayString(partsCacheIncludingCount[i]);
        }

        $('#construction_parts').text(displayParts);
        $('#construction_total_parts').text(displayTotalParts);
        $('#construction_total_volume').text(displayTotalVolume);
    })

    $(document).on('click', '.decrement_part', function () {
        let part_id = $(this).closest('tr').find('td:eq(2)').text();

        // init in function level to avoid view's not been inited issue
        if (partsCacheIncludingCount == undefined) {
            partsCacheIncludingCount = view.fetchPartsCache();
        }

        // reset
        let displayParts = '',
            displayTotalParts = 0,
            displayTotalVolume = 0;

        for (let i = 0; i < partsCacheIncludingCount.length; i++) {

            // there will be only one part a time
            if (partsCacheIncludingCount[i].id == part_id) {
                if (isUndefinedOrZero(partsCacheIncludingCount[i].count)) {
                    alert("No more such part to decrement");
                    continue;
                }
                else {
                    partsCacheIncludingCount[i].count -= 1;
                }
            }

            displayTotalParts += isUndefinedOrZero(partsCacheIncludingCount[i].count) ? 0 : partsCacheIncludingCount[i].count;
            displayTotalVolume += isUndefinedOrZero(partsCacheIncludingCount[i].count) ? 0 : calculatePartTotalVolume(partsCacheIncludingCount[i]);
            displayParts += isUndefinedOrZero(partsCacheIncludingCount[i].count) ? '' : constructPartDisplayString(partsCacheIncludingCount[i]);
        }

        $('#construction_parts').text(displayParts);
        $('#construction_total_parts').text(displayTotalParts);
        $('#construction_total_volume').text(displayTotalVolume);
    })

    // Delete a construction by ID
    $(document).on('click', '.delete_construction', function () {
        let construction_id = $(this).closest('tr').find('td:eq(2)').text();
        if (construction_id != undefined) {
            model.delete_construction(construction_id);
        }
    })

    // Edit a construction by ID
    $(document).on('click', '.edit_construction', function () {
        let construction_id = $(this).closest('tr').find('td:eq(2)').text();
        const construction_name = $(this).closest('tr').find('td:eq(3)').text();
        const parts = $(this).closest('tr').find('td:eq(4)').text();
        const totalParts = $(this).closest('tr').find('td:eq(5)').text();
        const totalVolume = $(this).closest('tr').find('td:eq(6)').text();
        let partsArray;

        if (partsCacheIncludingCount == undefined) {
            partsCacheIncludingCount = view.fetchPartsCache();
        }

        view.fetchConstructionsCache().forEach(construction => {
            if (construction._id['$oid'] == construction_id) {
                partsArray = construction.parts;
            }
        });

        partsArray.forEach(part => {
            partsCacheIncludingCount.forEach(cachedPart => {
                if (part.id == cachedPart.id) {
                    cachedPart.count = part.count;
                }
            });
        });

        $('.construction_id').text(construction_id);
        $('#construction_name').val(construction_name);
        $('#editor_caption').text('Edit Construction: ' + construction_name);
        $('#construction_parts').text(parts);
        $('#construction_total_parts').text(totalParts);
        $('#construction_total_volume').text(totalVolume);

        $('#save').text('Update');
        $('.constructions table').hide();
        $('.editor').show();
        $('.showWhenInteract').show();
    })

    // Save a construction
    $('#save').click(function (e) {
        let name = $('#construction_name').val();
        let parts = [];

        e.preventDefault();

        if (validate(name, partsCacheIncludingCount)) {

            for (let i = 0; i < partsCacheIncludingCount.length; i++) {
                if (!isUndefinedOrZero(partsCacheIncludingCount[i].count)) {
                    parts.push({ 'id': partsCacheIncludingCount[i].id, 'count': partsCacheIncludingCount[i].count });
                }
            }

            // update
            if ($('.construction_id').text() != '') {
                model.update_construction($('.construction_id').text(), name, parts);
            }
            else {
                // create
                model.create_construction(name, parts);
            }

        } else {
            alert('Make sure you have name and parts both specified');
        }
    });

    // Handle the model events
    $body.on('model_read_parts_success', function (e, data) {
        view.build_parts_table(JSON.parse(data));
    });

    $body.on('model_read_constructions_success', function (e, data) {
        view.build_constructions_table(JSON.parse(data));
        view.reset();
    });

    $body.on('model_create_construction_success', function (e, data) {
        model.read_constructions();
        // reset cache
        partsCacheIncludingCount = null;
        alert("New construction created!");
    });

    $body.on('model_update_construction_success', function (e, data) {
        model.read_constructions();
    });

    $body.on('model_delete_construction_success', function (e, data) {
        model.read_constructions();
    });

    $body.on('model_error', function (e, xhr, textStatus, errorThrown) {
        let error_msg = textStatus + ': ' + errorThrown + ' - ' + xhr.responseJSON.detail;
        view.error(error_msg);
        console.log(error_msg);
    })
}(ns.model, ns.view));

