#!/bin/bash

hugo mod clean && hugo mod tidy
rm -rf public/ resources/_gen/

hugo --minify
