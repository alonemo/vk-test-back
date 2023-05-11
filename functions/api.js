import express from 'express';
// const express = require('express');
import mongoose from 'mongoose';
// const mongoose = require('mongoose');
import multer from 'multer';
// const multer = require('multer');
import cors from 'cors';
// const cors = require('cors');
import fs from 'fs';
// const fs = require('fs');

// const serverless = require('serverless-http');
import serverless from 'serverless-http';
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

// router.get('/users/all', UserController.getAllUsers);

router.post('/upload', upload.single('image'), (req, res) => {
  const filedata = req.file;
  if (!filedata) res.status(403).json({ message: 'Неверный формат файла!' });
  else {
    res.json({
      url: `/uploads/${req.file.originalname}`,
    });
  }
});

router.get('/posts/all', (req, res, err) => {
  PostController.getAll(req, res);
});
// app.get('/posts/:id', PostController.getOne);
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

// app.listen(process.env.PORT || 4444, err => {
//   if (err) {
//     return console.log(err);
//   }

//   console.log('Server OK');
// });

app.use('/.netlify/functions/api', router);
module.exports.handler = serverless(app);
