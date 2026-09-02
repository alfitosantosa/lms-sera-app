export default function Footer() {
  return (
    <footer className="w-full border-t bg-background mt-auto">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-4">
        <div className="text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Yayasan {process.env.NEXT_PUBLIC_CLIENT_NAME}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
