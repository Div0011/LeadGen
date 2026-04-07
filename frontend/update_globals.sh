#!/bin/bash
echo "@tailwind base;" > src/app/globals.css
echo "@tailwind components;" >> src/app/globals.css
echo "@tailwind utilities;" >> src/app/globals.css
echo "" >> src/app/globals.css
sed -n '/<style>/,/<\/style>/p' /Users/divyansh/Downloads/leadgenius.html | grep -v "<style>" | grep -v "<\/style>" >> src/app/globals.css
