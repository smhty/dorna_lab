$(".alarm_b").on("click", function(e) {
  e.preventDefault();
	let msg = {
		"cmd":  $(this).attr("data-cmd"),
		"alarm": 0
	}
	send_message(msg)
});