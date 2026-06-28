import type { IncomeRecord } from '../types';
import { formatDate, formatMoney } from '../lib/formatters';

interface IncomeItemProps {
  item: IncomeRecord;
  baseCurrency: string;
  onDelete: (id: string) => void;
  onEdit: (item: IncomeRecord) => void;
}

export const IncomeItem = ({ item, baseCurrency, onDelete, onEdit }: IncomeItemProps) => {
  const handleDelete = () => {
    if (window.confirm('Delete this income entry?')) {
      onDelete(item.id);
    }
  };

  return (
    <li className="list-card">
      <div>
        <p className="list-title">{item.source}</p>
        <p className="list-subtitle">{item.notes || 'No notes'}</p>
        <p className="list-date">{formatDate(item.date)}</p>
        {item.receiptUrl ? (
          <a href={item.receiptUrl} target="_blank" rel="noreferrer" className="list-subtitle receipt-link">
            View receipt
          </a>
        ) : null}
      </div>
      <div className="list-actions">
        <div>
          <p className="list-amount positive">{formatMoney(item.convertedAmount, baseCurrency as any)}</p>
          <p className="list-subtitle">{formatMoney(item.amount, item.currency)}</p>
        </div>
        <button type="button" className="ghost-button" onClick={() => onEdit(item)}>
          Edit
        </button>
        <button type="button" className="ghost-button danger" onClick={handleDelete}>
          Delete
        </button>
      </div>
    </li>
  );
};
