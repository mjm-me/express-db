import express from 'express';
import createDebug from 'debug';
import { resolve } from 'path';
import morgan from 'morgan';
import cors from 'cors';
import bodyParser from 'body-parser';
import { debugLogger } from './middleware/debug-logger.js';
import {
  notFoundController,
  notMethodController,
} from './controllers/base.controller.js';
import { errorManager } from './controllers/errors.controller.js';
import { HomeController } from './controllers/home.controller.js';
import { createProductsRouter } from './routers/products.router.js';
import { HomePage } from './views/pages/home-page.js';
import { ProductsController } from './controllers/products.mvc.controller.js';
import type { Repository } from './models/repository.type.js';
import type { Animal } from './models/animal.type.js';
import { AnimalFileRepo } from './models/animals.json.repository.js';
//import { AnimalSqliteRepo } from './models/animals.sqlite.repository.js';
import { AnimalMySqlRepo } from './models/animals.mysql.repository.js';
import { AnimalPrismaRepo } from './models/animals.prisma.repository.js';

const debug = createDebug('demo:app');
debug('Loaded module');

export const createApp = () => {
  debug('Iniciando App...');

  const app = express();
  const __dirname = resolve();
  const publicPath = resolve(__dirname, 'public');

  app.disable('x-powered-by');

  // Middlewares
  app.use(cors());
  if (!process.env.DEBUG) {
    app.use(morgan('dev'));
  }
  app.use(express.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(debugLogger('debug-logger'));
  app.use(express.static(publicPath));

  // Got assets: static redirection

  app.get('/src/assets/*', (req, res) => {
    const url = req.url.replace('/src/assets/', './public/got/assets/');
    const assetPath = resolve(__dirname, url);
    debug('Serving asset:', url);
    res.sendFile(assetPath);
  });

  // Routes

  const homeView = new HomePage();
  const homeController = new HomeController(homeView);
  app.get('/', homeController.getPage);

  let animalModel: Repository<Animal>;
  switch (process.env.REPO as 'file' | 'sqlite' | 'mysql' | 'prisma') {
    //case 'sqlite':
    // animalModel = new AnimalSqliteRepo();
    //break;
    case 'mysql':
      animalModel = new AnimalMySqlRepo();
      break;
    case 'prisma':
      animalModel = new AnimalPrismaRepo();
      break;
    case 'file':
      animalModel = new AnimalFileRepo();
      break;
    default:
      throw new Error('Invalid repository');
  }

  const productsController = new ProductsController(animalModel);

  app.use('/products', createProductsRouter(productsController));

  app.get('*', notFoundController);
  app.use('*', notMethodController);

  app.use(errorManager);

  return app;
};
