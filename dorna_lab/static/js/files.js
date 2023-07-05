
var path_design_file_name = ""
var path_design_file_path = ""
var script_file_name = ""
var script_file_path = ""



function empty_file_list(){
  list = document.getElementById("fileList");
  $(list).empty(); //maybe better to use .remove() ?
}
function reload_file_list(){
  let path = $("#path_b").attr("data-key")
  send_message({
    "_server":"folder",
    "func": "get",
    "prm": [path] 
  })
}
function btn_drp_down_folder(item) {
  return`<div class="flex-grow-1"></div>
    <div class="border-left"> <button id="btnGroupDrop1" type="button" class="btn" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><i class="fas fa-ellipsis-h"></i>
    </button>
    <div class="dropdown-menu" aria-labelledby="btnGroupDrop1" style="">
      <button class="dropdown-item rename_b" ftype="folder" data-key="`+item+`">Rename </button>
      <button class="dropdown-item delete_b" ftype="folder" data-key="`+item+`">Delete </button>
      <button class="dropdown-item copy_b" ftype="folder" data-key="`+item+`">Copy </button>
      <button class="dropdown-item duplicate_b" ftype="folder" data-key="`+item+`">Duplicate </button>
    </div></div> `;
}
function btn_drp_down_file(item,path) {/*id="btnGroupDrop1"*/
  var tot_path = path+"/"+item;
  return `<div class="flex-grow-1"></div>
    <div class="border-left"><button type="button" class="btn file_drp_dwn_btn" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" path="`+tot_path+`"><i class="fas fa-ellipsis-h"></i>
    </button>
    <div class="dropdown-menu" aria-labelledby="btnGroupDrop1" style="">
      <button class="dropdown-item rename_b" ftype="file" data-key="`+item+`">Rename   </button>
      <button class="dropdown-item delete_b" ftype="file" data-key="`+item+`">Delete  </button>
      <button class="dropdown-item copy_b" ftype="file" data-key="`+item+`">Copy </button>
      <button class="dropdown-item duplicate_b" ftype="file" data-key="`+item+`">Duplicate </button>
      <button class="dropdown-item download_b" ftype="file" data-key="`+item+`">Download </button>
      <button class="dropdown-item btn_clp_brd" path="`+tot_path+`" data-clipboard-target="#file_address_input" >Copy Address </button>
    </div></div> `;
}


var path_history = []
var path_history_jump_once = false

var copy_src = ""
var copy_src_name = ""
var copy_src_type = "folder"
var copy_duplicate_flag = false

var open_file_name = ""
var open_file_name_2 = ""
var open_dst = ""

var wait_for_download = false; 
var download_name = "";

var save_path = ""
var save_content = ""
var save_content2 = ""
var save_name = ""
var save_dst = ""

var explorer_mode = 0   // 0 is none, 1 is save, 2 is open

var clipboard = new ClipboardJS('.btn_clp_brd');


