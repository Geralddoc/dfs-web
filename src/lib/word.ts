import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType } from 'docx';
import { saveAs } from 'file-saver';

export const generateWordReport = async (
    agroProcessors: any[],
    visits: any[]
) => {
    // Calculate some stats (example: percentage of processors with > 2 visits)
    // For simplicity, let's just make a report listing them and their visit counts

    const totalProcessors = agroProcessors.length;
    // Mock logic for percentages
    const processorsWithVisits = agroProcessors.filter(ap =>
        visits.some(v => v.relatedId === ap._id)
    ).length;
    const percentageVisited = totalProcessors > 0 ? ((processorsWithVisits / totalProcessors) * 100).toFixed(2) : "0";

    const doc = new Document({
        sections: [{
            properties: {},
            children: [
                new Paragraph({
                    text: "Agro Processor Report",
                    heading: HeadingLevel.TITLE,
                    alignment: "center",
                }),
                new Paragraph({
                    text: `Date: ${new Date().toLocaleDateString()}`,
                    alignment: "center",
                }),
                new Paragraph({ text: "" }), // Spacer
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "Summary Statistics",
                            bold: true,
                            size: 28,
                        }),
                    ],
                }),
                new Paragraph({
                    bullet: { level: 0 },
                    children: [
                        new TextRun(`Total Agro Processors: ${totalProcessors}`),
                    ],
                }),
                new Paragraph({
                    bullet: { level: 0 },
                    children: [
                        new TextRun(`Processors Visited: ${processorsWithVisits} (${percentageVisited}%)`),
                    ],
                }),
                new Paragraph({ text: "" }), // Spacer
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "Detailed List",
                            bold: true,
                            size: 28,
                        }),
                    ],
                }),
                new Table({
                    width: {
                        size: 100,
                        type: WidthType.PERCENTAGE,
                    },
                    rows: [
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph({ text: "Name", bold: true })] }),
                                new TableCell({ children: [new Paragraph({ text: "Business Name", bold: true })] }),
                                new TableCell({ children: [new Paragraph({ text: "Address", bold: true })] }),
                            ],
                        }),
                        ...agroProcessors.map(ap => (
                            new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph(ap.name)] }),
                                    new TableCell({ children: [new Paragraph(ap.businessName)] }),
                                    new TableCell({ children: [new Paragraph(ap.address)] }),
                                ],
                            })
                        )),
                    ],
                }),
            ],
        }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, "AgroProcessorReport.docx");
};
