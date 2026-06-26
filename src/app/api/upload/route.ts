import { NextRequest, NextResponse } from 'next/server';
import { requireAuthContext } from '@/lib/auth/session';
import { requirePermission } from '@/lib/auth/rbac';
import { handleAuthError } from '@/lib/security/api-guard';
import { uploadRequestSchema } from '@/lib/validators/schemas';
import { generateMediaKey, getUploadUrl, getPublicUrl } from '@/lib/storage/b2';
import { isAllowedUpload, sanitizeFolder, MAX_UPLOAD_BYTES } from '@/lib/security/sanitize';
import { guardAuthPost } from '@/lib/security/api-guard';
import { validateCsrf } from '@/lib/security/csrf';
import { writeAuditLog } from '@/lib/security/audit';

export async function POST(request: NextRequest) {
  const blocked = guardAuthPost(request, 'upload-presign', 20, 60 * 60 * 1000);
  if (blocked) return blocked;

  if (!(await validateCsrf(request))) {
    return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
  }

  try {
    const ctx = await requireAuthContext();
    requirePermission(ctx, 'upload.write');

    const body = await request.json();
    const parsed = uploadRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { filename, contentType, folder = 'media', fileSize } = parsed.data;

    if (fileSize && fileSize > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: 'File exceeds maximum size of 10MB' }, { status: 400 });
    }

    if (!isAllowedUpload(filename, contentType)) {
      return NextResponse.json({ error: 'File type not allowed' }, { status: 400 });
    }

    const safeFolder = sanitizeFolder(folder);
    const key = generateMediaKey(safeFolder, filename);
    const upload = await getUploadUrl(key, contentType);

    await writeAuditLog({
      action: 'upload.presign',
      actorId: ctx.userId,
      actorEmail: ctx.email,
      resource: 'b2',
      resourceId: key,
      request,
    });

    return NextResponse.json({
      key,
      uploadUrl: upload.uploadUrl,
      authorizationToken: upload.authorizationToken,
      contentType: upload.contentType,
      publicUrl: getPublicUrl(key),
    });
  } catch (error) {
    return handleAuthError(error);
  }
}
