export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-16">
      <h1 className="text-2xl font-semibold">Administração</h1>
      {children}
    </main>
  );
}
