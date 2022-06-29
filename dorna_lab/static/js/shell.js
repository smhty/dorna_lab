let shell_editor = CodeMirror.fromTextArea($(".shell")[0], {
	/*lineNumbers : true,*/
	lineWrapping: true,
	matchBrackets: true,
	autoCloseBrackets: true,
	readOnly: false,
	mode: "application/x-sh",
	theme: "isotope",
})
shell_editor.refresh()

function shell_print(data, type= "") {
	let line_number = shell_editor.lineCount()

	if (line_number >= 1000) {
		shell_editor.replaceRange("", CodeMirror.Pos(0, 0), CodeMirror.Pos(1, 0))
	}

	// add time
	shell_editor.replaceRange(type+ data+'\n', CodeMirror.Pos(shell_editor.lastLine()))

}