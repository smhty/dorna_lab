/*
connection.js handles the functions and event listeners regarding the connection to the WebSocket
This file includes:
- the event handlers relevant to WebSockets
*/

var socket;
// initialize url
$(".robot_url").prop("value","ws://"+document.domain+"/ws")
$(".robot_url").prop("placeholder","ws://"+document.domain+"/ws")
$(".url").text(document.domain)

// button event to connect to WebSocket
$(".connect_b").on("click", function(e) {
  e.preventDefault();

  $(".ws_stat_v").prop("value","Connecting")

  // initiate connection
  if(socket !== undefined && socket.readyState !== undefined){
    socket.close()
  }

  let url = $(".robot_url").prop("value");
  socket = new WebSocket(url);
  socket.onopen = function(e) {
    $(".ws_stat_v").prop("value","Connected")
    $(".connect_stat_connected").show()
    $(".connect_stat_disconnected").hide()
    $(".url").text(new URL(socket.url).hostname)
    $(".url_notebook").attr("href", "http://"+new URL(socket.url).hostname+":8888/doc/workspaces/auto")
    $(".url_ed").attr("href", "http://"+new URL(socket.url).hostname+":8888/doc/workspaces/auto/tree/education")

    send_message({"_server":"config"});

    
    init_ws();
    
 
    //send_delayed_msgs();
    //original_robot =  new Robot( renderer , camera , scene , control_camera , 1.0 , false);
    //chain = new move_chain(scene, camera, renderer,control_camera);
    //chain.callback.add(change_ghost_value);
  };

  socket.onclose = function(e){
    $(".ws_stat_v").prop("value","Disconnected")
    $(".connect_stat_connected").hide()
    $(".connect_stat_disconnected").show()

  };

  socket.onmessage = function(e){
    on_message(e)
  };

  socket.onerror = function(e) {
    $(".ws_stat_v").prop("value","Disconnected")
  };
});

// disconnect from WebSocket
$(".disconnect_b").on("click", function(e) {
  e.preventDefault();
  socket.close()
});


function init_ws(args = ["alarm"]){
  for (let i = 0; i < args.length; i++) {
       send_message({"cmd": args[i]})
     }   
}

