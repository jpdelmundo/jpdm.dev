import { Router } from 'express'
import * as controller from '../controllers/authController'

export const router = Router()

router.post('/login', controller.login);
router.post('/refresh-token', controller.refreshToken);