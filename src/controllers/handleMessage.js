/*

msg{
  key: {
    remoteJid: '6289693313000@s.whatsapp.net',
    fromMe: false,
    id: 'B8A37B911FE3F51CB72046D28773EB5B',
    participant: undefined
  },
  messageTimestamp: 1724550803,
  pushName: 'Karim Roy Tampubolon',
  broadcast: false,
  message: Message {
    conversation: 'M',
    messageContextInfo: MessageContextInfo {
      deviceListMetadata: [DeviceListMetadata],
      deviceListMetadataVersion: 2
    }
  },
  sessionId: 'karimroy',
  saveImage: [Function (anonymous)],
  saveVideo: [Function (anonymous)],
  saveDocument: [Function (anonymous)]
}


*/
// Define a Mongoose model without a schema
const mongoose = require('mongoose');
const FlexibleModel = mongoose.model('FlexibleModel', new mongoose.Schema({}, { strict: false }));

// Creating a new document with arbitrary fields
const set = async (object) => {
  const newDoc = new FlexibleModel(object);
  await newDoc.save();
  console.log('Document saved:', newDoc);
  return newDoc
};




// Update a document
const get = async (remoteJid, object) => {
  if (object) {
    const updatedDoc = await FlexibleModel.findOneAndUpdate(
      remoteJid,
      object,
      { new: true }
    ).lean();
    console.log('Document updated:', updatedDoc);
    return updatedDoc
  } else {
    const docs = await FlexibleModel.find(remoteJid).lean();
    console.log('Documents found:', docs);
    return docs
  }
};

