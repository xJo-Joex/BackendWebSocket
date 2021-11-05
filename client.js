const { Socket } = require("net");
//Esta libreria se encarga de permitir realizar entradas
// atraves de la consola
const readline = require("readline").createInterface({
  //difino la entrada y la salida, estableciendo para ambas la consola
  input: process.stdin,
  output: process.stdout,
  prompt: ">"
});
//Mensaje clave para cerrar la sesión
const END = "END";

const error = (message) => {
  console.error(message);
  //se pasa cero cuando todo es "OK"
  //en este caso "1" por que todo no fue "ok" se cierra por falta de argunmentos
  process.exit(1);
};

const connect = (host, port) => {
  console.log(`Connection to ${host} : ${port}`);
  const socket = new Socket();
  //creo una conección a esta direccion con este puerto
  socket.connect({ host, port });
  socket.setEncoding("utf-8");
  socket.on("connect", () => {
    console.log(`Connected`);
    readline.question(`Choose your username: `, (username) => {
      socket.write(username);
      console.log(`Type any message to sent it, type ${END} to finish`);
    });
    //Escucho el evento de escritura de una linea en la consola
    // y lo envio a traves de mi socket al server
    readline.on("line", (line) => {
      socket.write(line);
      if (line === END) {
        socket.end(); //finaliza el programa pero no lo mata
        //si pusiera la linea aqui de matar el pragrama
        //da error porque el servidor nunca confirma el cierre de la sesion
        // process.exit(0);
        console.log(`Desconneted`);
      }
    });
    socket.on("data", (data) => {
      console.log(data);
    });
  });

  socket.on("error", (err) => error(err.message));
  //evento para escuchar cuando cierra la sesion el servidor
  socket.on("close", () => process.exit(0));
};

const main = () => {
  if (process.argv.length !== 4) {
    error(`Usage: node ${__filename} host port`);
  }
  let [, , host, port] = process.argv;
  if (isNaN(port)) {
    error(`Invalid port ${port}`);
  }
  port = Number(port);

  console.log(`${host} ${port}`);
  connect(host, port);
};

if (module === require.main) {
  main();
}
