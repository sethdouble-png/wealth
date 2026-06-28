import type { ExpenseRecord } from '../types';
import { formatDate, formatMoney } from '../lib/formatters';

interface ExpenseItemProps {
  item: ExpenseRecord;
  baseCurrency: string;
  onDelete: (id: string) => void;
  onEdit: (item: ExpenseRecord) => void;
}

export const ExpenseItem = ({ item, baseCurrency, onDelete, onEdit }: ExpenseItemProps) => {
  const handleDelete = () => {
    if (window.confirm('Delete this expense entry?')) {
      onDelete(item.id);
    }
  };

  const handleEdit = () => {
    onEdit(item);
  };

  return (
    <li className="list-card">
      <div className="list-body">
        <p className="list-title">{item.category}</p>
        <div className="list-meta-row">
          <span className="list-pill">{formatDate(item.date)}</span>
          <span className="list-pill">{item.currency}</span>
          {item.notes ? <span className="list-pill">{item.notes}</span> : null}
        </div>
        {item.receiptUrl ? (
          <a href={item.receiptUrl} target="_blank" rel="noreferrer" className="list-subtitle receipt-link">
            View receipt
          </a>
        ) : null}
      </div>
      <div className="list-actions">
        <div className="amount-stack">
          <p className="list-amount negative">{formatMoney(item.convertedAmount, baseCurrency as any)}</p>
          <p className="list-subtitle">{formatMoney(item.amount, item.currency)}</p>
        </div>
        <div className="inline-actions">
          <button type="button" className="inline-action-button" onClick={handleEdit}>
            Edit
          </button>
          <button type="button" className="inline-action-button danger" onClick={handleDelete}>
            Delete
          </button>
        </div>
      </div>
    </li>
  );
};
