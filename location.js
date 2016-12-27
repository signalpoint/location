/**
 * Implements hook_field_widget_form().
 */
function location_cck_field_widget_form(form, form_state, field, instance, langcode, items, delta, element) {
  try {

    // Convert the form element to a hidden field since we'll populate it with
    // values dynamically later on.
    items[delta].type = 'hidden';

    // Make sure the widget is supported.
    var supported_widgets = [
      'location',
    ];
    if (!in_array(instance.widget.type, supported_widgets)) {
      console.log('WARNING: location_cck_field_widget_form() - widget type not supported! (' + instance.widget.type + ')');
      return;
    }

    // If we have an existing value, add it to the element.
    if (items[delta].item) {
      items[delta].value = items[delta].item.latitude + ',' + items[delta].item.longitude;
    }

    // For a latitude/longitude widget, we create two text fields and a button
    // to get the current position and fill in the two text fields.
    var onchange = '_location_cck_field_widget_form_change(this, \'' + items[delta].id + '\')';
    var latitude_id = items[delta].id + '-latitude';
    var latitude = {
      id: latitude_id,
      title: t('Latitude'),
      type: 'textfield',
      options: {
        attributes: {
          id: latitude_id,
          onchange: onchange,
          value: items[delta].item ? parseFloat(items[delta].item.latitude).toFixed(7) : ''
        }
      }
    };
    var longitude_id = items[delta].id + '-longitude';
    var longitude = {
      id: longitude_id,
      title: t('Longitude'),
      type: 'textfield',
      options: {
        attributes: {
          id: longitude_id,
          onchange: onchange,
          value: items[delta].item ? parseFloat(items[delta].item.longitude).toFixed(7) : ''
        }
      }
    };
    var options = {
      latitude: latitude.id,
      longitude: longitude.id
    };
    var btn = {
      id: items[delta].id + '-btn',
      text: t('Get current position'),
      type: 'button',
      options: {
        attributes: {
          onclick: '_location_cck_field_widget_form_click(\'' + latitude.id + '\', \'' + longitude.id + '\')'
        }
      }
    };
    items[delta].children.push(btn);
    items[delta].children.push(latitude);
    items[delta].children.push(longitude);

  }
  catch (error) { console.log('location_cck_field_widget_form - ' + error); }
}

/**
 * Handler for the "change" event.
 */
function _location_cck_field_widget_form_change(textfield, input) {
  try {
    // Depending on which textfield just changed values, grab the other one as
    // well, then build the latitude,longitude value for the hidden input.
    var which = $(textfield).attr('id');
    var other = which;
    if (which.indexOf('-latitude') != -1) { other = which.replace('-latitude', '-longitude'); }
    else {
      other = which.replace('-longitude', '-latitude');
      var swap = other;
      other = which;
      which = swap;
    }
    var value = $('#' + which).val() + ',' + $('#' + other).val();
    $('#' + input).val(value);
  }
  catch (error) { console.log('_location_cck_field_widget_form_change - ' + error); }
}

/**
 * Handler for the "click" event.
 */
function _location_cck_field_widget_form_click(latitude_id, longitude_id) {
  try {
    navigator.geolocation.getCurrentPosition(
      function(position) {
        // Place the coordinate values into the text fields, then force a change
        // event to fire.
        $('#' + latitude_id).val(position.coords.latitude);
        $('#' + longitude_id).val(position.coords.longitude).change();
      },
      function(error) {
        console.log('_location_cck_field_widget_form_click - getCurrentPosition', error);

        // Process error code.
        switch (error.code) {

           // PERMISSION_DENIED
          case 1:
            break;

          // POSITION_UNAVAILABLE
          case 2:
            break;

          // TIMEOUT
          case 3:
            break;

        }
      },
      {
        enableHighAccuracy: true
      }
    );
  }
  catch (error) { console.log('_location_cck_field_widget_form_click - ' + error); }
}

/**
 * Implements hook_assemble_form_state_into_field().
 */
function location_cck_assemble_form_state_into_field(entity_type, bundle, form_state_value, field, instance, langcode, delta, field_key) {
  try {
    console.log(form_state_value, 'form_state_value');
    console.log(field_key, 'field_key');
    console.log(field, 'field');
    if (empty(form_state_value)) { return null; }
    var coordinates = form_state_value.split(',');
    if (coordinates.length != 2) { return null; }
    // We don't want to use a key for this item's value.
    field_key.value = 'locpick';
    // Return the assembled value.
    return {
      user_latitude: coordinates[0],
      user_longitude: coordinates[1]
    };
  }
  catch (error) {
    console.log('location_cck_assemble_form_state_into_field - ' + error);
  }
}

/**
 * Implements hook_field_formatter_view().
 */
function location_cck_field_formatter_view(entity_type, entity, field, instance, langcode, items, display) {
  try {
    var element = {};
    $.each(items, function(delta, item) {
      $.each(instance.settings.location_settings.display.hide, function(property, value) {
        switch (property) {
          case 'additional':
          case 'city':
          case 'country':
          case 'country_name':
          case 'loc_pick':
          case 'name':
          case 'postal_code':
          case 'province':
          case 'province_name':
          case 'street':
            if (value) {
              delete item[property];
            }
            break;
          case 'coords':
            if (value) {
              delete item.latitude;
              delete item.longitude;
            }
            break;
          case 'map_link':
            if (value) {
            }
            break;
          default:
            break;
        }
      });
      element[delta] = {
        markup: theme('location', item)
      };
    });
    return element;
  }
  catch (error) { console.log('location_cck_field_formatter_view - ' + error); }
}

/**
 * Theme a location.
 */
function theme_location(variables) {
  try {
    var html = '';
    if (variables.street) { html += variables.street + '<br />'; }
    if (variables.additional) { html += variables.additional + '<br />'; }
    if (variables.city) { html += variables.city + ''; }
    if (variables.province || variables.province_name) {
      var province = variables.province ? variables.province : variables.province_name;
      if (variables.city) { html += ', '; }
      html += province + ' ';
    }
    if (variables.postal_code) { html += variables.postal_code + '<br />'; }
    else { html += '<br />'; }
    if (variables.country || variables.country_name) {
      var country = variables.country ? variables.country : variables.country_name;
      html += country + '<br />'; }
    if (variables.latitude) { html += 'Latitude: ' + variables.latitude + '<br />'; }
    if (variables.longitude) { html += 'Longitude: ' + variables.longitude + '<br />'; }
    return html;
  }
  catch (error) { console.log('theme_location - ' + error); }
}
