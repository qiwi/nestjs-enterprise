#!/usr/bin/env bash

cd "$INIT_CWD"

for f in $(find target -name '*.js'); do
  short=${f%.js};
  terser -c -m -o "$short.js" -- "$f";
done