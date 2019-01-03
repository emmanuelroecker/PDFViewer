#!/bin/sh
NOT='.sh$|^.git|^tests|^.eslint|^.travis|^package.json$|^package-lock.json$|.xpi$'
PDFJS_IN=node_modules/pdfjs-dist/build/pdf.js
PDFWORKERJS_IN=node_modules/pdfjs-dist/build/pdf.worker.js
PDFJS_OUT=content/vendor/pdf.js
PDFWORKERJS_OUT=content/vendor/pdf.worker.js

mkdir -p content/vendor
cp $PDFJS_IN $PDFJS_OUT
cp $PDFWORKERJS_IN $PDFWORKERJS_OUT

git ls-files | egrep -v $NOT > files

if [ -f $PDFJS ]; then
  true;
else
  echo "Please run make from content/pdfjs";
  exit 1
fi
echo $PDFJS_OUT >> files
echo $PDFWORKERJS_OUT >> files

rm ../release/pdfviewer.xpi
zip ../release/pdfviewer.xpi $(cat files)
rm files
