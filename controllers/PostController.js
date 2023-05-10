// create, delete, getPosts, getSinglePost

import PostModel from '../models/Post.js';
import UserModel from '../models/User.js';

export const getAll = async (req, res) => {
  try {
    // Подключаем связь с пользователем (чтобы получить не только Id но и самого пользователя)
    const posts = await PostModel.find().populate('user').exec(); // для этого пишем populate
    // и передаем массив связей или одну связь

    res.json(posts);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалость получить посты',
    });
  }
};

export const getPostsByFriends = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await UserModel.findById(userId);
    const posts = await PostModel.find({
      user: [...user.friends],
    })
      .populate('user')
      .exec();
    const sortedPosts = posts.sort(
      (post1, post2) => post2.createdAt - post1.createdAt
    );
    res.json(sortedPosts);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалость получить посты',
    });
  }
};

export const getOne = async (req, res) => {
  try {
    const postId = req.params.id;

    PostModel.findOneAndUpdate(
      {
        _id: postId,
      },
      {
        $inc: { viewsCount: 1 },
      },
      {
        returnDocument: 'after',
      }
    )
      .then(post => {
        if (!post) {
          return res.status(404).json({
            message: 'Пост не найден',
          });
        }
        return res.json(post);
      })
      .catch(err => {
        console.log(err);
        return res.status(500).json({
          message: 'Не удалость получить пост',
        });
      });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалость получить пост',
    });
  }
};

export const changeLikes = async (req, res) => {
  try {
    const postId = req.params.postId;
    const post = await PostModel.findById(postId);
    const userId = req.userId;
    if (post.likes.find(us => us.equals(userId))) {
      PostModel.findByIdAndUpdate(
        {
          _id: postId,
        },
        {
          $pull: { likes: userId },
        },
        { returnDocument: 'after' }
      )
        .populate('user')
        .exec()
        .then(post => {
          if (!post) {
            return res.status(404).json({
              message: 'Пост не найден',
            });
          }
          return res.json(post);
        })
        .catch(err => {
          console.log(err);
          return res.status(500).json({
            message: 'Не удалость получить пост',
          });
        });
    } else {
      PostModel.findByIdAndUpdate(
        {
          _id: postId,
        },
        {
          $addToSet: { likes: userId },
        },
        { returnDocument: 'after' }
      )
        .populate('user')
        .exec()
        .then(post => {
          if (!post) {
            return res.status(404).json({
              message: 'Пост не найден',
            });
          }
          return res.json(post);
        })
        .catch(err => {
          console.log(err);
          return res.status(500).json({
            message: 'Не удалость получить пост',
          });
        });
    }
  } catch (err) {}
};

export const remove = async (req, res) => {
  try {
    const postId = req.params.id;

    PostModel.findOneAndDelete({
      _id: postId,
    })
      .then(post => {
        if (!post) {
          return res.status(404).json({
            message: 'Пост не найден',
          });
        }
        return res.json({
          success: true,
        });
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({
          message: 'Не удалость удалить пост',
        });
      });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалость получить пост',
    });
  }
};

export const getPostsByUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const posts = await PostModel.find({ user: userId })
      .populate('user')
      .exec();
    const sortedPosts = posts.sort(
      (post1, post2) => post2.createdAt - post1.createdAt
    );
    res.json(sortedPosts);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалость получить посты',
    });
  }
};

export const create = async (req, res) => {
  try {
    const doc = new PostModel({
      text: req.body.text,
      imageUrl: req.body.imageUrl,
      user: req.userId,
    });

    const post = await doc.save();
    const resPost = await PostModel.findById(post._id).populate('user').exec();
    res.json(resPost);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалость запостить',
    });
  }
};

module.exports = getAll;
module.exports = getPostsByFriends;
module.exports = getOne;
module.exports = changeLikes;
module.exports = remove;
module.exports = getPostsByUser;
module.exports = create;