module.exports = async (msg, whatsapp) => {

  const { key, messageTimestamp, pushName, broadcast, message, sessionId } = msg
  const { remoteJid, fromMe, id, participant } = key
  if (fromMe || remoteJid.includes('status') || broadcast || participant) return
  const { conversation } = message

  await whatsapp.readMessage({
    sessionId,
    key,
  });

  await whatsapp.sendTyping({
    sessionId,
    to: remoteJid,
    duration: 1000,
  });

  const [find] = await get({ remoteJid })
  if (find) {
    console.log('isi');
    switch (find.content) {
      case 1:
        await whatsapp.sendTextMessage({
          sessionId,
          to: remoteJid,
          text: "Boleh kami tahu nama lengkap Anda?",
        });
        await get({ remoteJid }, { content: 2 })
        break
      case 2:
        await whatsapp.sendTextMessage({
          sessionId,
          to: remoteJid,
          text: "Boleh kami tahu alamat lengkap Anda?",
        });
        await get({ remoteJid }, { nama: conversation, content: 3 })
        break
      case 3:
        await get({ remoteJid }, { alamat: conversation, content: 4 })
        const [{ nama, alamat }] = await get({ remoteJid })
        await whatsapp.sendTextMessage({
          sessionId,
          to: remoteJid,
          text: `Nama : ${nama}\nAlamat : ${alamat}\nApakah data anda sudah benar?Balas YA/TIDAK`,
        });
        break
      case 4:
        if (conversation.toLowerCase() === "ya") {
          await whatsapp.sendTextMessage({
            sessionId,
            to: remoteJid,
            text: "silakan pilih jenis pertanyaan atau keluhan yang ingin Anda sampaikan mengenai sekolah atau pendidikan di Kota Sukabumi:\n\n1. Keluhan\n2. Saran\n3. Kritik\n4. Aspirasi\n\nKami akan dengan senang hati membantu Anda sesuai dengan pilihan yang Anda berikan.",
          });
          await get({ remoteJid }, { content: 5 })
        } else if (conversation.toLowerCase() === "tidak") {
          await whatsapp.sendTextMessage({
            sessionId,
            to: remoteJid,
            text: "Boleh kami tahu nama lengkap Anda?",
          });
          await get({ remoteJid }, { content: 2 })
        } else {
          const { nama, alamat } = await get({ remoteJid })
          await whatsapp.sendTextMessage({
            sessionId,
            to: remoteJid,
            text: `Nama : ${nama}\nAlamat : ${alamat}\nApakah data anda sudah benar?Balas YA atau TIDAK`,
          });
          await get({ remoteJid }, { content: 4 })
        }
        break
      default:
        const [user] = await get({ remoteJid })
        if (conversation.length === 1 && isNaN(conversation) === false && user.menu !== 5) {
          await get({ remoteJid }, { menu: parseFloat(conversation) })
          // await sendMessage(wa, user, `${message.length} ${isNaN(message)}`)
        }
        const [{ menu }] = await get({ remoteJid })
        switch (parseFloat(menu)) {
          case 0:
            await whatsapp.sendTextMessage({
              sessionId,
              to: remoteJid,
              text: "silakan pilih jenis pertanyaan atau keluhan yang ingin Anda sampaikan mengenai sekolah atau pendidikan di Kota Sukabumi:\n\n1. Keluhan\n2. Saran\n3. Kritik\n4. Aspirasi\n\nKami akan dengan senang hati membantu Anda sesuai dengan pilihan yang Anda berikan.",
            });
            break
          case 1:
            await whatsapp.sendTextMessage({
              sessionId,
              to: remoteJid,
              text: `Anda telah memilih opsi 1. Silakan tuliskan *Keluhan* Anda.`,
            });
            await get({ remoteJid }, { menu: 5, _menu: 1 })
            break
          case 2:
            await whatsapp.sendTextMessage({
              sessionId,
              to: remoteJid,
              text: `Anda telah memilih opsi 2. Silakan tuliskan *Saran* Anda.`,
            });
            await get({ remoteJid }, { menu: 5, _menu: 2 })
            break
          case 3:
            await whatsapp.sendTextMessage({
              sessionId,
              to: remoteJid,
              text: `Anda telah memilih opsi 3. Silakan tuliskan *Kritik* Anda.`,
            });
            await get({ remoteJid }, { menu: 5, _menu: 3 })
            break
          case 4:
            await whatsapp.sendTextMessage({
              sessionId,
              to: remoteJid,
              text: `Anda telah memilih opsi 4. Silakan tuliskan *Aspirasi* Anda.`,
            });
            await get({ remoteJid }, { menu: 5, _menu: 4 })
            break
          case 5:
            const _menu = { 1: "Keluhan", 2: "Saran", 3: "Kritik", 4: "Aspirasi" }
            const [user] = await get({ remoteJid })
            const message = [...user.message]
            message.push({ jenis: _menu[user._menu], kontent: conversation })
            await whatsapp.sendTextMessage({
              sessionId,
              to: remoteJid,
              text: `Terima kasih telah memberikan ${_menu[user._menu]} Anda. Kami menghargai masukan Anda dan akan segera menindaklanjutinya. Tim kami akan menghubungi Anda jika diperlukan informasi tambahan atau untuk memberikan update terkait ${_menu[user._menu]
                } yang Anda sampaikan.\n\nJika Anda memiliki pertanyaan lebih lanjut atau memerlukan bantuan tambahan, jangan ragu untuk menghubungi kami lagi.\n\nSilakan pilih jenis pertanyaan atau keluhan yang ingin Anda sampaikan mengenai sekolah atau pendidikan di Kota Sukabumi:\n\n1. Keluhan\n2. Saran\n3. Kritik\n4. Aspirasi\n\nKami akan dengan senang hati membantu Anda sesuai dengan pilihan yang Anda berikan.`,
            });
            await get({ remoteJid }, { menu: 0, _menu: 0, message })
            break
        }

        break
    }
  } else {
    console.log('kosong');
    await set({ remoteJid, menu: 0, _menu: 0, content: 1, nama: "", alamat: "", message: [] })
    await whatsapp.sendTextMessage({
      sessionId,
      to: remoteJid,
      text: "Halo, terima kasih telah menghubungi kami. Sebelum kami dapat memproses pertanyaan atau keluhan Anda mengenai sekolah atau pendidikan di Kota Sukabumi, kami memerlukan beberapa informasi dasar untuk verifikasi.",
    });
    await whatsapp.sendTextMessage({
      sessionId,
      to: remoteJid,
      text: "Boleh kami tahu nama Anda terlebih dahulu?",
    });
    await get({ remoteJid }, { content: 2 })
  }
  // await whatsapp.sendTextMessage({
  //   sessionId,
  //   to: remoteJid,
  //   text: conversation,
  //   // answering: msg, // for quoting message
  // });
}