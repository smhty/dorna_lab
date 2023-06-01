// map of functions
var function_map = {"pid_enabled": "pid_r", "alarm": "alarm_r", "id": "id_r", "gravity":"gravity_r", "toollength": "toollength_r",
 "version": "version_r", "uid": "uid_r","motor":"motor_r","encoder":"encoder_r","axis":"axis_r"};
/*
$(".joint_v").each(function(index) {
  let key = $(this).attr("data-key");
  function_map[key] = "joint_r";
});

$(".xyz_v").each(function(index) {
  let key = $(this).attr("data-key")
  function_map[key] = "xyz_r";
});
*/
$(".motion_v").each(function(index) {
  let key = $(this).attr("data-key");
  function_map[key] = "motion_r";
});


/*
$(".encoder_v").each(function(index) {
  let key = $(this).attr("data-value");
  function_map[key] = "encoder_r";
});
*/

$(".pwm_b").each(function(index) {
  let key = $(this).attr("data-key");
  function_map[key] = "pwm_r";
});

$(".out_c").each(function(index) {
  let key = $(this).attr("data-key");
  function_map[key] = "out_r";
});

$(".in_c").each(function(index) {
  let key = $(this).attr("data-key");
  function_map[key] = "in_r";
});

$(".ratio_v").each(function(index) {
  let key = $(this).attr("data-item");
  function_map[key] = "axis_r";
});

$(".adc_v").each(function(index) {
  let key = $(this).attr("data-key");
  function_map[key] = "adc_r";
}); 



$(".motor_c").each(function(index) {
  let key = $(this).attr("data-key");
  function_map[key] = "motor_r";
});
$(".mot_c").each(function(index) {
  let key = $(this).attr("data-key");
  function_map[key] = "mot_r";
});  
$(".encoder_c").each(function(index) {
  let key = $(this).attr("data-key");
  function_map[key] = "encoder_r";
}); 
$(".pprm_v").each(function(index) {
  let key = $(this).attr("data-key");
  function_map[key] = "pprm_r";
}); 
$(".tprm_v").each(function(index) {
  let key = $(this).attr("data-key");
  function_map[key] = "tprm_r";
}); 
$(".ppre_v").each(function(index) {
  let key = $(this).attr("data-key");
  function_map[key] = "ppre_r";
}); 
$(".tpre_v").each(function(index) {
  let key = $(this).attr("data-key");
  function_map[key] = "tpre_r";
}); 