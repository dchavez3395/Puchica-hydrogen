#!/bin/bash
cd "D:/Claude/puchica-site/generated-images"

AGY="/c/Users/dchav/AppData/Local/agy/bin/agy"

# Read all remaining products into arrays
mapfile -t HANDLES < <(python3 -c "
import json,sys
with open('_tmp_remaining.json') as f:
    products = json.load(f)
for p in products:
    sys.stdout.write(p['handle'] + '\n')
")

# Strip any carriage returns
for i in "${!HANDLES[@]}"; do
    HANDLES[$i]="${HANDLES[$i]//[$'\r']/}"
done

TOTAL=${#HANDLES[@]}
echo "Starting lifestyle image generation for $TOTAL products..."
echo "================================================"

count=0
for handle in "${HANDLES[@]}"; do
    count=$((count + 1))
    
    # Check if already generated
    outfile="${handle}-lifestyle.png"
    if [ -f "$outfile" ]; then
        echo "[$count/$TOTAL] $handle — already exists, skipping"
        continue
    fi
    
    # Get orig file
    origfile=$(ls _tmp_orig_${handle}.* 2>/dev/null | head -1)
    if [ -z "$origfile" ]; then
        echo "[$count/$TOTAL] $handle — NO ORIG FILE, skipping"
        continue
    fi
    
    # Get title and scene
    title=$(python3 -c "
import json,sys
with open('_tmp_titles.json') as f:
    d = json.load(f)
sys.stdout.write(d.get('$handle', '$handle'))
")
    
    scene=$(python3 -c "
import json,sys
with open('_tmp_prompts.json') as f:
    d = json.load(f)
sys.stdout.write(d.get('$handle', ''))
")
    
    # Build prompt
    PROMPT="You are a professional product photographer. Look at the product image file at '${origfile}' in the current working directory. This product is: ${title}. Generate a high-quality professional lifestyle product photography image that shows this product in a realistic setting: ${scene}. The image should look like a real photograph with natural lighting, shallow depth of field, and professional composition. The product should be clearly visible and recognizable. Save the generated image as '${outfile}' in the current working directory. The image must be a PNG file."
    
    echo "[$count/$TOTAL] $handle — generating..."
    
    # Call agy
    "$AGY" --model "Gemini 3.1 Pro (High)" --dangerously-skip-permissions --print "$PROMPT" 2>&1
    
    # Verify file exists
    if [ -f "$outfile" ]; then
        size=$(stat -c%s "$outfile" 2>/dev/null || wc -c < "$outfile")
        echo "[${count}/${TOTAL}] ${handle} — done (${size} bytes)"
    else
        echo "[${count}/${TOTAL}] ${handle} — FAILED (no output file)"
    fi
done

echo "================================================"
echo "Generation complete. Generated $count images."