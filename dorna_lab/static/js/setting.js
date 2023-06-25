$('.axis_c').on("change", function(e){
	set_ND()
})

$('.startup-b').on("click",function(e){
	e.preventDefault();
	send_message({"_server":"startup_set","text":$('.startup-v').val()});
})

$('.startup-cancel-b').on("click",function(e){
	e.preventDefault();
	send_message({"_server":"startup_get"});
})


$('.emergency-b').on("click",function(e){
	e.preventDefault();
	send_message({	"_server":"emergency",
					"key":"in"+$('.emergency-key-l').val(),
					"value":parseInt($('.emergency-val-l').val())});
});
$('.emergency-c').on("change", function(e){
	e.preventDefault();
	send_message({	"_server":"emergency",
					"enable":$('.emergency-c').prop("checked")});
})