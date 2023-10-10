const mongoose = require('mongoose');
const chalk = require('chalk');

const userDb = async () => {
  try {
    await mongoose.connect(process.env.NODE_ENV === 'DEV' && 'mongodb://127.0.0.1:27017/userDb');

    const Schema = mongoose.Schema;

    const userSchema = new Schema({
      username: String,
      password: String,
    });

    const User = mongoose.models.User || mongoose.model('User', userSchema);

    // 未username设置唯一索引 为了并发操作不再同一数据库model插入两条相同username数据
    userSchema.index({ username: 1 }, { unique: true });

    return User;
  } catch (error) {
    console.log(chalk.red(error));
  }
};

module.exports = userDb;
