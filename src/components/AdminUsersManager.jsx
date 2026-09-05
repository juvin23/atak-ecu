import React, { useState, useEffect } from 'react';
import { UserPlus, Trash2, Shield, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminUsersManager() {
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState(null);

  const fetchUsers = () => {
    setLoading(true);
    fetch('/api/auth/users', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const handleAddUser = async (e) => {
    e.preventDefault();
    setMessage(null);

    try {
      const res = await fetch('/api/auth/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ username: newUsername, password: newPassword })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add admin user.');

      setMessage({ type: 'success', text: `Admin user '${data.username}' created successfully.` });
      setNewUsername('');
      setNewPassword('');
      fetchUsers();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleDeleteUser = async (userId, targetUsername) => {
    setMessage(null);
    if (!window.confirm(`Are you sure you want to remove admin user '${targetUsername}'?`)) return;

    try {
      const res = await fetch(`/api/auth/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete admin user.');

      setMessage({ type: 'success', text: data.message });
      fetchUsers();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Left Column: Admin User List */}
      <div className="lg:col-span-2 space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Admin User Management</h2>
          <p className="text-xs text-slate-500">
            Registered admin accounts with database privileges. At least 1 admin user must remain active.
          </p>
        </div>

        {message && (
          <div className={`p-4 rounded-2xl text-xs flex items-center gap-3 border ${
            message.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          }`}>
            {message.type === 'error' ? <AlertTriangle className="w-4 h-4 flex-shrink-0" /> : <CheckCircle2 className="w-4 h-4 flex-shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        {loading ? (
          <div className="h-48 rounded-2xl bg-white animate-pulse border border-slate-200" />
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
              <span>Admin Username</span>
              <span>Registered Date</span>
              <span className="text-right">Action</span>
            </div>

            <div className="divide-y divide-slate-100">
              {users.map(u => (
                <div key={u.id} className="p-4 flex items-center justify-between hover:bg-slate-50 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-brand-700 flex items-center justify-center font-bold">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        {u.username}
                        {currentUser?.username === u.username && (
                          <span className="px-2 py-0.5 rounded bg-blue-100 text-brand-700 text-[10px] font-mono font-bold">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">User ID: #{u.id}</div>
                    </div>
                  </div>

                  <div className="text-slate-500 font-mono text-[11px]">
                    {new Date(u.created_at).toLocaleDateString()}
                  </div>

                  <div>
                    <button
                      onClick={() => handleDeleteUser(u.id, u.username)}
                      disabled={users.length <= 1}
                      className={`p-2 rounded-lg transition-colors ${
                        users.length <= 1 
                          ? 'opacity-30 cursor-not-allowed text-slate-400' 
                          : 'bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200'
                      }`}
                      title={users.length <= 1 ? 'Cannot delete the last admin user' : 'Remove Admin User'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {users.length <= 1 && (
              <div className="p-3 bg-amber-50 border-t border-amber-200 text-amber-800 text-[11px] flex items-center gap-2 font-medium">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Last Admin Protection: You cannot delete the remaining admin account.</span>
              </div>
            )}

          </div>
        )}
      </div>

      {/* Right Column: Add Admin Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
          <UserPlus className="w-5 h-5 text-brand-600" />
          <h3>Register New Admin</h3>
        </div>

        <form onSubmit={handleAddUser} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              New Admin Username
            </label>
            <input
              type="text"
              required
              value={newUsername}
              onChange={e => setNewUsername(e.target.value)}
              placeholder="e.g. atak_admin"
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl p-3 focus:outline-none focus:border-brand-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              New Admin Password
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Minimum 4 characters"
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl p-3 focus:outline-none focus:border-brand-600"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition-all"
          >
            Create Admin Account
          </button>
        </form>
      </div>

    </div>
  );
}
