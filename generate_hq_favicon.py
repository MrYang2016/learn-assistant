#!/usr/bin/env python3
"""
Generate high-quality favicon using PNG first, then convert to ICO
"""

from PIL import Image, ImageFilter
import os

def generate_hq_favicon(input_path, output_path):
    """Generate high-quality favicon using PNG intermediate format"""
    try:
        # Open the input image
        with Image.open(input_path) as img:
            print(f"原图尺寸: {img.size}")
            
            # Convert to RGBA if not already
            if img.mode != 'RGBA':
                img = img.convert('RGBA')
            
            # Create multiple sizes with high quality
            sizes = [(16, 16), (24, 24), (32, 32), (48, 48), (64, 64)]
            icons = []
            
            for size in sizes:
                # Use high-quality resampling
                resized = img.resize(size, Image.Resampling.LANCZOS)
                
                # Apply subtle sharpening for better clarity
                if size[0] >= 24:
                    resized = resized.filter(ImageFilter.UnsharpMask(radius=0.3, percent=120, threshold=2))
                
                icons.append(resized)
            
            # Save as ICO file
            icons[0].save(
                output_path, 
                format='ICO', 
                sizes=[(icon.width, icon.height) for icon in icons],
                optimize=False  # Don't optimize to maintain quality
            )
            
            print(f"成功生成高质量favicon: {output_path}")
            print(f"包含尺寸: {[f'{icon.width}x{icon.height}' for icon in icons]}")
            
            # Show file size
            file_size = os.path.getsize(output_path)
            print(f"文件大小: {file_size} 字节")
            
            # Also save individual PNG files for comparison
            for i, icon in enumerate(icons):
                png_path = f"app/favicon_{icon.width}x{icon.height}.png"
                icon.save(png_path, format='PNG', optimize=False)
                print(f"保存PNG版本: {png_path}")
            
    except Exception as e:
        print(f"生成favicon时出错: {e}")

if __name__ == "__main__":
    input_file = "app/image.png"
    output_file = "app/favicon.ico"
    
    if os.path.exists(input_file):
        generate_hq_favicon(input_file, output_file)
    else:
        print(f"输入文件 {input_file} 不存在")
