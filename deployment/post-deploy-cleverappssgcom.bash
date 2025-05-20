#!/bin/bash

# trace executed commands, stop on errors
set -ex

git -C connector add .
git -C connector fetch origin
git -C connector reset --hard origin/master
