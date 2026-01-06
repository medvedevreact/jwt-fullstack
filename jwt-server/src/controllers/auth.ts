import { Response, Request } from 'express';
import User from '../models/user';

export const createUser = async (req: Request, res: Response) => {
  const user = req.body;
  try {
    const newUser = await User.create(user);
    const token = newUser.generateToken();

    res
      .status(201)
      .cookie('accesToken', token, {
        httpOnly: true,
        maxAge: 3600000,
      })
      .json({ newUser, message: 'ok' });
  } catch (error: any) {
    // Просто ловим все ошибки и возвращаем 500
    console.log(error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

export const logInUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findByCredentials(email, password);
    const token = user.generateToken();

    res
      .status(201)
      .cookie('accesToken', token, {
        httpOnly: true,
        maxAge: 3600000,
      })
      .json({ user, message: 'ok' });
  } catch (error: any) {
    // Просто ловим все ошибки и возвращаем 500
    console.log(error);
    res.status(500).json({ error: 'Failed to logIn' });
  }
};
