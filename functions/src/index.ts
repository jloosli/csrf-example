import * as functions from 'firebase-functions';
import * as express from 'express';
import {register} from './bank';


const app = express();
register(app);
exports.static = functions.https.onRequest(app);
