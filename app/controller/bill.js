'use strict';

const moment = require('moment');

const Controller = require('egg').Controller;

class BillController extends Controller {

  // 新增账单
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

  // 获取帐单列表
  async getList() {
    const { ctx, app } = this;
    const { date, pageIndex=1, pageSize=10, tag_id='all' } = ctx.request.query;
    try {
      let user_id;
      const token = ctx.request.header.authorization;
      const decode = await app.jwt.verify(token, app.config.jwt.secret);
      user_id = decode.id;

      const list = await ctx.service.bill.getList(user_id);

      // 筛选日期及标签
      const _list = list.filter(item => {
        if (tag_id !== 'all') {
          return moment(Number(item.date)).format('YYYY-MM') === date && tag_id === item.tag_id;
        }
        return item.date.slice(0, 7) === date;
      })

      let tempList = [];
      _list.map(item => {
        let curDate = item.date;
        let curIndex = tempList.findIndex(temp => temp.date === curDate);
        if (curIndex > -1) {
          let curObj = tempList[curIndex];
          curObj.bills = curObj.bills || [];
          curObj.bills.push(item);
        } else {
          tempList.push({
            date: curDate,
            bills: [item]
          })
        }
      })
      // 日期降序
      tempList = tempList.sort((a, b) => moment(b.date) - moment(a.date));
      // 分页
      const filterListMap = _list.slice((pageIndex - 1) * pageSize, pageIndex * pageSize);
      const allFilterListByDate = list.filter(item1 => item1.date.slice(0, 7) === date);
      let totalOutcome= 0, totalIncome = 0;
      allFilterListByDate.map(bill => {
        bill.pay_type === 1 ? totalOutcome+=Number(bill.amount) : totalIncome+=Number(bill.amount);
      })
      ctx.body = {
        code: 200,
        msg: '请求成功',
        data: {
          totalOutcome, // 当月支出
          totalIncome, // 当月收入
          list: filterListMap || [] 
        },
        count: _list.length
      }
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = BillController;