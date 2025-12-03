import os

replacements = {
    '@/app/(main)/': '@/app/[locale]/(main)/',
    '@/app/trips/': '@/app/[locale]/trips/',
    '@/app/admin/': '@/app/[locale]/admin/',
    '@/app/auth/': '@/app/[locale]/auth/',
    '@/app/checkout/': '@/app/[locale]/checkout/',
    '@/app/login/': '@/app/[locale]/login/',
}

root_dir = 'src'

for subdir, dirs, files in os.walk(root_dir):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            filepath = os.path.join(subdir, file)
            with open(filepath, 'r') as f:
                content = f.read()
            
            new_content = content
            for old, new in replacements.items():
                new_content = new_content.replace(old, new)
            
            if new_content != content:
                print(f"Updating {filepath}")
                with open(filepath, 'w') as f:
                    f.write(new_content)
