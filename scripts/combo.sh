#!/bin/bash

# example usage
#   bash combo.sh ar.png cl.png

geoscents_home="/home/mattfel/geoscents/"
#This script will merge two jpg images into one using imageMagick.
#The final result will be a picture that is split diagonally.
#The diagonal line will start from the bottom left of the image.
#Both pictures must be of the same size.
#If you do not give the filenames as part of the command line, the default names will be used (Left.jpg and Right.jpg).
 
#If command line argument 1 is not provided, the value will default to the variable $LEFT_DEFAULT
LEFT_DEFAULT="Left.jpg";
MAP1=`echo $1 | sed "s/.png//"`
LEFT=${geoscents_home}/resources/flags/${1:-$LEFT_DEFAULT};
 
#If command line argument 2 is not provided, the value will default to the variable $Right_DEFAULT
RIGHT_DEFAULT="Right.jpg";
MAP2=`echo $2 | sed "s/.png//"`
RIGHT=${geoscents_home}/resources/flags/${2:-$RIGHT_DEFAULT};
 
#The intermediate images we will use must be png to support transparency.
#We remove the extension '.jpg' from the filenames and add the extension '.png'.
LEFT_OUT="${LEFT%.jpg}.new.png";
RIGHT_OUT="${RIGHT%.jpg}.new.png";
OUT="${geoscents_home}/resources/flags/$MAP1$MAP2.png";
 
# Read dimensions of both images and use the minimum for both axes
LEFT_W=`identify -format %w "$LEFT"`;
LEFT_H=`identify -format %h "$LEFT"`;
RIGHT_W=`identify -format %w "$RIGHT"`;
RIGHT_H=`identify -format %h "$RIGHT"`;
WIDTH=$(( LEFT_W < RIGHT_W ? LEFT_W : RIGHT_W ))
HEIGHT=$(( LEFT_H < RIGHT_H ? LEFT_H : RIGHT_H ))

convert -respect-parenthesis \
\( "$LEFT" -resize "${WIDTH}x${HEIGHT}!" -write "$LEFT_OUT" \) `#Load and resize first image` \
\( "$RIGHT" -resize "${WIDTH}x${HEIGHT}!" -write "$RIGHT_OUT" \) `#Load and resize second image` \
\( -size "$WIDTH"x"$HEIGHT" xc:black -fill white -draw "polygon 0,0 0,"$HEIGHT" "$WIDTH","$HEIGHT"" -write "MASK_$LEFT_OUT" \) `#Create the mask of the left triangle` \
\( -clone 2 -negate -write "MASK_$RIGHT_OUT" \) `#Create the mask of the lower triangle` \
\( -clone 0 -clone 2 -alpha off -compose copy_opacity -composite -write "$LEFT_OUT" \) `#Apply the upper triangle mask to the left image` \
\( -clone 1 -clone 3 -alpha off -compose copy_opacity -composite -write "$RIGHT_OUT" \) `#Apply the lower triangle mask to the right image` \
-delete 0-3 -compose over -composite "$OUT" `#Merge the two images together`;
 
#Cleaning up
rm "MASK_$RIGHT_OUT" "MASK_$LEFT_OUT" "$LEFT_OUT" "$RIGHT_OUT";
echo "Created combined flag $OUT"