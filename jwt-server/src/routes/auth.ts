import { Router } from 'express';
import { createUser, logInUser } from '../controllers/auth';

const router = Router();

router.post('/sign-up', createUser);
router.post('/sign-in', logInUser);

export default router;
