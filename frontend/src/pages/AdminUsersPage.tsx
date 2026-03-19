import React, { useCallback, useEffect, useState } from 'react';
import {
  getAllUsers,
  getSingleUser,
  updateUserRole,
} from '../services/adminService';
import type { AdminUser, GetUsersParams } from '../services/adminService';
import { extractErrorMessage } from '../utils/error';

const ROLE_OPTIONS = ['', 'USER', 'ADMIN'] as const;
const SORT_BY_OPTIONS = [
  'createdAt',
  'firstName',
  'lastName',
  'email',
] as const;

const AdminUsersPage: React.FC = () => {
  // ── List state ──────────────────────────────────────────────────────────────
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [isListLoading, setIsListLoading] = useState(false);
  const [listError, setListError] = useState('');

  // ── Filters ──────────────────────────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<GetUsersParams['role'] | ''>('');
  const [isVerified, setIsVerified] = useState<'' | 'true' | 'false'>('');
  const [sortBy, setSortBy] =
    useState<NonNullable<GetUsersParams['sortBy']>>('createdAt');
  const [sort, setSort] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);

  // ── Detail modal ─────────────────────────────────────────────────────────────
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');

  // ── Role update ──────────────────────────────────────────────────────────────
  const [roleUpdating, setRoleUpdating] = useState<number | null>(null);
  const [roleError, setRoleError] = useState('');

  // ── Fetch users ──────────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setIsListLoading(true);
    setListError('');
    try {
      const params: GetUsersParams = {
        page,
        limit: pagination.limit,
        sortBy,
        sort,
      };
      if (search.trim()) params.search = search.trim();
      if (role) params.role = role as 'USER' | 'ADMIN';
      if (isVerified !== '') params.isVerified = isVerified === 'true';

      const data = await getAllUsers(params);
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (err) {
      setListError(extractErrorMessage(err, 'Failed to fetch users.'));
    } finally {
      setIsListLoading(false);
    }
  }, [page, pagination.limit, search, role, isVerified, sortBy, sort]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ── View single user ─────────────────────────────────────────────────────────
  const openDetail = async (id: number) => {
    setDetailError('');
    setIsDetailLoading(true);
    setSelectedUser(null);
    try {
      const user = await getSingleUser(id);
      setSelectedUser(user);
    } catch (err) {
      setDetailError(extractErrorMessage(err, 'Failed to load user.'));
      setSelectedUser({ id } as AdminUser); // keep modal open to show error
    } finally {
      setIsDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setSelectedUser(null);
    setDetailError('');
  };

  // ── Update role ───────────────────────────────────────────────────────────────
  const handleRoleChange = async (
    userId: number,
    newRole: 'USER' | 'ADMIN',
  ) => {
    setRoleUpdating(userId);
    setRoleError('');
    try {
      const updated = await updateUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: updated.role } : u)),
      );
      // Sync modal if open
      if (selectedUser?.id === userId) {
        setSelectedUser((prev) =>
          prev ? { ...prev, role: updated.role } : prev,
        );
      }
    } catch (err) {
      setRoleError(extractErrorMessage(err, 'Failed to update role.'));
    } finally {
      setRoleUpdating(null);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  return (
    <main className='page-container'>
      <h1 className='heading-primary'>User Management</h1>

      {/* ── Filters ─────────────────────────────────────────────────────────── */}
      <form onSubmit={handleSearch} className='filter-bar'>
        <input
          type='text'
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder='Search by name or email…'
          className='filter-input'
        />

        <select
          value={role}
          onChange={(e) => {
            setRole(e.target.value as GetUsersParams['role'] | '');
            setPage(1);
          }}
          className='filter-select'
        >
          <option value=''>All roles</option>
          {ROLE_OPTIONS.filter(Boolean).map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        <select
          value={isVerified}
          onChange={(e) => {
            setIsVerified(e.target.value as '' | 'true' | 'false');
            setPage(1);
          }}
          className='filter-select'
        >
          <option value=''>All verified status</option>
          <option value='true'>Verified</option>
          <option value='false'>Unverified</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className='filter-select'
        >
          {SORT_BY_OPTIONS.map((s) => (
            <option key={s} value={s}>
              Sort: {s}
            </option>
          ))}
        </select>

        <button
          type='button'
          onClick={() => setSort((s) => (s === 'asc' ? 'desc' : 'asc'))}
          className='btn-outline btn-sm'
        >
          {sort === 'asc' ? '↑ Asc' : '↓ Desc'}
        </button>

        <button type='submit' className='btn-success btn-sm'>
          Search
        </button>
      </form>

      {/* ── Table ───────────────────────────────────────────────────────────── */}
      {listError && <p className='form-error'>{listError}</p>}
      {roleError && <p className='form-error'>{roleError}</p>}

      <div className='table-wrap'>
        <table className='data-table'>
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Name</th>
              <th>Role</th>
              <th>Verified</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isListLoading ? (
              <tr>
                <td colSpan={7} className='table-loading'>
                  <span className='spinner' />
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={7} className='table-empty'>
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.email}</td>
                  <td>
                    {[user.firstName, user.lastName]
                      .filter(Boolean)
                      .join(' ') || '—'}
                  </td>
                  <td>
                    <span className={`badge badge-${user.role.toLowerCase()}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>{user.isVerified ? '✓' : '✗'}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className='table-actions'>
                    <button
                      className='btn-outline btn-sm'
                      onClick={() => openDetail(user.id)}
                    >
                      View
                    </button>
                    <select
                      value={user.role}
                      disabled={roleUpdating === user.id}
                      onChange={(e) =>
                        handleRoleChange(
                          user.id,
                          e.target.value as 'USER' | 'ADMIN',
                        )
                      }
                      className='role-select'
                    >
                      <option value='USER'>USER</option>
                      <option value='ADMIN'>ADMIN</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ──────────────────────────────────────────────────────── */}
      <div className='pagination'>
        <span className='pagination-info'>
          {pagination.total} user{pagination.total !== 1 ? 's' : ''}{' '}
          &nbsp;|&nbsp; Page {pagination.page} of {pagination.totalPages}
        </span>
        <div className='pagination-controls'>
          <button
            className='btn-outline btn-sm'
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ← Prev
          </button>
          <button
            className='btn-outline btn-sm'
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next →
          </button>
        </div>
      </div>

      {/* ── User Detail Modal ────────────────────────────────────────────────── */}
      {(selectedUser !== null || isDetailLoading) && (
        <div className='modal-backdrop' onClick={closeDetail}>
          <div className='modal' onClick={(e) => e.stopPropagation()}>
            <button className='modal-close' onClick={closeDetail}>
              ✕
            </button>

            {isDetailLoading ? (
              <div className='page-loading'>
                <span className='spinner' />
              </div>
            ) : detailError ? (
              <p className='form-error'>{detailError}</p>
            ) : selectedUser ? (
              <>
                <div className='profile-avatar-wrap'>
                  {selectedUser.avatarUrl ? (
                    <img
                      src={selectedUser.avatarUrl}
                      alt={selectedUser.email}
                      className='profile-avatar'
                    />
                  ) : (
                    <div className='profile-avatar-placeholder'>
                      {selectedUser.email.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <h2 className='heading-secondary'>
                  {[selectedUser.firstName, selectedUser.lastName]
                    .filter(Boolean)
                    .join(' ') || '—'}
                </h2>

                <dl className='profile-details'>
                  <dt>Email</dt>
                  <dd>{selectedUser.email}</dd>

                  <dt>Role</dt>
                  <dd>
                    <span
                      className={`badge badge-${selectedUser.role.toLowerCase()}`}
                    >
                      {selectedUser.role}
                    </span>
                  </dd>

                  <dt>Verified</dt>
                  <dd>{selectedUser.isVerified ? 'Yes' : 'No'}</dd>

                  <dt>Joined</dt>
                  <dd>
                    {new Date(selectedUser.createdAt).toLocaleDateString()}
                  </dd>

                  <dt>Last updated</dt>
                  <dd>
                    {new Date(selectedUser.updatedAt).toLocaleDateString()}
                  </dd>
                </dl>

                <div className='btn-row'>
                  <label className='form-label-inline'>Change role:</label>
                  <select
                    value={selectedUser.role}
                    disabled={roleUpdating === selectedUser.id}
                    onChange={(e) =>
                      handleRoleChange(
                        selectedUser.id,
                        e.target.value as 'USER' | 'ADMIN',
                      )
                    }
                    className='role-select'
                  >
                    <option value='USER'>USER</option>
                    <option value='ADMIN'>ADMIN</option>
                  </select>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </main>
  );
};

export default AdminUsersPage;