function update_file_list(msg){
  open_file_name = ""
  list = document.getElementById("fileList");
  empty_file_list();

  if(!path_history_jump_once){
    path_history.push($("#path_b").attr("data-key"))
    if(path_history>10)
      path_history.shift()
  }
  else{
    path_history_jump_once = false
  }

  $("#path_b").text(msg["path"]);
  $("#path_b").attr("data-key",msg["path"]);



  if(true){//creating the breadcrumb
    $("#breadcrumb_area").prop("style").display = "";
    $("#path_b").prop("style").display = "none";

    let path_rest = msg["path"].slice(1,msg["path"].length);
    let path_here = "";
    //javad
    crumb_list = document.getElementById("path_breadcrumb_id");
    $(crumb_list).empty();

    while(path_rest.length>0){
      let ss = "";
      if(path_rest.indexOf("/")>-1){
        ss = path_rest.slice(0,path_rest.indexOf("/"));
        path_rest = path_rest.slice(path_rest.indexOf("/")+1,path_rest.length);
      }
      else{
        ss = path_rest;
        path_rest = "";
      }

      path_here = path_here +"/" +ss;
      if(ss=="")break;
      elem =`<li class="breadcrumb-item"><a href="#" class="crumb" data-key="`+path_here+`">`+ss+`</a></li>`;
      if(path_rest==""){
        elem =`<li class="breadcrumb-item" aria-current="page">`+ss+`</li>`;
      }
      $(elem).appendTo(crumb_list);
    }

    $(".crumb").on("click", function(e) {
      e.preventDefault();
        send_message({
          "_server":"folder",
          "func": "get",
          "prm": [$(this).attr("data-key")] 
      });
    });
  }


  for( a in msg["folder"]){
        let item = msg["folder"][a];
        let elem =`<div class="list-group-item list-group-item-action d-flex p-0 rounded-0 f-list-group-item" data-key="`+item+`">
            <button type="button" class="btn btn-ligh rounded-0 btn folder_b"  data-key="`+item+`">
                <i class="fas fa-folder"></i>
                `+item+`
            </button>`
         + btn_drp_down_folder(item) + `</div>`;
        
        $(elem).appendTo(list);
  }
  for( a in msg["file"]){
        let item = msg["file"][a];
        let elem =`<div class="list-group-item list-group-item-action d-flex p-0 rounded-0 f-list-group-item" data-key="`+item+`">
            <button type="button" class="btn btn-ligh rounded-0 btn file_b"  data-key="`+item+`">
                <i class="far fa-file"></i>
                `+item+`
            </button>`
         + btn_drp_down_file(item,$("#path_b").attr("data-key")) + `</div>`;
        $(elem).appendTo(list);
  }
  
  $(".folder_b").on("click", function(e) {
    // init path
    let path = $("#path_b").attr("data-key") + "/" + $(this).attr("data-key");

    // send server
    send_message({
      "_server":"folder",
      "func": "get",
      "prm": [path] 
    })
  });


  $(".file_b").on("click", function(e) {
    let name = $(this).attr("data-key");
    open_file_name = name;
    open_file_name_2 = name;

    $(".list-file").children().each(function( index){

      $(this).removeClass( "active" );
    })
    $(this).parent().addClass("active");

    let pathname = $("#path_b").attr("data-key") + "/" + name;
    $("#file_address_input").attr("value",pathname);

  });
  /*
  $(".f-list-group-item").on("click", function(e) {
    let key = $(this).attr("data-key");
    $(`.file_b[data-key=${key}]`).trigger('click');
  });
  */
  $(".rename_b").on("click", function(e) {
    let name = $(this).attr("data-key")
    let type = $(this).attr("ftype")
    let path = $("#path_b").attr("data-key") 

    let new_name = prompt("Change the name of the " + type + " \"" + name +"\" to:", "");

    if (new_name == null || new_name == ""){
      return 0;
    }

    if(type=="folder"){
      send_message({
        "_server":"folder",
      "func": "rename",
        "prm": [path+"/"+name , path+"/"+new_name] 
      })
    }
    if(type=="file"){
      let format = name.slice(name.lastIndexOf(".")+1, name.length);
      let new_name_formatted = new_name;
      if(new_name.lastIndexOf(".")>-1)
        new_name_formatted = new_name.slice(0,new_name.lastIndexOf("."))
      new_name_formatted = new_name_formatted + "." + format;
      
      send_message({
        "_server":"folder",
      "func": "rename",
        "prm": [path+"/"+name , path+"/"+new_name_formatted] 
      });
    }
        setTimeout(function(){reload_file_list();}, 500);

  });

  $(".delete_b").on("click", function(e) {
    let name = $(this).attr("data-key")
    let type = $(this).attr("ftype")
    let path = $("#path_b").attr("data-key") 

    if(!confirm("Are you sure, you want to delete the " + type + " \"" + name +"\"?")){
      return 0;
    }

    if(type=="folder"){
      send_message({
        "_server":"folder",
        "func": "folder_delete",
        "prm": [path+"/"+name] 
      })
    }
    if(type=="file"){
      send_message({
        "_server":"folder",
        "func": "file_delete",
        "prm": [path+"/"+name] 
      })
    }
    setTimeout(function(){reload_file_list();}, 500);
  });

  $(".copy_b").on("click", function(e) {
    let name = $(this).attr("data-key")
    let type = $(this).attr("ftype")
    let path = $("#path_b").attr("data-key") 
    copy_src = path + "/" + name;
    copy_src_type = type;
    copy_src_name = name;
  });
  $(".duplicate_b").on("click", function(e) {
    let name = $(this).attr("data-key")
    let type = $(this).attr("ftype")
    let path = $("#path_b").attr("data-key") 
    copy_src = path + "/" + name;
    copy_src_type = type;
    copy_src_name = name;
    copy_duplicate_flag = true;
    $(".paste_b").trigger("click");
  });

  $(".download_b").on("click", function(e) {
    download_name = $(this).attr("data-key")
    let path = $("#path_b").attr("data-key") 
    wait_for_download = true;
    send_message({
      "_server":"folder",
    "func": "open_file",
      "prm": [path+"/"+download_name] 
    })
    
  });
  
  $(".file_drp_dwn_btn").on("click", function(e) {
    let path = $(this).attr("path")
    $("#file_address_input").attr("value",path);

    $(".list-file").children().each(function( index){
      $(this).removeClass( "active" );
    });
    $(this).parent().parent().addClass("active");

  });
}

