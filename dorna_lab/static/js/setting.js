$('.axis_c').on("change", function(e){
	set_ND()
})

$('.startup-b').on("click",function(e){
	e.preventDefault();
	send_message({"_server":"startup","text":$('.startup-v').val()});
})