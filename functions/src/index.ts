import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express'
import * as cors from 'cors'


const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://goty-84c9e.firebaseio.com"
  });

  const db = admin.firestore();
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
export const helloWorld = functions.https.onRequest((request, response) => {
 response.json({
    resp: 'hello'
});
});

export const testing = functions.https.onRequest((request, response) => {
        const name= request.query.name || 'Nameless';
        response.json({name: name})
});

export const getGoty = functions.https.onRequest( async (request, response) => {
    
    const gameListRef = db.collection('gameList');
    const docsSnap = await gameListRef.get();

    const games = docsSnap.docs.map( doc => doc.data() );

    response.json(games);

});


// Crear servidor express para servicio REST
const app = express();
app.use(cors({origin: true}));

app.get('/getGoty', async (req, res) => {
    const gameListRef = db.collection('gameList');
    const docsSnap = await gameListRef.get();

    const games = docsSnap.docs.map( doc => doc.data() );

    res.json(games);
});

app.post('/getGoty/:id', async (req, res) => {
    const id = req.params.id;
    const gameRef = db.collection('gameList').doc(id);
    const gameSnap = await gameRef.get();

    if (!gameSnap.exists) {


        res.status(404).json({
            ok: false,
            message: 'No existe un juego con el ID ' + id
        })
    } else {
        const before = gameSnap.data() || { votes: 0 };
        await gameRef.update( {
            votes: before.votes + 1
        }
        )
        res.json({
            ok: true,
            message: 'Gracias por darle tu voto a ' + before.name
        })
    }

});

exports.api = functions.https.onRequest(app);