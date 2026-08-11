import Link from "next/link";

function hrefFor(page: number, q?: string): string {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  params.set("page", String(page));
  return `?${params.toString()}`;
}

export function Pagination({
  page,
  hasMore,
  q,
}: {
  page: number;
  hasMore: boolean;
  q?: string;
}) {
  if (page === 1 && !hasMore) return null;

  return (
    <div className="flex items-center justify-between text-sm">
      {page > 1 ? (
        <Link href={hrefFor(page - 1, q)} className="hover:underline">
          ← Anterior
        </Link>
      ) : (
        <span />
      )}
      <span className="text-zinc-500">Página {page}</span>
      {hasMore ? (
        <Link href={hrefFor(page + 1, q)} className="hover:underline">
          Seguinte →
        </Link>
      ) : (
        <span />
      )}
    </div>
  );
}
