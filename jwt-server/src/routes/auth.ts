import { Router } from 'express';
import { createUser, logInUser, refreshToken, logOutUser } from '../controllers/auth';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/sign-up', createUser);
router.post('/sign-in', logInUser);
router.post('/refresh', refreshToken);
router.post('/logout', logOutUser);
router.get('/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

export default router;
