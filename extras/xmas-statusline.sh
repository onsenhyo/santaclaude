#!/bin/bash
# Santa Claude status line: one line with the countdown to Christmas, by this machine's local date.
# Claude Code passes the session as JSON on stdin; this line needs none of it.

cat >/dev/null

year=$(date +%Y)
today=$(date +%s -d "$(date +%Y-%m-%d)")
target=$(date +%s -d "$year-12-25")
[ "$today" -gt "$target" ] && target=$(date +%s -d "$((year + 1))-12-25")
# Rounded, so a daylight saving shift of an hour never costs a day.
days=$(( (target - today + 43200) / 86400 ))

white='\033[1;38;2;244;244;244m'
red='\033[38;2;229;72;77m'
reset='\033[0m'

if [ "$days" -eq 0 ]; then
  printf "  🎅 ${red}Merry Christmas!${reset}\n"
else
  printf "  Merry Xmas 🎅 ${white}D-%s${reset}\n" "$days"
fi
