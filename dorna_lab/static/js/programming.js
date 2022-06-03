//editor type
var working_pid = -1

$(".editor_s").on("change", function(){
  let val = this.value//blockly_panel and python_panel
  setTimeout(function() { window.dispatchEvent(new Event('resize')); }, 200);
  // hide everything
  let display = $(this).attr("data-display")
  $("."+display).each(function( index){
    // check if d-flex exists
    if ($(this).hasClass("d-flex")) {
      $(this).removeClass("d-flex").addClass("d-none")
    }
    $(this).hide()
  })

  // visible current one
  if (true) {}
  if ($("."+val).hasClass("d-none")) {
    $("."+val).removeClass("d-none").addClass("d-flex")
  }
  $("."+val).show()

  python_editor.refresh()
  python_viewer.refresh()

  if(val=="blockly_panel"){
    $('.blockly_file_v').attr("value",blkly_file_name)
    let txt = blkly_file_name
    if(txt=="")txt=""
    $('.blockly_file_v').text(txt)
  }
  if(val=="python_panel"){
    $('.blockly_file_v').attr("value",python_file_name)
    let txt = python_file_name
    if(txt=="")txt=""
    $('.blockly_file_v').text(txt)
  }


})
//saving process.
var blkly_file_name = ""
var blkly_file_path = ""

var python_file_name = ""
var python_file_path = ""


var xml_initial = '<xml xmlns="https://developers.google.com/blockly/xml"><block type="code" id="XJ}//PDMs0.pK*:;k2ds" x="90" y="70"><field name="input">import time&amp;#10;from dorna2 import Dorna&amp;#10;</field><next><block type="method" id="xW#O_,PzTjYigb~/{g~T"><field name="name">main(robot)</field><statement name="statement"><block type="jmove" id="FI7^l7V3(JBhzLTwutbH"><statement name="inputs"><block type="set_label" id="[m^#|aeFxkr8|yXAhw#A"><value name="label"><block type="label_text" id="x_XtBII,Fu2Qc4g|ah3S"><field name="label">timeout</field></block></value><value name="input"><block type="math_number" id="S21SPQgy[w(}`2?5^8hS"><field name="NUM">-1</field></block></value><next><block type="set_label" id="7dUhs[ixOw/3@6!H+qK="><value name="label"><block type="val_list" id="p(en7`1!*{|bikqE!n|l"><field name="label">rel</field></block></value><value name="input"><block type="num_0_1_1"><field name="NUM">0.0</field> </block></value><next><block type="set_label" id="+8N9@z:OcUQ%nY{Oy3;S"><value name="label"><block type="rapid_list" id="lKYRah]:%k,[)[Bk_mxJ"><field name="label">vel</field></block></value><value name="input"><block type="math_number" id="pzuEC#)m^*]=nQ@kpkzc"><field name="NUM">0</field></block></value><next><block type="set_label" id="E:s{fJ5_We9/6T3f|+0`"><value name="label"><block type="coord_list" id="Bv+DwLoyXsMb#_n1UKla"><field name="label">j0</field></block></value><value name="input"><block type="math_number" id="Zlboj([$wlTKe|i:exON"><field name="NUM">0</field></block></value></block></next></block></next></block></next></block></statement></block></statement><next><block type="code" id="sv?-N%V{]OMvW~Z=L38?"><field name="input">if __name__ == "__main__":&amp;#10;    robot = Dorna()&amp;#10;    robot.connect(host="localhost", port=443)&amp;#10;    main(robot)&amp;#10;    robot.close()</field></block></next></block></next></block></xml>'
let python_viewer = CodeMirror.fromTextArea($(".python_viewer")[0], {
  lineNumbers : true,
  lineWrapping: true,
  matchBrackets: true,
  autoCloseBrackets: true,
  readOnly: true,
  mode: "text/x-python",
  tabSize: 4,
  indentUnit: 4
})
python_viewer.refresh();


let python_editor = CodeMirror.fromTextArea($(".python_editor")[0], {
  lineNumbers : true,
  lineWrapping: true,
  matchBrackets: true,
  autoCloseBrackets: true,
  mode: "text/x-python",
  tabSize: 4,
  indentUnit: 4
})
python_editor.refresh();


var toolbox = '<xml>';
toolbox    += '  <block type="controls_if"></block>';
toolbox    += '  <block type="controls_whileUntil"></block>';
toolbox    += '</xml>';


