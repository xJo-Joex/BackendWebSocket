//libreria estandar de node js
const { Server } = require("net");

const host = "localhost";
//para definir cuando el cliente a cerrado la sesión
const END = "END";

//Map para registrar las conexiones
const connections = new Map();

//funcion para error en el caso de que no me pasen los argumentos necesarios en la consola
const error = (message) => {
  console.error(message);
  //se pasa cero cuando todo es "OK"
  //en este caso "1" por que todo no fue "ok" se cierra por falta de argunmentos
  process.exit(1);
};

const sendMessage = (message, origin) => {
  for (let [key, value] of connections) {
    if (origin !== key) {
      key.write(message);
    }
  }
};

const listen = (port) => {
  const server = new Server();

  //cuando se me conecte  una maquina me van a dar un socket y voy a impirmir la
  //direccion ip de esa maquina;
  server.on("connection", (socket) => {
    const remoteSocket = `${socket.remoteAddress}: ${socket.remotePort}`;
    console.log(`New connection from [${remoteSocket}]`);
    socket.setEncoding("utf-8");

    socket.on("error", (err) => error(err.message));
    socket.on("data", (message) => {
      // si la coneccion ocurre por primera vista mapeo el socket con el con el valor del nombre de usuario
      if (!connections.has(socket)) {
        console.log(`Username ${message} set for connection ${remoteSocket}`);
        connections.set(socket, message);
        //caso contrario reviso de que el mensaje no sea el de ccerra sesión
      } else if (message === END) {
        connections.delete(socket);
        socket.end();
      } else {
        const fullMessage = `${connections.get(socket)} : ${message}`;
        // for (let [key, value] of connections) {
        //   console.log(value);
        // }
        //enviar los mensajes al resto de clientes
        console.log(` ${remoteSocket} -> ${fullMessage}`);
        // socket.write(`Mensaje enviado a las ${new Date()}`);
        sendMessage(fullMessage, socket);
      }
    });
    socket.on("close", () => {
      console.log(`Connection with ${remoteSocket} closed`);
    });
  });

  server.listen({ port, host }, () => {
    console.log(`listening on port ${port}`);
  });

  // para controlar en el caso de que digite un puerto ocupado
  server.on(error, (err) => error(err.message));
};

const main = () => {
  //esto lee los argumentos que se escriben en la consola
  // console.log(process.argv);
  if (process.argv.length !== 3) {
    error(`Usage: node ${__filename} port`);
  }
  let port = process.argv[2];
  if (isNaN(port)) {
    error(`Invalid port ${port}`);
  }
  //paso a tipo number
  port = Number(port);
  listen(port);
};
//si este archivo es el principal ejecuta la funcion main()
if (require.main === module) {
  main();
  // console.log(module)
}
