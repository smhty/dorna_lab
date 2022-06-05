$('.shutdown_b').click(function(e){

    send_message({
      "_server":"shell",
      "prm": ["sudo shutdown"] 
    })
})

$('.reboot_b').click(function(e){

    send_message({
      "_server":"shell",
      "prm": ["sudo reboot"] 
    })
})