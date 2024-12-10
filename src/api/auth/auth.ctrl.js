import Joi from 'joi';
import User from '../../models/user.js';

/*
  Post /api/auth/register
  {
    username: 'ssh',
    password: "mypass123"
  }
*/
export const register = async (ctx) => {
  // 입력값 검증
  const schema = Joi.object().keys({
    username: Joi.string().alphanum().min(3).max(20).required(),
    password: Joi.string().required(),
  });
  const result = schema.validate(ctx.request.body);
  if (result.error) {
    ctx.status = 400;
    ctx.body = result.error;
    return;
  }

  const { username, password } = ctx.request.body;
  try {
    // username이 있는지 확인
    const exists = await User.findByUsername(username);
    if (exists) {
      ctx.status = 409; // Confilct
      return;
    }

    const user = new User({
      username,
    });
    await user.setPassword(password); // 비밀번호 설정
    await user.save(); // db저장

    // 응답 데이터에서 hashedPassword 삭제
    ctx.body = user.serialize();
  } catch (e) {
    ctx.throw(500, e);
  }
};

export const login = async (ctx) => {
  // 로그인
};
export const check = async (ctx) => {
  // 로그인상태 확인
};
export const logout = async (ctx) => {
  // 로그아웃
};
