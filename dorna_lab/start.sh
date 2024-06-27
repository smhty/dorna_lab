#!/bin/bash
# a.out
/home/dorna/app/a.out &

# Source .bashrc to load environment variables
source /home/dorna/.bashrc

# Set any additional environment variables if needed
export PYTHONPATH=$PYTHONPATH:/usr/local/lib
export PYTHONPATH=$PYTHONPATH:/home/dorna/Downloads/librealsense/build/Release


# sleep for 5 seconds
sleep 5

# run the program
/usr/bin/python3  /home/dorna/Downloads/dorna_lab/dorna_lab/application.py