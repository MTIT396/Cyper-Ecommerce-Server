const authService = require("../services/auth.service");

exports.register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    res.json(user);
  } catch (e) {
    next(e);
  }
};

exports.login = async (req, res, next) => {
  try {
    const data = await authService.login(req.body, res);
    res.json(data);
  } catch (e) {
    next(e);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const result = await authService.logout(req, res);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
