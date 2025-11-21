// NOTE: This implementation relies on the 'jspdf' and 'jspdf-autotable' libraries.
// Ensure they are included in your project for this functionality to work.
import { jsPDF } from 'jspdf';
// FIX: Changed from side-effect import to default import for jspdf-autotable to use it as a function.
// This resolves the module augmentation error.
import autoTable from 'jspdf-autotable';
import { Quote, Client, CompanyConfig, ProductService } from '../types';

// The module augmentation is no longer needed as we are using autoTable as a function.
/*
// Extend jsPDF with autoTable, which is necessary for TypeScript
declare module 'jspdf' {
    interface jsPDF {
      autoTable: (options: any) => jsPDF;
    }
}
*/

export const generateQuotePDF = (
    quote: Quote, 
    client: Client, 
    companyConfig: CompanyConfig, 
    products: ProductService[]
) => {
    const doc = new jsPDF();

    // Helper to format currency
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    }
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor('#DC2626'); // Red color for company name
    doc.text(companyConfig.name, 14, 22);
    doc.setTextColor('#000000'); // Reset to black
    doc.setFontSize(10);
    doc.text(companyConfig.address, 14, 30);
    doc.text(companyConfig.contact, 14, 35);
    doc.text(`CNPJ: ${companyConfig.cnpj}`, 14, 40);

    doc.setFontSize(16);
    doc.text(`Orçamento #${quote.id.split('-')[1]}`, 200, 22, { align: 'right' });
    doc.setFontSize(10);
    doc.text(`Data: ${new Date(quote.issueDate).toLocaleDateString('pt-BR')}`, 200, 30, { align: 'right' });
    doc.text(`Válido até: ${new Date(quote.validityDate).toLocaleDateString('pt-BR')}`, 200, 35, { align: 'right' });

    // Client Info
    doc.setLineWidth(0.5);
    doc.line(14, 45, 200, 45);
    doc.setFontSize(12);
    doc.text("Cliente:", 14, 55);
    doc.setFontSize(10);
    doc.text(client.name, 14, 60);
    doc.text(client.address, 14, 65);
    doc.text(`${client.email} | ${client.phone}`, 14, 70);
    doc.text(`CPF/CNPJ: ${client.document}`, 14, 75);
    
    // Items Table
    const tableColumn = ["Descrição", "Qtd.", "Preço Unit.", "Total"];
    const tableRows: any[] = [];

    quote.items.forEach(item => {
        const itemData = [
            item.customDescription,
            item.quantity,
            formatCurrency(item.unitPrice),
            formatCurrency(item.quantity * item.unitPrice)
        ];
        tableRows.push(itemData);
    });

    // FIX: Switched to function call syntax for jspdf-autotable.
    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 85,
        headStyles: { fillColor: [220, 38, 38] }, // Red header
        theme: 'striped'
    });

    let finalY = (doc as any).lastAutoTable.finalY;

    // Totals
    const subtotal = quote.items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
    const discountAmount = quote.discount || 0;
    const subtotalAfterDiscount = subtotal - discountAmount;
    
    // Tax calculation "por dentro" (gross up)
    const taxRate = (quote.taxPercent || 0) / 100;
    const divisor = 1 - taxRate;
    const total = divisor > 0 ? subtotalAfterDiscount / divisor : subtotalAfterDiscount;
    const taxAmount = total - subtotalAfterDiscount;

    doc.setFontSize(10);
    doc.text(`Subtotal: ${formatCurrency(subtotal)}`, 200, finalY + 10, { align: 'right' });
    if(discountAmount > 0) {
        doc.text(`Desconto: - ${formatCurrency(discountAmount)}`, 200, finalY + 15, { align: 'right' });
        finalY += 5;
    }
    if(taxAmount > 0) {
        doc.text(`Impostos (${quote.taxPercent}%): + ${formatCurrency(taxAmount)}`, 200, finalY + 20, { align: 'right' });
        finalY += 5;
    }
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total: ${formatCurrency(total)}`, 200, finalY + 25, { align: 'right' });
    doc.setFont('helvetica', 'normal');

    finalY += 35;
    // Notes
    if (quote.notes) {
        doc.setFontSize(12);
        doc.text("Observações:", 14, finalY);
        doc.setFontSize(10);
        const splitNotes = doc.splitTextToSize(quote.notes, 180);
        doc.text(splitNotes, 14, finalY + 5);
        finalY += (splitNotes.length * 5) + 5;
    }

    if(companyConfig.defaultTerms) {
        doc.setFontSize(8);
        doc.text("Termos e Condições:", 14, finalY + 10);
        const splitTerms = doc.splitTextToSize(companyConfig.defaultTerms, 180);
        doc.text(splitTerms, 14, finalY + 15);
    }


    doc.save(`orcamento-${quote.id}.pdf`);
}