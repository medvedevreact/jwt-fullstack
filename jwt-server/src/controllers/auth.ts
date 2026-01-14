import { Response, Request } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user';

export const createUser = async (req: Request, res: Response) => {
  const user = req.body;
  try {
    const newUser = await User.create(user);
    const accessToken = newUser.generateAccessToken();
    const refreshToken = newUser.generateRefreshToken();

    res
      .status(201)
      .cookie('accessToken', accessToken, {
        httpOnly: true,
        maxAge: 15 * 60 * 1000, // 15 минут
      })
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
      })
      .json({ user: newUser, message: 'ok' });
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
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    res
      .status(200)
      .cookie('accessToken', accessToken, {
        httpOnly: true,
        maxAge: 15 * 60 * 1000, // 15 минут
      })
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
      })
      .json({ user, message: 'ok' });
  } catch (error: any) {
    // Просто ловим все ошибки и возвращаем 500
    console.log(error);
    res.status(500).json({ error: 'Failed to logIn' });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken: token } = req.cookies;

    if (!token) {
      return res.status(401).json({ error: 'Refresh token not provided' });
    }

    // Проверяем refresh token
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET as string) as { id: string };

    // Находим пользователя
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Генерируем новые токены
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    res
      .status(200)
      .cookie('accessToken', accessToken, {
        httpOnly: true,
        maxAge: 15 * 60 * 1000, // 15 минут
      })
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
      })
      .json({ user, message: 'Tokens refreshed' });
  } catch (error: any) {
    console.log(error);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};

export const logOutUser = async (req: Request, res: Response) => {
  try {
    // Очищаем куки с токенами
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.json({ message: 'Logged out successfully' });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ error: 'Failed to logout' });
  }
};
