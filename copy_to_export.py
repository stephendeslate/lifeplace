import os
import shutil
from urllib.parse import urlparse


def export_files(url_paths, export_folder="export"):
    # Create the export folder if it doesn't exist
    if not os.path.exists(export_folder):
        os.makedirs(export_folder)

    def copy_recursively(directory, parent_prefix=""):
        for root, dirs, files in os.walk(directory):
            # Calculate the relative path from the base directory
            rel_path = os.path.relpath(root, directory)
            current_prefix = parent_prefix
            
            # Only add to prefix if we're not at the root
            if rel_path != "." and parent_prefix:
                current_prefix = f"{parent_prefix}-{os.path.basename(root)}"
            elif rel_path != ".":
                current_prefix = os.path.basename(root)

            # Process all files in current directory
            for file in files:
                if not file.endswith('.DS_Store'):
                    source_path = os.path.join(root, file)
                    
                    # Create new filename with prefix
                    if current_prefix:
                        new_file_name = f"{current_prefix}-{file}"
                    else:
                        new_file_name = file
                        
                    destination = os.path.join(export_folder, new_file_name)
                    shutil.copy2(source_path, destination)
                    print(f"Copied and renamed file: {source_path} to {new_file_name}")

    for url_path in url_paths:
        # Parse the URL to get the path
        parsed_url = urlparse(url_path)
        path = parsed_url.path

        # Convert URL path to local file system path
        local_path = os.path.normpath(path.lstrip('/'))

        if os.path.isfile(local_path):
            # If it's a file, copy and rename it (excluding .DS_Store)
            if not (local_path.endswith('.DS_Store') or local_path.endswith('svg')):
                parent_folder = os.path.basename(os.path.dirname(local_path))
                file_name = os.path.basename(local_path)
                new_file_name = f"{parent_folder}-{file_name}"
                destination = os.path.join(export_folder, new_file_name)
                shutil.copy2(local_path, destination)
                print(f"Copied and renamed file: {local_path} to {new_file_name}")
            else:
                print(f"Skipped .DS_Store file: {local_path}")
        elif os.path.isdir(local_path):
            # Check if this is a src directory
            if os.path.basename(local_path) == "src":
                # Recursively copy all files from src directory
                parent_folder = os.path.basename(os.path.dirname(local_path))
                copy_recursively(local_path, parent_folder)
            else:
                # Handle regular directories as before
                for item in os.listdir(local_path):
                    item_path = os.path.join(local_path, item)
                    if os.path.isfile(item_path) and not item.endswith('.DS_Store'):
                        parent_folder = os.path.basename(local_path)
                        new_file_name = f"{parent_folder}-{item}"
                        destination = os.path.join(export_folder, new_file_name)
                        shutil.copy2(item_path, destination)
                        print(f"Copied and renamed file: {item_path} to {new_file_name}")
                    elif item.endswith('.DS_Store'):
                        print(f"Skipped .DS_Store file: {item_path}")
        else:
            print(f"Invalid path: {local_path}")

    print(f"All files have been exported to the '{export_folder}' folder.")

# Example usage
url_paths = [
    "backend/core/",
    "backend/core/domains/workflows",
    "backend/core/domains/communications/",
    "backend/core/utils/",
    "frontend/admin-crm/src/pages/settings",
    "frontend/admin-crm/src/pages/settings/workflows/",
    "frontend/admin-crm/src/pages/components/workflows/",
    "frontend/admin-crm/src/types/",
    "frontend/admin-crm/src/utils/",
    "frontend/admin-crm/src/App.tsx",
    "frontend/admin-crm/src/apis/",
    "frontend/admin-crm/src/hooks/"
]

export_files(url_paths)