#!/usr/bin/env bash

TARGET=$1
OLD_EXTENSION=$2
NEW_EXTENSION=$3

cd "$INIT_CWD"

for f in $(find "$TARGET" -name "*.$OLD_EXTENSION"); do
  short=${f%.js};
  mv "$f" "$short.$NEW_EXTENSION";
done
