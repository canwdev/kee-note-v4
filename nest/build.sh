#yarn build:all
echo ">>> [tar] bundling files..." &&
tar czf dist.tar dist frontend-dist node_modules package.json yarn.lock test run.sh &&
echo ">>> [tar] ok"
