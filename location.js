/**
 *
 */
function location_cck_field_formatter_view(entity_type, entity, field, instance, langcode, items, display) {
  try {
    var element = {};
    $.each(items, function(delta, item) {
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
    if (variables.province) {
      if (variables.city) { html += ', '; }
      html += variables.province + ' ';
    }
    if (variables.postal_code) { html += variables.postal_code + '<br />'; }
    else { html += '<br />'; }
    if (variables.country) { html += variables.country + '<br />'; }
    return html;
  }
  catch (error) { console.log('theme_location - ' + error); }
}

