$('.out_c,.pwm_c,.gravity_c').on( 'click', function( e ) {
	e.preventDefault()
	let msg = {
		"cmd":  $(this).attr("data-cmd"),
	}
	msg[$(this).attr("data-key")] = $(this).prop("checked")? 1:0
	send_message(msg)
})

$('.in_c').on( 'click', function( e ) {
	e.preventDefault()
})

$(".pwm_b").on("click", function(e) {
	e.preventDefault()

	let msg = {"cmd":  $(this).attr("data-cmd")}
	let key = $(this).attr("data-key");
	msg[key] = $(`.pwm_c[data-key=${key}]`).prop("checked")? 1:0;

	msg[$(`.dc_n[data-key=${key}]`).attr("data-item")] = Number($(`.dc_n[data-key=${key}]`).prop("value"))
	msg[$(`.freq_n[data-key=${key}]`).attr("data-item")] = Number($(`.freq_n[data-key=${key}]`).prop("value"))
	send_message(msg)
});

$(".axis_b").on("click", function(e) {
	e.preventDefault()

	let msg = {"cmd":  $(this).attr("data-cmd")}
	let key = $(this).attr("data-key");

	msg[$(`.ratio_n[data-key=${key}]`).attr("data-item")] = Number($(`.ratio_n[data-key=${key}]`).prop("value"))
	send_message(msg)
});

$(".set_toollength_b").on("click", function(e) {
	e.preventDefault()
	let msg = {"cmd":  $(this).attr("data-cmd")}
	msg["toollength"] = Number($(`.toollength_n`).prop("value"))
	send_message(msg)
});

$(".set_gravity_b").on("click", function(e) {
	e.preventDefault()

	let msg = {"cmd":  $(this).attr("data-cmd")}
	$('.gravity_m_v').each(function(e){
		let key = $(this).attr("data-key");
		msg[key] = Number($(`.gravity_m_n[data-key=${key}]`).prop("value"));
	});

	send_message(msg)
});