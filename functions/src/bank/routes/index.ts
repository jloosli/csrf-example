import * as path from 'path';
import {Application, Request, Response} from 'express';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import * as functions from 'firebase-functions';

const defaultRenderOptions = {
  title: 'Super Secure Bank',
  bankName: 'Super Secure Bank',
};

export const register = (app: Application) => {
  app.set('views', path.join(__dirname, '..', 'views'));
  app.set('view engine', 'ejs');
  // app.use(cors());
  app.use(cookieParser());

  app.get('/', (req: Request, res: Response) => {
    const name = req.cookies.name;
    res.render('index', {
      ...defaultRenderOptions,
      loggedIn: isLoggedIn(req),
      name,
    });
  });
  app.get('/login', (req: Request, res: Response) => {
    res.render('login', {
      ...defaultRenderOptions,
      title: 'Login | ' + defaultRenderOptions.title,
      header: 'Login', loggedIn: isLoggedIn(req),
    });
  });
  app.post('/login', (req: Request, res: Response) => {
    res.cookie('name', req.body.name);
    res.cookie('balance', req.cookies.balance || 0);
    res.redirect('/deposit');
  });

  app.get('/deposit', [loggedIn], (req: Request, res: Response) => {
    const name = req.cookies.name;
    const balance = req.cookies.balance || 0;
    res.render('deposit', {
      ...defaultRenderOptions,
      title: 'Deposit | ' + defaultRenderOptions.title,
      header: 'Deposit',
      balance: new Intl.NumberFormat('en-US',
          {style: 'currency', currency: 'USD'}).format(balance),
      name,
      loggedIn: isLoggedIn(req),
    });
  });

  app.post('/deposit', [loggedIn], (req: Request, res: Response) => {
    const newBalance = (req.cookies.balance || 0) + parseInt(req.body.amount);
    res.cookie('balance', newBalance);
    res.redirect('/deposit');
  });

  app.get('/transfer', [loggedIn], (req: Request, res: Response) => {
    const name = req.cookies.name;
    const balance = req.cookies.balance || 0;
    res.render('transfer', {
      ...defaultRenderOptions,
      title: 'Transfer | ' + defaultRenderOptions.title,
      header: 'Transfer',
      balance: new Intl.NumberFormat('en-US',
          {style: 'currency', currency: 'USD'}).format(balance),
      name,
      transfer: false, loggedIn: isLoggedIn(req),
    });
  });

  app.post('/transfer', [loggedIn], (req: Request, res: Response) => {
    const name = req.cookies.name;
    const transferAmount = parseInt(req.body.amount);
    const newBalance = (req.cookies.balance || 0) - transferAmount;
    res.cookie('balance', newBalance);
    res.render('transfer', {
      ...defaultRenderOptions,
      title: 'Transfer | ' + defaultRenderOptions.title,
      header: 'Transfer',
      balance: new Intl.NumberFormat('en-US',
          {style: 'currency', currency: 'USD'}).format(newBalance),
      name,
      transfer: {
        amount: new Intl.NumberFormat('en-US',
            {style: 'currency', currency: 'USD'}).format(transferAmount),
        destination: req.body.destination,
      },
      loggedIn: isLoggedIn(req),
    });
  });

  app.get('/logout', (req: Request, res: Response) => {
    res.clearCookie('name');
    res.clearCookie('balance');
    res.redirect('/');
  });

  app.get('*', (req: Request, res: Response) => {
    res.redirect('/');
  });
};

const loggedIn = (req: Request, res: Response, next: () => void) => {
  if (req.cookies.name) {
    next();
  } else {
    res.redirect('/login');
  }
};

const isLoggedIn = (req: Request) => {
  functions.logger.log('isLoggedIn', req);
  const res = Boolean(req?.cookies?.name);
  functions.logger.log('isLoggedIn:res', res);
  return res;
};

