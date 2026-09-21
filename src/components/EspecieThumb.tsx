import Icon from "./Icon";

export default function EspecieThumb({
  nombre,
  imagenUrl,
  tamano = "mini",
}: {
  nombre: string;
  imagenUrl?: string;
  tamano?: "mini" | "grande";
}) {
  const className = tamano === "mini" ? "mini-fish" : "species-fish";
  return (
    <span className={className}>
      {imagenUrl ? <img src={imagenUrl} alt={nombre} /> : <Icon name="fish" size={tamano === "mini" ? 15 : 26} />}
    </span>
  );
}
