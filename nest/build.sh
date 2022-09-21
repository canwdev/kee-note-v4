#yarn build:all
echo ">>> [tar] bundling files..." &&
tar czf dist.tar dist dist-frontend node_modules package.json yarn.lock test run.sh &&
echo ">>> [tar] ok"
