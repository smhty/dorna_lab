#!/bin/bash

# sleep for 5 seconds
sleep 5

# run notebook
#jupyter notebook --ip 0.0.0.0 --no-browser --port=8888 --allow-root --notebook-dir="/home/dorna/Projects/" --NotebookApp.token='' --NotebookApp.password=''

# Check if Jupyter server is running
if jupyter notebook list &> /dev/null; then
	echo "Jupyter server is already running."
else
	echo "Starting Jupyter server..."
	# run notebook
	pyter notebook --ip 0.0.0.0 --no-browser --port=8888 --allow-root --notebook-dir="/home/dorna/Projects/" --NotebookApp.token='' --NotebookApp.password='' &
fi