var haveEvents = 'GamepadEvent' in window;
var haveWebkitEvents = 'WebKitGamepadEvent' in window;

var controller = undefined;
var controller_index = undefined;
var controllerEnabled = false;

var lastItem = undefined;
var direction = 0;
var threshold = 0.5;

var rAF = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
          window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
var cAF = window.cancelAnimationFrame || window.mozCancelAnimationFrame;
var rAF_id;

if (haveEvents) {
  window.addEventListener("gamepadconnected", connectHandler);
  window.addEventListener("gamepaddisconnected", disconnectHandler);
} else if (haveWebkitEvents) {
  window.addEventListener("webkitgamepadconnected", connectHandler);
  window.addEventListener("webkitgamepaddisconnected", disconnectHandler);
}

// connect gamepad handler
function connectHandler(e) {
  let gamepad = e.gamepad;
  if(controller === undefined) {
    controller = gamepad;
    controller_index = gamepad.index;
  }

  updateGamepadStatus();

  if(controllerEnabled)
    updateStatus();
}

// disconnect gamepad handler
function disconnectHandler() {
  controllerEnabled = false;
  controller = undefined;
  controller_index = undefined;

  if(rAF_id) {
    cAF(rAF_id);
    rAF_id = undefined;
  }

  //send_halt_cmd();

  updateGamepadStatus();
}


function updateStatus() {
  var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);

  controller = gamepads[controller_index];
  controller_button = controller.buttons;
  controller_axes = controller.axes;

  $(".gamepad-axe").each(function(index) {
    let item = $(this).attr("data-item");
    let val = controller_axes[index];
    let direction = $(this).attr("data-value");
    
    val *= direction;
    /*
    if(index % 2 == 1) {
      val *= direction;
    }
    */
    

    let key = $(this).attr("data-key");
    let value = val > 0 ? Math.ceil(val) : Math.floor(val);

    let selected = $(this).attr("data-selected") === "true";
    let valid = Math.abs(val) > threshold;

    if(lastItemReleased(selected, valid))
      $(this).removeAttr("data-selected");
    else if(validItemPressed(selected, valid, key, value))
      $(this).attr("data-selected", "true");

  });

  $(".gamepad-button").each(function(index) {
    let item = $(this).attr("data-item");
    let key = $(this).attr("data-key");
    let value = $(this).attr("data-value");

    let selected = $(this).attr("data-selected") === "true";
    let valid = controller_button[index].pressed;

    if(lastItemReleased(selected, valid))
      $(this).removeAttr("data-selected");
    else if(validItemPressed(selected, valid, key, value))
      $(this).attr("data-selected", "true");

    /*
    let text = `button ${index}(${item}): ${controller_button[index].value}`;
    $(this).html(text);
    */

  });

  rAF_id = rAF(updateStatus);
}

function validItemPressed(selected, valid, key, value) {
  let condition = lastItem === undefined && valid && key != undefined;

  if(condition) {
      lastItem = key;
      direction = value;
      if(key === "halt") {
        //send_halt_cmd();
        $(".halt_b").click()
      }else if(key === "capture_position"){
        $(".rec_p_b").click()
      }else if(key === "play"){
        $(".script_play_b").click()
      }
       else {
        $(`.jog_b[data-key=${lastItem}][data-value=${direction}]`).mousedown()
      }

    return true;
  }

  return false;
}

function lastItemReleased(selected, valid) {
  let condition = selected && !valid;

  if(condition) {
    if(lastItem !== "halt" && lastItem !== "capture_position" && lastItem !== "play"){
      $(document).unbind("touchend");
      $(document).unbind("mouseup");
      if(!$(".jog_d_c").prop("checked")){
        $(".halt_b").click()
      }

    }
    lastItem = undefined;
    direction = 0;

    return true;
  }

  return false;
}

function updateGamepadStatus() {
  let connected = controller === undefined ? "Disconnected" : "Connected";
  let enabled = controllerEnabled ? "Enabled" : "Disabled";

  console.log("Gamepad " + enabled);
  $("#gamepad-enabled").prop("value", enabled);
  $("#gamepad-state").prop("value", connected);
  $("#gamepad-id").prop("value", "index: " + controller_index);
}

/*
$('.gamepad_c').on( 'click', function( e ) {
  
  controllerEnabled = $(this).prop("checked")? 1:0
  if (controllerEnabled) {
    updateStatus();    
  }else{
    if(rAF_id) {
      cAF(rAF_id);
      rAF_id = undefined
    }    
  }
})
*/

/*
// connect buttons
$("#gamepad_enable_b").on("click", function(e) {
  controllerEnabled = true;
  updateGamepadStatus();
  updateStatus();
});

$("#gamepad_disable_b").on("click", function(e) {
  controllerEnabled = false;
  if(rAF_id) {
    cAF(rAF_id);
    rAF_id = undefined
  }

  send_halt_cmd();

  updateGamepadStatus();
});
*/