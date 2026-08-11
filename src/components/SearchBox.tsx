export function SearchBox({
  q,
  placeholder,
}: {
  q?: string;
  placeholder: string;
}) {
  return (
    <form className="w-full max-w-xs">
      <input
        type="search"
        name="q"
        defaultValue={q}
        placeholder={placeholder}
        className="w-full rounded border border-zinc-300 p-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
      />
    </form>
  );
}
