import jsPDF from "jspdf";

export const generateGradeReport = (
    evaluation: any,
    subject: any,
    group: any,
    teacher: any,
    rubric: any,
    grade: any,
    gradeRows: any[]
) => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Reporte de Calificación", 20, 20);

    doc.setFontSize(12);

    doc.text(`Evaluación: ${evaluation?.name || "-"}`, 20, 40);
    doc.text(`Asignatura: ${subject?.name || "-"}`, 20, 50);
    doc.text(`Grupo: ${group?.name || "-"}`, 20, 60);
    doc.text(`Profesor: ${teacher?.first_name || ""} ${teacher?.last_name || ""}`, 20, 70);
    doc.text(`Rúbrica: ${rubric?.title || "-"}`, 20, 80);
    doc.text(`Nota final: ${grade?.final_score || 0}`, 20, 90);

    let y = 110;

    gradeRows.forEach((row, index) => {
        doc.text(`${index + 1}. ${row.criterionName}`, 20, y);

        y += 8;
        doc.text(`Nivel: ${row.obtainedLevel}`, 30, y);

        y += 8;
        doc.text(
            `Puntaje: ${row.score}/${row.maxScore}`,
            30,
            y
        );

        y += 8;
        doc.text(`Comentario: ${row.comment}`, 30, y);

        y += 15;
    });

    doc.save("reporte-calificacion.pdf");
};