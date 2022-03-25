import * as path from 'path';
import {Application, Request, Response} from 'express';
import * as cookieParser from 'cookie-parser';

const defaultRenderOptions = {
  title: 'Super Secure Bank',
  bankName: 'Super Secure Bank',
};

export const register = (app: Application) => {
  app.set('views', path.join(__dirname, '..', 'views'));
  app.set('view engine', 'ejs');
  app.use(cookieParser());
  app.get('/', (req: Request, res: Response) => {
    res.render('index', {
      ...defaultRenderOptions,
    });
  });
  app.get('/login', (req: Request, res: Response) => {
    res.render('login', {
      ...defaultRenderOptions,
      title: 'Login | ' + defaultRenderOptions.title,
      header: 'Login',
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
    });
  });

  app.post('/deposit', [loggedIn], (req: Request, res: Response) => {
    const newBalance = (req.cookies.balance || 0) + parseInt(req.body.amount);
    res.cookie('balance', newBalance);
    res.redirect('/deposit');
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
