import os

replacements = {
    "bg-[#070A11]": "bg-slate-50",
    "bg-slate-950": "bg-slate-100",
    "bg-slate-900/80": "bg-white",
    "bg-slate-900/60": "bg-white",
    "bg-slate-900": "bg-white",
    "bg-slate-800": "bg-slate-100",
    "border-slate-800": "border-slate-200",
    "border-slate-700": "border-slate-200",
    "text-slate-400": "text-slate-500",
    "text-slate-300": "text-slate-600",
    "text-slate-200": "text-slate-800",
    "text-slate-100": "text-slate-900",
    "text-white": "text-slate-900"
}

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content
    for old, new in replacements.items():
        new_content = new_content.replace(old, new)
        
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            process_file(os.path.join(root, file))
