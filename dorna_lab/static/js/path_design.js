// change point

var ND = {5:false,6:false,7:false,8:false};
var ND_count = 4;
var xyz_names = ["x","y","z","a","b","c","d","e"]
var axis_names_to_numbers = {"j0":0,"j1":1,"j2":2,"j3":3,"j4":4,"j5":5,"j6":6,"j7":7,"j8":8,"x":0,"y":1,"z":2,"a":3,"b":4,"c":5,"d":6,"e":7,"f":8};
function set_ND(){
	$('.axis_c').each(function(e){
		let key = $(this).attr("data-key").substring(4);
		ND[key] = $(this).prop("checked");
	});
	$( ".path_design_point_form , .position_form , .jog_form , .set_joint_form").each(function(e){
		if(ND[$(this).attr("data-key")] || $(this).attr("data-key")<5){
			$(this).prop("style").display = "";
		}
		else{
			$(this).prop("style").display = "none";
		}
	});
	hide_versionable()
	return 0;
}set_ND()

function set_cmd_to_robot(){
	let p = position("joint");

	$( ".path_design_point_prm_v" ).each( function(e) {
		let space = $(this).attr("data-space"); 
		if (space == "joint"){
			$(this).val(p[$(this).attr("data-key")]);
			$(this).trigger("change");
		}
	});
}

$( ".path_design_point_prm_v" ).on("change", function(e) {
	
	let space = $(this).attr("data-space"); 
	if (space == "joint"){
		let joint = []
		let cmd = {};
		for (let i =0; i < 5+ND_count ; i++) {
			if(i<5||ND[i]){
				joint.push(+$(`.path_design_point_prm_v[data-key=j${i}]`).prop("value"))
				cmd["j" + i] = joint[i];
			}
		}
		//console.log("joint: ", joint)
		chain.control_cmd.set_cmd(cmd)
	}
	else{
		let xyzab = []
		let cmd = {};
		for (let i =0; i < 5+ND_count ; i++) {
			if(i<5||ND[i]){
				xyzab.push(+$( ".path_design_point_prm_v[data-key=" + xyz_names[i] + "]" ).prop("value"))
				cmd[xyz_names[i]] = xyzab[i];
			}
		}

		chain.control_cmd.set_cmd(cmd);
	}

});

// control type
$('.path_design_point_ct_r').on("change", function(e){
	chain.controller.set_control_mode(this.value)
})

$(".path_design_move_b").on("click", function(e){
	// initialize msg
	let msg = {
		"cmd" : $(this).attr("data-cmd"),
		"rel": 0
	}

	// sync position
	if ($(".path_design_sync_c").prop("checked")){
		msg = {...msg,...position("joint"), ...position("xyz")}
	}

	chain.create_by_id(msg,$(this).attr("data-cmd"))
	
})


// select a move
$(".path_design_program_list").on("click", ".path_design_program_list_b", function(e){

	// get id
	let id = Number($(this).attr("data-id"))

	// select first point
	chain.list[id].select()
})


// select from list
$('.path_design_point_s').change(function(){
	let id = Number($(this).attr("data-id"))
	let point_id = Number($(this).prop("value"))
	console.log(point_id)
	// select first point
	chain.list[id].select(point_id + 1)      
})




$(".path_design_move_save_all_b").on("click", function(e){
	// for all elemnt in list 
	$(".path_design_program_list_b" ).each(function( index){
		let id = $(this).attr("data-id")
		chain.list[id].save()
	})
})


$(".path_design_move_cancel_all_b").on("click", function(e){
	$(".path_design_program_list_b" ).each(function( index){
		let id = $(this).attr("data-id")
		chain.list[id].cancel()
	})
})


$(".path_design_move_delete_all_b").on("click", function(e){
	chain.delete_all_by_id()
})


// visible
$('.path_design_visible_c').on( 'click', function( e ) {
	let visible = $(this).prop("checked")? true:false
	chain.set_visible(visible)
})
// preview
$('.path_design_preview_b').on( 'click', function( e ) {
	chain.play(0)

})



