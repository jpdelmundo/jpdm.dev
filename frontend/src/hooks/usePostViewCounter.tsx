import { apiPost } from "@/api/apiClient";
import { getFingerprint } from "@/utils/device";
import type { PostId } from "@shared/models/generated/Post";
import { jsonBase64Encode } from "@shared/utils/encoding";
import { useRef } from "react";

export function usePostViewLogger() {
    const viewedPosts = useRef<Set<PostId>>(new Set());

    const log = (post_id: PostId) => {
        if (viewedPosts.current.has(post_id)) return;
        apiPost(`/posts/${post_id}/log-view`, { fp: jsonBase64Encode(getFingerprint()), referrer: document.referrer || null });
        viewedPosts.current.add(post_id);
    }

    return { log };
}