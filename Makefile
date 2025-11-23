.PHONY: clean

SRC = $(shell find src -name "*.ts")

lib/index.js: $(SRC) tsconfig.json
	npx tsc

clean:
	rm -rf lib
