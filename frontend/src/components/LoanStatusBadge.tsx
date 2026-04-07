import clsx from 'clsx';

const statusConfig: Record<string, { label: string; className: string }> = {
  DRAFT: { label: 'Draft', className: 'bg-gray-100 text-gray-700' },
  SUBMITTED: { label: 'Submitted', className: 'bg-blue-100 text-blue-700' },
  IN_REVIEW: { label: 'In Review', className: 'bg-amber-100 text-amber-700' },
  CONDITIONALLY_APPROVED: { label: 'Cond. Approved', className: 'bg-purple-100 text-purple-700' },
  APPROVED: { label: 'Approved', className: 'bg-emerald-100 text-emerald-700' },
  IN_CLOSING: { label: 'In Closing', className: 'bg-sky-100 text-sky-700' },
  CLOSED: { label: 'Closed', className: 'bg-emerald-100 text-emerald-800' },
  ON_MARKET: { label: 'On Market', className: 'bg-indigo-100 text-indigo-700' },
  SOLD: { label: 'Sold', className: 'bg-green-100 text-green-800' },
  SUSPENDED: { label: 'Suspended', className: 'bg-orange-100 text-orange-700' },
  DECLINED: { label: 'Declined', className: 'bg-red-100 text-red-700' },
};

interface Props {
  status: string;
  className?: string;
}

export default function LoanStatusBadge({ status, className }: Props) {
  const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-700' };
  return (
    <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', config.className, className)}>
      {config.label}
    </span>
  );
}
