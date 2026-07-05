import { NextRequest, NextResponse } from 'next/server';
import { requireAuthContext } from '@/lib/auth/session';
import { requirePermission } from '@/lib/auth/rbac';
import { guardAuthMutation, handleAuthError, jsonError } from '@/lib/security/api-guard';
import { generateMediaKey, uploadFile } from '@/lib/storage/b2';
import { isB2Configured } from '@/lib/storage/env';
import {
  detectUploadMimeFromBytes,
  isAllowedUpload,
  sanitizeFolder,
  MAX_UPLOAD_BYTES,
} from '@/lib/security/sanitize';
import { writeAuditLog } from '@/lib/security/audit';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const blocked = await guardAuthMutation(request, 'upload-direct', 20, 60 * 60 * 1000);
  if (blocked) return blocked;

  try {
    const ctx = await requireAuthContext();
    requirePermission(ctx, 'upload.write');

    const contentType = request.headers.get('content-type') ?? '';
    if (!contentType.includes('multipart/form-data')) {
      return jsonError('Expected multipart form upload', 400);
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const folderRaw = formData.get('folder');

    if (!(file instanceof File)) {
      return jsonError('No file provided', 400);
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return jsonError('File exceeds maximum size of 10MB', 400);
    }

    const mimeType = file.type.toLowerCase();
    if (!isAllowedUpload(file.name, mimeType)) {
      return jsonError('File type not allowed', 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const header = buffer.subarray(0, 12);
    const detected = detectUploadMimeFromBytes(
      header.buffer.slice(header.byteOffset, header.byteOffset + header.byteLength),
      mimeType,
    );
    if (!detected || detected !== mimeType) {
      return jsonError('File content does not match a supported type', 400);
    }

    const safeFolder = sanitizeFolder(typeof folderRaw === 'string' ? folderRaw : 'media');
    const key = generateMediaKey(safeFolder, file.name);
    const publicUrl = await uploadFile(key, buffer, mimeType, {
      folder: safeFolder,
      filename: file.name,
    });

    await writeAuditLog({
      action: 'upload.direct',
      actorId: ctx.userId,
      actorEmail: ctx.email,
      resource: isB2Configured() ? 'b2' : 'local',
      resourceId: key,
      request,
      metadata: { contentType: mimeType, size: file.size, storage: isB2Configured() ? 'b2' : 'local' },
    });

    return NextResponse.json({ key, publicUrl });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'UNAUTHORIZED') return jsonError('Unauthorized', 401);
      if (error.message === 'FORBIDDEN') return jsonError('Forbidden', 403);
      if (error.message.includes('Missing B2_')) {
        return jsonError('Storage is not configured', 503);
      }
      if (error.message.startsWith('B2 upload failed')) {
        return jsonError('Cloud storage upload failed. Please try again.', 502);
      }
      console.error('[api/upload]', error);
      return jsonError(error.message || 'Upload failed', 500);
    }
    return handleAuthError(error);
  }
}
