exports.setupGame = (socket) => {
	engines[socket.id] = spawn(
		javaExecutable,
		["-jar", enginePath, playerIsWhite.toString()],
		{
			stdio: ["pipe", "pipe", "pipe"],
		},
	);
	sockets[socket.id]=socket;	
	engines[socket.id].stdout.on("data", handleEngineMessage);
	readyStates[socket.id]=false;
	awaitingengineMove[socket.id]=false;
	console.log("Sending to engine:", "engine ready?@"+socket.id+"\n");
	engines[socket.id].stdin.write("engine ready?@"+socket.id+"\n");	
};