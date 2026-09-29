import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { billApi } from '../../api/billApi';
import { PageHeader } from '../../components/common/PageHeader';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

export const BillFormPage = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    category: 'Utilities',
    dueDate: '',
    notes: '',
    paymentMethod: '',
    paymentReference: '',
    recurring: false,
    recurringFrequency: 'MONTHLY',
    status: 'UNPAID',
  });

  const [categories, setCategories] = useState(['Utilities', 'Rent', 'Insurance', 'Subscriptions', 'Education', 'Medical', 'Other']);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        const catList = await billApi.getCategories();
        if (catList && catList.length > 0) {
          setCategories(Array.from(new Set([...categories, ...catList])));
        }

        if (isEdit) {
          const bill = await billApi.getBill(id);
          setFormData({
            title: bill.title || '',
            description: bill.description || '',
            amount: bill.amount || '',
            category: bill.category || 'Utilities',
            dueDate: bill.dueDate || '',
            notes: bill.notes || '',
            paymentMethod: bill.paymentMethod || '',
            paymentReference: bill.paymentReference || '',
            recurring: bill.recurring || false,
            recurringFrequency: bill.recurringFrequency || 'MONTHLY',
            status: bill.status || 'UNPAID',
          });
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load bill data.');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const todayStr = new Date().toISOString().split('T')[0];
    if (formData.status === 'UNPAID' && formData.dueDate < todayStr) {
      setError('An unpaid bill must have a due date of today or in the future.');
      return;
    }
    if (formData.status === 'OVERDUE' && formData.dueDate >= todayStr) {
      setError('An overdue bill must have a past due date.');
      return;
    }

    setSubmitting(true);

    try {
      if (isEdit) {
        await billApi.updateBill(id, formData);
      } else {
        await billApi.createBill(formData);
      }
      navigate('/bills');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save bill. Please check your input.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage message="Loading bill details..." />;
  }

  return (
    <div>
      <div style={{ marginBottom: '18px' }}>
        <Link
          to="/bills"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700, color: '#2196F3' }}
        >
          <ArrowLeft size={16} /> Back to Bills
        </Link>
      </div>

      <PageHeader
        title={isEdit ? 'Edit Bill' : 'Create New Bill'}
        subtitle={isEdit ? 'Update details for this bill record' : 'Record a new expense or upcoming payable bill'}
        breadcrumb={isEdit ? 'Bills / Edit' : 'Bills / New'}
      />

      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          padding: '36px',
          border: '1px solid #E2EAF3',
          boxShadow: '0 10px 25px -5px rgba(33, 150, 243, 0.06)',
          maxWidth: '800px',
        }}
      >
        <ErrorAlert message={error} onClose={() => setError('')} />

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#0D2A5B', marginBottom: '6px' }}>
              Bill Title *
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Home Electricity / Water Bill"
              style={{
                width: '100%',
                padding: '11px 16px',
                borderRadius: '14px',
                border: '1.5px solid #E2EAF3',
                fontSize: '0.9rem',
                color: '#0D2A5B',
                outline: 'none',
                boxSizing: 'border-box',
                backgroundColor: '#ffffff',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#29B6F6')}
              onBlur={(e) => (e.target.style.borderColor = '#E2EAF3')}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#0D2A5B', marginBottom: '6px' }}>
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '11px 16px',
                  borderRadius: '14px',
                  border: '1.5px solid #E2EAF3',
                  fontSize: '0.9rem',
                  color: '#0D2A5B',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontWeight: 600,
                }}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#0D2A5B', marginBottom: '6px' }}>
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '11px 16px',
                  borderRadius: '14px',
                  border: '1.5px solid #E2EAF3',
                  fontSize: '0.9rem',
                  color: '#0D2A5B',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontWeight: 600,
                }}
              >
                <option value="UNPAID">Unpaid</option>
                <option value="PAID">Paid</option>
                <option value="OVERDUE">Overdue</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#0D2A5B', marginBottom: '6px' }}>
                Amount (LKR) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                name="amount"
                required
                value={formData.amount}
                onChange={handleChange}
                placeholder="2500.00"
                style={{
                  width: '100%',
                  padding: '11px 16px',
                  borderRadius: '14px',
                  border: '1.5px solid #E2EAF3',
                  fontSize: '0.9rem',
                  color: '#0D2A5B',
                  outline: 'none',
                  boxSizing: 'border-box',
                  backgroundColor: '#ffffff',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#29B6F6')}
                onBlur={(e) => (e.target.style.borderColor = '#E2EAF3')}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#0D2A5B', marginBottom: '6px' }}>
                {formData.status === 'PAID' ? 'Bill / Payment Date *' : 'Due Date *'}{' '}
                {formData.status === 'UNPAID' && <span style={{ color: '#2196F3', fontSize: '0.75rem', fontWeight: 500 }}>(Today or Future)</span>}
                {formData.status === 'OVERDUE' && <span style={{ color: '#EF4444', fontSize: '0.75rem', fontWeight: 500 }}>(Past Date)</span>}
                {formData.status === 'PAID' && <span style={{ color: '#10B981', fontSize: '0.75rem', fontWeight: 500 }}>(Any Date)</span>}
              </label>
              <input
                type="date"
                name="dueDate"
                required
                min={formData.status === 'UNPAID' ? new Date().toISOString().split('T')[0] : undefined}
                max={
                  formData.status === 'OVERDUE'
                    ? new Date(Date.now() - 86400000).toISOString().split('T')[0]
                    : undefined
                }
                value={formData.dueDate}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '11px 16px',
                  borderRadius: '14px',
                  border: '1.5px solid #E2EAF3',
                  fontSize: '0.9rem',
                  color: '#0D2A5B',
                  outline: 'none',
                  boxSizing: 'border-box',
                  backgroundColor: '#ffffff',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#29B6F6')}
                onBlur={(e) => (e.target.style.borderColor = '#E2EAF3')}
              />
            </div>
          </div>

          {/* Optional Payment Details - Appears Only When Status is PAID */}
          {formData.status === 'PAID' && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
                backgroundColor: '#F0FDF4',
                padding: '20px',
                borderRadius: '18px',
                border: '1.5px solid #BBF7D0',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.05)',
                animation: 'fadeIn 0.2s ease-in-out',
              }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#166534', marginBottom: '6px' }}>
                  Payment Method <span style={{ color: '#059669', fontWeight: 500, fontSize: '0.75rem' }}>(Optional)</span>
                </label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '11px 16px',
                    borderRadius: '12px',
                    border: '1.5px solid #86EFAC',
                    fontSize: '0.9rem',
                    color: '#0D2A5B',
                    backgroundColor: '#ffffff',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontWeight: 600,
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#10B981')}
                  onBlur={(e) => (e.target.style.borderColor = '#86EFAC')}
                >
                  <option value="">Select Method (Optional)</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Credit / Debit Card">Credit / Debit Card</option>
                  <option value="Online Banking / Portal">Online Banking / Portal</option>
                  <option value="Cash">Cash</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#166534', marginBottom: '6px' }}>
                  Payment Reference / Receipt No. <span style={{ color: '#059669', fontWeight: 500, fontSize: '0.75rem' }}>(Optional)</span>
                </label>
                <input
                  type="text"
                  name="paymentReference"
                  value={formData.paymentReference}
                  onChange={handleChange}
                  placeholder="e.g. TXN-94821, Ref #4092, Slip No"
                  style={{
                    width: '100%',
                    padding: '11px 16px',
                    borderRadius: '12px',
                    border: '1.5px solid #86EFAC',
                    fontSize: '0.9rem',
                    color: '#0D2A5B',
                    outline: 'none',
                    boxSizing: 'border-box',
                    backgroundColor: '#ffffff',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#10B981')}
                  onBlur={(e) => (e.target.style.borderColor = '#86EFAC')}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#0D2A5B', marginBottom: '6px' }}>
              Description & Notes (Optional)
            </label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Add any additional details or reference numbers..."
              style={{
                width: '100%',
                padding: '11px 16px',
                borderRadius: '14px',
                border: '1.5px solid #E2EAF3',
                fontSize: '0.9rem',
                color: '#0D2A5B',
                outline: 'none',
                boxSizing: 'border-box',
                backgroundColor: '#ffffff',
                resize: 'vertical',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#29B6F6')}
              onBlur={(e) => (e.target.style.borderColor = '#E2EAF3')}
            />
          </div>

          {/* Recurring Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#F8FAFD', padding: '14px 18px', borderRadius: '16px', border: '1px solid #E2EAF3' }}>
            <input
              type="checkbox"
              id="recurring"
              name="recurring"
              checked={formData.recurring}
              onChange={handleChange}
              style={{ width: '18px', height: '18px', accentColor: '#2196F3', cursor: 'pointer' }}
            />
            <label htmlFor="recurring" style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0D2A5B', cursor: 'pointer' }}>
              This is a recurring bill
            </label>

            {formData.recurring && (
              <select
                name="recurringFrequency"
                value={formData.recurringFrequency}
                onChange={handleChange}
                style={{
                  marginLeft: 'auto',
                  padding: '6px 12px',
                  borderRadius: '10px',
                  border: '1.5px solid #E2EAF3',
                  fontSize: '0.825rem',
                  backgroundColor: '#ffffff',
                  color: '#0D2A5B',
                  fontWeight: 600,
                  outline: 'none',
                }}
              >
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            )}
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button
              type="button"
              onClick={() => navigate('/bills')}
              style={{
                padding: '10px 22px',
                borderRadius: '9999px',
                border: '1.5px solid #E2EAF3',
                backgroundColor: '#ffffff',
                color: '#64748B',
                fontSize: '0.875rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F4F8FD')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 26px',
                borderRadius: '9999px',
                background: 'linear-gradient(135deg, #29B6F6 0%, #2196F3 100%)',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.875rem',
                fontWeight: 700,
                cursor: submitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 8px 20px -4px rgba(33, 150, 243, 0.38)',
                opacity: submitting ? 0.7 : 1,
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => !submitting && (e.currentTarget.style.transform = 'translateY(-1px)')}
              onMouseLeave={(e) => !submitting && (e.currentTarget.style.transform = 'translateY(0)')}
            >
              {submitting ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
              {isEdit ? 'Save Changes' : 'Create Bill'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
