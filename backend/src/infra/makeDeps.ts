import { CommentRepository } from "@/repositories/CommentRepository";
import { FileRepository } from "@/repositories/FileRepository";
import { ImageRepository } from "@/repositories/ImageRepository";
import { PostRepository } from "@/repositories/PostRepository";
import { UserRepository } from "@/repositories/UserRepository";
import type { Db } from "@/types/Db";
import type { Deps } from "@/types/Deps";
import type { Pool } from "pg";
import { withTransaction } from "./withTransaction";

export const makeDeps = (db: Db): Deps => {
    const isPool = 'connect' in db;

    return {
        postRepo: new PostRepository(db),
        imageRepo: new ImageRepository(db),
        fileRepo: new FileRepository(db),
        commentRepo: new CommentRepository(db),
        userRepo: new UserRepository(db),

        async withTransaction<T>(fn: (deps: Deps) => Promise<T>): Promise<T> {
            // already in a tx
            if (!isPool) {
                return fn(makeDeps(db));
            }

            // else new tx
            return withTransaction((txClient) => {
                const txDeps = makeDeps(txClient);
                return fn(txDeps);
            }, db as Pool);
        },
    };
};