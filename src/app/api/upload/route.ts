import { NextRequest, NextResponse } from 'next/server';
import { requireAuthContext } from '@/lib/auth/session';
import { requirePermission } from '@/lib/auth/rbac';
import { guardAuthMutation, handleAuthError } from '@/lib/security/api-guard';
import { generateMediaKey, uploadFile } from '@/lib/storage/b2';
import {
  detectUploadMimeFromBytes,
  isAllowedUpload,
  sanitizeFolder,
  MAX_UPLOAD_BYTES,
} from '@/lib/security/sanitize';
import { writeAuditLog } from '@/lib/security/audit';

export async function POST(request: NextRequest) {
  const blocked = await guardAuthMutation(request, 'upload-direct', 20, 60 * 60 * 1000);
  if (blocked) return blocked;



  try {
    const ctx = await requireAuthContext();
    requirePermission(ctx, 'upload.write');

    const contentType = request.headers.get('content-type') ?? '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Expected multipart form upload' }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const folderRaw = formData.get('folder');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: 'File exceeds maximum size of 10MB' }, { status: 400 });
    }

    const mimeType = file.type.toLowerCase();
    if (!isAllowedUpload(file.name, mimeType)) {
      return NextResponse.json({ error: 'File type not allowed' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const header = buffer.subarray(0, 12);
    const detected = detectUploadMimeFromBytes(
      header.buffer.slice(header.byteOffset, header.byteOffset + header.byteLength),
      mimeType,
    );
    if (!detected || detected !== mimeType) {
      return NextResponse.json(
        { error: 'File content does not match a supported type' },
        { status: 400 },
      );
    }

    const safeFolder = sanitizeFolder(typeof folderRaw === 'string' ? folderRaw : 'media');
    const key = generateMediaKey(safeFolder, file.name);
    const publicUrl = await uploadFile(key, buffer, mimeType);

    await writeAuditLog({
      action: 'upload.direct',
      actorId: ctx.userId,
      actorEmail: ctx.email,
      resource: 'b2',
      resourceId: key,
      request,
      metadata: { contentType: mimeType, size: file.size },
    });

    return NextResponse.json({ key, publicUrl });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Missing B2_')) {
      return NextResponse.json({ error: 'Storage is not configured' }, { status: 503 });
    }
    return handleAuthError(error);
  }
}
