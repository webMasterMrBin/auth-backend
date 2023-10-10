const mongoose = require('mongoose');

const connectDb = async () => {
  await mongoose.connect('mongodb://127.0.0.1:27017/test');

  const Schema = mongoose.Schema;

  const userSchema = new Schema({
    name: String,
    age: Number,
  });

  const User = mongoose.model('User', userSchema);
  const user = new User({ name: 'John1', age: 31 });
  user
    .save()
    .then(result => {
      console.log('User inserted:', result);
    })
    .catch(error => {
      console.error('Failed to insert document:', error);
    });
};

connectDb();
