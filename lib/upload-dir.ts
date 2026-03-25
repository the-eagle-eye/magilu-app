import path from 'path'

export function getUploadDir(subdir?: string): string {
  const base = process.env.UPLOAD_DIR ?? path.join(process.cwd(), 'public', 'uploads')
  return subdir ? path.join(base, subdir) : base
}
