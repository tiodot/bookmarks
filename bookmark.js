"use strict"
const http = require('http');
const url = require('url');
const fs = require('fs');
const readline = require('readline');
const querystring = require('querystring');
const spawnSync = require('child_process').spawnSync;

http.createServer((req, res) => {
	let urlData = url.parse(req.url);
	//console.dir(urlData);
	let queryObj = querystring.parse(urlData.query);
	console.dir(queryObj);
	writeToMarKdownDoc(queryObj);
	res.writeHead({'Content-Type': 'plain'});
	res.end('ok');
}).listen(3000);


function changeFilename () {
	let fileName = 'README.md';
	let name = '';
	let date = new Date();
	if (date.getDate() === 1) {
		name = data.getFullYear() + '_' + data.getMonth() + '.md'
		fs.renameSync(fileName, name);
	}
	return fileName;
}

function isNewFile(filename) {
	try {
		let fileState = fs.statSync(filename);
		let result = fileState.isFile();
		return result;
	}
	catch(e) {
		console.error(e);
		return false;
	}
}

function writeToFile(filename, data) {
	fs.writeFile(filename, data, (err) => {
		if (err) console.err(err);
		console.log('saved ' + filename);
		pushToGit();
	});
}

function writeToMarKdownDoc(obj) {
	let fileName = changeFilename();
	let data = [];
	let inserted = false;
	const date = new Date();
	if (!isNewFile(fileName)) {
		data.push(`### ${date.getFullYear()}-${date.getMonth()}-${date.getDate()}<br />`)
		data.push(`+ [${obj.title}](${obj.url})<br />\n`);
		writeToFile(fileName, data.join('\n'));
		return;
	}
	const rl = readline.createInterface({
	    input: fs.createReadStream(fileName)
	});

	rl.on('line', (line) => {
		if (!inserted && line.startsWith('###')) {

			let data_str = line.slice(3, 3 + 10).trim();
			if (new Date(data_str).getDate() === date.getDate()) {
				data.push(line);
				data.push(`+ [${obj.title}](${obj.url})<br />`);
			}
			else {
				data.push(`### ${date.getFullYear()}-${date.getMonth()}-${date.getDate()}<br />`)
				data.push(`+ [${obj.title}](${obj.url})<br />\n`);
				data.push(line);
			}
			inserted = true;
		}
		else {
			data.push(line);
		}
	});
	rl.on('close', () => {
		if (!inserted) { //新建的文件
			data.push(`### ${date.getFullYear()}-${date.getMonth()}-${date.getDate()}<br />`)
			data.push(`+ [${obj.title}](${obj.url})<br />\n`);
		}
		writeToFile(fileName, data.join('\n'));
	});
}

function pushToGit(title) {
	var cmds = [['git', ['add', '.']], ['git', ['commit', '-am', `"add ${title}"`]],['git', ['pull', '--rebase']], ['git', ['push']]];
	cmds.forEach((cmd) => {
		console.dir(spawnSync(cmd[0], cmd[1]));
	});
}

console.log('server start at 3000');