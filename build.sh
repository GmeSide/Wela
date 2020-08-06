#!/bin/bash
git pull
if [ $1 == "internal" ]
then
  cd fastlane && fastlane android internal && fastlane ios internal
else
  cd fastlane && fastlane android beta && fastlane ios beta
fi