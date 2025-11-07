import type { Request, Response } from 'express';
import type { AuthorizedRequest } from 'src/types/AuthorizedRequest';

type AuthorizedHandler = (req: AuthorizedRequest, res: Response) => Promise<Response> | void;

export const authorizedRequest = (fn: AuthorizedHandler) => ((req: Request, res: Response) => fn(req as AuthorizedRequest, res));