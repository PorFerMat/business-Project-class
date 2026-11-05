import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Edit2, 
  Archive, 
  RotateCcw, 
  Building2, 
  DollarSign, 
  Calendar, 
  Phone, 
  Mail,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Tenant } from '../types';

interface TenantManagementProps {
  tenants: Tenant[];
  onAddTenant: (tenant: Omit<Tenant, 'id' | 'isArchived'>) => void;
  onUpdateTenant: (tenant: Tenant) => void;
  onArchiveTenant: (id: string) => void;
  onRestoreTenant: (id: string) => void;
}

export const TenantManagement: React.FC<TenantManagementProps> = ({
  tenants,
  onAddTenant,
  onUpdateTenant,
  onArchiveTenant,
  onRestoreTenant,
}) => {
  const [tab, setTab] = useState<'active' | 'archived'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Filter tenants
  const activeTenants = tenants.filter((t) => !t.isArchived);
  const archivedTenants = tenants.filter((t) => t.isArchived);

  const displayList = (tab === 'active' ? activeTenants : archivedTenants).filter((t) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.roomNumber.toLowerCase().includes(q) ||
      t.email.toLowerCase().includes(q) ||
      t.phone.toLowerCase().includes(q)
    );
  });

  // Calculate statistics
  const totalRentActive = activeTenants.reduce((sum, t) => sum + t.monthlyRent, 0);
  const avgRent = activeTenants.length > 0 ? totalRentActive / activeTenants.length : 0;

  return (
    <div className="space-y-6">
      {/* Top Header & Metrics Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Tenant Management
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
            <span>{activeTenants.length} Active Leases</span>
            <span aria-hidden="true">·</span>
            <span>Monthly Rent Portfolio: ${totalRentActive.toLocaleString()}</span>
            <span aria-hidden="true">·</span>
            <span>{archivedTenants.length} Archived Records</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Add New Tenant
          </button>
        </div>
      </div>

      {/* Tabs & Search Strip */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setTab('active')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              tab === 'active'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active Tenants ({activeTenants.length})
          </button>
          <button
            onClick={() => setTab('archived')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              tab === 'archived'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Archived ({archivedTenants.length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, room, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
          />
        </div>
      </div>

      {/* Tenants Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-medium">Tenant Name</th>
                <th className="py-3 px-4 font-medium">Room & Building</th>
                <th className="py-3 px-4 font-medium">Contact</th>
                <th className="py-3 px-4 font-medium text-right">Monthly Rent</th>
                <th className="py-3 px-4 font-medium text-center">Rent Due Date</th>
                <th className="py-3 px-4 font-medium">Lease Period</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No tenants found matching your query.
                  </td>
                </tr>
              ) : (
                displayList.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 text-sm">
                        {tenant.name}
                      </div>
                      {tenant.notes && (
                        <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                          {tenant.notes}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                          {tenant.roomNumber}
                        </span>
                        <span className="text-xs text-slate-500">
                          {tenant.building === 'Building-A' ? 'Tower A' : 'Park View B'} · Fl {tenant.floor}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 space-y-0.5">
                      <div className="text-slate-800">{tenant.email}</div>
                      <div className="text-slate-500 font-mono text-[11px]">{tenant.phone}</div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-sm text-slate-900 tabular-nums text-right">
                      ${tenant.monthlyRent.toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-xs font-mono font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {tenant.rentDueDate}th of month
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                      {tenant.leaseStart} to {tenant.leaseEnd}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {tab === 'active' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setEditingTenant(tenant)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded hover:bg-slate-100 transition-colors shadow-xs"
                          >
                            <Edit2 className="w-3 h-3 text-slate-500" />
                            Edit
                          </button>
                          <button
                            onClick={() => onArchiveTenant(tenant.id)}
                            title="Archive Tenant"
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-500 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 rounded transition-colors"
                          >
                            <Archive className="w-3 h-3" />
                            Archive
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => onRestoreTenant(tenant.id)}
                          className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded hover:bg-emerald-100 transition-colors"
                        >
                          <RotateCcw className="w-3 h-3 text-emerald-600" />
                          Restore Tenant
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Tenant Modal */}
      {editingTenant && (
        <TenantEditModal
          tenant={editingTenant}
          onClose={() => setEditingTenant(null)}
          onSave={(updated) => {
            onUpdateTenant(updated);
            setEditingTenant(null);
          }}
        />
      )}

      {/* Add Tenant Modal */}
      {isAddModalOpen && (
        <TenantAddModal
          onClose={() => setIsAddModalOpen(false)}
          onAdd={(data) => {
            onAddTenant(data);
            setIsAddModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

// Sub-component: Edit Modal
interface TenantEditModalProps {
  tenant: Tenant;
  onClose: () => void;
  onSave: (tenant: Tenant) => void;
}

const TenantEditModal: React.FC<TenantEditModalProps> = ({ tenant, onClose, onSave }) => {
  const [formData, setFormData] = useState<Tenant>({ ...tenant });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Edit Tenant Information</h3>
            <p className="text-xs text-slate-500 mt-0.5">Update rent parameters, due date, and lease contract</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-sm p-1"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Room Number</label>
              <input
                type="text"
                required
                value={formData.roomNumber}
                onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-hidden focus:ring-1 focus:ring-slate-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Phone</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-hidden focus:ring-1 focus:ring-slate-400"
              />
            </div>
          </div>

          {/* Core Rent Settings */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
            <div className="font-semibold text-slate-900">Monthly Rent & Due Date Configuration</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Monthly Rent ($ USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 font-mono">$</span>
                  <input
                    type="number"
                    step="10"
                    min="100"
                    required
                    value={formData.monthlyRent}
                    onChange={(e) => setFormData({ ...formData, monthlyRent: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-7 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono font-bold focus:outline-hidden focus:ring-1 focus:ring-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Rent Due Date (Day of Month)</label>
                <select
                  value={formData.rentDueDate}
                  onChange={(e) => setFormData({ ...formData, rentDueDate: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-hidden focus:ring-1 focus:ring-slate-400"
                >
                  <option value={1}>1st of each month</option>
                  <option value={5}>5th of each month (Standard)</option>
                  <option value={10}>10th of each month</option>
                  <option value={15}>15th of each month</option>
                  <option value={20}>20th of each month</option>
                  <option value={25}>25th of each month</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Lease Start Date</label>
              <input
                type="date"
                value={formData.leaseStart}
                onChange={(e) => setFormData({ ...formData, leaseStart: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-hidden focus:ring-1 focus:ring-slate-400"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Lease End Date</label>
              <input
                type="date"
                value={formData.leaseEnd}
                onChange={(e) => setFormData({ ...formData, leaseEnd: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-hidden focus:ring-1 focus:ring-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Staff Notes / Payment Terms</label>
            <textarea
              rows={2}
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
              placeholder="e.g. ACH preferred, security deposit held in escrow..."
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Sub-component: Add Tenant Modal
interface TenantAddModalProps {
  onClose: () => void;
  onAdd: (tenant: Omit<Tenant, 'id' | 'isArchived'>) => void;
}

const TenantAddModal: React.FC<TenantAddModalProps> = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    roomNumber: 'A-401',
    building: 'Building-A',
    floor: 4,
    monthlyRent: 1500,
    rentDueDate: 5,
    leaseStart: '2026-11-01',
    leaseEnd: '2027-10-31',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Add New Tenant</h3>
            <p className="text-xs text-slate-500 mt-0.5">Register a tenant, set monthly rent, and link room</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-sm p-1"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Jessica Sterling"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Room Assignment</label>
              <input
                type="text"
                required
                value={formData.roomNumber}
                onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-hidden focus:ring-1 focus:ring-slate-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                required
                placeholder="tenant@domain.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Phone</label>
              <input
                type="text"
                required
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-hidden focus:ring-1 focus:ring-slate-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Monthly Rent ($)</label>
              <input
                type="number"
                min="100"
                step="50"
                required
                value={formData.monthlyRent}
                onChange={(e) => setFormData({ ...formData, monthlyRent: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono font-bold focus:outline-hidden focus:ring-1 focus:ring-slate-400"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Rent Due Date</label>
              <select
                value={formData.rentDueDate}
                onChange={(e) => setFormData({ ...formData, rentDueDate: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-hidden focus:ring-1 focus:ring-slate-400"
              >
                <option value={1}>1st of each month</option>
                <option value={5}>5th of each month (Standard)</option>
                <option value={10}>10th of each month</option>
                <option value={15}>15th of each month</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
            >
              Register Tenant
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
