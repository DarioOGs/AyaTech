import { useEffect, useState } from "react";

export type Tema = "light" | "dark";

function temaActual(): Tema {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

export function useTema() {
  const [tema, setTema] = useState<Tema>(() => temaActual());

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", tema);
    localStorage.setItem("tema", tema);
  }, [tema]);

  function alternar() {
    setTema((t) => (t === "dark" ? "light" : "dark"));
  }

  return { tema, alternar };
}
