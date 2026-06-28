import { useEffect, useState } from 'react';
import { addDoc, collection, onSnapshot, query, where } from 'firebase/firestore';
import { GlassButton } from '../components/GlassButton';
import { GlassCard } from '../components/GlassCard';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import type { GoalRecord } from '../types';

export const GoalsPage = () => {
  const { profile } = useAuth();
  const [goals, setGoals] = useState<GoalRecord[]>([]);
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [current, setCurrent] = useState('');
  const [deadline, setDeadline] = useState('');

  useEffect(() => {
    if (!profile?.id) return;
    const q = query(collection(db, 'goals'), where('userId', '==', profile.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setGoals(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as GoalRecord)));
    });
    return unsubscribe;
  }, [profile?.id]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!profile?.id) return;
    await addDoc(collection(db, 'goals'), {
      userId: profile.id,
      title,
      targetAmount: Number(target),
      currentAmount: Number(current),
      deadline,
    });
    setTitle('');
    setTarget('');
    setCurrent('');
    setDeadline('');
  };

  return (
    <div className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Savings goals</p>
          <h1>Build the future you want</h1>
        </div>
      </header>

      <GlassCard>
        <form onSubmit={handleSubmit} className="stacked-form">
          <label className="field-group">
            <span className="field-label">Goal title</span>
            <input className="glass-input" value={title} onChange={(event) => setTitle(event.target.value)} required />
          </label>
          <div className="input-grid">
            <label className="field-group">
              <span className="field-label">Target amount</span>
              <input className="glass-input" type="number" value={target} onChange={(event) => setTarget(event.target.value)} required />
            </label>
            <label className="field-group">
              <span className="field-label">Current amount</span>
              <input className="glass-input" type="number" value={current} onChange={(event) => setCurrent(event.target.value)} required />
            </label>
          </div>
          <label className="field-group">
            <span className="field-label">Deadline</span>
            <input className="glass-input" type="date" value={deadline} onChange={(event) => setDeadline(event.target.value)} required />
          </label>
          <GlassButton type="submit">Create goal</GlassButton>
        </form>
      </GlassCard>

      <GlassCard>
        <div className="section-header">
          <h3>Your goals</h3>
          <span>{goals.length}</span>
        </div>
        <div className="goal-list">
          {goals.map((goal) => {
            const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
            return (
              <div key={goal.id} className="goal-card">
                <div className="progress-row">
                  <h4>{goal.title}</h4>
                  <span>{percent}%</span>
                </div>
                <div className="progress-track">
                  <div className="progress-bar" style={{ width: `${percent}%` }} />
                </div>
                <p className="list-subtitle">Deadline: {goal.deadline}</p>
              </div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
};
