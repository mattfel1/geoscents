pushd geoscents
git pull
popd
rm -rf /var/www/html/*
cp -r geoscents/* /var/www/html/