var blocklyArea = document.getElementById('blocklyArea');
var blocklyDiv = document.getElementById('blocklyDiv');
var workspace = Blockly.inject('blocklyDiv',
  {toolbox: document.getElementById('toolbox'),     

  grid:
     {spacing: 20,
      length: 3,
      colour: '#ccc',
      snap: true},    

  zoom:
     {controls: true,
      wheel: true,
      startScale: 1.0,
      maxScale: 3,
      minScale: 0.3,
      scaleSpeed: 1.1,
      pinch: true},

    scrollbars: {
      horizontal: true,
      vertical: true
    },

    drag: true,

    wheel: false,

  trashcan: true});

Blockly.Python.INDENT = "\t";

var onresize = function(e) {
  if(true){//($('.active.tab-pane').hasClass('program-pane')){
    if( blocklyArea.offsetWidth * blocklyArea.offsetHeight > 0){
      // Compute the absolute coordinates and dimensions of blocklyArea.
      var element = blocklyArea;
      var x = 0;
      var y = 0;
      
      do {
        x += element.offsetLeft;
        y += element.offsetTop;
        element = element.offsetParent;
      } while (element);
      
      // Position blocklyDiv over blocklyArea.
      blocklyDiv.style.left = x + 'px';
      blocklyDiv.style.top = y + 'px';
      blocklyDiv.style.width = blocklyArea.offsetWidth + 'px';
      blocklyDiv.style.height = blocklyArea.offsetHeight + 'px';

      $('.blocklySvg').attr("width",blocklyArea.offsetWidth + 'px')
      $('.blocklySvg').attr("height",blocklyArea.offsetHeight + 'px')

      Blockly.svgResize(workspace);
    }
  }
};

window.addEventListener('resize', onresize, false);
onresize();

workspace.addChangeListener(function() {
  let code = Blockly.Python.workspaceToCode(workspace);

  //code = "def main(robot):\n"+"\t" + code + "\n" + "if __name__ == '__main__':\n"
  //  + "\tfrom dorna2 import dorna\n" + "\trobot = dorna()\n" + "\tmain(robot)";
  python_viewer.setValue(code)
});

function change_blockly_file(data,name,dst,title){
  $('.blockly_file_v').attr("value",name)
  //if(title=="")title = ""
  $('.blockly_file_v').text(title)
  blkly_file_name = name;
  blkly_file_path = dst;
}
function change_python_file(data,name,dst,title){
  $('.blockly_file_v').attr("value",name)
  //if(title=="")title = "None"
  $('.blockly_file_v').text(title)
  python_file_name = name;
  python_file_path = dst;
}
function set_pid(pid){
  if(pid<0){
    $('.blockly_process_id_v').text("");
    working_pid = -1;
  }
  else{
    $('.blockly_process_id_v').text(" - "+String(pid));
    working_pid = pid;
  }
}

function export_blockly_data(){
  var xml = Blockly.Xml.workspaceToDom(workspace);
  return Blockly.Xml.domToText(xml);
}
function import_blockly_data(data){
  let s = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(workspace));
  if (s!=data){
    if (!confirm("All unsaved blocks will be lost!")){
      return 0
    }

  }
  workspace.clear();
  var xml = Blockly.Xml.textToDom(data);
  Blockly.Xml.domToWorkspace(xml, workspace);

}
function import_python_data(data){
  if (python_editor.getValue()!=data){
    if (!confirm("All unsaved python codes will be lost!")){
      return 0
    }

  }
  python_editor.setValue(data)

}


$('.blockly_new_b').click(function(e){

  if($(".editor_s").val()=="blockly_panel"){
      workspace.clear();

      var xml = Blockly.Xml.textToDom(xml_initial );
      Blockly.Xml.domToWorkspace(xml, workspace);

      blkly_file_name = "";
      blkly_file_path = "";
      change_blockly_file(null,"","","");
  }
  if($(".editor_s").val()=="python_panel"){
      change_python_file(null,"","","");
      import_python_data("")
  }
})

