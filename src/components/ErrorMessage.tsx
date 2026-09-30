export default function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
      {message}
    </div>
  );
}