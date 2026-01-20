export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
        <p className="text-gray-600 mb-4">Página não encontrada</p>
        <a href="/" className="text-primary-600 hover:text-primary-700 font-semibold">
          Voltar ao início
        </a>
      </div>
    </div>
  );
}
