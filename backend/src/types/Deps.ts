import type { CommentRepository } from "@/repositories/CommentRepository.js";
import type { FileRepository } from "@/repositories/FileRepository.js";
import type { ImageRepository } from "@/repositories/ImageRepository.js";
import type { PostRepository } from "@/repositories/PostRepository.js";
import type { UserRepository } from "@/repositories/UserRepository.js";

export type Deps = {
    postRepo: PostRepository;
    imageRepo: ImageRepository;
    fileRepo: FileRepository;
    commentRepo: CommentRepository;
    userRepo: UserRepository;
    withTransaction<T>(fn: (deps: Deps) => Promise<T>): Promise<T>;
}