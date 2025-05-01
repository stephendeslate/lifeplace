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
url_paths1 = [
    "backend/core/domains/events/models.py",
    "backend/core/domains/events/serializers.py",
    "backend/core/domains/events/views.py",
    "backend/core/domains/events/urls.py",
    "backend/core/domains/events/services.py",
    "frontend/admin-crm/src/App.tsx",
    "frontend/admin-crm/src/pages/settings/bookingflow/BookingFlows.tsx",
    "frontend/admin-crm/src/components/bookingflow/BookingStepTabs.tsx",
    "frontend/admin-crm/src/components/bookingflow/BookingStepForm.tsx",
    "frontend/admin-crm/src/components/bookingflow/BookingStepFormDate.tsx",
    "frontend/admin-crm/src/components/bookingflow/BookingStepFormProduct.tsx",
    "frontend/admin-crm/src/components/bookingflow/BookingStepFormQuestionnaire.tsx",
    "frontend/client-portal/src/App.tsx",
    "frontend/admin-crm/src/types/clients.types.ts",
    "frontend/admin-crm/src/pages/settings/bookingflow/BookingFlows.tsx",
    "frontend/admin-crm/src/pages/settings/bookingflow/EventTypes.tsx",
    "backend/core/domains/bookingflow/models.py",
    "backend/core/domains/bookingflow/serializers.py",
    "backend/core/domains/bookingflow/services.py",
    "backend/core/domains/bookingflow/views.py",
    "backend/core/domains/bookingflow/urls.py",
    "backend/core/domains/questionnaires/models.py",
    "backend/core/domains/questionnaires/serializers.py",
    "backend/core/domains/questionnaires/services.py",
    "backend/core/domains/questionnaires/urls.py",
    "backend/core/domains/questionnaires/views.py",
]

url_paths = [
    "frontend/admin-crm/src/App.tsx",
    "frontend/admin-crm/src/apis/bookingflow.api.ts",
    "frontend/admin-crm/src/hooks/useBookingFlows.ts",
    "frontend/admin-crm/src/components/bookingflow/BookingFlowItem.tsx",
    "frontend/admin-crm/src/components/bookingflow/BookingFlowDialog.tsx",
    "frontend/admin-crm/src/components/bookingflow/steps/AddonConfigForm.tsx",
    "frontend/admin-crm/src/components/bookingflow/steps/ConfirmationConfigForm.tsx",
    "frontend/admin-crm/src/components/bookingflow/steps/DateConfigForm.tsx",
    "frontend/admin-crm/src/components/bookingflow/steps/IntroConfigForm.tsx",
    "frontend/admin-crm/src/components/bookingflow/steps/PackageConfigForm.tsx",
    "frontend/admin-crm/src/components/bookingflow/steps/PaymentConfigForm.tsx",
    "frontend/admin-crm/src/components/bookingflow/steps/QuestionnaireConfigForm.tsx",
    "frontend/admin-crm/src/components/bookingflow/steps/SummaryConfigForm.tsx",
    "frontend/client-portal/src/App.tsx",
    "frontend/admin-crm/src/pages/settings/bookingflow/BookingFlows.tsx",
    "frontend/admin-crm/src/pages/settings/bookingflow/EventTypes.tsx",
    "backend/core/domains/bookingflow/models.py",
    "backend/core/domains/bookingflow/serializers.py",
    "backend/core/domains/bookingflow/services.py",
    "backend/core/domains/bookingflow/views.py",
    "backend/core/domains/bookingflow/urls.py",
]

export_files(url_paths)