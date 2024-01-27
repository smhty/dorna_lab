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




//Setting up a frame
function record_point(input){
	let joints = chain.robot.joints; //change this
	input.val("["+String(joints)+"]")
}

$('.frame_rec_b').on("click",function(e){
	e.preventDefault();
	let key = $(this).attr("data-key")
	record_point($('.frame_v[data-key="' + key + '"]'))
});

$('.tcp_rec_b').on("click",function(e){
	e.preventDefault();
	let key = $(this).attr("data-key")
	record_point($('.tcp_v[data-key="' + key + '"]'))
});

$('.frame_b_set').on("click",function(e){
	e.preventDefault();
	/*
	send_message({	"_server":"frame_set",
					"name":$('.frame_name_v').val(),
					"point_1":JSON.parse($('.frame_v[data-key="' + 1 + '"]').val()),
					"point_2":JSON.parse($('.frame_v[data-key="' + 2 + '"]').val()),
					"point_3":JSON.parse($('.frame_v[data-key="' + 3 + '"]').val()),
					"point_4":JSON.parse($('.frame_v[data-key="' + 4 + '"]').val())});
*/
	let msg = {		"name":$('.frame_name_v').val(),
					"point_1":JSON.parse($('.frame_v[data-key="' + 1 + '"]').val()),
					"point_2":JSON.parse($('.frame_v[data-key="' + 2 + '"]').val()),
					"point_3":JSON.parse($('.frame_v[data-key="' + 3 + '"]').val()),
					"point_4":JSON.parse($('.frame_v[data-key="' + 4 + '"]').val())};

	send_shell_python(os_info["tool_dir"] , "tcp-frame-generator.py "+"frame_set "+`\"`+JSON.stringify(msg).replaceAll("\"", `\\"`)  +`\"` );

});

$('.tcp_b_set').on("click",function(e){
	e.preventDefault();
	/*
	send_message({	"_server":"tcp_set",
					"name":$('.tcp_name_v').val(),
					"point_1":JSON.parse($('.tcp_v[data-key="' + 1 + '"]').val()),
					"point_2":JSON.parse($('.tcp_v[data-key="' + 2 + '"]').val()),
					"point_3":JSON.parse($('.tcp_v[data-key="' + 3 + '"]').val()),
					"point_4":JSON.parse($('.tcp_v[data-key="' + 4 + '"]').val()),
					"point_5":JSON.parse($('.tcp_v[data-key="' + 5 + '"]').val()),
					"point_6":JSON.parse($('.tcp_v[data-key="' + 6 + '"]').val()),
					"point_5_base_dir":$('.tcp-z-select-form').val(),
					"point_6_base_dir":$('.tcp-x-select-form').val()

				});
	*/
	let msg = {		"name":$('.tcp_name_v').val(),
					"point_1":JSON.parse($('.tcp_v[data-key="' + 1 + '"]').val()),
					"point_2":JSON.parse($('.tcp_v[data-key="' + 2 + '"]').val()),
					"point_3":JSON.parse($('.tcp_v[data-key="' + 3 + '"]').val()),
					"point_4":JSON.parse($('.tcp_v[data-key="' + 4 + '"]').val()),
					"point_5":JSON.parse($('.tcp_v[data-key="' + 5 + '"]').val()),
					"point_6":JSON.parse($('.tcp_v[data-key="' + 6 + '"]').val()),
					"point_5_base_dir":$('.tcp-z-select-form').val(),
					"point_6_base_dir":$('.tcp-x-select-form').val()

				};


	send_shell_python(os_info["tool_dir"] , "tcp-frame-generator.py "+"tcp_set "+`\"`+JSON.stringify(msg).replaceAll("\"", `\\"`)  +`\"` );

});

var tcp_dic;
var frame_dic;

function update_tcp_frame_list(msg){
	tcp_dic = msg["result"]["tcp_list"];
	frame_dic = msg["result"]["frame_list"];

	var tcp_dropdown = document.getElementById('tcp-list');
	var frame_dropdown = document.getElementById('frame-list');

	// Store the value of the selected item (if it exists)
	var tcp_selected = tcp_dropdown.value;
	var frame_selected = frame_dropdown.value;

	// Clear all existing elements in the dropdown
	tcp_dropdown.innerHTML = '';
	frame_dropdown.innerHTML = '';

	// Add two new elements to the dropdown
	let i = 0;
	for(i in tcp_dic){
		var option = document.createElement('option');
		option.value = i;
		option.text = i;
		tcp_dropdown.appendChild(option);
		if(i == tcp_selected){
			tcp_dropdown.value = i;
		}
	}
	for(i in frame_dic){
		var option = document.createElement('option');
		option.value = i;
		option.text = i;
		frame_dropdown.appendChild(option);
		if(i == frame_selected){
			frame_dropdown.value = i;
		}
	}
}

$("#tcp-list").on("change", function(e){
	var selected_item = $(this).val();
	send_message({"_server":"select_tcp",
				"name":selected_item});
});

$("#frame-list").on("change", function(e){
	var selected_item = $(this).val();
	send_message({"_server":"select_frame",
			"name":selected_item});
});


$("#frame-tcp-update").on("click", function(e){
	send_message({"_server":"config"});
});
