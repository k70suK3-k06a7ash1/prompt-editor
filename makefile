format:
	npx @biomejs/biome format --write ./src
push:
	git add . && git commit -m 'chore' && git push origin
