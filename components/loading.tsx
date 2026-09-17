export default function Loading() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      <div className="flex h-32 items-center">
        <div className="text-center">
          <div className="border-primary mx-auto h-8 w-8 animate-spin rounded-full border-b-2"></div>
          <p className="text-muted-foreground mt-2 text-sm">Memuat data...</p>
        </div>
      </div>
    </div>
  );
}
