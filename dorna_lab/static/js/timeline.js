var h_values = []
var slider = document.getElementById('values-slider');
var valuesForSlider = Array.from({length:5001},(v,k)=>k);

var format = {
    to: function(value) {
        return valuesForSlider[Math.round(value)];
    },
    from: function (value) {
        return valuesForSlider.indexOf(Number(value));
    }
};

noUiSlider.create(slider, {
    start: [0, 20, 50, 90],
    // A linear range from 0 to 15 (16 values)
    range: { min: 0, max: valuesForSlider.length - 1 },
    // steps of 1
    step: 1,
    tooltips: false,
    format: format,
    pips: { mode: 'steps', format: format},
});

// add time line
// change item i then drag all the remaining items after it
function add_timeline(slider) {
    // values: Current slider values (array);
    // handle: Handle that caused the event (number);
    // unencoded: Slider values without formatting (array);
    // tap: Event was caused by the user tapping the slider (boolean);
    // positions: Left offset of the handles (array);
    // noUiSlider: slider public Api (noUiSlider);
    data = {
        "values": values,
        "handle": handle,
        "unencoded": unencoded,
        "tap": tap,
        "positions": positions,
        "noUiSlider": noUiSlider,
    }
    console.log(data)
}

// change item i then drag all the remaining items after it
function set_plot(values, handle, unencoded, tap, positions, noUiSlider) {
    // values: Current slider values (array);
    // handle: Handle that caused the event (number);
    // unencoded: Slider values without formatting (array);
    // tap: Event was caused by the user tapping the slider (boolean);
    // positions: Left offset of the handles (array);
    // noUiSlider: slider public Api (noUiSlider);
    data = {
        "values": values,
        "handle": handle,
        "unencoded": unencoded,
        "tap": tap,
        "positions": positions,
        "noUiSlider": noUiSlider,
    }
    console.log(data)
}


// Binding namespaced events
slider.noUiSlider.on('set', set_plot);
