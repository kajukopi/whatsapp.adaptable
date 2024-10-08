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
            socket.emit('info:whatsapp', "session connected to: ", sessionId);
          })

          // Whatsapp Disconected
          whatsapp.onDisconnected((sessionId) => {
            socket.emit('info:whatsapp', "session disconnected to: ", sessionId);
          })

          // Whatsapp on update
          whatsapp.onMessageUpdate((sessionId) => {
            socket.emit('info:whatsapp', "session message update: ", sessionId);
          })

          // Whatsapp on Pairing Code
          whatsapp.onPairingCode((sessionId, code) => {
            socket.emit('info:whatsapp', "On pairing code: ", code);
          })

          // Whatsapp on QRCOde
          whatsapp.onQRUpdated(({ sessionId, qr }) => {
            QRCode.toDataURL(qr, function (err, url) {
              socket.emit('qr:whatsapp', { url });
            })
          })
          // Whatsapp On Message Recieved
          whatsapp.onMessageReceived((msg) => {
            require('./handleMessage')(msg, whatsapp)
          });
        })
      } else {
        socket.emit('info:whatsapp', "Session: ", session?.user?.id);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });



  });
}

module.exports = { initializeSocketIO }