$('.blockly_save_b').click(function(e){
  if($(".editor_s").val()=="blockly_panel"){
      save_dst = "blockly"
      if(blkly_file_name==""){

        let path = $("#path_blk_b").attr("data-key")
        send_message({
            "_server":"folder",
           "func": "get",
            "prm": [path] 
        })

        save_mode();
        save_content = export_blockly_data();
        save_content2 = python_viewer.getValue();
      }
      else{
        send_message({
        "_server":"folder",
        "func": "save_file",
        "prm": [blkly_file_path,blkly_file_name,export_blockly_data()] 
        })
        send_message({
        "_server":"folder",
        "func": "save_file",
        "prm": [blkly_file_path, blkly_file_name.slice(0,blkly_file_name.lastIndexOf("."))+".py"  , python_viewer.getValue()] 
        })
      }
  }
  if($(".editor_s").val()=="python_panel"){
    save_dst = "python"
    if(python_file_name==""){
        save_mode();
        let path = $("#path_py_b").attr("data-key")
        send_message({
            "_server":"folder",
           "func": "get",
            "prm": [path] 
        })
        save_content = python_editor.getValue();
      }
    else{
        send_message({
        "_server":"folder",
        "func": "save_file",
        "prm": [python_file_path,python_file_name,python_editor.getValue()] 
        })
      }
  }
})
$('.blockly_save_as_b').click(function(e){
  if($(".editor_s").val()=="blockly_panel"){
      let path = $("#path_blk_b").attr("data-key")
      send_message({
            "_server":"folder",
           "func": "get",
            "prm": [path] 
      })
      save_dst = "blockly"
      save_mode();
      save_content = export_blockly_data();
      save_content2 = python_viewer.getValue();
  }
  if($(".editor_s").val()=="python_panel"){
      let path = $("#path_py_b").attr("data-key")
      send_message({
            "_server":"folder",
           "func": "get",
            "prm": [path] 
      })
      save_dst = "python"
      save_mode();
      save_content = python_editor.getValue();
  }
})

$('.blockly_open_b').click(function(e){
  open_mode();
  if($(".editor_s").val()=="blockly_panel"){
    open_dst = "blockly"
    let path = $("#path_blk_b").attr("data-key")
    send_message({
            "_server":"folder",
           "func": "get",
            "prm": [path] 
    })
  }
  if($(".editor_s").val()=="python_panel"){
    open_dst = "python"
    let path = $("#path_py_b").attr("data-key")
    send_message({
            "_server":"folder",
           "func": "get",
            "prm": [path] 
    })
  }
})

$('.blockly_upload_b').click(function(e){

  let input_file = document.createElement('input');
  input_file.type = 'file';
  input_file.onchange = e => {
      let input = e.target;
      let reader = new FileReader();
      reader.onload = function(){
          let text = reader.result;
          if($(".editor_s").val()=="blockly_panel")
            import_blockly_data(text);
          if($(".editor_s").val()=="python_panel")
            import_python_data(text);
      };
      reader.readAsText(input.files[0]);
  }
  input_file.click();

})

$('.blockly_download_b').click(function(e){
  let hiddenElement = document.createElement('a');
  hiddenElement.target = '_blank';
  if($(".editor_s").val()=="blockly_panel"){
    hiddenElement.href = 'data:attachment/text,' + encodeURIComponent(export_blockly_data());   
    hiddenElement.download = "blockly_code.blk" ;
  }
  if($(".editor_s").val()=="python_panel"){
    hiddenElement.href = 'data:attachment/text,' + encodeURIComponent(python_editor.getValue());
    hiddenElement.download = "python_code.py" ;
  }


  hiddenElement.click();
})

$('.blockly_delete_b').click(function(e){
  if($(".editor_s").val()=="blockly_panel")
    workspace.clear();
  if($(".editor_s").val()=="python_panel")
    import_python_data("")
})

var first_time_programming = true

$('#pills-programming-tab-python , #pills-programming-tab-blockly ').on("click",function(e){
  if($(this).attr("id") == "pills-programming-tab-python" )
    $(".editor_s").val("python_panel")

  if($(this).attr("id") == "pills-programming-tab-blockly" ){
    $(".editor_s").val("blockly_panel")
    setTimeout(function() { window.dispatchEvent(new Event('resize')); 
      if(first_time_programming)
         $('.blockly_new_b').click()
      first_time_programming = false
    }, 200);
  }

  $(".editor_s").change()


  
});

$('#pills-main-tab').on("click",function(e){
  setTimeout(function() { window.dispatchEvent(new Event('resize')); }, 200);
});




//trying expandable blocks



function ListBlockStructure(block, inputCount = 0) {
  block.type = 'lists_create_with';
  if (inputCount === 0) {
    block.inputList.length =  1;
    const input = block.inputList[0];
    input.type = Blockly.DUMMY_INPUT;
    input.name = 'EMPTY';
    block.getField('MINUS')= null;
    block.toString() = 'create empty list';
    return;
  }

  block.inputList.length = inputCount;
  for (let i = 0; i < inputCount; i++) {
    block.inputList[i].name = 'ADD' + i;
  }
  //assert.isNotNull(block.getField('MINUS'));
  //assert.notEqual(block.toString(), 'create empty list');
}

