import json
import sys

# Access the passed argument

if __name__ == '__main__':
	model = sys.argv[1]
	
	# adjust the model
	try:
		with open('config.log') as infile:
			config_data = json.load(infile)
			config_data["model"] = model
	except:
		config_data = {"model":model}


	# make sure all the keys exists
	if "startup" not in config_data:
		config_data["startup"] = ""
	if "emergency_enable" not in config_data:
		config_data["emergency_enable"] = False
	if "emergency_key" not in config_data:
		config_data["emergency_key"] = "in0"
	if "emergency_value" not in config_data:
		config_data["emergency_value"] = 1

	# write the file
	with open("config.log", "w") as infile:
		json.dump(config_data, infile)