import { diskStorage, memoryStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { extname, join } from 'path';

const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

function isLocalDev() {
  return process.env.NODE_ENV === 'development' && !process.env.VERCEL;
}

function uniqueFilename(originalname: string) {
  return `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(originalname)}`;
}

function getLocalUploadDir() {
  const dir = join(process.cwd(), 'uploads');
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export function createMulterOptions() {
  const fileFilter = (
    _req: Express.Request,
    file: Express.Multer.File,
    cb: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    const ext = extname(file.originalname).toLowerCase();
    cb(null, ALLOWED_EXTENSIONS.includes(ext));
  };

  if (!isLocalDev()) {
    return {
      storage: memoryStorage(),
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter,
    };
  }

  return {
    storage: diskStorage({
      destination: (_req, _file, cb) => {
        cb(null, getLocalUploadDir());
      },
      filename: (_req, file, cb) => {
        cb(null, uniqueFilename(file.originalname));
      },
    }),
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter,
  };
}