$('.blockly_kill_b').click(function(e){
  if(working_pid>0)
     send_message({
        "_server":"kill",
        "prm": [Number(working_pid)] 
      });
});

$('.blockly_play_b').click(function(e){
  let code = ""
  if($(".editor_s").val()=="blockly_panel")
    code = python_viewer.getValue();
  if($(".editor_s").val()=="python_panel")
    code = python_editor.getValue();

  let name = ""
  let path = ""

  if(($(".editor_s").val()=="blockly_panel"&&blkly_file_name=="")||($(".editor_s").val()=="python_panel"&&python_file_name=="")){
    /*
    name = "temp.py"
    path = $("#path_b").attr("data-key");
    */
    if(confirm("You need to save your work first. Do you want to do it now?")){
      alert("click PLAY again after you were done saving!")
      $('.blockly_save_as_b').click();
    }
    return 0;
  }
  
  else{
    if($(".editor_s").val()=="blockly_panel"){
      name = blkly_file_name.slice(0,blkly_file_name.lastIndexOf('.')) + '.py';
      path = blkly_file_path;
    }
    if($(".editor_s").val()=="python_panel"){
      name = python_file_name;
      path = python_file_path;
    }
  }
  $('.blockly_save_b').click()

  send_message({
    "_server":"folder",
    "func": "save_file",
    "prm": [path,name,code] 
  })

  setTimeout(function() { 
  //send_message({"cmd": "sudo python3 "+path+'/'+name}, "shell")
    send_message({
    "_server":"shell",
    "prm": ["sudo python3 "+path+'/'+name],
    "dir": path
  })
  }, 200);
  
})


$('.shell_submit_b').click(function(e){

    //send_message({"cmd": $(".shell_cmd_v").val() }, "shell")
    send_message({
      "_server":"shell",
      "prm": [$(".shell_cmd_v").val()] 
    })
    $(".shell_cmd_v").val("")

})


$('.sessions_b').click(function(e){
  $('#sessions_modal').modal('show');
})

var sessions_list = [];

function update_sessions_list(msg){
  let l = JSON.parse(msg)
  if (l.length == 0)
    return 0;

  let list = document.getElementById("sessionsList");
  $(list).empty();

  sessions_list = [];
  for(b in l){
      let a = l[b]
      let dis_str = "";
      sessions_list.push({"id":a[0],"state":a[3]});

      if (a[3]=="Ended"){
        dis_str = "disabled = true"
      }
      let elem = `<div class="list-group-item p-2 rounded-0">
              <div class="d-flex w-100">
                <div> <i class="fa fa-code"></i> `+a[4]+`</div>
                <small class="ml-auto mt-auto mb-auto">`+a[3]+`</small>
              </div>              
              <div class="d-flex w-100">
                <small class="mt-auto mb-auto"> <b> Process ID: </b>  ` + a[0] +`</small>
                <div class="mt-auto mb-auto ml-1 mr-1">&bull;</div>
                <small class="mt-auto mb-auto"> <b> Started:  </b> `+ a[1] +`</small>
                <div class="mt-auto mb-auto ml-1 mr-1">&bull;</div>
                <small class="mt-auto mb-auto"> <b> Ended: </b>  `+a[2]+`</small>
                <button type="button" class="btn btn-danger btn-sm rounded-0 ml-auto kill_btn" data-key=`+a[0]+" "+dis_str+ ` >End Process</button>
              </div>              
            </div>`
      
      $(elem).appendTo(list);
  }


  $(".kill_btn").on("click", function(e) {
    let id = $(this).attr("data-key")

    //send_message({"prm": id}, "kill")
      send_message({
      "_server":"kill",
      "prm": [Number(id)] 
    })
  });

}

function call_for_sessions_list(){
  //send_message({"cmd": "db.db_class().db_call","prm": ["SELECT * FROM program"]});
  send_message({
      "_server":"db",
      "prm": ["SELECT * FROM program"] 
    })
}

$('.sessions-update-btn').click(function(e){
    call_for_sessions_list()
})

setInterval(function () {call_for_sessions_list()}, 5000);

/*gives back all data: send_message({"cmd": "db.db_class().db_call",
      "prm": ["SELECT * FROM program"]})

  writes new data:
  send_message({"cmd": "db.db_class().db_call",
      "prm": ["INSERT INTO program VALUES (16,'hello' , 'bye' , 'done' )"]})
      */