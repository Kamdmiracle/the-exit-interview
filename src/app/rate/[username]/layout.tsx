export default function RateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      {/* This 'children' is where your page.tsx content will show up */}
      {children}
    </section>
  );
}