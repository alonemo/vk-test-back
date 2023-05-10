import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    imageUrl: String,
    viewsCount: {
      type: Number,
      default: 0,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Ссылаемся на отдельную модель User и оттуда вытаскивать пользователя,
      // то есть получается связь между двумя таблицами
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Post', PostSchema);
