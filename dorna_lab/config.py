config = {
	"folder": {
		"path_home": "/home/dorna/Projects",
		"path_example": "/home/dorna/Downloads/example",
		"path_wizard": "/home/dorna/Downloads/wizard",
		"path_blockly": "/home/dorna/Projects/blockly",
		"path_python": "/home/dorna/Projects/python",
		"path_path_design": "/home/dorna/Projects/path_design",
		"path_script": "/home/dorna/Projects/script"
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