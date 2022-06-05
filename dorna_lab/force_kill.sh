#!/bin/bash

pids=$(pstree -p $1 | grep -o '([0-9]\+)' | grep -o '[0-9]\+')
for pid in "${pids}"; do
    kill $pid
done