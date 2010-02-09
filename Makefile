YUIBIN = java -jar ~/Downloads/yuicompressor-2.4.2/build/yuicompressor-2.4.2.jar
CSSOPT = --type css
JSOPT = --type js

M4 = m4

GADGETSRC = gadget.m4.xml
GADGETDEST = gadget.xml

CSSSRC = css/smoothness/jquery-ui-1.7.2.custom.css css/style.css 
CSSDEST = style.min.css

JSSRC = tf.js
JSDEST = tf.min.js

default: ${GADGETDEST}

${GADGETDEST}: ${GADGETSRC} ${CSSDEST} ${JSDEST}
	${M4} ${GADGETSRC} > ${GADGETDEST}

${CSSDEST}: ${CSSSRC}
	cat ${CSSSRC} | ${YUIBIN} ${CSSOPT} > ${CSSDEST}

${JSDEST}: ${JSSRC}
	cat ${JSSRC} | ${YUIBIN} ${JSOPT} > ${JSDEST}

