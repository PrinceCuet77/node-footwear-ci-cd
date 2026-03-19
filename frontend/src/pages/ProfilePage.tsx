import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getProfile, updateProfile } from '../services/userService';
import type { ProfileUser, UpdateProfileData } from '../services/userService';
import { extractErrors, extractErrorMessage } from '../utils/error';
import FormErrors from '../components/FormErrors';

const ProfilePage: React.FC = () => {
  const { updateUser } = useAuth();

  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [fetchError, setFetchError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Editable fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const [submitError, setSubmitError] = useState<string[]>([]);
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getProfile()
      .then(setProfile)
      .catch((err) =>
        setFetchError(extractErrorMessage(err, 'Failed to load profile.')),
      );
  }, []);

  const openEdit = () => {
    if (!profile) return;
    setFirstName(profile.firstName ?? '');
    setLastName(profile.lastName ?? '');
    setAvatarUrl(profile.avatarUrl ?? '');
    setSubmitError([]);
    setSuccessMsg('');
    setIsEditing(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError([]);
    setSuccessMsg('');
    setIsSubmitting(true);

    const data: UpdateProfileData = {};
    if (firstName.trim()) data.firstName = firstName.trim();
    if (lastName.trim()) data.lastName = lastName.trim();
    if (avatarUrl.trim()) data.avatarUrl = avatarUrl.trim();

    try {
      const updated = await updateProfile(data);
      setProfile(updated);

      // Keep the navbar name in sync
      const fullName = [updated.firstName, updated.lastName]
        .filter(Boolean)
        .join(' ');
      updateUser({ name: fullName, avatarUrl: updated.avatarUrl });

      setSuccessMsg('Profile updated successfully.');
      setIsEditing(false);
    } catch (err) {
      setSubmitError(extractErrors(err, 'Failed to update profile.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (fetchError) {
    return (
      <main className='page-container'>
        <p className='form-error'>{fetchError}</p>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className='page-container page-loading'>
        <span className='spinner' />
      </main>
    );
  }

  const fullName =
    [profile.firstName, profile.lastName].filter(Boolean).join(' ') || '—';

  return (
    <main className='page-container'>
      <div className='card profile-card'>
        {/* Avatar */}
        <div className='profile-avatar-wrap'>
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={fullName}
              className='profile-avatar'
            />
          ) : (
            <div className='profile-avatar-placeholder'>
              {fullName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {!isEditing ? (
          <>
            <h1 className='heading-primary'>{fullName}</h1>

            <dl className='profile-details'>
              <dt>Email</dt>
              <dd>{profile.email}</dd>

              <dt>Role</dt>
              <dd>
                <span className={`badge badge-${profile.role.toLowerCase()}`}>
                  {profile.role}
                </span>
              </dd>

              <dt>Verified</dt>
              <dd>{profile.isVerified ? 'Yes' : 'No'}</dd>

              <dt>Member since</dt>
              <dd>{new Date(profile.createdAt).toLocaleDateString()}</dd>
            </dl>

            {successMsg && <p className='form-success'>{successMsg}</p>}

            <button onClick={openEdit} className='btn-success'>
              Edit Profile
            </button>
          </>
        ) : (
          <form onSubmit={handleUpdate} className='auth-form'>
            <h2 className='heading-secondary'>Edit Profile</h2>

            <div className='form-group'>
              <label htmlFor='firstName'>First Name</label>
              <input
                id='firstName'
                type='text'
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder='Jane'
                maxLength={50}
              />
            </div>

            <div className='form-group'>
              <label htmlFor='lastName'>Last Name</label>
              <input
                id='lastName'
                type='text'
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder='Doe'
                maxLength={50}
              />
            </div>

            <div className='form-group'>
              <label htmlFor='avatarUrl'>Avatar URL</label>
              <input
                id='avatarUrl'
                type='url'
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder='https://…'
              />
            </div>

            {submitError.length > 0 && <FormErrors errors={submitError} />}

            <div className='btn-row'>
              <button
                type='submit'
                className='btn-success'
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving…' : 'Save'}
              </button>
              <button
                type='button'
                className='btn-outline'
                onClick={() => setIsEditing(false)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
};

export default ProfilePage;
