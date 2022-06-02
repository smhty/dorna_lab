function rand_id(){
  return (Math.floor((Math.random() * 1000000)) %999999) +2

}

function send_message(msg, id = true, stringify=true) {
  if(id){
    msg.id = rand_id() 
  }

  let not_server_message = (typeof msg["_server"]==='undefined');

  if(stringify){
    msg = JSON.stringify(msg);
  }

  socket.send(msg);
  
  if(not_server_message)
  	log_print(msg, "🔵")
}
