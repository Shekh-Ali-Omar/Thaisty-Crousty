export default function MenuLoading() {
  return (
    <div className="grid grid-cols-2 gap-y-14 gap-x-3 py-8">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-52 animate-pulse rounded-2xl glass" />
      ))}
    </div>
  );
}
