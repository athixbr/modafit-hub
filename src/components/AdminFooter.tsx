export default function AdminFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card/50 border-t border-border text-center py-4 text-sm text-muted-foreground">
      <div className="space-y-2">
        <p>
          © {currentYear} <span className="font-semibold text-foreground">Vidativa Moda Fitness</span> - Todos os direitos reservados
        </p>
        <p className="text-xs">
          Desenvolvido por <a href="https://www.athix.com.br" target="_blank" rel="noopener noreferrer" className="font-semibold text-foreground hover:text-primary transition-colors">ATHIX</a> - <a href="https://www.athix.com.br" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.athix.com.br</a>
        </p>
      </div>
    </footer>
  );
}
