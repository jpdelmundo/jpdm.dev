import type { CommentRepository } from "@/repositories/CommentRepository";
import type { FileRepository } from "@/repositories/FileRepository";
import type { ImageRepository } from "@/repositories/ImageRepository";
import type { PostRepository } from "@/repositories/PostRepository";
import type { UserRepository } from "@/repositories/UserRepository";

export type Deps = {
    postRepo: PostRepository;
    imageRepo: ImageRepository;
    fileRepo: FileRepository;
    commentRepo: CommentRepository;
    userRepo: UserRepository;
    withTransaction<T>(fn: (deps: Deps) => Promise<T>): Promise<T>;
}