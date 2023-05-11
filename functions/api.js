import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

import dotenv from 'dotenv';
dotenv.config();
import serverless from 'serverless-http';
const router = express.Router();
const app = express();
import path from 'path';
import multer from 'multer';

import { CloudinaryStorage } from 'multer-storage-cloudinary';
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_KEY_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'Images',
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, callback) => {
    const ext = path.extname(file.originalname);
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
      return callback(new Error('Only images are allowed'));
    }
    callback(null, true);
  },
});

import {
  registerValidation,
  loginValidation,
  postCreateValidation,
} from '../validations.js';

import {
  checkAuth,
  handleValidationErrors,
  // cloudinary,
} from '../utils/index.js';

import { UserController, PostController } from '../controllers/index.js';

mongoose
  .connect(
    'mongodb+srv://kamishnikovda:Bendgamin7@cluster0.jakkw2v.mongodb.net/SocialNetwork?retryWrites=true&w=majority'
  )
  .then(() => {
    console.log('DB OK');
  })
  .catch(err => {
    console.log('DB Error', err);
  });

app.use(express.json());
app.use(cors());

router.post('/upload', upload.single('image'), async (req, res) => {
  const filedata = req.file;
  if (!filedata) res.status(403).json({ message: 'Неверный формат файла!' });
  return res.json({ url: req.file.path });
});
router.post(
  '/auth/login',
  loginValidation,
  (req, res, next) => {
    handleValidationErrors(req, res, next);
  },
  (req, res, err) => {
    UserController.login(req, res);
  }
);
router.post(
  '/auth/register',
  registerValidation,
  (req, res, next) => {
    handleValidationErrors(req, res, next);
  },
  (req, res, err) => {
    UserController.register(req, res);
  }
);
router.get('/:userId', (req, res, err) => {
  UserController.getUser(req, res);
});
router.get('/friends/:userId', (req, res, err) => {
  UserController.getFriends(req, res);
});
router.get('/users/all', (req, res, err) => {
  UserController.getAllUsers(req, res);
});

router.get('/posts/all', (req, res, err) => {
  PostController.getAll(req, res);
});
router.get('/posts/:id', (req, res, err) => {
  PostController.getPostsByUser(req, res);
});
router.get('/posts/all/:userId', (req, res, err) => {
  PostController.getPostsByFriends(req, res);
});
router.post(
  '/posts',
  (req, res, next) => {
    checkAuth(req, res, next);
  },
  postCreateValidation,
  (req, res, next) => {
    handleValidationErrors(req, res, next);
  },
  (req, res, err) => {
    PostController.create(req, res);
  }
);
router.post(
  '/posts/:postId',
  (req, res, next) => {
    checkAuth(req, res, next);
  },
  (req, res, err) => {
    PostController.changeLikes(req, res);
  }
);
router.delete(
  '/posts/:id',
  (req, res, next) => {
    checkAuth(req, res, next);
  },
  (req, res, err) => {
    PostController.remove(req, res);
  }
);

router.post(
  '/friends/:friendId',
  (req, res, next) => {
    checkAuth(req, res, next);
  },
  (req, res, err) => {
    UserController.addFriend(req, res);
  }
);
router.delete(
  '/friends/:friendId',
  (req, res, next) => {
    checkAuth(req, res, next);
  },
  (req, res, err) => {
    UserController.removeFriend(req, res);
  }
);

app.use('/.netlify/functions/api', router);
module.exports.handler = serverless(app);
