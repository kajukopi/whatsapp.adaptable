const socketIO = require('socket.io');
const whatsapp = require('wa-multi-session')
const QRCode = require('qrcode')

function initializeSocketIO(server) {
  const io = socketIO(server);
  // Set up Socket.IO connections
  io.on('connection', (socket) => {
    console.log('A user connected');

    // Handle incoming messages from clients
    socket.on('start:whatsapp', (msg) => {
      const session = whatsapp.getSession('karimroy')
      if (!session) {
        whatsapp.startWhatsapp('karimroy').then((data) => {
          socket.emit('start:whatsapp', `Initialize...`); // Broadcast the message to all connected clients

          // Whatasaap Connected
          whatsapp.onConnected((sessionId) => {
            console.log("session connected to: ", sessionId);
            socket.emit('info:whatsapp', "session connected to: ", sessionId);
          })

          // Whatsapp Disconected
          whatsapp.onDisconnected((sessionId) => {
            console.log("session disconnected to: ", sessionId);
            socket.emit('info:whatsapp', "session disconnected to: ", sessionId);
          })

          // Whatsapp on update
          whatsapp.onMessageUpdate((sessionId) => {
            console.log("session message update: ", sessionId);
            socket.emit('info:whatsapp', "session message update: ", sessionId);
          })

          // Whatsapp on Pairing Code
          whatsapp.onPairingCode((sessionId, code) => {
            console.log("On pairing code: ", sessionId, code);
            socket.emit('info:whatsapp', "On pairing code: ", code);
          })

          // Whatsapp on QRCOde
          whatsapp.onQRUpdated(({ sessionId, qr }) => {
            console.log("On qrcode update: ", sessionId, qr);
            QRCode.toDataURL(qr, function (err, url) {
              console.log(url)
              socket.emit('qr:whatsapp', { url });
            })
          })
          // Whatsapp On Message Recieved
          whatsapp.onMessageReceived(async (msg) => {

            // If from me and from status return false
            if (msg.broadcast || msg.key.fromMe || msg.key.remoteJid.includes("status")) return;

            console.log(msg);

            await whatsapp.readMessage({
              sessionId: msg.sessionId,
              key: msg.key,
            });

            await whatsapp.sendTyping({
              sessionId: msg.sessionId,
              to: msg.key.remoteJid,
              duration: 3000,
            });

            await whatsapp.sendTextMessage({
              sessionId: msg.sessionId,
              to: msg.key.remoteJid,
              text: msg.message.conversation,
              // answering: msg, // for quoting message
            });
          });
        })
      } else {
        socket.emit('info:whatsapp', "Session: ", session.user);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });



  });
}

module.exports = { initializeSocketIO }