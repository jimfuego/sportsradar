#!/bin/sh

# export .env vars
set -o allexport
source .env
set +o allexport

# select start command according to environment
if [ "$NODE_ENV" = "production" ] || [ "$NODE_ENV" = "staging" ]; then
  printf "%s\n" "$NODE_ENV"
  node .
elif [ "$NODE_ENV" = "localhost" ]; then
  printf "%s\n" "$NODE_ENV"
  nodemon index.ts
fi
