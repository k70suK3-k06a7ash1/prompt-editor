format:
	npx @biomejs/biome format --write ./src

lint:
	npx @biomejs/biome lint --write ./src

check:
	npx @biomejs/biome check --write ./src

push:
	git add . && git commit -m 'chore' && git push origin

# GitHub Actions local testing with act
act-test:
	act -j test

act-list:
	act -l

act-dry:
	act -n

act-test-verbose:
	act -j test --verbose
