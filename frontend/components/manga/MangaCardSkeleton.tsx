import { SkeletonLoader } from "@/components/ui/SkeletonLoader";

export function MangaCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[1.6rem] border border-[var(--line)] bg-[var(--surface)] p-0">
      <SkeletonLoader className="aspect-[0.78] rounded-b-[1.2rem] rounded-t-[1.6rem]" />
      <div className="space-y-2 px-3.5 pb-4 pt-3.5">
        <SkeletonLoader className="h-4 w-4/5" />
        <SkeletonLoader className="h-4 w-3/5" />
        <SkeletonLoader className="mt-3 h-3 w-2/5" />
      </div>
    </div>
  );
}