// change prm
$( ".path_design_prm_v" ).on("change", function(e) {
	let key = $(this).attr("data-key"); 
	let value = Math.abs(Number($(this).prop("value"))) 

	if(! $(`.path_design_prm_c[data-key=${key}]`).prop("checked")){
		$(`.path_design_prm_c[data-key=${key}]`).click();
	}
	//if($(`.path_design_prm_c[data-key=${key}]`).prop("checked")){
	let id = Number($(`.path_design_program_list_b.active`).attr("data-id"))
	if(isNaN(id)){
		return 0
	}
	chain.list[id].prm[key] = value 
	//}
});
//tool head
$( ".ghost_toolhead_v" ).on("change", function(e) {
	chain.tool_head_length_set(Number($(this).prop("value")));
});

// delete prm
$('.path_design_prm_c').on( 'click', function( e ) {
	let id = Number($(`.path_design_program_list_b.active`).attr("data-id"))
	if(isNaN(id)){
		return 0
	}		
	let key = $(this).attr("data-key");
	if(!$(this).prop("checked")){
		delete chain.list[id].prm[key]
	}else{
		let value = Number($(`.path_design_prm_v[data-key=${key}]`).prop("value"))	
		chain.list[id].prm[key] = value
	}

})

// convert to script
$(".path_design_play_b").on("click", function(){
	chain.make_script(true,true) //roundness activated
})


//upload script
$(".make_script_b").on("click", function(){
	chain.make_script(false,true);
})
/*
function change_move_type(id,type){
	let editor_val = editor.getValue()
	chain.make_script(false,true);
	let s = editor.getValue()+"\n"
	let s_b = ""
	let s_m = ""

	counter = 0
	
	while(s.indexOf("\n")!=-1){
		let line = s.slice(0,s.indexOf("\n"));
		s = s.slice(s.indexOf("\n")+1,s.length)

		if(counter == id){
			s_m = line
			break
		}
		s_b = s_b + line + '\n'

		counter += 1
	}

	if(counter!=id){return 0}
	//console.log("s_b:\n"+s_b+"\ns_m:\n"+s_m+"\ns\n:"+s)
	let cmd = JSON.parse(s_m)
	
	if(cmd["cmd"] == type){return 1}

	let new_cmd = {}
	new_cmd["cmd"] = type
	new_cmd["rel"] = 0

	if (type=="jmove" && !(typeof cmd["x"]==="undefined")){//cmove-lmove to jmove
		let pos = new THREE.Vector3(cmd["x"],cmd["y"],cmd["z"]);
		pos = chain.robot.real_to_xyz(pos)
		let js = chain.robot.xyza_to_joints(pos, cmd["a"], cmd["b"])
		for(let i=0 ; i<js.length;i++)
			new_cmd["j"+i] = js[i]
	}
	if ((type=="lmove" || type=="cmove") && !(typeof cmd["x"]==="undefined")){
		for (i in xyz_names){
			if (!(typeof cmd[xyz_names[i]]==="undefined")){
				new_cmd[xyz_names[i]] = cmd[xyz_names[i]];
			}
		}
	}
	if ((type=="lmove" || type=="cmove") && !(typeof cmd["j0"]==="undefined")){
		let pos = chain.robot.joints_to_xyz([cmd["j0"],cmd["j1"],cmd["j2"],cmd["j3"]])
		pos = chain.robot.xyz_to_real(pos);
		new_cmd["x"] = pos.x; new_cmd["y"] = pos.y; new_cmd["z"]=pos.z; new_cmd["a"]=cmd["j1"]+cmd["j2"]+cmd["j3"]; new_cmd["b"]=cmd["j4"];
	}

	let new_script = s_b+JSON.stringify(new_cmd)+s;
	editor.setValue(new_script);
	$('.script_convert_b').trigger("click");


	editor.setValue(editor_val)
}

*/

