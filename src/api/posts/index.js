import Router from 'koa-router';
import * as postCtrl from './posts.ctrl.js';
import checkLoggedIn from '../../lib/checkLoggendIn.js';

const posts = new Router();
posts.get('/', postCtrl.list);
posts.post('/', checkLoggedIn, postCtrl.write);

const post = new Router();
post.get('/', postCtrl.read);
post.delete('/', checkLoggedIn, postCtrl.checkOwnPost, postCtrl.remove);
post.patch('/', checkLoggedIn, postCtrl.checkOwnPost, postCtrl.update);

posts.use('/:id', postCtrl.getPostById, post.routes());

export default posts;
