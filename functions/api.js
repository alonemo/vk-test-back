import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';

const serverless = require('serverless-http');
const router = express.Router();
const app = express();

import {
  registerValidation,
  loginValidation,
  postCreateValidation,
} from '../validations.js';

import { checkAuth, handleValidationErrors } from '../utils/index.js';

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

// const app = express();

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads');
    }
    cb(null, 'uploads');
  },
  filename: (_, file, cb) => {
    cb(null, file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage,
  fileFilter,
});

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

router.post(
  '/auth/login',
  loginValidation,
  handleValidationErrors,
  UserController.login
);
router.post(
  '/auth/register',
  registerValidation,
  handleValidationErrors,
  UserController.register
);
router.get('/:userId', UserController.getUser);
router.get('/friends/:userId', UserController.getFriends);
router.get('/users/all', UserController.getAllUsers);

router.post('/upload', upload.single('image'), (req, res) => {
  const filedata = req.file;
  if (!filedata) res.status(403).json({ message: 'Неверный формат файла!' });
  else {
    res.json({
      url: `/uploads/${req.file.originalname}`,
    });
  }
});

router.get('/posts', PostController.getAll);
// app.get('/posts/:id', PostController.getOne);
router.get('/posts/:id', PostController.getPostsByUser);
router.get('/posts/all/:userId', PostController.getPostsByFriends);
router.post(
  '/posts',
  checkAuth,
  postCreateValidation,
  handleValidationErrors,
  PostController.create
);
router.post('/posts/:postId', checkAuth, PostController.changeLikes);
router.delete('/posts/:id', checkAuth, PostController.remove);

router.post('/friends/:friendId', checkAuth, UserController.addFriend);
router.delete('/friends/:friendId', checkAuth, UserController.removeFriend);

// app.listen(process.env.PORT || 4444, err => {
//   if (err) {
//     return console.log(err);
//   }

//   console.log('Server OK');
// });

app.use('/.netlify/functions/api', router);
module.exports.handler = serverless(app);
