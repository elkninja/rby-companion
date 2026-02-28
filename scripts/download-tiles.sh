#!/bin/bash
# Download map tiles from pkmnmap.com for self-hosting
# Tiles are organized as: public/map-tiles/{z}/{x}/{y}.png
# Zoom levels 2-6

BASE_URL="https://pkmnmap.com/FireRedLeafGreen/Tilesets/Overworld"
OUTPUT_DIR="public/map-tiles"

mkdir -p "$OUTPUT_DIR"

for z in 2 3 4 5 6; do
    max=$((2**z - 1))
    echo "Downloading zoom level $z (grid ${max}x${max})..."
    for x in $(seq 0 $max); do
        mkdir -p "$OUTPUT_DIR/$z/$x"
        for y in $(seq 0 $max); do
            url="$BASE_URL/$z/$x/$y.png"
            outfile="$OUTPUT_DIR/$z/$x/$y.png"
            if [ ! -f "$outfile" ]; then
                # Download silently, skip 404s
                curl -sf "$url" -o "$outfile" 2>/dev/null || rm -f "$outfile"
            fi
        done
    done
    count=$(find "$OUTPUT_DIR/$z" -name "*.png" 2>/dev/null | wc -l)
    echo "  Zoom $z: $count tiles downloaded"
done

total=$(find "$OUTPUT_DIR" -name "*.png" | wc -l)
echo ""
echo "Done! Total tiles downloaded: $total"
