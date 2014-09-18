
test:
	@NODE_TLS_REJECT_UNAUTHORIZED=0 ./node_modules/.bin/mocha 


.PHONY: test