function replace_moves(id1,id2){
	$(".path_design_program_list_b" ).each(function( index){
		let id = $(this).attr("data-id")
		chain.list[id].save()
	})
	let editor_val = editor.getValue()
	chain.make_script(false,true);
	let s = editor.getValue()+"\n"
	let s_b1 = ""
	let s_b2 = ""
	let s_m1 = ""
	let s_m2 = ""

	let i1 = Math.min(id1,id2);
	let i2 = Math.max(id1,id2);
	if(id1==id2) return 0;

	counter = 0
	
	while(s.indexOf("\n")!=-1){
		let line = s.slice(0,s.indexOf("\n"));
		s = s.slice(s.indexOf("\n")+1,s.length)

		if(counter == i1)				{s_m1 = line;}
		if(counter == i2)				{s_m2 = line;break;}
		if(counter<i1)					{s_b1 = s_b1 + line + '\n';}
		if(counter<i2 && counter>i1)	{s_b2 = s_b2 + line + '\n';}

		counter += 1
	}

	if(counter!=i2){return 0}
	
	let new_script = s_b1+s_m2+s_b2+s_m1+s;
	editor.setValue(new_script);
	$('.script_convert_b').trigger("click");

	editor.setValue(editor_val)
	return 1;
}

function path_design_move_list_up_down(v){//v=+1 means it goes down, v=-1 means it goes up
	if(v!=1 && v!=-1)return;
	let dst = Number(path_design_selected_id) + v;
	if(Number(path_design_selected_id)==0 || dst == 0) return;
	if( Object.keys(chain.list).length<=dst)return;
	if(chain.list[dst].removed)return;
	if(replace_moves(path_design_selected_id,dst)){
		chain.list[dst].select()
	}
	return 0;
}

function change_ghost_value(position){

	$(".path_design_point_prm_v" ).each(function( index){
		$(this).prop("value", position[$(this).attr("data-key")])
	})

	$(".path_design_prm_v" ).each(function( index){
		let key = $(this).attr("data-key")
		if(!(typeof position[$(this).attr("data-key")] === 'undefined')){
			$(`.path_design_prm_c[data-key=${key}]`).prop("checked", true);
			$(this).prop("value", position[key]);
		}
	})

}

function path_design_list_element(id,txt){
	return `<div class="list-group-item list-group-item-action path_design_program_list_b d-flex p-0 rounded-0" data-id= `+id+`>
		<button type="button" class="btn btn-sm rounded-0 btn-txt">
		    `+txt+`
		</button>
		<div class="flex-grow-1"></div>

		<!--action-->
		<button type="button" class="btn btn-sm path_design_move_preview_b border-left rounded-0" data-id=`+id+`>
			<i class="fas fa-fast-forward"></i>
		</button>
		<button type="button" class="btn btn-sm path_design_move_save_b border-left rounded-0" data-id=`+id+`>
		    <i class="fas fa-check"></i>
		</button>
		<button type="button" class="btn btn-sm path_design_move_cancel_b border-left rounded-0" data-id=`+id+`>
			<i class="fas fa-times"></i>
		</button>
		<button type="button" class="btn btn-sm path_design_move_delete_b border-left rounded-0" data-id=`+id+`>
			<i class="far fa-trash-alt"></i>
		</button>
		</div>
	</div>`
}
function update_path_design_list_names(){
	let k = 0
	let ch = chain;
	$(`.path_design_program_list_b`).each(function( index){
		let id = Number($(this).attr("data-id"));
		//console.log(id);
		if(!(chain.list[id].removed)){
			//console.log(k)
			let txt = "jmove";
			if(chain.list[id].n_points==2) txt = "cmove";
			else
				if(chain.list[id].move_type==1) txt = "lmove";

			$(this).children(".btn-txt").html(k + ': '+txt);
			k = k + 1;
		} 
	})
}

