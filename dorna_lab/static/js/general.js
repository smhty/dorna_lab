// hide and show script
$(".display_b").on("click", function (e){
	let display = $(this).attr("data-display")
	let visible = $("."+display).is(':visible')

	// hide all
	$(`.display_b`).each(function( index){
		$(this).prop('checked', false);
		$(this).parent().removeClass("active");

		let display = $(this).attr("data-display")
		$("."+display).hide() 
	})

	// show
	if (!visible) {
		$("."+display).show()

		$(this).prop('checked', true);
		$(this).parent().toggleClass("active");
	}
	
	editor.refresh()
	log_editor.refresh()
});	

$('[data-toggle="tooltip"]').tooltip({
    trigger : 'hover'
}) 

$(".graphic_switch").on("click", function (e){
	if(graphic){
		graphic = false;
		renderer.clearColor();
		container.removeChild( renderer.domElement );
	}
	else{
		graphic = true
		container.appendChild( renderer.domElement );
	}
});	


$( ".resize" ).resizable({
	handles: "e",
	containment: "parent"
});

$( ".resize_s" ).resizable({
	handles: "s",
	containment: "parent"
});
$( ".resize_e" ).resizable({
	handles: "e",
	containment: "parent",
	stop: function( event, ui ) {
		editor.refresh()
		log_editor.refresh()
	}

});

// close page alert
window.onbeforeunload = function (foo) {
	mes = "Are you sure ?";
	foo.returnValue = mes;
	return mes;
  };