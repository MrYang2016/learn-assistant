#!/usr/bin/env python3
"""
Convert high-resolution PNG image to ultra-high-quality favicon.ico
"""

from PIL import Image, ImageFilter
import os

def convert_to_ultra_hq_favicon(input_path, output_path):
    """Convert high-resolution PNG image to ultra-high-quality favicon.ico format"""
    try:
        # Open the input image
        with Image.open(input_path) as img:
            print(f"原图尺寸: {img.size}")
            
            # Convert to RGBA if not already
            if img.mode != 'RGBA':
                img = img.convert('RGBA')
            
            # Create higher resolution sizes with better quality
            sizes = [(16, 16), (24, 24), (32, 32), (48, 48), (64, 64)]
            icons = []
            
            for size in sizes:
                # Use high-quality resampling with additional sharpening
                resized = img.resize(size, Image.Resampling.LANCZOS)
                
                # Apply slight sharpening to maintain clarity at small sizes
                if size[0] >= 24:  # Only sharpen larger sizes
                    resized = resized.filter(ImageFilter.UnsharpMask(radius=0.5, percent=150, threshold=3))
                
                icons.append(resized)
            
            # Save as ICO file with multiple sizes
            icons[0].save(
                output_path, 
                format='ICO', 
                sizes=[(icon.width, icon.height) for icon in icons]
            )
            
            print(f"成功转换 {input_path} 到 {output_path}")
            print(f"创建的favicon包含尺寸: {[f'{icon.width}x{icon.height}' for icon in icons]}")
            
            # Show file size
            file_size = os.path.getsize(output_path)
            print(f"文件大小: {file_size} 字节")
            
    except Exception as e:
        print(f"转换图片时出错: {e}")

if __name__ == "__main__":
    input_file = "app/image.png"
    output_file = "app/favicon.ico"
    
    if os.path.exists(input_file):
        convert_to_ultra_hq_favicon(input_file, output_file)
    else:
        print(f"输入文件 {input_file} 不存在")