function update_path_design_list(id, txt){
	// access the given id
	if(!$(`.path_design_program_list_b[data-id=${id}]`).length){
		$( ".path_design_program_list" ).append( 
			path_design_list_element(id,txt)
			//'<button type="button" class="list-group-item list-group-item-action pt-0 pb-0 path_design_program_list_b" data-id="'+id+'">'+txt+'</button>'		
		);
		//update_path_design_list_names()

	}


	$(".path_design_move_delete_b").off("click");
	$(".path_design_move_save_b").off("click");
	$(".path_design_move_cancel_b").off("click");
	$(".path_design_move_preview_b").off("click");


	// remove
	$(".path_design_move_delete_b").on("click", function(e){
		let id = Number($(this).attr("data-id"))
		if (id > 0) {
			chain.list[id].remove()
		}
		//update_path_design_list_names()
	})
	// save
	$(".path_design_move_save_b").on("click", function(e){
		//
		let id = Number($(this).attr("data-id"))
		// read vel, ...
		chain.list[id].save()
	})
	//cancel
	$(".path_design_move_cancel_b").on("click", function(e){
		let id = Number($(this).attr("data-id"))
		chain.list[id].cancel()
	})
	//preview
	$(".path_design_move_preview_b").on("click", function(e){
		let id = Number($(this).attr("data-id"))
		setTimeout(function() {chain.play(id);}, 100);
		
	})
	
}
var path_design_selected_id = 0;
function program_list_select(id, point_id, n_points){
	// remove active class
	path_design_selected_id = id;

	$(`.path_design_program_list_b`).each(function( index){
		$(this).removeClass( "active" )
	})

	// add active class
	$(`.path_design_program_list_b[data-id=${id}]`).addClass("active")

	// empty select
	$(".path_design_point_s").empty();

	// set path id
	$(".path_design_point_s").attr("data-id", id);

	// active xyz in control type
	$('.path_design_point_ct_r[value=2]').prop('checked', true)

	// ad points to select
	for (let i = 0; i < n_points; i++) {
		$(".path_design_point_s").append(
			"<option value="+i+">point "+i+"</option>"
		)
	}

	 $('.path_design_point_s').prop( "value", point_id);

	 // add prm
	 let prm = chain.list[id].prm

	$(".path_design_prm_c" ).each(function(e){
		let key = $(this).attr("data-key")
		if (key in prm) {
			$(`.path_design_prm_v[data-key=${key}]`).prop("value", prm[key])
			$(this).prop("checked", true)	
		}else{
			$(this).prop("checked", false)			
		}
	})

	if(! ($('.path_design_visible_c').prop("checked"))){
		$('.path_design_visible_c').trigger("click");
	}

	
}


function program_list_remove(id){
	// remove button from list
	$(`.path_design_program_list_b[data-id=${id}]`).remove()

	// select another one
}

var path_upload_promise;

$('.path_upload_b').click(function(e){
	let editor_data = editor.getValue();
	$('.script_upload_b').trigger("click")
	path_upload_promise = new Promise((resolve,reject)=>{
		resolve(editor_data)
	});

})	

$('.path_download_b').click(function(e){

	let editor_data = editor.getValue();
	chain.make_script(false,false);
	$('.script_download_b').trigger("click");
	editor.setValue(editor_data);

})

$('.sync_pos_b').on("click", function(e){
	set_cmd_to_robot()
});

$('.path_save_b').click(function(e){
	if(path_design_file_name==""){
		$('.path_save_as_b').click();
	}
	else{
		let editor_data = editor.getValue();
		chain.make_script(false,false);
		let sc = editor.getValue();
		editor.setValue(editor_data);

        send_message({
        "_server":"folder",
    	"func": "save_file",
        "prm": [path_design_file_path,path_design_file_name,sc] 
        })
	}


})
$('.path_save_as_b').click(function(e){
	/*
	let path = $("#path_path_design_b").attr("data-key")
	 send_message({
	      "_server":"folder",
    	"func": "get",
	      "prm": [path] 
	 })
	*/

	save_dst = "path_design"
	save_mode();
	let editor_data = editor.getValue();
	chain.make_script(false,false);
	
	save_content = editor.getValue();

	editor.setValue(editor_data);
})

$('.path_open_b').click(function(e){
	/*
		let path = $("#path_path_design_b").attr("data-key")
	 send_message({
	      "_server":"folder",
    	"func": "get",
	      "prm": [path] 
	 })
	*/
	open_mode();
	open_dst = "path_design"
})

$(".path_delete_b").on("click", function(e){
	chain.delete_all_by_id();
})
$(".path_new_b").on("click", function(e){
	chain.delete_all_by_id();
	change_path_design_file(null,"","","")
})


function change_path_design_file(data,name,dst,title){
  $('.path_design_file_v').attr("value",name)
  if(title=="") title = ""
  $('.path_design_file_v').text(title)
  path_design_file_name = name;
  path_design_file_path = dst;
}
change_path_design_file(null,"","","")