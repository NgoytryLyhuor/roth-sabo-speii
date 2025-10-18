import React, { useRef } from 'react';
import { ArrowLeft, Download } from 'lucide-react';
import { Invoice } from '../types/invoice';
import { formatCurrency } from '../utils/formatCurrency';
import html2canvas from 'html2canvas';

interface InvoicePreviewProps {
  invoice: Invoice;
  onBack: () => void;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoice, onBack }) => {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!invoiceRef.current) return;

    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const link = document.createElement('a');
      const dateStr = invoice.date.replace(/-/g, '');
      const filename = `Invoice_${invoice.customerName}_${dateStr}.png`;

      link.download = filename;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error downloading invoice:', error);
      alert('Failed to download invoice. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-3">
      <div className="max-w-2xl mx-auto mb-3 flex gap-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1 px-3 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <button
          onClick={handleDownload}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded text-sm font-semibold hover:bg-green-700"
        >
          <Download size={16} />
          Download as Image
        </button>
      </div>

      <div className="max-w-2xl mx-auto bg-white shadow-lg">
        <div ref={invoiceRef} className="p-4">
          <div className="text-center mb-4 pb-3 border-b-2 border-gray-800">
            <h1 className="text-2xl font-bold text-gray-800 mb-1">INVOICE</h1>
            <div className="text-xs text-gray-600">វិក័យប័ត្រ</div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
            <div>
              <div className="font-semibold text-gray-700 mb-1">Customer / អតិថិជន:</div>
              <div className="text-gray-900">{invoice.customerName}</div>
            </div>
            <div>
              <div className="font-semibold text-gray-700 mb-1">Date / ថ្ងៃទី:</div>
              <div className="text-gray-900">{new Date(invoice.date).toLocaleDateString()}</div>
            </div>
            <div>
              <div className="font-semibold text-gray-700 mb-1">Seller / អ្នកលក់:</div>
              <div className="text-gray-900">{invoice.sellerName}</div>
            </div>
            <div>
              <div className="font-semibold text-gray-700 mb-1">Currency / រូបិយប័ណ្ណ:</div>
              <div className="text-gray-900">{invoice.currency === 'USD' ? 'US Dollar ($)' : 'Khmer Riel (៛)'}</div>
            </div>
          </div>

          <div className="mb-4">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-800 text-white">
                  <th className="border border-gray-700 px-1.5 py-1.5 text-[10px] font-semibold w-8">No</th>
                  <th className="border border-gray-700 px-1.5 py-1.5 text-[10px] font-semibold text-left">Product<br/><span className="font-normal">ឈ្មោះទំនិញ</span></th>
                  <th className="border border-gray-700 px-1.5 py-1.5 text-[10px] font-semibold w-14">Qty<br/><span className="font-normal">បរិមាណ</span></th>
                  <th className="border border-gray-700 px-1.5 py-1.5 text-[10px] font-semibold w-20">Unit Price<br/><span className="font-normal">តម្លៃ</span></th>
                  <th className="border border-gray-700 px-1.5 py-1.5 text-[10px] font-semibold w-24">Amount<br/><span className="font-normal">សរុប</span></th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={item.id}>
                    <td className="border border-gray-300 px-1.5 py-1.5 text-[10px] text-center">{index + 1}</td>
                    <td className="border border-gray-300 px-1.5 py-1.5 text-[10px]">{item.name}</td>
                    <td className="border border-gray-300 px-1.5 py-1.5 text-[10px] text-center">{item.quantity}</td>
                    <td className="border border-gray-300 px-1.5 py-1.5 text-[10px] text-right">{formatCurrency(item.unitPrice, invoice.currency)}</td>
                    <td className="border border-gray-300 px-1.5 py-1.5 text-[10px] text-right font-semibold">{formatCurrency(item.amount, invoice.currency)}</td>
                  </tr>
                ))}
                {Array.from({ length: Math.max(0, 5 - invoice.items.length) }).map((_, i) => (
                  <tr key={`empty-${i}`}>
                    <td className="border border-gray-300 px-1.5 py-1.5 text-[10px] text-center">&nbsp;</td>
                    <td className="border border-gray-300 px-1.5 py-1.5 text-[10px]">&nbsp;</td>
                    <td className="border border-gray-300 px-1.5 py-1.5 text-[10px]">&nbsp;</td>
                    <td className="border border-gray-300 px-1.5 py-1.5 text-[10px]">&nbsp;</td>
                    <td className="border border-gray-300 px-1.5 py-1.5 text-[10px]">&nbsp;</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mb-4">
            <div className="w-64 space-y-1">
              <div className="flex justify-between items-center py-1 border-b border-gray-300">
                <span className="text-xs font-semibold text-gray-700">Subtotal / សរុបរង:</span>
                <span className="text-xs font-bold text-gray-900">{formatCurrency(invoice.subtotal, invoice.currency)}</span>
              </div>

              {invoice.discountPercent > 0 && (
                <div className="flex justify-between items-center py-1 border-b border-gray-300">
                  <span className="text-xs font-semibold text-gray-700">Discount / បញ្ចុះតម្លៃ ({invoice.discountPercent}%):</span>
                  <span className="text-xs font-bold text-red-600">-{formatCurrency(invoice.subtotal * (invoice.discountPercent / 100), invoice.currency)}</span>
                </div>
              )}

              {invoice.deliveryFee > 0 && (
                <div className="flex justify-between items-center py-1 border-b border-gray-300">
                  <span className="text-xs font-semibold text-gray-700">Delivery Fee / ថ្លៃដឹកជញ្ជូន:</span>
                  <span className="text-xs font-bold text-green-600">+{formatCurrency(invoice.deliveryFee, invoice.currency)}</span>
                </div>
              )}

              <div className="flex justify-between items-center py-2 bg-gray-800 text-white px-2 rounded">
                <span className="text-sm font-bold">TOTAL / សរុប:</span>
                <span className="text-base font-bold">{formatCurrency(invoice.total, invoice.currency)}</span>
              </div>
            </div>
          </div>

          <div className="border-t-2 border-gray-300 pt-3 mt-4 text-center">
            <p className="text-[10px] text-gray-600 italic">Thank you for your business!</p>
            <p className="text-[10px] text-gray-600 italic">សូមអរគុណ!</p>
          </div>
        </div>
      </div>
    </div>
  );
};
