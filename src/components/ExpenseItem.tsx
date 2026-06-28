import type { ExpenseRecord } from '../types';
import { formatDate, formatMoney } from '../lib/formatters';

interface ExpenseItemProps {
  item: ExpenseRecord;
  baseCurrency: string;
  onDelete: (id: string) => void;
  onEdit: (item: ExpenseRecord) => void;
}

export const ExpenseItem = ({ item, baseCurrency, onDelete, onEdit }: ExpenseItemProps) => (
  <li className="list-card">
    <div>
      <p className="list-title">{item.category}</p>
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
        <p className="list-amount negative">{formatMoney(item.convertedAmount, baseCurrency as any)}</p>
        <p className="list-subtitle">{formatMoney(item.amount, item.currency)}</p>
      </div>
      <button className="ghost-button" onClick={() => onEdit(item)}>
        Edit
      </button>
      <button className="ghost-button" onClick={() => onDelete(item.id)}>
        Delete
      </button>
    </div>
  </li>
);
