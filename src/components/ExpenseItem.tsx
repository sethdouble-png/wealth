import type { ExpenseRecord } from '../types';
import { formatDate, formatMoney } from '../lib/formatters';

interface ExpenseItemProps {
  item: ExpenseRecord;
  onDelete: (id: string) => void;
}

export const ExpenseItem = ({ item, onDelete }: ExpenseItemProps) => (
  <li className="list-card">
    <div>
      <p className="list-title">{item.category}</p>
      <p className="list-subtitle">{item.notes || 'No notes'}</p>
      <p className="list-date">{formatDate(item.date)}</p>
    </div>
    <div className="list-actions">
      <div>
        <p className="list-amount negative">{formatMoney(item.convertedAmount, 'UGX')}</p>
        <p className="list-subtitle">{formatMoney(item.amount, item.currency)}</p>
      </div>
      <button className="ghost-button" onClick={() => onDelete(item.id)}>
        Delete
      </button>
    </div>
  </li>
);