const copyToClipboardAsync = str => {
  if (navigator && navigator.clipboard && navigator.clipboard.writeText)
    return navigator.clipboard.writeText(str);
  return Promise.reject('The Clipboard API is not available.');
};

$("#path_b").on("click", function(e) {
	// init path
	let path = $(this).attr("data-key")
  
	// add to the path/*
  //$(this).prevAll().each(function(){
  //	path = $(this).attr("data-key")+ "/" + path
  //})

  // send server
  send_message({
  	"_server":"folder",
    "func": "get",
  	"prm": [path] 
  })
});

$(".back_folder_b").on("click", function(e) {
  if(path_history.length>=1){
    path_history_jump_once = true;
    let last_path = path_history.pop()
    send_message({
      "_server":"folder",
    "func": "get",
      "prm": [last_path] 
    })
  }
});


$(".up_folder_b").on("click", function(e) {
  let path = $("#path_b").attr("data-key");
  let ind = path.lastIndexOf("/");
  path = path.slice(0,ind );
  if(path.length>3)
    send_message({
      "_server":"folder",
    "func": "get",
      "prm": [path] 
    })
});

$(".home_folder_b").on("click", function(e) {
  let path = $("#path_home_b").attr("data-key")
    send_message({
      "_server":"folder",
    "func": "get",
      "prm": [path] 
    });
});

$(".example_folder_b").on("click", function(e) {
  let path = $("#path_example_b").attr("data-key")
    send_message({
      "_server":"folder",
    "func": "get",
      "prm": [path] 
    });
});

$(".wizard_folder_b").on("click", function(e) {
  let path = $(this).attr("data-key")
    send_message({
      "_server":"folder",
    "func": "get",
      "prm": [path] 
    });
});

$(".new_folder_b").on("click", function(e) {
    let path = $("#path_b").attr("data-key")
    let new_folder_name = "new_folder";
    /*
    let folder_list = []
    $(".folder_b").each(function(){
      folder_list.push(console.log($(this).attr("data-key")))
    })
    
    let new_folder_name = "new_folder";
    let i = 0;
    while( i<10){
      let exist = false;
      for (k in folder_list){
        if(i==0){
          if (folder_list[k] == "new_folder"){
            exist = true
            console("hi1")
          }
        }
        else{
          if (folder_list[k] == "new_folder"+i){
            exist = true
            console("hi2")
          }
        }

      }

      if(!exist) break;
      i = i + 1;
    }

    if(i>0) new_folder_name = new_folder_name + i
      console.log(i)
    */
    send_message({
      "_server":"folder",
      "func": "folder_new",
      "prm": [path+"/"+new_folder_name] 
    })
    setTimeout(function(){reload_file_list();}, 500);

    
});

$(".paste_b").on("click", function(e) {
    if(copy_src==""){
      return 0;
    }
    let path_new = "";
    if(copy_duplicate_flag){
      copy_duplicate_flag = false;
      if(copy_src_type=="folder"){
       path_new = copy_src + "_copy";
      }
      if(copy_src_type=="file"){
       path_new = copy_src.slice(0 , copy_src.lastIndexOf(".")) + "_copy" + copy_src.slice(copy_src.lastIndexOf(".") , copy_src.length);
      }

    }
    else{
      path_new = $("#path_b").attr("data-key") + "/" + copy_src_name;
    }
    let path_old = copy_src;
    copy_src = "";

    if(copy_src_type=="file")
    send_message({
      "_server":"folder",
    "func": "file_copy",
      "prm": [path_old,path_new] 
    })
    if(copy_src_type=="folder")
    send_message({
      "_server":"folder",
    "func": "folder_copy",
      "prm": [path_old,path_new] 
    })
    setTimeout(function(){reload_file_list();}, 500);
   
    
});



//$("#path_b").trigger("click");

function save_mode(){
  explorer_mode = 1;
  $('.file_save_b').prop("style").display = "";
  $('.file_open_b').prop("style").display = "none";
  $('#file_modal').modal('show');
}

