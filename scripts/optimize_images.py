import os
from PIL import Image

def crop_and_resize(img, target_w=800, target_h=500):
    w, h = img.size
    target_ratio = target_w / target_h
    current_ratio = w / h
    
    if current_ratio > target_ratio:
        # Image is wider than 16:10 -> crop width symmetrically
        crop_w = int(h * target_ratio)
        left = (w - crop_w) // 2
        img = img.crop((left, 0, left + crop_w, h))
    elif current_ratio < target_ratio:
        # Image is taller than 16:10 -> crop height symmetrically
        crop_h = int(w / target_ratio)
        top = (h - crop_h) // 2
        img = img.crop((0, top, w, top + crop_h))
        
    return img.resize((target_w, target_h), Image.Resampling.LANCZOS)

def main():
    project_dir = 'public/images/projects'
    targets = [
        ('halisi-app-cover.png', 'halisi-app-cover.webp'),
        ('greenroute-cover.png', 'greenroute-cover.webp'),
        ('kula-kwa-macho-cover.png', 'kula-kwa-macho-cover.webp'),
        ('geliscope-cover.png', 'geliscope-cover.webp'),
        ('email-analyzer-cover.png', 'email-analyzer-cover.webp'),
        ('ole-ken-hotel-cover.png', 'ole-ken-hotel-cover.webp'),
    ]
    
    print('Starting WebP conversion...')
    for src_name, dest_name in targets:
        src_path = os.path.join(project_dir, src_name)
        dest_path = os.path.join(project_dir, dest_name)
        
        if not os.path.exists(src_path):
            print(f'Missing: {src_path}')
            continue
            
        with Image.open(src_path) as img:
            # Convert to RGB if RGBA/P
            if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
                # Create a solid dark background for transparent pixels matching site obsidian (#0A0A09)
                bg = Image.new('RGB', img.size, (10, 10, 9))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                bg.paste(img, mask=img.split()[3]) # 3 is the alpha channel
                img_rgb = bg
            else:
                img_rgb = img.convert('RGB')
            
            # Ensure size is strictly between 30 KB and 85 KB (under 100 KB)
            dim = (960, 600)
            q = 84
            candidate = crop_and_resize(img_rgb, dim[0], dim[1])
            candidate.save(dest_path, 'WEBP', quality=q, method=4)
            size_kb = os.path.getsize(dest_path) / 1024
            
            # If size is < 30 KB, try 1200x750 or higher quality
            if size_kb < 30.0:
                dim = (1200, 750)
                q = 85
                candidate = crop_and_resize(img_rgb, dim[0], dim[1])
                candidate.save(dest_path, 'WEBP', quality=q, method=4)
                size_kb = os.path.getsize(dest_path) / 1024
            # If size is > 85 KB, resize to 800x500 and calibrate quality
            elif size_kb > 85.0:
                dim = (800, 500)
                for test_q in [82, 80, 78, 75]:
                    candidate = crop_and_resize(img_rgb, dim[0], dim[1])
                    candidate.save(dest_path, 'WEBP', quality=test_q, method=4)
                    size_kb = os.path.getsize(dest_path) / 1024
                    q = test_q
                    if size_kb <= 85.0:
                        break

            
            with Image.open(dest_path) as out_img:
                print(f'{dest_name}: {out_img.size[0]}x{out_img.size[1]}, {size_kb:.2f} KB (quality=82-85)')

if __name__ == '__main__':
    main()
