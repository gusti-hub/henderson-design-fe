// Invoice number mirrors the proposal number 1:1 (e.g. Hen-KIR-000001 -> INV-Hen-KIR-000001)
export const toInvoiceNumber = (proposalNumber) => (proposalNumber ? `INV-${proposalNumber}` : null);
