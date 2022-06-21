//$('.toast_info').toast('show')

function add_note(type, msg="") {
	let toast_id = parseInt(1000+Math.random()*1000).toString()
	let note = ''
	if (type == "info"){
		let note = '<div class="toast '+toast_id+'" role="alert" aria-live="assertive" aria-atomic="true" data-autohide="false"> <div class="toast-header"> <strong class="mr-auto">ℹ️ Info</strong> <button type="button" class="ml-2 mb-1 close close_toast" data-dismiss="toast" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div> <div class="toast-body">Before start working with the robot make sure that:<ul> <li>All the joints are set to their true values.</li> <li>Motors are enabled.</li> </ul> </div> </div>' 		
		$(".note").append(note)	
	}
	else if( type == "home"){
		let note = '<div class="toast '+toast_id+'" role="alert" aria-live="assertive" aria-atomic="true" data-autohide="false"> <div class="toast-header"> <strong class="mr-auto">ℹ️ Info</strong> <button type="button" class="ml-2 mb-1 close close_toast" data-dismiss="toast" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div> <div class="toast-body">'+msg+'</div> </div>' 		
		$(".note").append(note)	
	}
	else if( type == "joystick_connected"){
		let note = '<div class="toast '+toast_id+'" role="alert" aria-live="assertive" aria-atomic="true"  data-autohide="false"> <div class="toast-header"> <strong class="mr-auto">🎮 Joystick</strong> <button type="button" class="ml-2 mb-1 close close_toast" data-dismiss="toast" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div> <div class="toast-body">Joystick is connected!</div> </div>'
		$(".note").append(note)
	}
	else if( type == "joystick_disconnected"){
		let note = '<div class="toast '+toast_id+'" role="alert" aria-live="assertive" aria-atomic="true" data-autohide="false"> <div class="toast-header"> <strong class="mr-auto">🎮 Joystick</strong> <button type="button" class="ml-2 mb-1 close close_toast" data-dismiss="toast" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div> <div class="toast-body">Joystick is disconnected!</div> </div>'
		$(".note").append(note)
	}
	else if( type == "alarm"){
		let note = '<div class="toast '+toast_id+'" role="alert" aria-live="assertive" aria-atomic="true" data-autohide="false"> <div class="toast-header"> <strong class="mr-auto">⚠️ Alarm</strong> <button type="button" class="ml-2 mb-1 close close_toast" data-dismiss="toast" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div> <div class="toast-body">Disable the alarm first.</div> </div>'
		$(".note").append(note)
	}else{
		return
	}
	$('.'+toast_id).toast({
		autohide: true,
		delay: 10000,
		animation: true
	})		
	$('.'+toast_id).toast('show')		

}

$(document).on('click', '.close_toast', function(e){ 
	e.preventDefault()
	$(this).closest(".toast").remove()
});

add_note("info")