#!/bin/bash
input="./bootstrap-class-grep.txt"
while IFS= read -r line
do
  echo "className: $line"
  grep -rin "className=\W$line\W" --include=\*.jsx .
done < "$input"
