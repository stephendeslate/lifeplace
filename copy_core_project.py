import os
import shutil


def export_files():
    OUTPUT_DIR = "project_core"
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
    
    # Define paths
    backend_path = "backend/core/domains"
    frontend_types_path = "frontend/admin-crm/src/types"
    
    # Detect all available backend domains
    backend_domains = set(os.listdir(backend_path)) if os.path.exists(backend_path) else set()
    backend_domains = {d for d in backend_domains if os.path.isdir(os.path.join(backend_path, d))}
    
    frontend_domains = set(os.listdir(frontend_types_path)) if os.path.exists(frontend_types_path) else set()
    frontend_domains = {f.split(".")[0] for f in frontend_domains if f.endswith(".types.ts")}

    print(f"Backend Domains Found: {backend_domains}")
    print(f"Frontend Domains Found: {frontend_domains}")

    # Find relevant domains
    common_domains = backend_domains & frontend_domains
    if not common_domains:
        common_domains = backend_domains | frontend_domains  # In case one side is empty

    print(f"Domains to Process: {common_domains}")

    # Copy relevant files
    for domain in common_domains:
        file_patterns = [
            f"backend/core/domains/{domain}/serializers.py",
            f"backend/core/domains/{domain}/services.py",
            f"backend/core/domains/{domain}/views.py",
            f"frontend/admin-crm/src/apis/{domain}.api.ts",
            f"frontend/admin-crm/src/types/{domain}.types.ts"
        ]
        
        for file_path in file_patterns:
            if os.path.exists(file_path):
                new_file_name = file_path.replace("/", "-")
                output_path = os.path.join(OUTPUT_DIR, new_file_name)
                shutil.copy2(file_path, output_path)
                print(f"Copied: {file_path} -> {output_path}")
            else:
                print(f"Skipped missing file: {file_path}")
    
    # Copy additional project-level files
    additional_files = ["README.md", "package.json"]
    for file in additional_files:
        if os.path.exists(file):
            shutil.copy2(file, os.path.join(OUTPUT_DIR, file.replace("/", "-")))
            print(f"Copied: {file} -> {OUTPUT_DIR}/{file}")

if __name__ == "__main__":
    export_files()
