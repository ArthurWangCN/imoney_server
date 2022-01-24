'use strict'

const Service = require('egg').Service;

class BillService extends Service {
  async add(params) {
    const { app } = this;
    try {
      const result = await app.mysql.insert('bill', params);
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async getList(id) {
    try {
      const { ctx, app } = this;
      const QUERY_STR = 'id, pay_type, amount, date, tag_id, tag_name, description';
      let sql = `select ${QUERY_STR} from bill where user_id = ${id}`;

      const result = await app.mysql.query(sql);
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}

module.exports = BillService;
