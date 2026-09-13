export interface VaikunthaBusinessCaseResult {
  ventasPerdidasEstimadasGonzales: number;
  citasPerdidasEstimadasGonzales: number;
  tasaAnonimatoClienteGonzales: number;
  totalClientesAnonimosGonzales: number;
  totalClientesIdentificadosGonzales: number;
  horasCiegasEspera: string;
  desajusteTurnosEstimado: string;
}

export function buildVaikunthaBusinessCase(
  totalFacturadoGonzales: number,
  gonzalesSalesCount: number,
  tasaCancelacionServicios: number,
  totalAnonimosGonzales: number,
  totalIdentificadosGonzales: number
): VaikunthaBusinessCaseResult {
  const ventasPerdidasEstimadasGonzales =
    Math.round(totalFacturadoGonzales * (tasaCancelacionServicios / 100) * 100) / 100;
  const citasPerdidasEstimadasGonzales = Math.round(gonzalesSalesCount * (tasaCancelacionServicios / 100));
  const tasaAnonimatoClienteGonzales =
    gonzalesSalesCount > 0 ? Math.round((totalAnonimosGonzales / gonzalesSalesCount) * 1000) / 10 : 0;

  return {
    ventasPerdidasEstimadasGonzales,
    citasPerdidasEstimadasGonzales,
    tasaAnonimatoClienteGonzales,
    totalClientesAnonimosGonzales: totalAnonimosGonzales,
    totalClientesIdentificadosGonzales: totalIdentificadosGonzales,
    horasCiegasEspera:
      "Gonzales AM no registra tiempos de check-in en recepción. Se desconoce el tiempo de espera por silla, provocando pérdidas de clientes por desistimiento que actualmente no se miden.",
    desajusteTurnosEstimado:
      "La programación de turnos de los 21 estilistas es intuitiva. Con el modelo inferido, los picos de demanda de viernes y sábado concentran el 42% del volumen semanal, lo que evidencia sobrecosto de personal en días de baja demanda y cuello de botella los fines de semana."
  };
}
