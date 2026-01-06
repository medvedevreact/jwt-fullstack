import { Document, Model, Schema, model } from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

interface IUser {
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  generateToken: () => string;
}

interface IUserDoc extends Document, IUser {}

interface IUserModel extends Model<IUserDoc> {
  findByCredentials: (email: string, password: string) => Promise<IUserDoc>;
}

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (value: string) => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(value);
        },
        message: 'Email is not valid.',
      },
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_doc, ret) => {
        delete ret.password;
        return ret;
      },
    },
  },
);

userSchema.pre('save', async function (next) {
  try {
    if (this.isModified('password')) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
    next();
  } catch (error) {
    next(error as Error);
  }
});

userSchema.methods.generateToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET as string, {
    expiresIn: '1h',
  });
};

userSchema.statics.findByCredentials = async function (
  email: string,
  password: string,
) {
  const user = await this.findOne({ email }).select('+password');

  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if (!isPasswordMatch) {
    throw new Error('Invalid email or password');
  }

  return user;
};

const User = model<IUserDoc, IUserModel>('User', userSchema);

export default User;
