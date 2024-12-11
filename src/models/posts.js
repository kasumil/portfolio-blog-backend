import mongoose from 'mongoose';

const { Schema } = mongoose;

// 스키마 정의
const PostSchema = new Schema({
  title: String,
  body: String,
  tags: [String],
  publishedDate: {
    type: Date,
    default: Date.now,
  },
  user: {
    _id: mongoose.Types.ObjectId,
    username: String,
  },
});

// 모델 생성
const Post = mongoose.model('Post', PostSchema);
export default Post;
