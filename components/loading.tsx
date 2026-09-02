export default function Loading() {
  return (
    <div className="w-full min-h-screen flex items-center justify-center">
      <div className="flex items-center h-32">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Memuat data...</p>
        </div>
      </div>
    </div>
  );
}
