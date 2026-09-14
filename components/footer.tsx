export default function Footer() {
  return (
    <footer className="w-full border-t bg-background mt-auto">
      <div className="container mx-auto  md:px-6 px-10 py-7">
        <div className="text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()}{" "}
          {process.env.NEXT_PUBLIC_CLIENT_NAME}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
