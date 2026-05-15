
import mongoose from 'mongoose';

import { Book } from './models/book.js';
import { User } from './models/user.js';

export const connectToDatabase = async () => {
  // await mongoose.connect(
  //   'mongodb+srv://nodejs:Mahmoud123@cluster0.yzgiwmo.mongodb.net/myDB?retryWrites=true&w=majority'
  // );
  await mongoose.connect(process.env.MONGODB_URI,)

  console.log('Connected to the database!');
};

export const model = {
  Book,
  User,
};