import type { CommentRepository } from "@/repositories/CommentRepository.js";
import type { FileRepository } from "@/repositories/FileRepository.js";
import type { ImageRepository } from "@/repositories/ImageRepository.js";
import type { PasswordResetRepository } from "@/repositories/PasswordResetRepository.js";
import type { PostLikeRepository } from "@/repositories/PostLikeRepository.js";
import type { PostRepository } from "@/repositories/PostRepository.js";
import type { PostViewRepository } from "@/repositories/PostViewRepository.js";
import type { RefreshTokenRepository } from "@/repositories/RefreshTokenRepository.js";
import type { UserRepository } from "@/repositories/UserRepository.js";
import type { UserProfileRepository } from "@/repositories/UserProfileRepository.js";
import type { UserRoleRepository } from "@/repositories/UserRoleRepository.js";

export type Deps = {
    postRepo: PostRepository;
    postLikeRepo: PostLikeRepository;
    imageRepo: ImageRepository;
    fileRepo: FileRepository;
    commentRepo: CommentRepository;
    userRepo: UserRepository;
    userProfileRepo: UserProfileRepository;
    userRoleRepo: UserRoleRepository;
    refreshTokenRepo: RefreshTokenRepository;
    passwordResetRepo: PasswordResetRepository;
    postViewRepo: PostViewRepository;
    withTransaction<T>(fn: (deps: Deps) => Promise<T>): Promise<T>;
}