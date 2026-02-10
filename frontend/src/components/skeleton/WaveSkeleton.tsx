import Skeleton, { type SkeletonProps } from "@mui/material/Skeleton";

export function WaveSkeleton(props: SkeletonProps) {
    return <Skeleton animation="wave" {...props} />;
}