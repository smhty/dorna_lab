let script_index = [[], []]
let editor = CodeMirror.fromTextArea($(".script")[0], {
	lineNumbers : true,
	lineWrapping: true,
	matchBrackets: true,
	autoCloseBrackets: true,
	mode: "text/x-python",
	tabSize: 4,
	indentUnit: 4,
	indentGuide: true,
})

var charWidth = editor.defaultCharWidth(), basePadding = 4;
editor.on("renderLine", function(cm, line, elt) {
	var off = CodeMirror.countColumn(line.text, null, cm.getOption("tabSize")) * charWidth;
	elt.style.textIndent = "-" + off + "px";
	elt.style.paddingLeft = (basePadding + off) + "px";
});
editor.refresh();



$('.script_upload_b').click(function(e){
	e.preventDefault();

	let input_file = document.createElement('input');
	input_file.type = 'file';

	input_file.onchange = e => {
	    let input = e.target;

	    let reader = new FileReader();
	    reader.onload = function(){
	      	let text = reader.result;
	      	editor.setValue(text)
	        if(path_upload_promise!=null){
		    	path_upload_promise.then((value) =>{
		    		$('.script_convert_b').trigger("click")
					editor.setValue(value);
		    	})
		    	path_upload_promise = null
		    }
	    };

	    reader.readAsText(input.files[0]);

	}
	input_file.click();

})

$('.script_download_b').click(function(e){
	e.preventDefault();
	let mode = $(".script_mode_l").prop("value")

	let hiddenElement = document.createElement('a');
	let ext = "txt"
	//hiddenElement.href = 'data:attachment/text,' + encodeURI(yaml.dump(data));
	hiddenElement.href = 'data:attachment/text,' + encodeURIComponent(editor.getValue());
	hiddenElement.target = '_blank';
	hiddenElement.download = "code." + ext ;
	hiddenElement.click();

})


// handles
$('.script_play_b').on("click", function(e){
	e.preventDefault();

	try {
		script_index[2].clear()
	}
	catch(err) {
	}
	script_index = [[], []]
	let input_str = editor.getValue();
	
	let stack = [];

	let script_replay = $(".script_replay_c").prop("checked")
	let script_track = $(".script_track_c").prop("checked")

	let json_data = parse_script(input_str)
	let valid_msg = false
	if (json_data.length >= 1) {
		valid_msg = true
	}
	for (let i = 0; i < json_data.length; i++) {
	  let cmd = json_data[i]["data"];

		//add id and save indices of command
		if(script_track){
			cmd["id"] = json_data[i]["startLine"]+1
			script_index[0].push(cmd["id"])
			script_index[1].push(pair)
		}		
	  send_message(cmd, false, true)
	}	

	// replay
	if(script_replay && valid_msg){
		let cmd = {
			"cmd": "sleep",
			"time": 0.001,
			"id": 1
		}
		send_message(cmd, false, true)
	}
});

$('.script_convert_b').on("click", function(e){
	e.preventDefault();
	let cmd_index = 0;
	if(true){//if(confirm("All previously designed paths will be lost.")){
		chain.set_control_cmd(null)
		if(chain.delete_all_by_id()){

			script_index = [[], []]
			let input_str = editor.getValue();
			let stack = [];

			let valid_msg = false
			
		  	for(let i = 0; i < input_str.length; i++) {
				let ch = input_str.charAt(i);

				if(ch === '{') {
				  stack.push(i);
				}
				else if(ch === '}') {
				  try {
				    let start = stack.pop();

				    if(stack.length == 0) {
								let startPos = editor.posFromIndex(start);

								let end = i + 1;
								let endPos = editor.posFromIndex(end);
								let pair = [startPos, endPos];

								let msg = input_str.substring(start, end).replace(/[ \n\t\r]+/g,"");
								let json_str = JSON.parse(msg);

								valid_msg = true
								if(cmd_index==0 && json_str["cmd"]=="jmove"){
									chain.first.set_cmd(json_str)
								}
								else{
									chain.create_by_id(json_str, json_str["cmd"])
								}
								cmd_index++
				    }
				  } catch(e) {
				    console.log("Bad input format");
				  }
				}
			};
			chain.save_all()	
		}

	}
});


function highlight_editor(start, end, stat){
	return editor.markText(start, end, {className: "script_stat_"+ stat});
}

function add_to_editor(data){
	editor.replaceRange(JSON.stringify(data) +'\n', CodeMirror.Pos(editor.lastLine()))

	editor.focus()
	editor.setCursor({line: Infinity, ch: 0})	
}


$('.script_save_as_b').click(function(e){
	/*
	let path = $("#path_script_b").attr("data-key")
	 send_message({
	      "_server": "folder",
	      "func":"get",
	      "prm": [path] 
	 })
	*/
	save_dst = "script"
	save_mode();
	save_content = editor.getValue();
})
$('.script_save_b').click(function(e){
	if(script_file_name==""){
		$('.script_save_as_b').click();
	}
	else{
          send_message({
	      "_server":"folder",
	      "func": "save_file",
	      "prm": [script_file_path,script_file_name,editor.getValue()] 
	    })
	}
})

$('.script_open_b').click(function(e){
	/*
	let path = $("#path_script_b").attr("data-key")
	 send_message({
	      "_server":"folder",
	      "func": "get",
	      "prm": [path] 
	 })
	 */
	open_mode();
	open_dst = "script"
})

function change_script_file(data,name,dst,title){
  $('.script_file_v').attr("value",name)
  if(title=="") title = ""
  $('.script_file_v').text(title)
  script_file_name = name;
  script_file_path = dst;
}

$('.script_new_b').click(function(e){
	change_script_file(null,"","","");
	editor.setValue("")
})
$('.script_delete_b').click(function(e){
	editor.setValue("")
})
change_script_file(null,"","","");

function parse_script(fileContent) {
  const jsonObjects = [];
  const lines = fileContent.split('\n');
  let jsonString = '';
  let startLine = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim().startsWith('#')) {
      // Ignore comment lines
      startLine++;
      continue;
    }

    if (jsonString === '') {
      startLine = i + 1;
    }

    jsonString += line.trim();

    try {
      const jsonObject = JSON.parse(jsonString);

      if (typeof jsonObject === 'object' && jsonObject !== null) {
        // Push the parsed JSON object along with the start line number
        jsonObjects.push({ data: jsonObject, startLine });
      }

      jsonString = '';
    } catch (error) {
      // Ignore lines that do not form a valid JSON object
    }
  }

  return jsonObjects;
}

