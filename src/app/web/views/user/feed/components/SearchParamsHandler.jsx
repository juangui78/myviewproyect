"use client"; // 🔹 Esto hace que solo se ejecute en el cliente
import { useSearchParams } from "next/navigation";

export default function SearchParamsHandler({ setKey }) {
  const searchParams = useSearchParams();
  const search = searchParams?.get("search");

  useEffect(() => {
    setKey(Date.now());
  }, [search]);

  return null;
}
