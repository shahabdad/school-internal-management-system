import React, { useState } from 'react';
import { mockStudents } from '../services/api';
import { Plus, Search, Filter, Mail, Phone } from 'lucide-react';
import type { Student } from '../types';

export const StudentsView: React.FC = () => {
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [filterText, setFilterText] = useState('');

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(filterText.toLowerCase()) ||
      s.email.toLowerCase().includes(filterText.toLowerCase()) ||
      s.id.includes(filterText)
  );

  return (
    <div className="page-container">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Students Directory</h1>
          <p className="page-subtitle">Manage student profiles, active enrollments, and membership status.</p>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={() => {
            const name = prompt('Student Name:');
            if (name) {
              const newSt: Student = {
                id: (1239 + students.length).toString(),
                name,
                email: `${name.toLowerCase().replace(/\s+/g, '.')}@academix.edu`,
                phone: '+1 (555) 100-2000',
                address: 'University Campus',
                membership: 'Basic Plan',
                status: 'Active',
                enrolledDate: new Date().toISOString().split('T')[0],
              };
              setStudents([newSt, ...students]);
            }
          }}
        >
          <Plus size={18} />
          <span>Add New Student</span>
        </button>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="search-box" style={{ flex: 1 }}>
            <Search className="search-icon" size={18} />
            <input
              type="text"
              className="search-input"
              placeholder="Search by student name, ID or email..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
          </div>
          <button type="button" className="time-filter-btn" style={{ padding: '0.6rem 1rem' }}>
            <Filter size={16} /> Filter Status
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Student Name</th>
              <th>Contact</th>
              <th>Membership</th>
              <th>Enrolled Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((st) => (
              <tr key={st.id}>
                <td><strong>#{st.id}</strong></td>
                <td>
                  <div style={{ fontWeight: 600 }}>{st.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{st.address}</div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem' }}>
                    <Mail size={14} color="#64748b" /> {st.email}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                    <Phone size={14} color="#64748b" /> {st.phone}
                  </div>
                </td>
                <td><strong>{st.membership}</strong></td>
                <td>{st.enrolledDate}</td>
                <td>
                  <span className={`status-badge ${st.status.toLowerCase()}`}>
                    {st.status}
                  </span>
                </td>
                <td>
                  <button
                    type="button"
                    style={{ color: '#1d4ed8', fontWeight: 600, fontSize: '0.8rem' }}
                    onClick={() => alert(`Viewing profile for ${st.name}`)}
                  >
                    View Card
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
