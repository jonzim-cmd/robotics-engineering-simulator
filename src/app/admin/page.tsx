'use client';

import React, { useState, useEffect } from 'react';
import { getAdminData, createStudent, type User, type ProgressEvent } from '../actions';
import { Lock, Users, FileText, RefreshCw, Plus, AlertCircle } from 'lucide-react';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Data
  const [users, setUsers] = useState<User[]>([]);
  const [progress, setProgress] = useState<(ProgressEvent & { user_name: string })[]>([]);
  
  // Create Student State
  const [newStudentName, setNewStudentName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleLogin = async (e: React.FormEvent | null, pinOverride?: string) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');

    const pinToUse = pinOverride || pin;
    const result = await getAdminData(pinToUse);
    
    if (result.success) {
      setUsers(result.users || []);
      setProgress(result.progress || []);
      setIsAuthenticated(true);
    } else {
      setError(result.error || 'Zugriff verweigert');
      // If auto-submit failed, maybe clear pin to allow retry
      if (pinOverride) setPin('');
    }
    setLoading(false);
  };

  // Auto-submit when PIN reaches 4 digits
  useEffect(() => {
    if (pin.length === 4) {
      handleLogin(null, pin);
    }
  }, [pin]);

  const refreshData = async () => {
    setLoading(true);
    const result = await getAdminData('1111'); // We know the PIN is correct if we are here
    if (result.success) {
      setUsers(result.users || []);
      setProgress(result.progress || []);
    }
    setLoading(false);
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;

    setIsCreating(true);
    const result = await createStudent(newStudentName);
    
    if (result.success) {
      setNewStudentName('');
      await refreshData(); // Reload list
    } else {
      alert(result.error);
    }
    setIsCreating(false);
  };

  // Filter reflections only
  const getReflectionsForUser = (userId: number) => {
    return progress.filter(p => p.user_id === userId && p.event_type === 'REFLECTION')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-200 font-mono p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-lg shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-slate-800 rounded-full">
              <Lock className="w-8 h-8 text-cyan-400" />
            </div>
          </div>
          <h1 className="text-center text-xl font-bold mb-6 text-cyan-500">ADMINISTRATOR ACCESS</h1>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1">ACCESS PIN</label>
              <input 
                type="password" 
                value={pin}
                maxLength={4}
                onChange={(e) => setPin(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-center tracking-[0.5em] focus:border-cyan-500 outline-none transition-colors font-mono text-xl"
                placeholder="••••"
                autoFocus
                disabled={loading}
              />
            </div>
            
            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm justify-center bg-red-400/10 p-2 rounded">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {!loading && pin.length < 4 && (
              <button 
                type="submit" // Keep as submit for Enter key support on partial PINs
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white p-3 rounded font-bold transition-colors disabled:opacity-50 text-xs uppercase tracking-widest"
              >
                Eingabe bestätigen
              </button>
            )}
            
            {loading && (
              <div className="text-center text-cyan-500 text-xs animate-pulse uppercase tracking-widest">
                Verifying Access Credentials...
              </div>
            )}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-mono p-4 md:p-8">
      <header className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-cyan-500 flex items-center gap-2">
            <Users className="w-6 h-6" />
            CLASSROOM MANAGEMENT
          </h1>
          <p className="text-slate-500 text-sm mt-1">Active Students: {users.length}</p>
        </div>
        <button 
          onClick={refreshData}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded text-sm transition-colors"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh Data
        </button>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Student List & Creation */}
        <div className="space-y-6">
          {/* Create Student */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
            <h2 className="text-sm font-bold text-slate-400 mb-3 uppercase">Register Student</h2>
            <form onSubmit={handleCreateStudent} className="flex gap-2">
              <input 
                type="text" 
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                placeholder="Name / ID"
                className="flex-1 bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm focus:border-cyan-500 outline-none"
              />
              <button 
                disabled={isCreating || !newStudentName.trim()}
                className="bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-2 rounded transition-colors disabled:opacity-50"
              >
                <Plus size={20} />
              </button>
            </form>
          </div>

          {/* Student List */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
             <h2 className="text-sm font-bold text-slate-400 p-4 border-b border-slate-800 uppercase">Roster</h2>
             <div className="max-h-[600px] overflow-y-auto">
               {users.length === 0 ? (
                 <div className="p-8 text-center text-slate-600 text-sm">No students registered yet.</div>
               ) : (
                 <table className="w-full text-sm text-left">
                   <thead className="bg-slate-950 text-slate-500">
                     <tr>
                       <th className="p-3 font-normal">Name</th>
                       <th className="p-3 font-normal text-right">Last Active</th>
                     </tr>
                   </thead>
                   <tbody>
                     {users.map(user => (
                       <tr key={user.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                         <td className="p-3 font-medium text-slate-300">{user.name}</td>
                         <td className="p-3 text-right text-slate-500 text-xs">
                           {new Date(user.last_active).toLocaleDateString()} <br/>
                           {new Date(user.last_active).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               )}
             </div>
          </div>
        </div>

        {/* Right Column: Reflections / Details */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-sm font-bold text-slate-400 uppercase mb-3">Recent Activity & Reflections</h2>
          
          <div className="space-y-4">
            {users.map(user => {
              const userReflections = getReflectionsForUser(user.id);
              if (userReflections.length === 0) return null;

              return (
                <div key={user.id} className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3 border-b border-slate-800 pb-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <h3 className="font-bold text-slate-200">{user.name}</h3>
                  </div>
                  
                  <div className="space-y-3 pl-4 border-l-2 border-slate-800">
                    {userReflections.map((ref) => (
                      <div key={ref.id} className="relative">
                        <div className="text-xs text-cyan-500 mb-1 flex justify-between">
                          <span className="font-bold uppercase flex items-center gap-1">
                            <FileText size={12} /> Level {ref.level_id}
                          </span>
                          <span className="opacity-50">{new Date(ref.created_at).toLocaleString()}</span>
                        </div>
                        <div className="text-slate-300 bg-slate-950 p-3 rounded text-sm italic">
                          "{typeof ref.payload === 'string' ? ref.payload : (ref.payload as any).answer || JSON.stringify(ref.payload)}"
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            
            {users.every(u => getReflectionsForUser(u.id).length === 0) && (
               <div className="p-12 border border-dashed border-slate-800 rounded-lg text-center text-slate-600">
                 Waiting for incoming transmissions from student terminals...
               </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
