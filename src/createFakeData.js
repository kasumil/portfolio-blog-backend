import Post from './models/posts.js';

export default async function createFakeData() {
  const posts = [...Array(40).keys()].map((i) => ({
    title: `포스트 ${i}`,
    body: `Irure fugiat duis ex non magna id minim qui labore ullamco aliqua anim nulla consequat. Aute consequat nisi velit dolor laborum officia velit sint proident deserunt duis excepteur. ...`, // 중략 가능
    tags: ['가짜', '데이터'],
  }));

  try {
    // 기존 데이터를 모두 삭제하고 새로운 데이터 삽입
    await Post.deleteMany({});
    const inserted = await Post.insertMany(posts);
    console.log('Fake data inserted:', inserted);
  } catch (err) {
    console.error('Error inserting fake data:', err);
  }
}