function open_mode(){
  explorer_mode = 2;
  $('.file_save_b').prop("style").display = "none";
  $('.file_open_b').prop("style").display = "";
  $('#file_modal').modal('show');

}

function empty_mode(){
  explorer_mode = 0;
  reload_file_list();
  $('.file_save_b').prop("style").display = "none";
  $('.file_open_b').prop("style").display = "none";
}//empty_mode();

$( "#file_modal" ).on('shown.bs.modal', function(){
  let path = $("#path_b").attr("data-key");
  send_message({
    "_server":"folder",
    "func": "get",
    "prm": [path] 
  })

});

$('.file_save_b').on("click",function(e) {
  const d = new Date();
  let gs = d.toISOString().replaceAll(" ","-").replaceAll(":","-")

  let name =  prompt("Name:",gs.slice(0,Math.max(5,gs.lastIndexOf("."))) );
  if(name==null){return 0;}
  
  if(save_dst=="blockly"){
    name = name + ".blk";
  }
  else{
    if(save_dst=="python")
      name = name + ".py";
    else
      name = name + ".txt";
  }

  $('#file_modal').modal('hide');
  let path = $("#path_b").attr("data-key");

  send_message({
    "_server":"folder",
    "func": "save_file",
    "prm": [path,name,save_content] 
  })

  if(save_dst=="blockly"){
    send_message({
      "_server":"folder",
      "func": "save_file",
      "prm": [path,name.slice(0,name.lastIndexOf("."))+".py",save_content2] 
    })
  }

  open_file_name_2 = name
  open_dst = save_dst

  setTimeout(function() { 
    $('.file_open_b').click();
  }, 500);
  
  empty_mode();

});

$('.file_open_b').on("click", function(e) {

  if(open_file_name_2 != ""){
    open_file_name = open_file_name_2;
  }
  if (open_file_name != ""){
    let path = $("#path_b").attr("data-key");

    send_message({
      "_server":"folder",
      "func": "open_file",
      "prm": [path+"/"+open_file_name] 
    })
 
    $('#file_modal').modal('hide');
    empty_mode();
  }

});





$('.file_cancel_b').on("click", function(e) {
  $('#file_modal').modal('hide');
  explorer_mode = 0;
});

function file_open_result(data){
  if(open_file_name_2 != ""){
    open_file_name = open_file_name_2;
    open_file_name_2 = "";
  }
  if(wait_for_download){
    wait_for_download = false;

    let hiddenElement = document.createElement('a');
    //hiddenElement.href = 'data:attachment/text,' + encodeURI(yaml.dump(data));
    hiddenElement.href = 'data:attachment/text,' + encodeURIComponent(data);
    hiddenElement.target = '_blank';
    hiddenElement.download = download_name ;
    hiddenElement.click();
    return 0;
  }
  if(open_dst=="path_design"){
      let editor_data = editor.getValue();
      editor.setValue(data);
      $('.script_convert_b').trigger("click");
      editor.setValue(editor_data);
      change_path_design_file(data,open_file_name,$("#path_b").attr("data-key"),open_file_name);
  }

  if(open_dst=="script"){
      editor.setValue(data);
      change_script_file(data,open_file_name,$("#path_b").attr("data-key"),open_file_name);
  }

  if(open_dst=="blockly"){
    if($(".editor_s").val()!="blockly_panel"){
      $(".editor_s").val("blockly_panel")
      $(".editor_s").change()
    }
    import_blockly_data(data);
    change_blockly_file(data,open_file_name,$("#path_b").attr("data-key"),open_file_name);
  }

  if(open_dst=="python"){
        if($(".editor_s").val()!="python_panel"){
          $(".editor_s").val("python_panel")
          $(".editor_s").change()
        }
        change_python_file(data,open_file_name,$("#path_b").attr("data-key"),open_file_name);
        import_python_data(data);
  }
}

$('.file_upload_b').on("click", function(e) {
  let input_file = document.createElement('input');
  input_file.type = 'file';

  input_file.onchange = e => {
      let input = e.target;

      let reader = new FileReader();

      reader.onload = function(){
        let text = reader.result;

        let name = prompt("Save uploaded file as:", "");

        if (name != null){
          if(name=="") name = "uploaded_file.txt";
          if(name.lastIndexOf(".")==-1) name = name + ".txt";

          send_message({
          "_server":"folder",
    "func": "save_file",
          "prm": [$("#path_b").attr("data-key"),name,text] 
           })
        }
      };

      reader.readAsText(input.files[0]);

  }
  input_file.click();

});