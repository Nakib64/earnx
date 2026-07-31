'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { apiFetch } from '../../../lib/api';
import { Users, Star, Award, AlertCircle } from 'lucide-react';

export default function ReferralPage() {
  const { user } = useAuth();
  const [treeData, setTreeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTree = async () => {
      setLoading(true);
      const res = await apiFetch<any>('/users/tree?depth=5');
      if (res.success && res.data) {
        setTreeData(res.data);
      } else {
        setError(res.error?.message || 'Failed to load referral tree');
      }
      setLoading(false);
    };

    if (user) fetchTree();
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-500"></div>
        <p className="text-sm font-medium text-slate-500">Building referral tree structure...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center space-x-2">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  const levels = treeData?.tree ? Object.keys(treeData.tree).map(Number).sort((a, b) => a - b) : [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Referral Tree Network</h1>
        <p className="text-xs text-slate-500 mt-1">
          Explore your multi-level downline team members grouped by tree depth level
        </p>
      </div>

      {/* Network Overview Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl text-center bg-white border border-slate-200">
          <span className="text-xs font-bold text-slate-400 uppercase">Your Referral Code</span>
          <div className="text-lg font-mono font-extrabold text-sky-600 mt-1">{user?.referral_code}</div>
        </div>
        <div className="glass-card p-4 rounded-xl text-center bg-white border border-slate-200">
          <span className="text-xs font-bold text-slate-400 uppercase">Earning Badge</span>
          <div className="text-sm font-extrabold text-slate-800 mt-1 flex items-center justify-center space-x-1">
            <Award className="w-4 h-4 text-purple-600" />
            <span>{user?.designation?.name || 'Starter Member'}</span>
          </div>
        </div>
        <div className="glass-card p-4 rounded-xl text-center bg-white border border-slate-200">
          <span className="text-xs font-bold text-slate-400 uppercase">Max Depth Earning</span>
          <div className="text-lg font-extrabold text-emerald-600 mt-1">Level {user?.designation?.max_level || 1}</div>
        </div>
        <div className="glass-card p-4 rounded-xl text-center bg-white border border-slate-200">
          <span className="text-xs font-bold text-slate-400 uppercase">Total Downlines</span>
          <div className="text-lg font-extrabold text-indigo-600 mt-1">
            {levels.reduce((sum, lvl) => sum + treeData.tree[lvl].length, 0)} Members
          </div>
        </div>
      </div>

      {/* Level Breakdown Cards */}
      {levels.length === 0 ? (
        <div className="glass-card p-8 rounded-2xl text-center space-y-3 bg-white border border-slate-200">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Downline Members Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Share your unique referral link with your network to start building your multi-level tree.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {levels.map((level) => {
            const downlines = treeData.tree[level];
            const isEarningLevel = (user?.designation?.max_level || 1) >= level;

            return (
              <div key={level} className="glass-card rounded-2xl p-5 space-y-4 bg-white border border-slate-200">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-8 h-8 rounded-lg sky-gradient-bg text-white font-extrabold text-xs flex items-center justify-center">
                      L{level}
                    </span>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">
                        Level {level} Downlines ({downlines.length})
                      </h3>
                      <span className="text-[11px] text-slate-400">
                        {level === 1 ? 'Direct Referrals' : `Indirect Referrals (Level ${level})`}
                      </span>
                    </div>
                  </div>

                  {isEarningLevel ? (
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">
                      ✓ Earning Unlocked
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-semibold">
                      🔒 Requires Higher Star Badge
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {downlines.map((member: any) => (
                    <div
                      key={member.id}
                      className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between"
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold text-xs text-slate-800">
                          {member.full_name || member.phone}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {member.phone}
                        </div>
                        {member.designation && (
                          <div className="flex items-center space-x-1 text-[10px] font-bold text-purple-700">
                            <span>{member.designation.name}</span>
                            <div className="flex items-center">
                              {Array.from({ length: member.designation.stars || 1 }).map((_, i) => (
                                <Star key={i} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="text-[10px] text-slate-400">
                          Joined: {new Date(member.created_at).toLocaleDateString()}
                        </div>
                      </div>

                      <div>
                        {member.status === 'ACTIVE' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-200 text-slate-600">
                            Disabled
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
