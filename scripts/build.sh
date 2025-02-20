#! /bin/bash

set -e

npm run build:cjs
npm run build:esm

# Rename .js files to .mjs in esm directory
for file in esm/*.js; do
    mv "$file" "${file%.js}.mjs"
    mv "$file.map" "${file%.js}.mjs.map"
done

# Change the imports of each file to use .mjs extension
for file in esm/*.mjs; do
    sed -i '' 's/\.js'/.mjs'/g' "$file"
    sed -i '' 's/\.js"/.mjs"/g' "${file}.map"
done
