
var delayed_messages = [];

function rand_id(){
  return (Math.floor((Math.random() * 1000000)) %999999) +2

}

function send_message(msg, id = false, stringify=true,response_function,variables) {
  if(socket.readyState==0){
    delayed_messages.push([msg,id,stringify,response_function])
    return;
  }

  if(id){
    msg.id = rand_id();
    msg["cmd_id"] = rand_id();
    knmtc_response_list[String(msg["cmd_id"])] = {"func":response_function,"vars":variables};
  }

  let not_server_message = (typeof msg["_server"]==='undefined');

  if(stringify){
    msg = JSON.stringify(msg);
  }

  socket.send(msg);
  
  if(not_server_message)
  	log_print(msg, "🔵")
}

function send_delayed_msgs(){
  console.log("check status",socket.readyState)
  let l = delayed_messages.length;
  for(i=0;i<l;i++){
    let msg = delayed_messages[l-1-i];
    console.log(msg);
    send_message(msg[0],msg[1],msg[2],msg[3]);
    //delayed_messages.pop();
  }
}