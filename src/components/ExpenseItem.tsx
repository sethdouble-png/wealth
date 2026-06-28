import { useState } from 'react';
import type { ExpenseRecord } from '../types';
import { formatDate, formatMoney } from '../lib/formatters';

interface ExpenseItemProps {
  item: ExpenseRecord;
  baseCurrency: string;
  onDelete: (id: string) => void;
  onEdit: (item: ExpenseRecord) => void;
}

export const ExpenseItem = ({ item, baseCurrency, onDelete, onEdit }: ExpenseItemProps) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleDelete = () => {
    setMenuOpen(false);
    if (window.confirm('Delete this expense entry?')) {
      onDelete(item.id);
    }
  };

  const handleEdit = () => {
    setMenuOpen(false);
    onEdit(item);
  };

  return (
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
        <div className="action-menu">
          <button type="button" className="action-fab" onClick={() => setMenuOpen((state) => !state)} aria-label="More actions">
            +
          </button>
          {menuOpen ? (
            <div className="action-menu-popover">
              <button type="button" className="ghost-button" onClick={handleEdit}>
                Edit
              </button>
              <button type="button" className="ghost-button danger" onClick={handleDelete}>
                Delete
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </li>
  );
};
