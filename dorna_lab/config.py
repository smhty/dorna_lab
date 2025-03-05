config = {
	"folder": {
		"path_home": "C:\\Users\\jvd\\Documents\\GitHub\\dorna_lab_hub\\dorna_lab\\dorna_lab",
		"path_example": "C:\\Users\\jvd\\Documents\\GitHub\\dorna_lab_hub\\dorna_lab\\dorna_lab",
		"path_wizard": "C:\\Users\\jvd\\Documents\\GitHub\\dorna_lab_hub\\dorna_lab\\dorna_lab",
		"path_blockly": "C:\\Users\\jvd\\Documents\\GitHub\\dorna_lab_hub\\dorna_lab\\dorna_lab",
		"path_python": "C:\\Users\\jvd\\Documents\\GitHub\\dorna_lab_hub\\dorna_lab\\dorna_lab",
		"path_path_design":"C:\\Users\\jvd\\Documents\\GitHub\\dorna_lab_hub\\dorna_lab\\dorna_lab",
		"path_script": "C:\\Users\\jvd\\Documents\\GitHub\\dorna_lab_hub\\dorna_lab\\dorna_lab",
		"path_env": "C:\\Users\\jvd\\Documents\\GitHub\\dorna_lab_hub\\dorna_lab\\dorna_lab"
	},
	"server":{
		"host": "0.0.0.0",
		"port": 80,
		"debug": True
	},
	"robot_server":{
		"host": "localhost"
	},
	"cmd":{
		"alarm": "alarm",
		"output": "output",
		"pwm": "pwm",
		"adc": "adc",
		"input": "input",
		"halt": "halt",
		"pid": "pid",
		"motor": "motor",
		"joint": "joint",
		"move": "rmove",
		"lmove": "lmove",
		"jmove": "jmove",
		"pause" : "sleep",
		"toollength": "toollength",
		"version": "version",
		"uid": "uid",
		"gravity": "gravity",
		"axis": "axis",
		"pid": "pid",
	},
	"update": "sudo rm -rf /home/dorna/Downloads/upgrade && sudo mkdir /home/dorna/Downloads/upgrade && sudo git clone https://github.com/dorna-robotics/upgrade.git /home/dorna/Downloads/upgrade && cd /home/dorna/Downloads/upgrade && sudo sh setup_0.sh",
	"home": "sudo python3 /home/dorna/Downloads/dorna_python/example/home/main.py --Host localhost --Index "

}