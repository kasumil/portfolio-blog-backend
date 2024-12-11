import Post from '../../models/posts.js';
import mongoose from 'mongoose';
import Joi from 'joi';

const { ObjectId } = mongoose.Types;

// 미들웨어
export const getPostById = async (ctx, next) => {
  const { id } = ctx.params;
  if (!ObjectId.isValid(id)) {
    ctx.status = 400;
    return;
  }
  try {
    const post = await Post.findById(id);
    // post가 존재하지 않을때
    if (!post) {
      ctx.status = 404;
      return;
    }
    ctx.state.post = post;
    return next();
  } catch (e) {
    ctx.throw(500, e);
  }
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
  // 갳게가 다음 필드 있는지 여부 검증
  const schema = Joi.object().keys({
    title: Joi.string().required(),
    body: Joi.string().required(),
    tags: Joi.array().items(Joi.string()).required(),
  });

  // 검증하고 나서 검증 실패인 경우 에러
  const result = schema.validate(ctx.request.body);
  if (result.error) {
    ctx.status = 400; // Bad Request
    ctx.body = result.error;
    return;
  }

  const { title, body, tags } = ctx.request.body;
  const post = new Post({
    title,
    body,
    tags,
    user: ctx.state.user,
  });
  try {
    await post.save();
    ctx.body = post;
  } catch (e) {
    ctx.throw(500, e);
  }
};

/*
  GET /api/posts?username=&tag=&page=
*/
export const list = async (ctx) => {
  // query는 문자열이므로 숫자로 변환해줘야함.
  // 값이 주어지지 않았으면 1을 기본 사용
  const page = parseInt(ctx.query.page || '1', 10);

  if (page < 1) {
    ctx.status = 400;
    return;
  }

  const { tag, username } = ctx.query;
  // tag, username 값이 유효하면 객체 안에 넣고, 그렇지 않으면 넣지 않음.
  const query = {
    ...(username ? { 'user.username': username } : {}),
    ...(tag ? { tags: tag } : {}),
  };

  try {
    const posts = await Post.find(query)
      .sort({ _id: -1 })
      .limit(10)
      .skip((page - 1) * 10)
      .lean() // lean을 사용하면 몽고디비 조회당시 json으로 값이 반환 됨
      .exec();
    const pageCount = await Post.countDocuments(query).exec(); // 페이지 마지막 값 조회.
    ctx.set('Last-Page', Math.ceil(pageCount / 10));
    ctx.body = posts.map((post) => ({
      ...post,
      body: post.body.length < 200 ? post.body : `${post.body.slice(0, 200)}...`,
    }));
  } catch (e) {
    ctx.throw(500, e);
  }
};

/*
  GET /api/posts/:id
*/
export const read = async (ctx) => {
  ctx.body = ctx.state.post;
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

  // 갳게가 다음 필드 있는지 여부 검증
  const schema = Joi.object().keys({
    title: Joi.string(),
    body: Joi.string(),
    tags: Joi.array().items(Joi.string()),
  });

  // 검증하고 나서 검증 실패인 경우 에러
  const result = schema.validate(ctx.request.body);
  if (result.error) {
    ctx.status = 400; // Bad Request
    ctx.body = result.error;
    return;
  }

  try {
    const post = await Post.findByIdAndUpdate(id, ctx.request.body, {
      new: true, // new의 경우 업데이트 된 내용 반환, false의 경우 업데이트 되기전의 데이터 반환
    }).exec();
    if (!post) {
      ctx.status = 404;
    }
    ctx.body = post;
  } catch (e) {
    ctx.throw(500, e);
  }
};

// 해당 작성자가 맞는지 체크하는 기능
export const checkOwnPost = (ctx, next) => {
  const { user, post } = ctx.state;
  if (post?.user?._id.toString() !== user._id) {
    ctx.status = 403; // forbidden
    return;
  }
  return next();
};
