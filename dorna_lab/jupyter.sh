#!/bin/bash

# sleep for 10 seconds
sleep 10

# run notebook
#jupyter notebook --ip 0.0.0.0 --no-browser --port=8888 --allow-root --notebook-dir="/home/dorna/" --NotebookApp.token='' --NotebookApp.password=''
nohup jupyter notebook --ip 0.0.0.0 --no-browser --port=8888 --allow-root --notebook-dir="/home/dorna/" --NotebookApp.token='' --NotebookApp.password='' &