import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Carga, RegistroGasolina, RegistroPeaje } from "@/types";
import { computeMonthlySummary, formatMoney, formatNumber } from "./calculations";
import { format } from "date-fns";

// ---------- CSV ----------
function csvEscape(v: any): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (/[",\n;]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

function toCSV(headers: string[], rows: any[][]): string {
  return [headers, ...rows].map(r => r.map(csvEscape).join(",")).join("\n");
}

const ts = () => format(new Date(), "yyyyMMdd-HHmm");

export function exportCargasCSV(cargas: Carga[]) {
  const headers = ["Fecha recogida","Hora","Origen","Fecha entrega","Hora","Destino","Millas vacías","Millas cargadas","Millas total","Pago recibido","Costo gasolina","Comida","Hospedaje","Otros","Total gastos","Ganancia neta","$/Milla","Notas"];
  const rows = cargas.map(c => [c.fechaRecogida,c.horaRecogida,c.ubicacionRecogida,c.fechaEntrega,c.horaEntrega,c.ubicacionEntrega,c.millasVacias,c.millasCargadas,c.millasTotal,c.pagoRecibido,c.costoGasolina,c.gastosComida,c.hospedaje,c.otrosGastos,c.totalGastos,c.gananciaNeta,c.gananciaPorMilla.toFixed(2),c.notas]);
  downloadBlob(new Blob([toCSV(headers, rows)], { type: "text/csv;charset=utf-8" }), `cargas-${ts()}.csv`);
}

export function exportGasolinaCSV(gas: RegistroGasolina[]) {
  const headers = ["Fecha","Gasolinera","Ubicación","Galones","Precio/galón","Total gasolina","Snack/comida","Total gastado","Método pago","Carga vinculada","Notas"];
  const rows = gas.map(g => [g.fecha,g.gasolinera,g.ubicacion,g.galones,g.precioPorGalon,g.totalGasolina,g.snackComida,g.totalGastado,g.metodoPago,g.cargaId || "",g.notas]);
  downloadBlob(new Blob([toCSV(headers, rows)], { type: "text/csv;charset=utf-8" }), `gasolina-${ts()}.csv`);
}

export function exportPeajesCSV(peajes: RegistroPeaje[]) {
  const headers = ["Fecha","Ubicación/Carretera","Monto","Método pago","Notas"];
  const rows = peajes.map(p => [p.fecha,p.ubicacionCarretera,p.monto,p.metodoPago,p.notas]);
  downloadBlob(new Blob([toCSV(headers, rows)], { type: "text/csv;charset=utf-8" }), `peajes-${ts()}.csv`);
}

export function exportResumenMensualCSV(cargas: Carga[], gas: RegistroGasolina[], peajes: RegistroPeaje[], yearMonth: string) {
  const m = computeMonthlySummary(cargas, gas, peajes, yearMonth);
  const headers = ["Concepto","Valor"];
  const rows: any[][] = [
    ["Mes", m.mes],
    ["Total cargas", m.totalCargas],
    ["Días trabajados", m.diasTrabajados],
    ["Millas totales", m.millasTotal],
    ["Ingresos totales", m.ingresosTotal],
    ["Ingreso promedio/carga", m.ingresoPromedioPorCarga.toFixed(2)],
    ["Total gasolina", m.gastoGasolina],
    ["Total comida", m.gastoComida],
    ["Total hospedaje", m.gastoHospedaje],
    ["Total peajes", m.gastoPeajes],
    ["Otros gastos", m.otrosGastos],
    ["Gastos totales", m.gastosTotal],
    ["Ganancia neta", m.gananciaNeta],
    ["Ganancia por milla", m.gananciaPorMilla.toFixed(2)],
  ];
  downloadBlob(new Blob([toCSV(headers, rows)], { type: "text/csv;charset=utf-8" }), `resumen-${yearMonth}.csv`);
}

// ---------- PDF ----------
function newDoc(title: string): jsPDF {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "letter" });
  doc.setFontSize(16);
  doc.text(title, 40, 40);
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`Generado: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 40, 56);
  doc.setTextColor(0);
  return doc;
}

const pdfTheme = {
  headStyles: { fillColor: [14, 116, 161] as [number, number, number], textColor: 255, fontSize: 9 },
  bodyStyles: { fontSize: 8 },
  alternateRowStyles: { fillColor: [245, 247, 250] as [number, number, number] },
  styles: { cellPadding: 4 },
  margin: { left: 40, right: 40 },
};

export function exportCargasPDF(cargas: Carga[]) {
  const doc = newDoc("Registro de Cargas");
  autoTable(doc, {
    startY: 70,
    head: [["Fecha","Origen","Destino","Millas","Pago","Gastos","Ganancia","$/Mi"]],
    body: cargas.map(c => [
      c.fechaRecogida, c.ubicacionRecogida, c.ubicacionEntrega,
      formatNumber(c.millasTotal, 0), formatMoney(c.pagoRecibido),
      formatMoney(c.totalGastos), formatMoney(c.gananciaNeta), formatMoney(c.gananciaPorMilla),
    ]),
    ...pdfTheme,
  });
  const total = cargas.reduce((s,c)=>s+c.gananciaNeta,0);
  const y = (doc as any).lastAutoTable.finalY + 20;
  doc.setFontSize(11);
  doc.text(`Total cargas: ${cargas.length}    Ganancia total: ${formatMoney(total)}`, 40, y);
  doc.save(`cargas-${ts()}.pdf`);
}

export function exportGasolinaPDF(gas: RegistroGasolina[]) {
  const doc = newDoc("Control de Gasolina");
  autoTable(doc, {
    startY: 70,
    head: [["Fecha","Gasolinera","Ubicación","Galones","Precio/gal","Total gas","Snack","Total","Método"]],
    body: gas.map(g => [
      g.fecha, g.gasolinera, g.ubicacion,
      formatNumber(g.galones, 2), formatMoney(g.precioPorGalon),
      formatMoney(g.totalGasolina), formatMoney(g.snackComida),
      formatMoney(g.totalGastado), g.metodoPago,
    ]),
    ...pdfTheme,
  });
  const total = gas.reduce((s,g)=>s+g.totalGastado,0);
  const y = (doc as any).lastAutoTable.finalY + 20;
  doc.setFontSize(11);
  doc.text(`Total gastado: ${formatMoney(total)}`, 40, y);
  doc.save(`gasolina-${ts()}.pdf`);
}

export function exportPeajesPDF(peajes: RegistroPeaje[]) {
  const doc = newDoc("Control de Peajes");
  autoTable(doc, {
    startY: 70,
    head: [["Fecha","Ubicación/Carretera","Monto","Método pago","Notas"]],
    body: peajes.map(p => [p.fecha, p.ubicacionCarretera, formatMoney(p.monto), p.metodoPago, p.notas]),
    ...pdfTheme,
  });
  const total = peajes.reduce((s,p)=>s+p.monto,0);
  const y = (doc as any).lastAutoTable.finalY + 20;
  doc.setFontSize(11);
  doc.text(`Total peajes: ${formatMoney(total)}`, 40, y);
  doc.save(`peajes-${ts()}.pdf`);
}

export function exportResumenMensualPDF(cargas: Carga[], gas: RegistroGasolina[], peajes: RegistroPeaje[], yearMonth: string) {
  const m = computeMonthlySummary(cargas, gas, peajes, yearMonth);
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  doc.setFontSize(18);
  doc.text("Resumen Mensual", 40, 50);
  doc.setFontSize(12);
  doc.setTextColor(120);
  doc.text(`Mes: ${yearMonth}`, 40, 70);
  doc.setTextColor(0);

  autoTable(doc, {
    startY: 90,
    head: [["Actividad", "Valor"]],
    body: [
      ["Total cargas", String(m.totalCargas)],
      ["Días trabajados", String(m.diasTrabajados)],
      ["Millas totales", formatNumber(m.millasTotal, 0)],
      ["Ingresos totales", formatMoney(m.ingresosTotal)],
      ["Ingreso prom. por carga", formatMoney(m.ingresoPromedioPorCarga)],
    ],
    ...pdfTheme,
  });

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 15,
    head: [["Gastos", "Valor"]],
    body: [
      ["Gasolina", formatMoney(m.gastoGasolina)],
      ["Comida", formatMoney(m.gastoComida)],
      ["Hospedaje", formatMoney(m.gastoHospedaje)],
      ["Peajes", formatMoney(m.gastoPeajes)],
      ["Otros", formatMoney(m.otrosGastos)],
      ["Gastos totales", formatMoney(m.gastosTotal)],
    ],
    ...pdfTheme,
  });

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 15,
    head: [["Resultados", "Valor"]],
    body: [
      ["Ganancia neta", formatMoney(m.gananciaNeta)],
      ["Ganancia por milla", formatMoney(m.gananciaPorMilla)],
    ],
    headStyles: { fillColor: [22, 163, 74] as [number, number, number], textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 9, fontStyle: "bold" },
    margin: { left: 40, right: 40 },
  });

  doc.save(`resumen-${yearMonth}.pdf`);
}

// ---------- Full business export (multi-section PDF) ----------
export function exportNegocioCompletoPDF(
  cargas: Carga[],
  gas: RegistroGasolina[],
  peajes: RegistroPeaje[],
  yearMonth?: string,
) {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "letter" });
  const pageWidth = doc.internal.pageSize.getWidth();

  // ===== Cover =====
  doc.setFontSize(24);
  doc.text("Reporte Completo del Negocio", 40, 80);
  doc.setFontSize(12);
  doc.setTextColor(120);
  doc.text(`Generado: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 40, 105);
  if (yearMonth) doc.text(`Resumen del mes: ${yearMonth}`, 40, 122);
  doc.setTextColor(0);

  doc.setFontSize(11);
  const totalIngresos = cargas.reduce((s, c) => s + c.pagoRecibido, 0);
  const totalGastosCargas = cargas.reduce((s, c) => s + c.totalGastos, 0);
  const totalGanancia = cargas.reduce((s, c) => s + c.gananciaNeta, 0);
  const totalGas = gas.reduce((s, g) => s + g.totalGastado, 0);
  const totalPeajes = peajes.reduce((s, p) => s + p.monto, 0);

  autoTable(doc, {
    startY: 150,
    head: [["Resumen general", "Valor"]],
    body: [
      ["Total de cargas", String(cargas.length)],
      ["Ingresos totales", formatMoney(totalIngresos)],
      ["Gastos totales (cargas)", formatMoney(totalGastosCargas)],
      ["Total gasolina", formatMoney(totalGas)],
      ["Total peajes", formatMoney(totalPeajes)],
      ["Ganancia neta", formatMoney(totalGanancia)],
    ],
    ...pdfTheme,
  });

  // ===== Resumen mensual (si hay mes) =====
  if (yearMonth) {
    const m = computeMonthlySummary(cargas, gas, peajes, yearMonth);
    doc.addPage();
    doc.setFontSize(18);
    doc.text(`Resumen del Mes — ${yearMonth}`, 40, 50);

    autoTable(doc, {
      startY: 80,
      head: [["Actividad", "Valor"]],
      body: [
        ["Total cargas", String(m.totalCargas)],
        ["Días trabajados", String(m.diasTrabajados)],
        ["Millas totales", formatNumber(m.millasTotal, 0)],
        ["Ingresos totales", formatMoney(m.ingresosTotal)],
        ["Ingreso prom. por carga", formatMoney(m.ingresoPromedioPorCarga)],
      ],
      ...pdfTheme,
    });
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 15,
      head: [["Gastos", "Valor"]],
      body: [
        ["Gasolina", formatMoney(m.gastoGasolina)],
        ["Comida", formatMoney(m.gastoComida)],
        ["Hospedaje", formatMoney(m.gastoHospedaje)],
        ["Peajes", formatMoney(m.gastoPeajes)],
        ["Otros", formatMoney(m.otrosGastos)],
        ["Gastos totales", formatMoney(m.gastosTotal)],
      ],
      ...pdfTheme,
    });
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 15,
      head: [["Resultados", "Valor"]],
      body: [
        ["Ganancia neta", formatMoney(m.gananciaNeta)],
        ["Ganancia por milla", formatMoney(m.gananciaPorMilla)],
      ],
      headStyles: { fillColor: [22, 163, 74] as [number, number, number], textColor: 255, fontSize: 9 },
      bodyStyles: { fontSize: 9, fontStyle: "bold" },
      margin: { left: 40, right: 40 },
    });
  }

  // ===== Cargas =====
  doc.addPage();
  doc.setFontSize(18);
  doc.text("Registro de Cargas", 40, 50);
  if (cargas.length === 0) {
    doc.setFontSize(11); doc.setTextColor(120);
    doc.text("Sin registros", 40, 80); doc.setTextColor(0);
  } else {
    autoTable(doc, {
      startY: 70,
      head: [["Fecha","Origen","Destino","Millas","Pago","Gastos","Ganancia","$/Mi"]],
      body: cargas.map(c => [
        c.fechaRecogida, c.ubicacionRecogida, c.ubicacionEntrega,
        formatNumber(c.millasTotal, 0), formatMoney(c.pagoRecibido),
        formatMoney(c.totalGastos), formatMoney(c.gananciaNeta), formatMoney(c.gananciaPorMilla),
      ]),
      ...pdfTheme,
    });
  }

  // ===== Gasolina =====
  doc.addPage();
  doc.setFontSize(18);
  doc.text("Control de Gasolina", 40, 50);
  if (gas.length === 0) {
    doc.setFontSize(11); doc.setTextColor(120);
    doc.text("Sin registros", 40, 80); doc.setTextColor(0);
  } else {
    autoTable(doc, {
      startY: 70,
      head: [["Fecha","Gasolinera","Ubicación","Galones","Precio/gal","Total gas","Snack","Total","Método"]],
      body: gas.map(g => [
        g.fecha, g.gasolinera, g.ubicacion,
        formatNumber(g.galones, 2), formatMoney(g.precioPorGalon),
        formatMoney(g.totalGasolina), formatMoney(g.snackComida),
        formatMoney(g.totalGastado), g.metodoPago,
      ]),
      ...pdfTheme,
    });
  }

  // ===== Peajes =====
  doc.addPage();
  doc.setFontSize(18);
  doc.text("Control de Peajes", 40, 50);
  if (peajes.length === 0) {
    doc.setFontSize(11); doc.setTextColor(120);
    doc.text("Sin registros", 40, 80); doc.setTextColor(0);
  } else {
    autoTable(doc, {
      startY: 70,
      head: [["Fecha","Ubicación/Carretera","Monto","Método pago","Notas"]],
      body: peajes.map(p => [p.fecha, p.ubicacionCarretera, formatMoney(p.monto), p.metodoPago, p.notas]),
      ...pdfTheme,
    });
  }

  // Footer page numbers
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Página ${i} de ${pageCount}`, pageWidth - 80, doc.internal.pageSize.getHeight() - 20);
    doc.setTextColor(0);
  }

  doc.save(`negocio-completo-${ts()}.pdf`);
}
