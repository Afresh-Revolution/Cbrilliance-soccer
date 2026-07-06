'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Video } from '@/types';
import { POSITION_LABELS } from '@/lib/constants/navigation';
import { fetchCsrfToken, patchWithCsrf, deleteWithCsrf } from '@/lib/auth/csrf-client';
import AdminConfirmDialog from '@/components/admin/AdminConfirmDialog';

function displayPosition(video: Video) {
  if (!video.position) return 'All';
  return POSITION_LABELS[video.position] ?? video.position;
}

function displayPlayer(video: Video) {
  return video.playerName?.trim() || 'Team';
}

function VideoThumbnail({ video }: { video: Video }) {
  if (video.thumbnail) {
    return (
      <Image
        src={video.thumbnail}
        alt={video.title}
        width={80}
        height={48}
        className="admin-videos__thumb-img"
      />
    );
  }

  return <div className="admin-videos__thumb-fallback" aria-hidden />;
}

function VideoViewModal({ video, onClose }: { video: Video; onClose: () => void }) {
  return (
    <div className="admin-modal" role="dialog" aria-modal="true">
      <div className="admin-modal__backdrop" onClick={onClose} aria-hidden />
      <div className="admin-modal__panel admin-modal__panel--wide">
        <div className="admin-modal__head">
          <h2>{video.title}</h2>
          <button type="button" className="admin-modal__close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="admin-modal__body">
          <div className="admin-videos__modal-player">
            <p className="text-muted">{displayPlayer(video)} · {displayPosition(video)} · {video.ageCategory ?? '—'}</p>
            <p className="text-muted">Duration: {video.duration || '—'}</p>
          </div>
          {video.videoUrl && (
            <div className="admin-videos__embed">
              <iframe
                src={video.videoUrl}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
        </div>
        <div className="admin-modal__actions">
          <Link href={`/admin/videos/${video.id}/edit`} className="btn btn--primary btn--sm">
            Edit
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminVideosTable({ videos: initialVideos }: { videos: Video[] }) {
  const router = useRouter();
  const [videos, setVideos] = useState(initialVideos);
  const [viewVideo, setViewVideo] = useState<Video | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Video | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleToggleFeatured(video: Video) {
    setBusyId(video.id);
    try {
      const csrf = await fetchCsrfToken();
      const { ok, data } = await patchWithCsrf<{ video?: Video; error?: string }>(
        `/api/admin/videos/${video.id}`,
        { featured: !video.featured },
        csrf,
      );
      if (!ok || !data.video) {
        alert(typeof data.error === 'string' ? data.error : 'Failed to update video');
        return;
      }
      setVideos((prev) => prev.map((v) => (v.id === video.id ? data.video! : v)));
      router.refresh();
    } catch {
      alert('Failed to update video');
    } finally {
      setBusyId(null);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;

    const video = deleteTarget;
    setBusyId(video.id);
    setDeleteError(null);
    try {
      const csrf = await fetchCsrfToken();
      const { ok, data } = await deleteWithCsrf<{ error?: string }>(
        `/api/admin/videos/${video.id}`,
        csrf,
      );
      if (!ok) {
        setDeleteError(typeof data.error === 'string' ? data.error : 'Failed to delete video');
        return;
      }
      setVideos((prev) => prev.filter((v) => v.id !== video.id));
      if (viewVideo?.id === video.id) {
        setViewVideo(null);
      }
      setDeleteTarget(null);
      router.refresh();
    } catch {
      setDeleteError('Failed to delete video');
    } finally {
      setBusyId(null);
    }
  }

  function openDeleteDialog(video: Video) {
    setDeleteError(null);
    setDeleteTarget(video);
  }

  function closeDeleteDialog() {
    if (busyId) return;
    setDeleteTarget(null);
    setDeleteError(null);
  }

  return (
    <>
      <div className="admin-videos__toolbar">
        <p>{videos.length} video{videos.length === 1 ? '' : 's'}</p>
        <Link href="/admin/videos/new" className="btn btn--primary btn--sm">+ Add Video</Link>
      </div>

      <div className="admin__table-wrap">
        <table className="admin__table admin-videos__table">
          <thead>
            <tr>
              <th>Video</th>
              <th>Player</th>
              <th>Position</th>
              <th>Age</th>
              <th>Duration</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {videos.length === 0 ? (
              <tr>
                <td colSpan={7} className="admin__table-empty">
                  No videos yet. Add your first video to get started.
                </td>
              </tr>
            ) : (
              videos.map((video) => (
                <tr key={video.id}>
                  <td>
                    <div className="admin-videos__video-cell">
                      <div className="admin-videos__thumb">
                        <VideoThumbnail video={video} />
                      </div>
                      <span className="admin-videos__title">{video.title}</span>
                    </div>
                  </td>
                  <td>{displayPlayer(video)}</td>
                  <td><span className="admin-videos__position">{displayPosition(video)}</span></td>
                  <td>{video.ageCategory ?? '—'}</td>
                  <td className="admin-videos__duration">{video.duration || '—'}</td>
                  <td>
                    <div className="admin-videos__status-cell">
                      <button
                        type="button"
                        className={`admin-videos__status ${video.featured ? 'admin-videos__status--featured' : 'admin-videos__status--standard'}`}
                        disabled={busyId === video.id}
                        onClick={() => handleToggleFeatured(video)}
                        title={video.featured ? 'Click to unfeature' : 'Click to feature'}
                      >
                        {video.featured ? 'Featured' : 'Standard'}
                      </button>
                      <Link
                        href={`/admin/videos/${video.id}/edit`}
                        className="btn btn--outline btn--sm"
                      >
                        Edit
                      </Link>
                    </div>
                  </td>
                  <td>
                    <div className="admin-videos__actions">
                      <button
                        type="button"
                        className="btn btn--outline btn--sm"
                        onClick={() => setViewVideo(video)}
                      >
                        View
                      </button>
                      <button
                        type="button"
                        className="btn btn--outline btn--sm admin-videos__delete"
                        disabled={busyId === video.id}
                        onClick={() => openDeleteDialog(video)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {viewVideo && <VideoViewModal video={viewVideo} onClose={() => setViewVideo(null)} />}

      {deleteTarget && (
        <AdminConfirmDialog
          title="Delete video?"
          message={`"${deleteTarget.title}" will be permanently removed. This cannot be undone.`}
          confirmLabel="Delete video"
          busy={busyId === deleteTarget.id}
          error={deleteError}
          onCancel={closeDeleteDialog}
          onConfirm={confirmDelete}
        />
      )}
    </>
  );
}
