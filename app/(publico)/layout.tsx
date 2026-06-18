export default function PublicoLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-2">
          <span className="text-xl">💇‍♀️</span>
          <span className="font-bold">SalãoApp</span>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="max-w-lg mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
