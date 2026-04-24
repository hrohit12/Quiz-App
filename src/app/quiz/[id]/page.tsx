import QuizClient from "./QuizClient";

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ id: 'index' }]; // Dummy param to satisfy static export
}

export default function Page() {
  return <QuizClient />;
}
