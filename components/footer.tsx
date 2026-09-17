export default function Footer() {
  return (
    <footer className="bg-background mt-auto w-full border-t">
      <div className="container mx-auto px-10 py-7 md:px-6">
        <div className="text-muted-foreground text-center text-sm">
          &copy; {new Date().getFullYear()}{" "}
          {process.env.NEXT_PUBLIC_CLIENT_NAME}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
