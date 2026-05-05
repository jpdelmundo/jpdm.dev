import { PostCommentRepository } from "@/repositories/postCommentRepository.js";
import { FileRepository } from "@/repositories/FileRepository.js";
import { PostImageRepository } from "@/repositories/PostImageRepository.js";
import { PasswordResetRepository } from "@/repositories/PasswordResetRepository.js";
import { PostLikeRepository } from "@/repositories/PostLikeRepository.js";
import { PostRepository } from "@/repositories/PostRepository.js";
import { PostViewRepository } from "@/repositories/PostViewRepository.js";
import { RefreshTokenRepository } from "@/repositories/RefreshTokenRepository.js";
import { UserRepository } from "@/repositories/UserRepository.js";
import { UserProfileRepository } from "@/repositories/UserProfileRepository.js";
import { UserRoleRepository } from "@/repositories/UserRoleRepository.js";
import type { Db } from "@/types/Db.js";
import type { Deps } from "@/types/Deps.js";
import { withTransaction } from "./withTransaction.js";

const makeRepos = (db: Db) => ({
    postRepo: new PostRepository(db),
    postLikeRepo: new PostLikeRepository(db),
    postImageRepo: new PostImageRepository(db),
    fileRepo: new FileRepository(db),
    postCommentRepo: new PostCommentRepository(db),
    userRepo: new UserRepository(db),
    userProfileRepo: new UserProfileRepository(db),
    userRoleRepo: new UserRoleRepository(db),
    refreshTokenRepo: new RefreshTokenRepository(db),
    passwordResetRepo: new PasswordResetRepository(db),
    postViewRepo: new PostViewRepository(db),
});

export const makeDeps = (db: Db, inTransaction = false): Deps => {
    const deps: Deps = {
        ...makeRepos(db),
        withTransaction: async <T>(fn: (deps: Deps) => Promise<T>): Promise<T> => {
            if (inTransaction) return fn(deps); //already in tx, don't wrap in another tx, just call fn()
            return withTransaction((txClient) => fn(makeDeps(txClient, true)), db);
        },
    };

    return deps;
};