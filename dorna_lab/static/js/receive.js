//in - out - pwm - adc - path design

// receive message functions
var knmtc_response_list = {}; // in the form of "cmd_id" : function. 


function on_message(event){
  
  /*try*/ {
    let msg = JSON.parse(event.data);
    //console.log(msg)
    if("cmd_id" in msg){
      if(String(msg["cmd_id"]) in knmtc_response_list){
        knmtc_response_list[String(msg["cmd_id"])]["func"](msg, knmtc_response_list[String(msg["cmd_id"])]["vars"]);
        delete knmtc_response_list[String(msg["cmd_id"])];
        return;
      }
    }

    if("to" in msg){
      switch (msg["to"]) {
        case "api.folder.get":
          update_file_list(msg);
          break
        case "shell":
          shell_print(msg["msg"])
          if("pid" in msg)
            set_pid(msg["pid"])
          break
        case "api_folder_open_file":
          file_open_result(msg["result"]);
          break
        case "api.folder.rename":
        case "api_folder_save_file":
          reload_file_list();
          break
        case "db.call":
          update_sessions_list(msg["result"])
          break
        case "run_js":
          console.log(eval(msg["code"]));//message type: {"to":"run_js","code":...}
        break
        case "update":
          update_print(msg["msg"])
          break
        case "update_check":
          update_check(msg["msg"])
          break                   
      }   

    }else{
      for (let key in msg) {
        if(key in function_map) {
          let cmd_key = function_map[key];
          window[cmd_key](key, msg);
        }  
      }
      // print log
      print_log(msg)      
    }
  }
  //catch(err) {
  //  console.error(err)
  //}

}

/* function map methods */

function out_r(key, msg) {
  $(`.out_c[data-key=${key}]`).prop("checked", msg[key]? true:false);
}

function axis_r(key, msg) {
  let index = key.substring(5)
  $(`.ratio_v[data-key=axis${index}]`).prop("value", msg[key].toFixed(3));
}
function gravity_r(key, msg) {
  $(`.gravity_c`).prop("checked", msg[key]? true:false);
  $(`.gravity_m_v[data-key=x]`).prop("value", msg["x"].toFixed(3));
  $(`.gravity_m_v[data-key=y]`).prop("value",msg["y"].toFixed(3));
  $(`.gravity_m_v[data-key=z]`).prop("value",msg["z"].toFixed(3));
  $(`.gravity_m_v[data-key=m]`).prop("value", msg["m"].toFixed(3));
}
function in_r(key, msg) {
  $(`.in_c[data-key=${key}]`).prop("checked", msg[key]? true:false);
}

function pwm_r(key, msg) {
  //key : pwmi
  let index = key.substring(3)
  $(`.dc_v[data-key=${key}]`).prop("value", msg["duty".concat(index)].toFixed(3));
  $(`.dc_v[data-key=${key}]`).text( msg["duty".concat(index)].toFixed(3));
  $(`.freq_v[data-key=${key}]`).prop("value", msg["freq".concat(index)].toFixed(3));
  $(`.freq_v[data-key=${key}]`).text(msg["freq".concat(index)].toFixed(3));
  $(`.pwm_c[data-key=${key}]`).prop("value", msg["pwm".concat(index)]? true:false);
  $(`.pwm_c[data-key=${key}]`).prop("checked", msg["pwm".concat(index)]? true:false);
}

function adc_r(key, msg) {
  $(`.adc_v[data-key=${key}]`).prop("value", msg[key]);
}

function pid_r(key, msg) {
  $(".pid_v").prop("value", msg[key])
}

function alarm_r(key, msg) {
  let val = msg[key]
  if(val===1){
    $(".alarm_li").show()
    add_note("alarm")  
  }
  if(val===0){
    $(".alarm_li").hide()
    init_ws(args = ["motor", "toollength", "input", "output", "pwm", "adc", "version", "uid", "gravity", "axis"])  
  }
  
  // display alarm message
  $(".alarm_stat_v").prop("value", JSON.stringify(msg))  
}

/*
function joint_r(key, msg) {
  $(`.joint_v[data-key=${key}]`).text(Number.parseFloat(msg[key]).toFixed(3));
}
*/

function version_r(key, msg) {
  $(`.version_v[data-key=${key}]`).text(msg[key]);
}

function uid_r(key, msg) {
  $(`.uid_v[data-key=${key}]`).text(msg[key]);
}

function toollength_r(key, msg) {
  $(`.toollength_v[data-key=${key}]`).val(Number.parseFloat(msg[key]).toFixed(2));
  original_robot.tool_head_length_set(Number.parseFloat(msg[key]))
}

function motion_r(key, msg) {
  document.getElementById("motion_r_id_"+key).innerHTML = Number.parseFloat(msg[key]).toFixed(3);
}
/*
function xyz_r(key, msg) {
  $(`.xyz_v[data-key=${key}]`).text(Number.parseFloat(msg[key]).toFixed(3));
}
*/
function encoder_r(key, msg) {
  $(`.encoder_v[data-key=j${key.substring(7)}]`).text(Number.parseFloat(msg[key]).toFixed(2));
}

// motor
function motor_r(key, msg) {
  // replay
  $(".motor_c").prop("checked", msg[key]);
} 

// id
function id_r(key, msg) {
  // home
  if(msg[key] >= 2000000){
    // 2,000,0i0: set pid
    // 2,000,0i1: alarm motion
    // 2,000,0i2: clear alarm
    // 2,000,0i3: reset pid
    // 2,000,0i4: move backwards and set iprobe
    // 2,000,0i5: halt
    // 2,000,0i6: joint assignment 
    // 2,000,0i7: error, clear alarm
    // 2,000,0i8: error, reset pid 
    let id = msg[key]
    let index = Math.floor((id - 2000000) / 10)
    let process_stat = id - (2000000 + 10 * index)
    if(process_stat == 0 && msg["stat"] == 0){
      add_note("home", "Homing process started for joint "+index)  
    }else if(process_stat == 6  && msg["stat"] == 2){
      add_note("home", "Homing process completed for joint "+index)
    }else if(process_stat == 8  && msg["stat"] == 2){
      add_note("home", "Homing process failed for joint "+index)
    }
  }   
  // replay
  if(msg[key] === 1 && msg["stat"] === 2 && $(".script_replay_c").prop("checked")){
    $(".script_play_b").click()
  } 

  // track 
  if($(".script_track_c").prop("checked") && msg["stat"] === 1 && script_index[0].includes(msg[key] ) ) {
    let id = msg[key]
    let index_id = script_index[0].indexOf(id)

    //remove last highlight
    try {
      script_index[2].clear()
    }
    catch(err) {
    }
    //add new highlight
    script_index[2] = highlight_editor(script_index[1][index_id][0], script_index[1][index_id][1], msg["stat"])

    
    // update script index
    script_index[0].splice(index_id, 1)
    script_index[1].splice(index_id, 1)
  } 
}

function print_log(msg){

  if("cmd" in msg && msg["cmd"] == "motion"){
    return 0
  }
  log_print(JSON.stringify(msg), "🟢")

}