
class gamepad{

	constructor(){
		this.locked = false;

		this.button_status 		 =  [];
		this.button_status_old   = [];
		this.axis_status 		 = [];
		this.axis_status_old	 = [];

		this.fill_button_status()
		this.fill_button_status_old()

		this.press 	= $.Callbacks();
		this.release = $.Callbacks();		
		
		//this.control_agent = control_agent;
	}


	update(){
		this.fill_button_status()
		if (!this.locked){
			let i=0;
			let l = this.button_status.length;
			for (i;i<l;i++){
				if( this.button_status[i] != this.button_status_old[i]){
					if (this.button_status[i] == true){
						this.press.fire(i)
						ctrl_agent.update({"keyCode":i},true,1)
						//console.log("press",i)
					}
					else{
						this.release.fire(i)
						ctrl_agent.update({"keyCode":i},false,1)
						//console.log("release")
					}
				}
			}
			for (i=0;i<this.axis_status.length;i++){
				if( this.axis_status[i] != this.axis_status_old[i]){
					if (this.axis_status[i] == 1){
						this.press.fire(-i*2 - 1)
						ctrl_agent.update({"keyCode": -i*2 - 1 },true,1)
						//console.log("press",l + i*2)
					}
					if (this.axis_status[i] == -1){
						this.press.fire(-i*2 - 2)
						ctrl_agent.update({"keyCode": -i*2 - 2 },true,1)
						//console.log("press",-(l + i*2))
					}
					if (this.axis_status[i] == 0){
						this.release.fire(-i*2 - 1)
						this.release.fire(-i*2 - 2)
						ctrl_agent.update({"keyCode": -i*2 - 1 },false,1)
						ctrl_agent.update({"keyCode": -i*2 - 2 },false,1)
						//console.log("release")
					}
				}
			}
			//the same for axis + considering tresold
		}
		this.fill_button_status_old()

	}

	fill_button_status(){
		this.button_status = []
		for(let  b in joy_button){
			this.button_status.push(joy_button[b].pressed)

		}
		this.axis_status = []
		for(let  b in joy_axis){
			this.axis_status.push(Math.round(joy_axis[b]))

		}
		//console.log(joy_button[0])
	}

	fill_button_status_old(){
		this.button_status_old = []
		for(let b in this.button_status){
			this.button_status_old.push(this.button_status[b])
		}
		this.axis_status_old = []
		for(let b in this.axis_status){
			this.axis_status_old.push(this.axis_status[b])
		}
	}
}


class control_agent{

	constructor(){
		this.emergency_key_down = false;
		this.locked = true;
		this.switch = 0; //0 is keyboard, 1 is gamepad
		this.busy = false;
		this.effective_key = false;

		this.abnormal_keys = ["halt","play_script","motor","record_joint","record_line"];
		this.abnormal_map  = ["halt_b","script_play_b","motor_c","rec_joint_b","rec_line_b"];

		this.working_key_event = null;

		let agent = this;

		document.addEventListener("keydown", (event) => {
    		agent.update(event,true,0)
		});

		document.addEventListener("keyup", (event) => {
    		agent.update(event,false,0)
		});

	}

	clear(){

		$(".jog_b").trigger("mouseup");
		this.busy = false;
		this.effective_key = null;
		$(".jog_b").trigger("mouseup");
	}

	update(event, press, swtch){
		if(swtch==0 && event.keyCode==32){//space
			this.emergency_key_down = press;
			if(!press){
				this.clear()
			}
			return 0;
		}

		if(!this.locked && swtch == this.switch && ((swtch==1||(swtch==0&&this.emergency_key_down))) ){
			if(!this.busy){
				if(press){
					this.busy = true;
					this.working_key_event = event;
					this.effective_key = false;
					let item  = JSON.parse(localStorage.getItem("key_values"));
					if (this.switch == 1)
						item  = JSON.parse(localStorage.getItem("joy_values"));
					
					for (var key in item) {
					
						let ab_index = this.abnormal_keys.indexOf(key);
						if(ab_index >= 0){
							if (item[key]==event.keyCode){
								console.log(key);
								$("."+this.abnormal_map[ab_index]).trigger("click");
								this.effective_key = true;
								break;
							}
						}
						else{
							if($(".tab_pill_jog_" + $(".jog_b_" + key).attr("tab") ).attr("aria-selected")=="true"){
							    if (item[key]==event.keyCode){
							   
							    	$(".jog_b_" + key).trigger("mousedown")
							    	this.effective_key = true;
							    	break;
							    }
						    }
						}
					}
					
				}
			}
			else{
				if(this.working_key_event.keyCode==event.keyCode && !press){
					this.busy=false;
					//this.working_key_event = null;
					if(this.effective_key){
						$(".jog_b").trigger("mouseup");
						/*
						$(".halt_b").trigger("mouseup");
						$(".path_design_play_b").trigger("mouseup");
						$(".script_play_b").trigger("mouseup");
						$(".rec_line_b").trigger("mouseup");
						$(".rec_joint_b").trigger("mouseup");
						*/
					}

				}
			}
		}
	}

}

var ctrl_agent = new control_agent();
var gamepad_agent = new gamepad();
//var g_agent_interval = setInterval(gamepad_agent.update(), 70); 


$("#pills-setting-tab").on( 'click', function( e ) {
 	$('.controller-select-form').val(0);
 	$('.controller-select-form').trigger("change");
})


$('.controller-select-form').change(function(){
	let point_id = Number($(this).prop("value"))
	if(point_id == 0){
		ctrl_agent.locked = true;
	}
	if(point_id == 1){
		ctrl_agent.locked = false;
	    ctrl_agent.switch = 0;
	    ctrl_agent.clear();
	}
	if(point_id == 2){
		ctrl_agent.locked = false;
	    ctrl_agent.switch = 1;
	    ctrl_agent.clear();
	}
})
