import Post from '../../models/posts.js';
import mongoose from 'mongoose';

const { ObjectId } = mongoose.Types;

// 미들웨어
export const checkObjectId = (ctx, next) => {
  const { id } = ctx.params;
  console.log('id: ', id);
  if (!ObjectId.isValid(id)) {
    ctx.status = 400;
    return;
  }
  return next();
};

/*
  POST /api/posts
  {
    title: '제목',
    body: "내용",
    tags: ['태그1', '태그2']
  }
*/
export const write = async (ctx) => {
  const { title, body, tags } = ctx.request.body;
  const post = new Post({
    title,
    body,
    tags,
  });
  try {
    await post.save();
    ctx.body = post;
  } catch (e) {
    ctx.throw(500, e);
  }
};

/*
  GET /api/posts
*/
export const list = async (ctx) => {
  try {
    const posts = await Post.find().exec();
    ctx.body = posts;
  } catch (e) {
    ctx.throw(500, e);
  }
};

/*
  GET /api/posts/:id
*/
export const read = async (ctx) => {
  const { id } = ctx.params;

  try {
    const post = await Post.findById(id).exec();
    if (!post) {
      ctx.status = 404;
      return;
    }
    ctx.body = post;
  } catch (e) {
    ctx.throw(500, e);
  }
};

/*
  DELETE /api/posts/:id
*/
export const remove = async (ctx) => {
  const { id } = ctx.params;
  try {
    await Post.findByIdAndDelete(id).exec();
    ctx.status = 204;
  } catch (e) {
    ctx.throw(500, e);
  }
};

/*
  PATCH /api/posts/:id
*/
export const update = async (ctx) => {
  const { id } = ctx.params;
  try {
    const post = await Post.findByIdAndUpdate(id, ctx.request.body, {
      new: true,
    }).exec();
    if (!post) {
      ctx.status = 404;
    }
    ctx.body = post;
  } catch (e) {
    ctx.throw(500, e);
  }
};
