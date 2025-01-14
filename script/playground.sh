#!/bin/bash

. "${0%/*}/constants.sh"
set_constants

set -exo pipefail

anvil --mnemonic "$mnemonic" --fork-url "$fork_url" --fork-block-number "$fork_block" --chain-id 1 --port 8545 &
anvil_pid="$!"

while ! nc -z localhost 8545; do
  sleep 3
done

function cleanup {
  kill "$anvil_pid"
}

trap cleanup EXIT

echo "Running playground script..."

wait "$anvil_pid"
