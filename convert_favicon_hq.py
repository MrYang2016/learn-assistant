#!/usr/bin/env python3
"""
Convert high-resolution PNG image to high-quality favicon.ico
"""

from PIL import Image
import os

def convert_to_high_quality_favicon(input_path, output_path):
    """Convert high-resolution PNG image to high-quality favicon.ico format"""
    try:
        # Open the input image
        with Image.open(input_path) as img:
            print(f"原图尺寸: {img.size}")
            
            # Convert to RGBA if not already
            if img.mode != 'RGBA':
                img = img.convert('RGBA')
            
            # Create higher resolution sizes for better quality
            # Include more sizes for better browser compatibility
            sizes = [(16, 16), (24, 24), (32, 32), (48, 48), (64, 64)]
            icons = []
            
            for size in sizes:
                # Use high-quality resampling for better results
                resized = img.resize(size, Image.Resampling.LANCZOS)
                icons.append(resized)
            
            # Save as ICO file with multiple sizes
            icons[0].save(
                output_path, 
                format='ICO', 
                sizes=[(icon.width, icon.height) for icon in icons],
                quality=100  # Maximum quality
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
        convert_to_high_quality_favicon(input_file, output_file)
    else:
        print(f"输入文件 {input_file} 不存在")
