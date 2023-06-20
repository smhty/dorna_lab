let log_editor = CodeMirror.fromTextArea($(".log")[0], {
	/*lineNumbers : true,*/
	lineWrapping: true,
	matchBrackets: true,
	autoCloseBrackets: true,
	mode: "application/json",
	
})

function log_print(data, type= "") {
	/*
	if (! $(".log_print_c").prop("checked")) {
		return 0
	}
	*/
	let line_number = log_editor.lineCount()

	if (line_number >= 1000) {
		log_editor.replaceRange("", CodeMirror.Pos(0, 0), CodeMirror.Pos(1, 0))
	}

	// add time
	let date = new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1")
	log_editor.replaceRange(type+"["+date+"] "+ data+'\n', CodeMirror.Pos(log_editor.lastLine()))

	// Scroll the last line into view
	if ($(".log_last_line_c").prop("checked")) {
		log_editor.scrollIntoView(log_editor.lastLine());	
	}
}

$( ".log_display_b" ).on("click", function(e) {
	$(".log_panel").toggle()
	onWindowResize()
});