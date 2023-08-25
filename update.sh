#!/bin/bash
ps -ef | grep abm | grep -v grep | cut -c 9-15 | xargs kill -9
cp -r ./update/* ./
abm
