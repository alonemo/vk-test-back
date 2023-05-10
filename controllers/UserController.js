import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import UserModel from '../models/User.js';

export const register = async (req, res) => {
  try {
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const doc = new UserModel({
      email: req.body.email,
      firstName: req.body.firstName,
      secondName: req.body.secondName,
      age: req.body.age,
      city: req.body.city,
      university: req.body.university,
      avatarUrl: req.body.avatarUrl,
      passwordHash: hash,
    });

    const user = await doc.save();

    const token = jwt.sign(
      {
        _id: user._id,
      },
      'secret123',
      {
        expiresIn: '30d',
      }
    );

    const { passwordHash, ...userData } = user._doc;

    res.json({
      ...userData,
      token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось зарегистрировать пользователя',
    });
  }
};

export const login = async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        message: 'Неверный логин или пароль',
      });
    }

    const isValidPass = await bcrypt.compare(
      req.body.password,
      user._doc.passwordHash
    );
    if (!isValidPass) {
      return res.status(404).json({
        message: 'Неверный логин или пароль',
      });
    }

    const token = jwt.sign(
      {
        _id: user._id,
      },
      'secret123',
      {
        expiresIn: '30d',
      }
    );

    const { passwordHash, ...userData } = user._doc;

    res.json({
      ...userData,
      token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось авторизоваться',
    });
  }
};

export const addFriend = async (req, res) => {
  try {
    const friendId = req.params.friendId;
    const friend = await UserModel.findById(friendId);
    if (!friend) {
      return res.status(404).json({
        message: 'Нет такого пользователя',
      });
    }
    const userId = req.userId;
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: 'Не существующий пользователь не может ни с кем подружиться',
      });
    }
    if (
      user.friends.find(fr => fr.equals(friend._id)) ||
      friend.friends.find(fr => fr.equals(user._id))
    ) {
      return res.status(403).json({
        message: 'Пользователи уже друзья!',
      });
    }

    UserModel.findByIdAndUpdate(
      {
        _id: userId,
      },
      {
        $addToSet: { friends: friendId },
      },
      { returnDocument: 'after' }
    ).catch(err => {
      console.log(err);
      return res.status(500).json({
        message: 'Не удалось добавить друга',
      });
    });
    UserModel.findByIdAndUpdate(
      {
        _id: friendId,
      },
      {
        $addToSet: { friends: userId },
      },
      { returnDocument: 'after' }
    )
      .then(user => {
        return res.json(user);
      })
      .catch(err => {
        console.log(err);
        return res.status(500).json({
          message: 'Не удалось добавить друга',
        });
      });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не получилось добавить друга',
    });
  }
};

export const removeFriend = async (req, res) => {
  try {
    const friendId = req.params.friendId;
    const friend = await UserModel.findById(friendId);
    if (!friend) {
      return res.status(404).json({
        message: 'Нет такого пользователя',
      });
    }
    const userId = req.userId;
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: 'Не существующий пользователь не может перестать дружить',
      });
    }
    if (
      !user.friends.find(fr => fr.equals(friend._id)) ||
      !friend.friends.find(fr => fr.equals(user._id))
    ) {
      return res.status(403).json({
        message: 'Пользователи не были друзьями',
      });
    }

    UserModel.findByIdAndUpdate(
      {
        _id: userId,
      },
      {
        $pull: { friends: friendId },
      },
      { returnDocument: 'after' }
    ).catch(err => {
      return res.status(500).json({
        message: 'Не удалось удалить друга',
      });
    });
    UserModel.findByIdAndUpdate(
      {
        _id: friendId,
      },
      {
        $pull: { friends: userId },
      },
      { returnDocument: 'after' }
    )
      .then(user => {
        return res.json(user);
      })
      .catch(err => {
        return res.status(500).json({
          message: 'Не удалось удалить друга',
        });
      });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не получилось удалить друга',
    });
  }
};

export const getFriends = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await UserModel.findById(userId);
    const friends = await UserModel.find({
      _id: [...user.friends],
    }).exec();
    res.json(friends);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалость получить друзей',
    });
  }
};

export const getAllUsers = async (req, res) => {
  console.log('aaaaaa');
  try {
    const users = await UserModel.find().exec();
    res.json(users);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалость получить пользователей',
    });
  }
};

export const getUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: 'Нет такого пользователя',
      });
    }

    const { passwordHash, ...userData } = user._doc;

    res.json(userData);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Нет доступа',
    });
  }
};

module.exports = register;
module.exports = login;
module.exports = addFriend;
module.exports = removeFriend;
module.exports = getFriends;
module.exports = getAllUsers;
module.exports = getUser;
