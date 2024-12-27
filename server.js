//import the enviromental config 
import 'dotenv/config';

//import the libs 

import express, { json } from 'express'
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import options from './csp-options.js';
import { engine } from 'express-handlebars';
import roleData from './model/data.js';
import https from 'https';
import { readFile } from 'fs/promises';

//creation of the server 
let app = express();

// Add the middlewares 
app.use(helmet(options));
app.use(compression());
app.use(cors());
app.use(json());
app.use(express.static('public'));
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');
app.enable('trust proxy');

app.use((req, res, next) => {
  res.locals.styles = '/css/style.css';  // Inject the styles link
  next();
});
//Paths coding 
app.get('/', async (request, response) => {
  try {

    response.render('main-interface', {
      title: 'Portofolio',
      styles: ['/css/style.css'],
      data: roleData,

    });

    console.log(roleData.images);
  } catch (error) {
    response.status(500).send('Erreur serveur.');
  }
});

//Send an error 404 for undefined paths 
app.use(function (request, response) {
  response.status(404).send(request.originalUrl + ' not found.');
});

//server started 
if (process.env.NODE_ENV === 'production') {
  console.log('http://localhost:' + process.env.PORT);
  app.listen(process.env.PORT);
} else {
  const credentials = {
    cert: await readFile('./security/localhost.cert'),
    key: await readFile('./security/localhost.key')
  };
  console.log('Serveur démarré:');
  console.log('https://localhost:' + process.env.PORT);
  https.createServer(credentials, app).listen(process.env.PORT);
}
