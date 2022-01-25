'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller, middleware } = app;
  const _jwt = middleware.jwtErr(app.config.jwt.secret); // 传入加密字符串
  router.get('/test', _jwt, controller.home.index);
  router.get('/api/user/getUserInfo', _jwt, controller.user.getUserInfo);
  router.post('/api/user/editUserInfo', _jwt, controller.user.editUserInfo);
  router.post('/api/user/register', controller.user.register);
  router.post('/api/user/login', controller.user.login);
  router.post('/api/upload', controller.upload.upload);

  router.post('/api/bill/add', _jwt, controller.bill.add);
  router.get('/api/bill/getList', _jwt , controller.bill.getList);
  router.get('/api/bill/getBillDetail', _jwt , controller.bill.getBillDetail);
  router.post('/api/bill/updateBill', _jwt , controller.bill.updateBill);
};
