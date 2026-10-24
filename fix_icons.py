from pathlib import Path
from PIL import Image, ImageOps, ImageDraw
from datetime import datetime
import shutil
import sys

BASE = Path(__file__).resolve().parent
SOURCE = Path.home() / "storage/shared/Download/REXO-Icons/rexo.png"
RES = BASE / "android/app/src/main/res"

SIZES = {
    "mdpi": 48,
    "hdpi": 72,
    "xhdpi": 96,
    "xxhdpi": 144,
    "xxxhdpi": 192,
}

def fit_square(img, size):
    img = ImageOps.contain(img, (size, size), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (size, size), (8, 8, 8, 255))
    canvas.alpha_composite(img, ((size-img.width)//2, (size-img.height)//2))
    return canvas

def main():
    if not SOURCE.is_file():
        sys.exit(f"الصورة مش موجودة: {SOURCE}")

    with Image.open(SOURCE) as original:
        original.load()
        img = ImageOps.exif_transpose(original).convert("RGBA")

    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    backup = BASE / "icon-backups" / timestamp
    targets = []

    for density, size in SIZES.items():
        folder = RES / f"mipmap-{density}"
        if not folder.is_dir():
            sys.exit(f"المجلد غير موجود: {folder}")
        targets.extend([
            (folder / "ic_launcher.png", fit_square(img, size)),
            (folder / "ic_launcher_round.png", fit_square(img, size)),
        ])

    # تأكد من وجود كل الملفات المستهدفة قبل النسخ أو التعديل.
    backup.mkdir(parents=True, exist_ok=False)
    for path, _ in targets:
        if path.exists():
            dest = backup / path.relative_to(RES)
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(path, dest)

    try:
        for path, image in targets:
            image.save(path, format="PNG", optimize=True)
            print(f"تم تجهيز: {path.relative_to(RES)}")
    except Exception as e:
        print("حصل خطأ، هنرجع النسخ الاحتياطية:", e)
        for path, _ in targets:
            saved = backup / path.relative_to(RES)
            if saved.exists():
                shutil.copy2(saved, path)
        sys.exit(1)

    print("\nاكتمل تجهيز الأيقونات العادية والدائرية.")
    print("النسخة الاحتياطية موجودة في:", backup)
    print("ملفات foreground وXML لم يتم تغييرها.")

if __name__ == "__main__":
    main()
