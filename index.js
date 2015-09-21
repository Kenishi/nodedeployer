var net = require('net'),
	path = require('path'),
	config = require('config'),
	spawn = require('child_process').spawn;

NAME = config.get("name");
SOCKET_PATH = config.get("socket_path");
DEPLOY_SCRIPT_PATH = path.resolve(config.get("deploy_script_path"));
LOGGING = config.get("logging");

var server = net.createServer(function(c) {
	c.on('data', function(buffer) {
		var data = "";
		if(typeof buffer === "string") {
			data = 	buffer;
		}
		else if(typeof buffer === "object") {
			data = buffer.toString('utf8');
		}
		data = data.trim();
		if(data === "DEPLOY") {
			doDeploy();
			server.close();
		}
	});
});

function doDeploy() {
	if(LOGGING) {
		console.log("Deploy running");
	}

	deploy = spawn('sh', [DEPLOY_SCRIPT_PATH], {
		cwd : path.dirname(DEPLOY_SCRIPT_PATH)
	});
	
	deploy.on('exit', function(code, signal) {
		console.log("Deploy process completed with code: " + code + " Signal:" + signal);
	});
	
	deploy.on('error', function(err) {
		console.log(err);
	});
	
	deploy.stdout.on('data', function(buffer) {
		var data = buffer.toString('utf8');
		if(LOGGING) {
			console.log(data);
		}
	});
}

server.listen(SOCKET_PATH);
if(LOGGING) {
	console.log(NAME + " Deployer listening");
}

process.on('SIGTERM', exit.bind(this, 'SIGTERM'));
process.on('SIGINT', exit.bind(this, 'SIGINT'));
process.on('exit', exit.bind(this));

function exit(signal) {
	if(LOGGING) {
		console.log(NAME + " Deployer Exiting");
	}
	server.close();
	process.kill(process.pid, signal);
}