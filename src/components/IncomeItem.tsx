import type { IncomeRecord } from '../types';
import { formatDate, formatMoney } from '../lib/formatters';

interface IncomeItemProps {
  item: IncomeRecord;
  onDelete: (id: string) => void;
}

export const IncomeItem = ({ item, onDelete }: IncomeItemProps) => (
  <li className="list-card">
    <div>
      <p className="list-title">{item.source}</p>
      <p className="list-subtitle">{item.notes || 'No notes'}</p>
      <p className="list-date">{formatDate(item.date)}</p>
    </div>
    <div className="list-actions">
      <div>
        <p className="list-amount positive">{formatMoney(item.convertedAmount, 'UGX')}</p>
        <p className="list-subtitle">{formatMoney(item.amount, item.currency)}</p>
      </div>
      <button className="ghost-button" onClick={() => onDelete(item.id)}>
        Delete
      </button>
    </div>
  </li>
);
