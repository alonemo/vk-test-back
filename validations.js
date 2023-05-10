import { body } from 'express-validator';

export const registerValidation = [
  body('email', 'Неверный формат почты').isEmail(),
  body('password', 'Пароль минимум 5 символов').isLength({ min: 5 }),
  body('firstName', 'Укажите имя').isLength({ min: 3 }),
  body('secondName', 'Укажите фамилию').isLength({ min: 3 }),
  body('age', 'Укажите возраст').isLength({ min: 1 }),
  body('city', 'Укажите город').isLength({ min: 3 }),
  body('university', 'Укажите университет').isLength({ min: 3 }),
  body('avatarUrl', 'Неверная ссылка на аватарку').optional().isString(),
];

export const loginValidation = [
  body('email', 'Неверный формат почты').isEmail(),
  body('password', 'Пароль минимум 5 символов').isLength({ min: 5 }),
];

export const postCreateValidation = [
  body('text', 'Введите текст поста.').isLength({ min: 3 }).isString(),
  body('imageUrl', 'Неверная ссылка на изображение').optional().isString(),
];
