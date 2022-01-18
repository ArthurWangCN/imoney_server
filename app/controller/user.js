'use strict';

const Controller = require('egg').Controller;

const defaultAvatar = 'http://s.yezgea02.com/1615973940679/WeChat77d6d2ac093e247c361f0b8a7aeb6c2a.png';

class UserController extends Controller {

  // 登录
  async login() {
    const { ctx, app } = this;
    const { username, password } = ctx.request.body;

    if (!username || !password) {
      ctx.body = {
        code: 500,
        msg: '账号不存在',
        data: null
      }
      return;
    }

    const userInfo = await ctx.service.user.getUserByName(username);
    if (userInfo && (password !== userInfo.password)) {
      ctx.body = {
        code: 500,
        msg: '密码错误',
        data: null
      }
      return;
    }

    // 生成 token 加盐
    // app.jwt.sign 方法接受两个参数，第一个为对象，对象内是需要加密的内容；第二个是加密字符串，上文已经提到过。
    const token = app.jwt.sign({
      id: userInfo.id,
      username: userInfo.username,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // token 有效期为 24 小时
    }, app.config.jwt.secret);

    ctx.body = {
      code: 200,
      message: '登录成功',
      data: {
        token
      },
    };
  }

  // 注册
  async register() {
    const { ctx } = this;
    const { username, password } = ctx.request.body;

    if (!username || !password) {
      ctx.body = {
        code: 400,
        msg: '用户名或密码不能为空',
        data: null
      }
      return;
    }

    const userInfo = await ctx.service.user.getUserByName(username);
    if (userInfo && userInfo.id) {
      ctx.body = {
        code: 500,
        msg: '用户名已存在',
        data: null
      }
      return;
    }

    // 调用 service 方法，将数据存入数据库。
    const result = await ctx.service.user.register({
      
      username,
      password,
      signature: '世界和平。',
      avatar: defaultAvatar,
      createTime: Date.now()
    });

    if (result) {
      
      ctx.body = {
        code: 200,
        msg: '注册成功',
        data: null
      }
    } else {
      ctx.body = {
        code: 500,
        msg: '注册失败',
        data: null
      }
    }
  }

  // 获取用户信息
  async getUserInfo() {
    const { ctx, app } = this;
    const token = ctx.request.header.authorization;
    const decode = await app.jwt.verify(token, app.config.jwt.secret);
    const userInfo = await ctx.service.user.getUserByName(decode.username);
    ctx.body = {
      code: 200,
      msg: '请求成功',
      data: {
        id: userInfo.id,
        username: userInfo.username,
        signature: userInfo.signature || '',
        avatar: userInfo.avatar || defaultAvatar
      }
    }
  }

  // 编辑用户信息
  async editUserInfo() {
    const { ctx, app } = this;
    const {signature, avatar} = ctx.request.body;
    try {
      const token = ctx.request.header.authorization;
      const decode = await app.jwt.verify(token, app.config.jwt.secret);
      let userId = decode.id;
      const userInfo = await ctx.service.user.getUserByName(decode.username);
      let params = {
        ...userInfo,
        id: userId,
      }
      if (signature !== undefined) params = {...params, signature};
      if (avatar !== undefined) {
        let avatarUrl = avatar === '' ? defaultAvatar : avatar;
        params = {...params, avatar: avatarUrl}
      }
      const result = await ctx.service.user.editUserInfo(params);
      ctx.body = {
        code: 200,
        msg: '请求成功',
        data: {
          id: userId,
          username: userInfo.username
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = UserController;
