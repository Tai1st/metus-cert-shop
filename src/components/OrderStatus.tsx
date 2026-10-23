export const STATUS_LABEL: Record<string, { text: string; cls: string }> = {
  awaiting_payment: { text: 'Chờ thanh toán', cls: 'bg-amber-100 text-amber-800' },
  paid: { text: 'Đã thanh toán', cls: 'bg-blue-100 text-blue-800' },
  provisioning: { text: 'Đang xử lý', cls: 'bg-blue-100 text-blue-800' },
  completed: { text: 'Hoàn tất', cls: 'bg-green-100 text-green-800' },
  failed: { text: 'Thất bại', cls: 'bg-red-100 text-red-800' },
  cancelled: { text: 'Đã hủy', cls: 'bg-slate-200 text-slate-700' },
};

export default function OrderStatus({ status }: { status: string }) {
  const s = STATUS_LABEL[status] || { text: status, cls: 'bg-slate-200' };
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${s.cls}`}>{s.text}</span>;
}
