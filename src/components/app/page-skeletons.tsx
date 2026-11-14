import { Skeleton, SkeletonCard, SkeletonPage } from "@/components/ui/skeleton";

function Heading({ subtitle = true }: { subtitle?: boolean }) {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="h-10 w-56" />
      {subtitle && <Skeleton className="h-5 w-full max-w-sm" />}
    </div>
  );
}

function ListRows({ count }: { count: number }) {
  return (
    <div className="divide-y divide-border overflow-hidden rounded-3xl border border-border bg-surface">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="flex items-center gap-4 px-5 py-4">
          <Skeleton className="size-9 shrink-0 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-5 w-12" />
        </div>
      ))}
    </div>
  );
}

export function QuizHomeSkeleton() {
  return (
    <SkeletonPage className="mx-auto max-w-xl">
      <Heading />
      <SkeletonCard className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-12 w-full rounded-full" />
        <Skeleton className="mx-auto h-4 w-48" />
      </SkeletonCard>
      <ListRows count={3} />
    </SkeletonPage>
  );
}

export function QuizRunnerSkeleton() {
  return (
    <SkeletonPage>
      <div className="flex flex-col gap-3">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 10 }, (_, index) => (
            <Skeleton key={index} className="size-9 rounded-full" />
          ))}
        </div>
      </div>
      <SkeletonCard className="flex flex-col gap-4 sm:p-8">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-7 w-full" />
        <Skeleton className="h-7 w-3/4" />
        <div className="mt-2 flex flex-col gap-3">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-16 w-full rounded-2xl" />
          ))}
        </div>
      </SkeletonCard>
      <div className="flex justify-end gap-3">
        <Skeleton className="h-12 w-32 rounded-full" />
        <Skeleton className="h-12 w-32 rounded-full" />
      </div>
    </SkeletonPage>
  );
}

export function ReviewSkeleton() {
  return (
    <SkeletonPage className="mx-auto max-w-3xl">
      <Heading />
      <SkeletonCard className="flex flex-col gap-3 p-4">
        <div className="flex justify-between">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-14" />
        </div>
        <Skeleton className="h-2.5 w-full rounded-full" />
        <Skeleton className="h-3 w-64" />
      </SkeletonCard>
      <SkeletonCard className="flex min-h-72 flex-col gap-4 sm:p-10">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="mt-auto h-12 w-full rounded-full" />
      </SkeletonCard>
    </SkeletonPage>
  );
}

export function FlashcardsSkeleton() {
  return (
    <SkeletonPage>
      <Heading />
      <div className="flex flex-col gap-3 sm:flex-row">
        <Skeleton className="h-12 flex-1 rounded-2xl" />
        <Skeleton className="h-12 rounded-2xl sm:w-64" />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => (
          <SkeletonCard key={index} className="flex flex-col gap-3 p-5">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-2 h-px w-full" />
            <Skeleton className="h-4 w-36" />
          </SkeletonCard>
        ))}
      </div>
    </SkeletonPage>
  );
}

export function RankingSkeleton() {
  return (
    <SkeletonPage className="mx-auto max-w-xl">
      <Heading />
      <div className="grid grid-cols-3 gap-2 rounded-3xl border border-border bg-surface p-4">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="flex flex-col items-center gap-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-7 w-12" />
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-10 w-28 rounded-full" />
        <Skeleton className="h-10 w-20 rounded-full" />
      </div>
      <ListRows count={6} />
    </SkeletonPage>
  );
}

export function GenericSkeleton() {
  return (
    <SkeletonPage className="mx-auto max-w-3xl">
      <Heading />
      {Array.from({ length: 4 }, (_, index) => (
        <Skeleton key={index} className="h-16 w-full rounded-3xl" />
      ))}
    </SkeletonPage>
  );
}
