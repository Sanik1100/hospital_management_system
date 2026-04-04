import API from './api.js';

export const invoiceService={
    // get all patient invoices
    // params: {status}
    getMyInvoices: (params) =>
        API.get(`/invoices/my/invoices`, {params}),

    // get payment history
    getPaymentHistory: () =>
        API.get(`/invoices/my/payment-history`),

    // get single invoice (receipt page)
    getById: (id) =>
        API.get(`/invoices/${id}`),

    // pay invoice
    pay: (id,data) =>
        API.put(`/invoices/${id}/pay`,data),

    // get doctor earnings
    getMyEarnings: () =>
        API.get('/invoices/my/earnings'),
};