#!/bin/bash
# sleep for 10 seconds
sleep 10

# run notebook
nohup /usr/bin/python3 -m jupyter notebook --ip 0.0.0.0 --no-browser --port=8888 --allow-root --notebook-dir="/home/dorna/" --NotebookApp.token='' --NotebookApp.password='' &