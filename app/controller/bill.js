'use strict';

const Controller = require('egg').Controller;

class BillController extends Controller {
  async add() {
    const { ctx, app } = this;

    const { pay_type, amount, date, tag_id, tag_name, description = '' } = ctx.request.body;

    if (!pay_type || !amount || !date || !tag_id || !tag_name) {
      ctx.body = {
        code: '400',
        msg: '参数错误',
        data: null
      }
      return
    }

    try {
      let user_id;
      const token = ctx.request.header.authorization;
      const decode = await app.jwt.verify(token, app.config.jwt.secret);
      user_id = decode.id;

      const result = await ctx.service.bill.add({
        pay_type,
        amount,
        date,
        tag_id,
        tag_name,
        description,
        user_id
      })

      ctx.body = {
        code: 200,
        msg: '添加成功',
        data: { amount, description }
      }
    } catch (error) {
      ctx.body = {
        code: 500,
        msg: '系统错误',
        data: error
      }
    }
  }
}

module.exports = BillController;