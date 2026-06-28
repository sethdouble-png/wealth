import { useMemo, useState } from 'react';

const starterEntries = [
  { id: 1, label: 'Salary', amount: 5000, type: 'income' },
  { id: 2, label: 'Rent', amount: 1800, type: 'expense' },
  { id: 3, label: 'Groceries', amount: 320, type: 'expense' },
  { id: 4, label: 'Freelance', amount: 900, type: 'income' },
];

function App() {
  const [entries, setEntries] = useState(starterEntries);
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');

  const totals = useMemo(() => {
    const income = entries.filter((entry) => entry.type === 'income').reduce((sum, entry) => sum + entry.amount, 0);
    const expense = entries.filter((entry) => entry.type === 'expense').reduce((sum, entry) => sum + entry.amount, 0);
    return { income, expense, balance: income - expense };
  }, [entries]);

  const handleAdd = (event) => {
    event.preventDefault();
    if (!label.trim() || !amount) return;

    setEntries((current) => [
      ...current,
      {
        id: Date.now(),
        label: label.trim(),
        amount: Number(amount),
        type,
      },
    ]);
    setLabel('');
    setAmount('');
    setType('expense');
  };

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Personal finance</p>
          <h1>WealthFlow</h1>
          <p>Track spending, plan savings, and stay in control.</p>
        </div>
      </header>

      <section className="summary-grid">
        <article className="card">
          <span>Income</span>
          <strong>${totals.income.toLocaleString()}</strong>
        </article>
        <article className="card">
          <span>Expenses</span>
          <strong>${totals.expense.toLocaleString()}</strong>
        </article>
        <article className="card highlight">
          <span>Balance</span>
          <strong>${totals.balance.toLocaleString()}</strong>
        </article>
      </section>

      <section className="card form-card">
        <h2>Add entry</h2>
        <form onSubmit={handleAdd} className="entry-form">
          <input value={label} onChange={(event) => setLabel(event.target.value)} placeholder="Label" />
          <input type="number" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="Amount" />
          <select value={type} onChange={(event) => setType(event.target.value)}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
          <button type="submit">Add</button>
        </form>
      </section>

      <section className="card">
        <h2>Recent activity</h2>
        <ul className="entry-list">
          {entries.map((entry) => (
            <li key={entry.id} className="entry-row">
              <div>
                <strong>{entry.label}</strong>
                <p>{entry.type === 'income' ? 'Income' : 'Expense'}</p>
              </div>
              <span className={entry.type === 'income' ? 'positive' : 'negative'}>
                {entry.type === 'income' ? '+' : '-'}${entry.amount.toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default App;
