$('.axis_c').on("change", function(e){
	set_ND()
})

$('.startup-b').on("click",function(e){
	e.preventDefault();
	send_message({"_server":"startup","text":$('.startup-v').val()});
})

$('.emergency-b').on("click",function(e){
	e.preventDefault();
	send_message({	"_server":"emergency",
					"enable":$('.emergency-c').prop("checked"),
					"key":"in"+$('.emergency-key-l').val(),
					"value":$('.emergency-val-l').val()});
});
$('.emergency-c').on("change", function(e){
	e.preventDefault();
	send_message({	"_server":"emergency",
					"enable":$('.emergency-c').prop("checked"),
					"key":"in"+$('.emergency-key-l').val(),
					"value":$('.emergency-val-l').val()});
})